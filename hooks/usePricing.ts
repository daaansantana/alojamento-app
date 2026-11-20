"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { simulatePricing } from "@/lib/simulator";
import type { PricingResult, PricingScenario } from "@/types";

/** Pricing simulator; null until the data is ready. */
export function usePricing(scenario: PricingScenario): PricingResult | null {
  const { bookings, status } = useData();
  const { priceChange, months } = scenario;

  return useMemo(() => {
    if (status !== "ready") return null;
    return simulatePricing(bookings, { priceChange, months });
  }, [bookings, status, priceChange, months]);
}
