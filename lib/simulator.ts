// "What if" scenarios (SPEC sections 3 and 4).
// Not implemented yet: each function returns a placeholder of the right shape.

import { monthKey, soldNights } from "@/lib/dates";
import { returnStays } from "@/lib/guests";
import type {
  Booking,
  DirectBookingResult,
  DirectBookingScenario,
  PricingResult,
  PricingScenario,
  Room,
  WinterCampaignResult,
  WinterCampaignScenario,
  WinterRoomResult,
  WinterRoomScenario,
} from "@/types";

/** Platform return stays moved to the direct channel. */
export function simulateDirectBookings(
  bookings: Booking[],
  scenario: DirectBookingScenario,
): DirectBookingResult {
  const { commissionRate, conversionRate, directDiscount } = scenario;
  const platformStays = returnStays(bookings).filter(
    (stay) => stay.channel === "Booking" || stay.channel === "Airbnb",
  );
  const baseRevenue = platformStays.reduce((sum, stay) => sum + stay.total, 0);
  return {
    baseStays: platformStays.length,
    baseRevenue,
    commissionToday: baseRevenue * commissionRate,
    yearlyGain:
      baseRevenue * conversionRate * (commissionRate - directDiscount),
    breakEvenDiscount: commissionRate,
  };
}

/** One room leaves short stays from November to February for one long stay. */
export function simulateWinterRoom(
  bookings: Booking[],
  rooms: Room[],
  scenario: WinterRoomScenario,
): WinterRoomResult {
  // TODO: implement (SPEC section 4, "Winter room")
  return {
    roomId: scenario.roomId,
    months: 4,
    winterNights: 30,
    winterRevenue: 3000,
    displacedStays: 10,
    relocatableStays: 9,
    lostRevenue: 500,
    longStayRevenue: 3000,
    netGain: 2500,
  };
}

/** A price change in some months, if the same nights sell. */
export function simulatePricing(
  bookings: Booking[],
  scenario: PricingScenario,
): PricingResult {
  const months = new Set(scenario.months);
  const nights = soldNights(bookings).filter((night) =>
    months.has(monthKey(night.date)),
  );
  const baseRevenue = nights.reduce((sum, night) => sum + night.revenue, 0);
  const factor = 1 + scenario.priceChange;
  return {
    nightsSold: nights.length,
    baseRevenue,
    newRevenue: baseRevenue * factor,
    nightsForSameRevenue: nights.length / factor,
  };
}

/** A winter campaign for the guests who already came in winter. */
export function simulateWinterCampaign(
  bookings: Booking[],
  scenario: WinterCampaignScenario,
): WinterCampaignResult {
  // TODO: implement (SPEC section 4, "Winter campaign")
  return {
    guests: 40,
    extraStays: 8,
    avgStayValue: 280,
    extraRevenue: 2016,
    discountCost: 224,
  };
}
