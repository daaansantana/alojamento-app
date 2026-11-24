// Guests: a guest is a guest_email; stays ordered by check_in, then id
// (SPEC sections 1 and 3).

import {
  compareStays,
  daysBetween,
  isBetween,
  referenceDate,
  stayNights,
  WINTER,
} from "@/lib/dates";
import type {
  Booking,
  ChannelTransition,
  GuestCard,
  GuestLevel,
  GuestProfile,
  GuestProfileId,
  GuestRules,
  GuestTotals,
  LanguageCode,
  Season,
  SegmentCounts,
} from "@/types";

/** Every guest with at least one completed stay. */
export function guestProfiles(bookings: Booking[]): GuestProfile[] {
  const reference = referenceDate(bookings);
  if (reference === null) return [];
  const byGuest = new Map<string, Booking[]>();
  const completed = bookings
    .filter((booking) => booking.status === "Concluída")
    .sort(compareStays);
  for (const stay of completed) {
    const stays = byGuest.get(stay.guest_email);
    if (stays) stays.push(stay);
    else byGuest.set(stay.guest_email, [stay]);
  }
  return [...byGuest].map(([email, stays]) => {
    const first = stays[0];
    const last = stays[stays.length - 1];
    const spent = stays.reduce((sum, stay) => sum + stay.total, 0);
    const lastCheckOut = stays.reduce(
      (latest, stay) => (stay.check_out > latest ? stay.check_out : latest),
      first.check_out,
    );
    const recencyDays = daysBetween(lastCheckOut, reference);
    return {
      email,
      name: first.guest_name,
      stays: stays.length,
      spent,
      firstCheckIn: first.check_in,
      lastCheckOut,
      recencyDays,
      firstChannel: first.channel,
      lastChannel: last.channel,
      everDirect: stays.some((stay) => stay.channel === "Direto"),
      r: recencyDays <= 90 ? 3 : recencyDays <= 180 ? 2 : 1,
      f: stays.length >= 3 ? 3 : stays.length === 2 ? 2 : 1,
      m: spent >= 600 ? 3 : spent >= 300 ? 2 : 1,
    };
  });
}

/** The profiles with 2 or more stays. */
export function returningGuests(profiles: GuestProfile[]): GuestProfile[] {
  return profiles.filter((profile) => profile.stays >= 2);
}

/** Returning guests whose last channel is a platform, in contact order. */
export function contactFirst(profiles: GuestProfile[]): GuestProfile[] {
  return returningGuests(profiles)
    .filter((p) => p.lastChannel === "Booking" || p.lastChannel === "Airbnb")
    .sort(
      (a, b) =>
        b.spent - a.spent ||
        b.stays - a.stays ||
        a.recencyDays - b.recencyDays ||
        (a.email < b.email ? -1 : a.email > b.email ? 1 : 0),
    );
}

/** Every completed stay after each guest's first. */
export function returnStays(bookings: Booking[]): Booking[] {
  const seen = new Set<string>();
  return bookings
    .filter((booking) => booking.status === "Concluída")
    .sort(compareStays)
    .filter((stay) => {
      if (seen.has(stay.guest_email)) return true;
      seen.add(stay.guest_email);
      return false;
    });
}

/** For each return stay: the channel of the guest's first stay and of that stay. */
export function channelTransitions(bookings: Booking[]): ChannelTransition[] {
  const firstChannel = new Map(
    guestProfiles(bookings).map((p) => [p.email, p.firstChannel]),
  );
  const rows = new Map<string, ChannelTransition>();
  for (const stay of returnStays(bookings)) {
    const from = firstChannel.get(stay.guest_email);
    if (from === undefined) continue;
    const key = `${from}→${stay.channel}`;
    const row = rows.get(key) ?? { from, to: stay.channel, stays: 0 };
    row.stays += 1;
    rows.set(key, row);
  }
  return [...rows.values()].sort(
    (a, b) =>
      b.stays - a.stays ||
      a.from.localeCompare(b.from, "pt") ||
      a.to.localeCompare(b.to, "pt"),
  );
}

/** Returning guests with a night from November to February, sorted like contactFirst. */
export function winterReturners(bookings: Booking[]): GuestProfile[] {
  const winterGuests = new Set(
    bookings
      .filter(
        (booking) =>
          booking.status === "Concluída" &&
          stayNights(booking.check_in, booking.check_out).some((night) =>
            isBetween(night, WINTER.start, WINTER.end),
          ),
      )
      .map((booking) => booking.guest_email),
  );
  // The same order as contactFirst.
  return returningGuests(guestProfiles(bookings))
    .filter((profile) => winterGuests.has(profile.email))
    .sort(
      (a, b) =>
        b.spent - a.spent ||
        b.stays - a.stays ||
        a.recencyDays - b.recencyDays ||
        (a.email < b.email ? -1 : a.email > b.email ? 1 : 0),
    );
}

/** Guests, stays and spend, overall and for returning guests. */
export function guestTotals(bookings: Booking[]): GuestTotals {
  const profiles = guestProfiles(bookings);
  const returning = returningGuests(profiles);
  return {
    guests: profiles.length,
    stays: profiles.reduce((sum, p) => sum + p.stays, 0),
    spent: profiles.reduce((sum, p) => sum + p.spent, 0),
    returningGuests: returning.length,
    returningStays: returning.reduce((sum, p) => sum + p.stays, 0),
    returningSpent: returning.reduce((sum, p) => sum + p.spent, 0),
  };
}

/**
 * The label rules, by default. With 2 and 3 stays the base splits into 210
 * «Novo», 81 «Voltou» and 21 «Habitual»; 840 € is where the top 10% of
 * guests by spend start. Booking.com's Genius levels need 2, 5 and 15 stays
 * in two years: too many for a small house, where one guest has 5 stays.
 * The host can change them; these are the starting values.
 */
export const GUEST_RULES: GuestRules = {
  returned: 2,
  regular: 3,
  bigSpender: 840,
  longStay: 5,
};

/** The language to write in and the flag, by the country in the bookings. */
export const COUNTRY_LANGUAGE: Record<
  string,
  { language: LanguageCode; flag: string }
> = {
  Portugal: { language: "pt-PT", flag: "pt" },
  Brasil: { language: "pt-BR", flag: "br" },
  Espanha: { language: "es", flag: "es" },
  "Reino Unido": { language: "en", flag: "gb" },
  Alemanha: { language: "de", flag: "de" },
  França: { language: "fr", flag: "fr" },
  "Países Baixos": { language: "nl", flag: "nl" },
};

/** Addresses the platforms give for one stay: not for offers afterwards. */
const PLATFORM_ALIAS =
  /@(guest\.booking\.com|guest\.airbnb\.com|[\w.-]*expediapartnercentral\.com)$/i;

/** True for a Booking, Airbnb or Expedia relay address. */
export function isPlatformAlias(email: string): boolean {
  return PLATFORM_ALIAS.test(email.trim());
}

/** Winter from November to February, summer from June to September. */
export function seasonOf(checkIn: string): Season {
  const month = Number(checkIn.slice(5, 7));
  if (month >= 11 || month <= 2) return "inverno";
  if (month >= 6 && month <= 9) return "verao";
  return "meia";
}

/** The level for a number of stays. */
export function levelOf(stays: number, rules: GuestRules): GuestLevel {
  if (stays >= rules.regular) return "habitual";
  if (stays >= rules.returned) return "voltou";
  return "novo";
}

/** «longas» when the average stay is long enough, otherwise the season. */
export function profileOf(
  avgNights: number,
  season: Season,
  rules: GuestRules,
): GuestProfileId {
  return avgNights >= rules.longStay ? "longas" : season;
}

/** One card per guest with a completed stay, in the order of guestProfiles. */
export function guestCards(
  bookings: Booking[],
  rules: GuestRules = GUEST_RULES,
): GuestCard[] {
  const byGuest = new Map<string, Booking[]>();
  for (const stay of bookings
    .filter((booking) => booking.status === "Concluída")
    .sort(compareStays)) {
    const stays = byGuest.get(stay.guest_email);
    if (stays) stays.push(stay);
    else byGuest.set(stay.guest_email, [stay]);
  }
  return [...byGuest].map(([email, stays]) => {
    const last = stays[stays.length - 1];
    const spent = stays.reduce((sum, stay) => sum + stay.total, 0);
    const avgNights =
      stays.reduce((sum, stay) => sum + stay.nights, 0) / stays.length;
    const bySeason = new Map<Season, number>();
    for (const stay of stays) {
      const season = seasonOf(stay.check_in);
      bySeason.set(season, (bySeason.get(season) ?? 0) + 1);
    }
    const most = Math.max(...bySeason.values());
    const tied = [...bySeason].filter(([, n]) => n === most).map(([s]) => s);
    const season = tied.length === 1 ? tied[0] : seasonOf(last.check_in);
    const place = COUNTRY_LANGUAGE[last.country];
    return {
      email,
      name: stays[0].guest_name,
      country: last.country,
      countries: [...new Set(stays.map((stay) => stay.country))].sort((a, b) =>
        a.localeCompare(b, "pt"),
      ),
      language: place?.language ?? "en",
      flag: place?.flag ?? null,
      stays: stays.length,
      spent,
      avgNights,
      season,
      level: levelOf(stays.length, rules),
      profile: profileOf(avgNights, season, rules),
      bigSpender: spent >= rules.bigSpender,
      lastCheckIn: last.check_in,
      lastChannel: last.channel,
      history: stays.map((stay) => ({
        checkIn: stay.check_in,
        nights: stay.nights,
        guests: stay.guests,
        roomId: stay.room_id,
        channel: stay.channel,
        total: stay.total,
      })),
      platformAlias: isPlatformAlias(email),
    };
  });
}

/** How many guests in each level, profile and language. */
export function segmentCounts(
  cards: Pick<
    GuestCard,
    | "level"
    | "profile"
    | "language"
    | "bigSpender"
    | "countries"
    | "platformAlias"
  >[],
): SegmentCounts {
  const counts: SegmentCounts = {
    levels: { novo: 0, voltou: 0, habitual: 0 },
    profiles: { inverno: 0, verao: 0, meia: 0, longas: 0 },
    languages: { "pt-PT": 0, "pt-BR": 0, es: 0, en: 0, de: 0, fr: 0, nl: 0 },
    bigSpenders: 0,
    multiCountry: 0,
    platformAlias: 0,
  };
  for (const card of cards) {
    counts.levels[card.level] += 1;
    counts.profiles[card.profile] += 1;
    counts.languages[card.language] += 1;
    if (card.bigSpender) counts.bigSpenders += 1;
    if (card.countries.length > 1) counts.multiCountry += 1;
    if (card.platformAlias) counts.platformAlias += 1;
  }
  return counts;
}
