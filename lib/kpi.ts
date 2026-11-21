// The KPI: how much the house can gain in a year, in three scenarios
// (SPEC sections 3 and 4, version 3). Only combines the two simulators.

import { BOOKING_COMMISSION } from "@/lib/benchmarks";
import {
  simulateDirectBookings,
  simulateWinterCampaign,
} from "@/lib/simulator";
import type { Booking, GainScenario } from "@/types";

type GainAssumptions = Pick<
  GainScenario,
  "id" | "conversionRate" | "directDiscount" | "winterReturnRate"
>;

/** The three sets of assumptions, in order: cautious, likely, optimistic. */
export const GAIN_SCENARIOS: readonly GainAssumptions[] = [
  {
    id: "cautious",
    conversionRate: 0.2,
    directDiscount: 0.05,
    winterReturnRate: 0.1,
  },
  {
    id: "likely",
    conversionRate: 0.5,
    directDiscount: 0.05,
    winterReturnRate: 0.2,
  },
  {
    id: "optimistic",
    conversionRate: 1,
    directDiscount: 0,
    winterReturnRate: 0.3,
  },
];

/** Direct bookings plus the extra winter stays at the normal price, per scenario. */
export function gainScenarios(bookings: Booking[]): GainScenario[] {
  return GAIN_SCENARIOS.map((scenario) => {
    const directGain = simulateDirectBookings(bookings, {
      commissionRate: BOOKING_COMMISSION,
      conversionRate: scenario.conversionRate,
      directDiscount: scenario.directDiscount,
    }).yearlyGain;
    const winterGain = simulateWinterCampaign(bookings, {
      returnRate: scenario.winterReturnRate,
      discount: 0,
    }).extraRevenue;
    return {
      ...scenario,
      directGain,
      winterGain,
      total: directGain + winterGain,
    };
  });
}
