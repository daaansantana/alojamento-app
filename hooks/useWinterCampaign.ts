"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { simulateWinterCampaign } from "@/lib/simulator";
import type { WinterCampaignResult, WinterCampaignScenario } from "@/types";

/** Winter-campaign simulator; null until the data is ready. */
export function useWinterCampaign(
  scenario: WinterCampaignScenario,
): WinterCampaignResult | null {
  const { bookings, status } = useData();
  const { returnRate, discount } = scenario;

  return useMemo(() => {
    if (status !== "ready") return null;
    return simulateWinterCampaign(bookings, { returnRate, discount });
  }, [bookings, status, returnRate, discount]);
}
