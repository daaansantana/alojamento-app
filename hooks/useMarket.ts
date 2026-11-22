"use client";

import { useMemo } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { MARKET_BY_MONTH } from "@/lib/benchmarks";
import { marketComparison } from "@/lib/market";
import type { MarketComparison } from "@/types";

/** The house's price per night next to the market's, month by month; null until the data is ready. */
export function useMarket(): MarketComparison | null {
  const dashboard = useDashboard();
  return useMemo(
    () =>
      dashboard ? marketComparison(dashboard.byMonth, MARKET_BY_MONTH) : null,
    [dashboard],
  );
}
