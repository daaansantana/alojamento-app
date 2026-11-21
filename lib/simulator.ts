// "What if" scenarios (SPEC sections 3 and 4).

import {
  compareStays,
  isBetween,
  monthKey,
  monthsBetween,
  soldNights,
  stayNights,
  WINTER,
} from "@/lib/dates";
import { returnStays, winterReturners } from "@/lib/guests";
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
  const { roomId, monthlyRate } = scenario;
  const inWinter = (night: string) =>
    isBetween(night, WINTER.start, WINTER.end);
  const completed = bookings.filter((b) => b.status === "Concluída");

  // The nights each room is taken, by a completed stay or a stay moved there.
  const taken = new Map(rooms.map((room) => [room.id, new Set<string>()]));
  for (const stay of completed) {
    const nights = taken.get(stay.room_id);
    for (const night of stayNights(stay.check_in, stay.check_out)) {
      nights?.add(night);
    }
  }

  const winter = soldNights(bookings).filter(
    (night) => night.booking.room_id === roomId && inWinter(night.date),
  );
  const displaced = completed
    .filter(
      (stay) =>
        stay.room_id === roomId &&
        stayNights(stay.check_in, stay.check_out).some(inWinter),
    )
    .sort(compareStays);
  // Cheapest first, then the lowest id: upgrades are the last resort.
  const others = rooms
    .filter((room) => room.id !== roomId)
    .sort((a, b) => a.price_per_night - b.price_per_night || a.id - b.id);

  let relocatableStays = 0;
  let lostRevenue = 0;
  for (const stay of displaced) {
    const nights = stayNights(stay.check_in, stay.check_out);
    const target = others.find(
      (room) =>
        room.capacity >= stay.guests &&
        nights.every((night) => !taken.get(room.id)?.has(night)),
    );
    if (target) {
      relocatableStays += 1;
      for (const night of nights) taken.get(target.id)?.add(night);
    } else {
      lostRevenue += stay.total;
    }
  }

  const months = monthsBetween(WINTER.start, WINTER.end).length;
  const longStayRevenue = monthlyRate * months;
  return {
    roomId,
    months,
    winterNights: winter.length,
    winterRevenue: winter.reduce((sum, night) => sum + night.revenue, 0),
    displacedStays: displaced.length,
    relocatableStays,
    lostRevenue,
    longStayRevenue,
    netGain: longStayRevenue - lostRevenue,
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
  const guests = winterReturners(bookings).length;
  const winterStays = bookings.filter(
    (b) =>
      b.status === "Concluída" &&
      isBetween(b.check_in, WINTER.start, WINTER.end),
  );
  const avgStayValue = winterStays.length
    ? winterStays.reduce((sum, stay) => sum + stay.total, 0) /
      winterStays.length
    : 0;
  const extraStays = Math.round(guests * scenario.returnRate);
  const value = extraStays * avgStayValue;
  return {
    guests,
    extraStays,
    avgStayValue,
    extraRevenue: value * (1 - scenario.discount),
    discountCost: value * scenario.discount,
  };
}
