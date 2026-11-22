// Date helpers (SPEC section 1): parse "YYYY-MM-DD" as UTC and read it with
// getUTC… methods, list the nights of a stay (check_in up to the day before
// check_out), month keys "YYYY-MM", the winter window (2025-11-01 to
// 2026-02-28) and the reference date (latest completed check-out, never
// today).

import type { Booking } from "@/types";

const DAY_MS = 86_400_000;

/** The period of the data: 365 nights, November 2025 to October 2026. */
export const PERIOD = { start: "2025-11-01", end: "2026-10-31" } as const;

/** The winter window: November to February, 120 nights. */
export const WINTER = { start: "2025-11-01", end: "2026-02-28" } as const;

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

/** A UTC date back to "YYYY-MM-DD". */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The date a number of days after (or before, when negative) another. */
export function addDays(date: string, days: number): string {
  return formatDate(new Date(parseDate(date).getTime() + days * DAY_MS));
}

/** Whole days from one date to another: ("2026-09-23", "2026-11-02") → 40. */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (parseDate(to).getTime() - parseDate(from).getTime()) / DAY_MS,
  );
}

/** Whether a date falls from start to end, both included. */
export function isBetween(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/** Every date from start to end, both included. */
export function datesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
}

/** The nights of a stay: check_in up to the day before check_out. */
export function stayNights(checkIn: string, checkOut: string): string[] {
  return datesBetween(checkIn, addDays(checkOut, -1));
}

/** The month key of a date: "2026-08-15" → "2026-08". */
export function monthKey(date: string): string {
  return formatDate(parseDate(date)).slice(0, 7);
}

/** Every month key from the month of start to the month of end. */
export function monthsBetween(start: string, end: string): string[] {
  const first = parseDate(start);
  const last = monthKey(end);
  const months: string[] = [];
  for (let i = 0; ; i++) {
    const month = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1),
    );
    const key = formatDate(month).slice(0, 7);
    if (key > last) break;
    months.push(key);
  }
  return months;
}

/** The days in a month: "2026-02" → 28. */
export function daysInMonth(month: string): number {
  const first = parseDate(`${month}-01`);
  return new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

/** A guest's stays in order: by check_in, then id. */
export function compareStays(a: Booking, b: Booking): number {
  if (a.check_in !== b.check_in) return a.check_in < b.check_in ? -1 : 1;
  return a.id - b.id;
}

/** One night sold inside the period, on its own date. */
export interface SoldNight {
  date: string;
  booking: Booking;
  revenue: number; // total ÷ nights
}

/**
 * Every night sold inside the period: completed stays only, each night on its
 * own date, so the nights after 31 Oct 2026 are left out.
 */
export function soldNights(bookings: Booking[]): SoldNight[] {
  const nights: SoldNight[] = [];
  for (const booking of bookings) {
    if (booking.status !== "Concluída") continue;
    const revenue = booking.total / booking.nights;
    for (const date of stayNights(booking.check_in, booking.check_out)) {
      if (isBetween(date, PERIOD.start, PERIOD.end)) {
        nights.push({ date, booking, revenue });
      }
    }
  }
  return nights;
}
