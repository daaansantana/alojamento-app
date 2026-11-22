// Date helpers (SPEC section 1): parse "YYYY-MM-DD" as UTC and read it with
// getUTC… methods, list the nights of a stay (check_in up to the day before
// check_out), month keys "YYYY-MM", the winter window (2025-11-01 to
// 2026-02-28) and the reference date (latest completed check-out, never
// today).

import type { Booking } from "@/types";

/** "2025-11-01" as a UTC date. */
export function parseDate(date: string): Date {
  return new Date(Date.parse(`${date}T00:00:00Z`));
}

/** The latest check-out of a completed stay, or null if there is none. */
export function referenceDate(bookings: Booking[]): string | null {
  let latest: string | null = null;
  for (const booking of bookings) {
    if (booking.status !== "Concluída") continue;
    if (latest === null || booking.check_out > latest) {
      latest = booking.check_out;
    }
  }
  return latest;
}

/** The month of a "YYYY-MM-DD" date, 1 to 12. */
export function monthNumber(date: string): number {
  return parseDate(date).getUTCMonth() + 1;
}
