"use client";

import { useShallow } from "zustand/react/shallow";
import { useDataStore } from "@/store/useDataStore";

/** The month picked for the alerts (null = the reference date's month) and how to change it. */
export function useMonthSelection(): {
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
} {
  return useDataStore(
    useShallow((state) => ({
      selectedMonth: state.selectedMonth,
      setSelectedMonth: state.setSelectedMonth,
    })),
  );
}
