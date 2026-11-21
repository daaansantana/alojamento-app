// Guests: a guest is a guest_email; stays ordered by check_in, then id
// (SPEC sections 1 and 3).
// Not implemented yet: each function returns a placeholder of the right shape.

import { compareStays, daysBetween, referenceDate } from "@/lib/dates";
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
  // TODO: implement (SPEC section 4, "Guests")
  return exampleBookings(128);
}

/** For each return stay: the channel of the guest's first stay and of that stay. */
export function channelTransitions(bookings: Booking[]): ChannelTransition[] {
  // TODO: implement (SPEC section 4, "Channel transitions")
  return EXAMPLE_CHANNELS.flatMap((from) =>
    EXAMPLE_CHANNELS.map((to) => ({ from, to, stays: 10 })),
  );
}

/** Returning guests with a night from November to February, sorted like contactFirst. */
export function winterReturners(bookings: Booking[]): GuestProfile[] {
  // TODO: implement (SPEC section 4, "Winter returners")
  return exampleProfiles(40, 2);
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
