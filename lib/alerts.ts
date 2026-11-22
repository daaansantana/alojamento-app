// Action alerts: the numbers behind them and their order by month
// (SPEC sections 3 and 4).
// Not implemented yet: each function returns a placeholder of the right shape.

import type { Alert, AlertFacts, Booking, Room } from "@/types";

/** The numbers behind the four alerts. */
export function alertFacts(bookings: Booking[], rooms: Room[]): AlertFacts {
  // TODO: implement (SPEC section 4, "Alert facts and action alerts")
  return {
    winterEmptyNights: 500,
    winterReturners: 40,
    platformReturnStays: 90,
    commissionToday: 4000,
    julyOccupancy: 0.5,
    augustOccupancy: 0.6,
    summerGain: 2500,
    orphanNights: 8,
    summerOrphanNights: 4,
  };
}

/** The alerts for a month (1 to 12), in order; an alert whose number is 0 is left out. */
export function actionAlerts(facts: AlertFacts, month: number): Alert[] {
  // TODO: implement (SPEC section 4, "Alert facts and action alerts")
  return [
    { id: "commission", when: "always" },
    { id: "winter", when: "now" },
    { id: "summer", when: "prepare" },
    { id: "orphans", when: "later" },
  ];
}
