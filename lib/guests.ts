// Guests: a guest is a guest_email; stays ordered by check_in, then id
// (SPEC sections 1 and 3).
// Not implemented yet: each function returns a placeholder of the right shape.

import {
  EXAMPLE_CHANNELS,
  exampleBookings,
  exampleProfiles,
} from "@/lib/placeholders";
import type { Booking, ChannelTransition, GuestProfile } from "@/types";

/** Every guest with at least one completed stay. */
export function guestProfiles(bookings: Booking[]): GuestProfile[] {
  // TODO: implement (SPEC section 4, "Guests")
  return exampleProfiles(312);
}

/** The profiles with 2 or more stays. */
export function returningGuests(profiles: GuestProfile[]): GuestProfile[] {
  // TODO: implement (SPEC section 4, "Guests")
  return exampleProfiles(102, 2);
}

/** Returning guests whose last channel is a platform, in contact order. */
export function contactFirst(profiles: GuestProfile[]): GuestProfile[] {
  // TODO: implement (SPEC section 3 for the order, section 4 for the values)
  return exampleProfiles(80, 2);
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
