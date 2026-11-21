"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { actionAlerts, alertFacts } from "@/lib/alerts";
import { monthNumber, referenceDate } from "@/lib/dates";
import { useDataStore } from "@/store/useDataStore";
import type { Alert, AlertFacts } from "@/types";

/** Action alerts for the selected month (or the reference date's); null until the data is ready. */
export function useAlerts(): {
  month: number;
  alerts: Alert[];
  facts: AlertFacts;
} | null {
  const { rooms, bookings, status } = useData();
  const selectedMonth = useDataStore((state) => state.selectedMonth);

  return useMemo(() => {
    if (status !== "ready") return null;
    const reference = referenceDate(bookings);
    const month =
      selectedMonth ?? (reference === null ? null : monthNumber(reference));
    if (month === null) return null;
    const facts = alertFacts(bookings, rooms);
    return { month, alerts: actionAlerts(facts, month), facts };
  }, [rooms, bookings, status, selectedMonth]);
}
