// The house's price per night next to the market's, month by month.
import type {
  MarketComparison,
  MarketComparisonMonth,
  MarketMonth,
  PeriodKpi,
} from "@/types";

/** Within 1 € of the market counts as level. */
const LEVEL = 1;

/** The house's adr against the market's, for every month in byMonth. */
export function marketComparison(
  byMonth: PeriodKpi[],
  market: MarketMonth[],
): MarketComparison {
  const byPeriod = new Map(market.map((m) => [m.period, m]));
  const months: MarketComparisonMonth[] = byMonth.map((month) => {
    const found = byPeriod.get(month.period);
    if (!found) throw new Error(`no market value for ${month.period}`);
    return {
      period: month.period,
      house: month.adr,
      market: found.adr,
      difference: month.adr - found.adr,
      from: found.from,
      substitute: found.from !== found.period,
    };
  });
  const below = months.filter((m) => m.difference <= -LEVEL).length;
  const above = months.filter((m) => m.difference >= LEVEL).length;
  const widest = months.reduce((w, m) =>
    Math.abs(m.difference) > Math.abs(w.difference) ? m : w,
  );
  return {
    months,
    below,
    above,
    level: months.length - below - above,
    widest,
  };
}
