"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { simulateDirectBookings } from "@/lib/simulator";
import type { DirectBookingResult, DirectBookingScenario } from "@/types";

/** Direct-booking simulator; null until the data is ready. */
export function useDirectSimulation(
  scenario: DirectBookingScenario,
): DirectBookingResult | null {
  const { bookings, status } = useData();
  const { commissionRate, conversionRate, directDiscount } = scenario;

  return useMemo(() => {
    if (status !== "ready") return null;
    return simulateDirectBookings(bookings, {
      commissionRate,
      conversionRate,
      directDiscount,
    });
  }, [bookings, status, commissionRate, conversionRate, directDiscount]);
}
