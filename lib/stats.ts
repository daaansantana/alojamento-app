// Totals, rankings and groupings over completed stays (SPEC sections 1 and 3).
// Not implemented yet: each function returns a placeholder of the right shape.

import {
  daysInMonth,
  monthKey,
  monthsBetween,
  PERIOD,
  soldNights,
} from "@/lib/dates";
import {
  EXAMPLE_CHANNELS,
  EXAMPLE_COUNTRIES,
  EXAMPLE_MONTHS,
  EXAMPLE_ROOM_IDS,
} from "@/lib/placeholders";
import type {
  Booking,
  CancellationRate,
  ChannelMix,
  ChannelNet,
  CommissionRates,
  MonthTemperature,
  OrphanNight,
  PeriodKpi,
  Room,
  RoomKpi,
  RoomMonthOccupancy,
  ThermometerThresholds,
} from "@/types";

/** The whole period, with `period: "year"`. */
export function kpisForYear(bookings: Booking[], rooms: Room[]): PeriodKpi {
  const months = kpisByMonth(bookings, rooms);
  const nightsSold = months.reduce((sum, m) => sum + m.nightsSold, 0);
  const nightsAvailable = months.reduce((sum, m) => sum + m.nightsAvailable, 0);
  const revenue = months.reduce((sum, m) => sum + m.revenue, 0);
  return {
    period: "year",
    nightsSold,
    nightsAvailable,
    occupancy: nightsAvailable ? nightsSold / nightsAvailable : 0,
    revenue,
    adr: nightsSold ? revenue / nightsSold : 0,
    revpar: nightsAvailable ? revenue / nightsAvailable : 0,
  };
}

/** 12 rows, oldest month first. */
export function kpisByMonth(bookings: Booking[], rooms: Room[]): PeriodKpi[] {
  const nights = soldNights(bookings);
  return monthsBetween(PERIOD.start, PERIOD.end).map((period) => {
    const inMonth = nights.filter((night) => monthKey(night.date) === period);
    const nightsSold = inMonth.length;
    const nightsAvailable = rooms.length * daysInMonth(period);
    const revenue = inMonth.reduce((sum, night) => sum + night.revenue, 0);
    return {
      period,
      nightsSold,
      nightsAvailable,
      occupancy: nightsAvailable ? nightsSold / nightsAvailable : 0,
      revenue,
      adr: nightsSold ? revenue / nightsSold : 0,
      revpar: nightsAvailable ? revenue / nightsAvailable : 0,
    };
  });
}

/** 8 rows, one per room. */
export function kpisByRoom(bookings: Booking[], rooms: Room[]): RoomKpi[] {
  // TODO: implement (SPEC section 4, "By room")
  return EXAMPLE_ROOM_IDS.map((roomId) => ({
    roomId,
    name: `Quarto ${roomId}`,
    nightsSold: 150,
    nightsAvailable: 365,
    occupancy: 150 / 365,
    revenue: 15000,
  }));
}

/** 3 rows, highest revenue first. */
export function channelMix(bookings: Booking[]): ChannelMix[] {
  // TODO: implement (SPEC section 4, "Channel mix")
  return EXAMPLE_CHANNELS.map((channel) => ({
    channel,
    bookings: 160,
    bookingsShare: 1 / 3,
    nightsSold: 400,
    nightsShare: 1 / 3,
    revenue: 40000,
    revenueShare: 1 / 3,
  }));
}

/** One row per channel or per country, highest rate first. */
export function cancellationRates(
  bookings: Booking[],
  by: "channel" | "country",
): CancellationRate[] {
  // TODO: implement (SPEC section 4, "Cancellations")
  const keys = by === "channel" ? EXAMPLE_CHANNELS : EXAMPLE_COUNTRIES;
  return keys.map((key) => ({
    key,
    bookings: 60,
    cancelled: 6,
    rate: 0.1,
  }));
}

/** 3 rows, highest net revenue first. */
export function channelNet(
  bookings: Booking[],
  rates: CommissionRates,
): ChannelNet[] {
  // TODO: implement (SPEC section 4, "Net revenue by channel")
  return EXAMPLE_CHANNELS.map((channel) => ({
    channel,
    nightsSold: 400,
    revenue: 40000,
    commissionRate: 0.1,
    commission: 4000,
    netRevenue: 36000,
    netAdr: 90,
  }));
}

/** 96 rows (8 rooms × 12 months), by room then month. */
export function occupancyByRoomMonth(
  bookings: Booking[],
  rooms: Room[],
): RoomMonthOccupancy[] {
  // TODO: implement (SPEC section 4, "Occupancy by room and month")
  return EXAMPLE_ROOM_IDS.flatMap((roomId) =>
    EXAMPLE_MONTHS.map((month) => ({
      roomId,
      month,
      nightsSold: 12,
      nightsAvailable: 30,
      occupancy: 0.4,
    })),
  );
}

/** Empty nights between two occupied nights in the same room, by room then date. */
export function orphanNights(
  bookings: Booking[],
  rooms: Room[],
): OrphanNight[] {
  // TODO: implement (SPEC section 4, "Orphan nights")
  return EXAMPLE_ROOM_IDS.map((roomId) => ({ roomId, date: "2024-07-15" }));
}

/** Occupancy thresholds the app uses for the price thermometer. */
export const THERMOMETER: ThermometerThresholds = { hot: 0.55, cold: 0.4 };

/** One row per row of byMonth, same order, with its level. */
export function priceThermometer(
  byMonth: PeriodKpi[],
  thresholds: ThermometerThresholds,
): MonthTemperature[] {
  // TODO: implement (SPEC section 4, "Price thermometer")
  return EXAMPLE_MONTHS.map((period, i) => ({
    period,
    occupancy: 0.45,
    adr: 100,
    level: i >= 5 && i <= 7 ? "hot" : i <= 1 ? "cold" : "normal",
  }));
}
