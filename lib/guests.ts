// Guests: a guest is a guest_email; stays ordered by check_in, then id
// (SPEC sections 1 and 3).
// Not implemented yet: each function returns a placeholder of the right shape.

import {
  compareStays,
  daysBetween,
  isBetween,
  referenceDate,
  stayNights,
  WINTER,
} from "@/lib/dates";
import {
  EXAMPLE_CHANNELS,
  exampleBookings,
  exampleProfiles,
} from "@/lib/placeholders";
import type {
  Booking,
  ChannelTransition,
  GuestProfile,
  GuestTotals,
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
  // TODO: implement (SPEC section 4, "Guest totals")
  return {
    guests: 300,
    stays: 420,
    spent: 120000,
    returningGuests: 100,
    returningStays: 220,
    returningSpent: 60000,
  };
}
