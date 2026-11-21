// Totals, rankings and groupings over completed stays (SPEC sections 1 and 3).
// Not implemented yet: each function returns a placeholder of the right shape.

import {
  datesBetween,
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
  const nightsAvailable = datesBetween(PERIOD.start, PERIOD.end).length;
  const byRoom = new Map(
    rooms.map((room) => [room.id, { nightsSold: 0, revenue: 0 }]),
  );
  for (const night of soldNights(bookings)) {
    const row = byRoom.get(night.booking.room_id);
    if (!row) continue;
    row.nightsSold += 1;
    row.revenue += night.revenue;
  }
  return [...rooms]
    .sort((a, b) => a.id - b.id)
    .map((room) => {
      const { nightsSold, revenue } = byRoom.get(room.id) ?? {
        nightsSold: 0,
        revenue: 0,
      };
      return {
        roomId: room.id,
        name: room.name,
        nightsSold,
        nightsAvailable,
        occupancy: nightsSold / nightsAvailable,
        revenue,
      };
    });
}

/** 3 rows, highest revenue first. */
export function channelMix(bookings: Booking[]): ChannelMix[] {
  const nights = soldNights(bookings);
  const totalRevenue = nights.reduce((sum, night) => sum + night.revenue, 0);
  const channels = [...new Set(bookings.map((booking) => booking.channel))];
  return channels
    .map((channel) => {
      const count = bookings.filter((b) => b.channel === channel).length;
      const inChannel = nights.filter((n) => n.booking.channel === channel);
      const revenue = inChannel.reduce((sum, night) => sum + night.revenue, 0);
      return {
        channel,
        bookings: count,
        bookingsShare: count / bookings.length,
        nightsSold: inChannel.length,
        nightsShare: nights.length ? inChannel.length / nights.length : 0,
        revenue,
        revenueShare: totalRevenue ? revenue / totalRevenue : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
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
