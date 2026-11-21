"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import {
  channelTransitions,
  contactFirst,
  guestProfiles,
  guestTotals,
  returningGuests,
  returnStays,
  winterReturners,
} from "@/lib/guests";
import type { ReturningData } from "@/types";

/** Returning guests and their stays; null until the data is ready. */
export function useReturningGuests(): ReturningData | null {
  const { bookings, status } = useData();

  return useMemo(() => {
    if (status !== "ready") return null;
    const profiles = guestProfiles(bookings);
    return {
      returning: returningGuests(profiles),
      contactFirst: contactFirst(profiles),
      winterReturners: winterReturners(bookings),
      transitions: channelTransitions(bookings),
      returnStays: returnStays(bookings),
      totals: guestTotals(bookings),
    };
  }, [bookings, status]);
}
