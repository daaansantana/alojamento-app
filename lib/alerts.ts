// Action alerts: the numbers behind them and their order by month
// (SPEC sections 3 and 4).

import { BOOKING_COMMISSION } from "@/lib/benchmarks";
import { monthNumber, monthsBetween, WINTER } from "@/lib/dates";
import { returnStays, winterReturners } from "@/lib/guests";
import { PAINEL_SUMMER } from "@/lib/painel";
import { simulatePricing } from "@/lib/simulator";
import { kpisByMonth, orphanNights } from "@/lib/stats";
import type {
  Alert,
  AlertFacts,
  AlertId,
  AlertWhen,
  Booking,
  Room,
} from "@/types";

/** The numbers behind the four alerts. */
export function alertFacts(bookings: Booking[], rooms: Room[]): AlertFacts {
  const byMonth = kpisByMonth(bookings, rooms);
  const winterMonths = new Set(monthsBetween(WINTER.start, WINTER.end));
  const occupancyOf = (month: number) =>
    byMonth.find((m) => monthNumber(`${m.period}-01`) === month)?.occupancy ??
    0;
  const platformStays = returnStays(bookings).filter(
    (stay) => stay.channel === "Booking" || stay.channel === "Airbnb",
  );
  const summer = simulatePricing(bookings, PAINEL_SUMMER);
  const orphans = orphanNights(bookings, rooms);
  return {
    winterEmptyNights: byMonth
      .filter((m) => winterMonths.has(m.period))
      .reduce((sum, m) => sum + m.nightsAvailable - m.nightsSold, 0),
    winterReturners: winterReturners(bookings).length,
    platformReturnStays: platformStays.length,
    commissionToday:
      platformStays.reduce((sum, stay) => sum + stay.total, 0) *
      BOOKING_COMMISSION,
    julyOccupancy: occupancyOf(7),
    augustOccupancy: occupancyOf(8),
    summerGain: summer.newRevenue - summer.baseRevenue,
    orphanNights: orphans.length,
    summerOrphanNights: orphans.filter((night) => {
      const month = monthNumber(night.date);
      return month >= 6 && month <= 9;
    }).length,
  };
}

/** The alerts for a month (1 to 12), in order; an alert whose number is 0 is left out. */
export function actionAlerts(facts: AlertFacts, month: number): Alert[] {
  const seasons: [number[], [AlertId, AlertWhen][]][] = [
    [
      [11, 12, 1, 2],
      [
        ["winter", "now"],
        ["commission", "always"],
        ["summer", "prepare"],
        ["orphans", "later"],
      ],
    ],
    [
      [3, 4, 5, 6],
      [
        ["summer", "prepare"],
        ["commission", "always"],
        ["orphans", "prepare"],
        ["winter", "later"],
      ],
    ],
    [
      [7, 8],
      [
        ["summer", "now"],
        ["orphans", "now"],
        ["commission", "always"],
        ["winter", "prepare"],
      ],
    ],
    [
      [9, 10],
      [
        ["winter", "prepare"],
        ["commission", "always"],
        ["orphans", "later"],
        ["summer", "later"],
      ],
    ],
  ];
  const numberOf: Record<AlertId, number> = {
    winter: facts.winterReturners,
    commission: facts.platformReturnStays,
    summer: facts.summerGain,
    orphans: facts.orphanNights,
  };
  const order = seasons.find(([months]) => months.includes(month))?.[1] ?? [];
  return order
    .filter(([id]) => numberOf[id] !== 0)
    .map(([id, when]) => ({ id, when }));
}
