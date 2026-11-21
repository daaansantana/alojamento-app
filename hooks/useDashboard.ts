"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { AIRBNB_HOST_FEE, BOOKING_COMMISSION } from "@/lib/benchmarks";
import {
  cancellationRates,
  channelMix,
  channelNet,
  kpisByMonth,
  kpisByRoom,
  kpisForYear,
  occupancyByRoomMonth,
  orphanNights,
} from "@/lib/stats";
import type { CommissionRates, DashboardData } from "@/types";

const TYPICAL_RATES: CommissionRates = {
  Booking: BOOKING_COMMISSION,
  Airbnb: AIRBNB_HOST_FEE,
  Direto: 0,
};

/** Everything the dashboard shows; null until the data is ready. */
export function useDashboard(): DashboardData | null {
  const { rooms, bookings, status } = useData();

  return useMemo(() => {
    if (status !== "ready") return null;
    return {
      year: kpisForYear(bookings, rooms),
      byMonth: kpisByMonth(bookings, rooms),
      byRoom: kpisByRoom(bookings, rooms),
      channels: channelMix(bookings),
      netByChannel: channelNet(bookings, TYPICAL_RATES),
      roomMonth: occupancyByRoomMonth(bookings, rooms),
      orphanNights: orphanNights(bookings, rooms),
      cancellationsByChannel: cancellationRates(bookings, "channel"),
      cancellationsByCountry: cancellationRates(bookings, "country"),
    };
  }, [rooms, bookings, status]);
}
