// "What if" scenarios (SPEC sections 3 and 4).
// Not implemented yet: each function returns a placeholder of the right shape.

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
  // TODO: implement (SPEC section 4, "Direct-booking simulator")
  return {
    baseStays: 90,
    baseRevenue: 27000,
    commissionToday: 4000,
    yearlyGain: 1000,
    breakEvenDiscount: 0.12,
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
  // TODO: implement (SPEC section 4, "Pricing simulator")
  return {
    nightsSold: 250,
    baseRevenue: 25000,
    newRevenue: 26000,
    nightsForSameRevenue: 240,
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
