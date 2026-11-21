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
  const keyOf = (booking: Booking) =>
    by === "channel" ? booking.channel : booking.country;
  const keys = [...new Set(bookings.map(keyOf))];
  return keys
    .map((key) => {
      const rows = bookings.filter((booking) => keyOf(booking) === key);
      const cancelled = rows.filter((b) => b.status === "Cancelada").length;
      return {
        key,
        bookings: rows.length,
        cancelled,
        rate: cancelled / rows.length,
      };
    })
    .sort((a, b) => b.rate - a.rate || a.key.localeCompare(b.key, "pt"));
}

/** 3 rows, highest net revenue first. */
export function channelNet(
  bookings: Booking[],
  rates: CommissionRates,
): ChannelNet[] {
  const nights = soldNights(bookings);
  const channels = [...new Set(bookings.map((booking) => booking.channel))];
  return channels
    .map((channel) => {
      const inChannel = nights.filter((n) => n.booking.channel === channel);
      const revenue = inChannel.reduce((sum, night) => sum + night.revenue, 0);
      const commissionRate = rates[channel] ?? 0;
      const commission = revenue * commissionRate;
      const netRevenue = revenue - commission;
      return {
        channel,
        nightsSold: inChannel.length,
        revenue,
        commissionRate,
        commission,
        netRevenue,
        netAdr: inChannel.length ? netRevenue / inChannel.length : 0,
      };
    })
    .sort((a, b) => b.netRevenue - a.netRevenue);
}

/** 96 rows (8 rooms × 12 months), by room then month. */
export function occupancyByRoomMonth(
  bookings: Booking[],
  rooms: Room[],
): RoomMonthOccupancy[] {
  const months = monthsBetween(PERIOD.start, PERIOD.end);
  const sold = new Map(
    rooms.map((room) => [room.id, new Map<string, number>()]),
  );
  for (const night of soldNights(bookings)) {
    const byMonth = sold.get(night.booking.room_id);
    if (!byMonth) continue;
    const month = monthKey(night.date);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  return [...rooms]
    .sort((a, b) => a.id - b.id)
    .flatMap((room) =>
      months.map((month) => {
        const nightsSold = sold.get(room.id)?.get(month) ?? 0;
        const nightsAvailable = daysInMonth(month);
        return {
          roomId: room.id,
          month,
          nightsSold,
          nightsAvailable,
          occupancy: nightsSold / nightsAvailable,
        };
      }),
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
