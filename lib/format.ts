// Display formatting for the interface, in pt-PT. Pure: numbers in, text out.
// Every space inside a number and before the € is a no-break space (U+00A0),
// so the € never ends up alone on a line.

const NBSP = " ";

const numberFormats = new Map<number, Intl.NumberFormat>();

function formatNumber(value: number, decimals: number): string {
  let format = numberFormats.get(decimals);
  if (!format) {
    format = new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    numberFormats.set(decimals, format);
  }
  return format.format(value).replace(/\s/g, NBSP);
}

/** Euros: 1413 → "1413 €", 14625.93 → "14 626 €", eur(2643.84, 2) → "2643,84 €". */
export function eur(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)}${NBSP}€`;
}

/** A whole number: 1344 → "1344", 14626 → "14 626". */
export function int(value: number): string {
  return formatNumber(value, 0);
}

const percentFormats = new Map<number, Intl.NumberFormat>();

/** A share from 0 to 1 as a percentage: 0.4603 → "46%"; pct(0.155, 1) → "15,5%". */
export function pct(share: number, maxDecimals = 0): string {
  let format = percentFormats.get(maxDecimals);
  if (!format) {
    format = new Intl.NumberFormat("pt-PT", {
      style: "percent",
      maximumFractionDigits: maxDecimals,
    });
    percentFormats.set(maxDecimals, format);
  }
  return format.format(share).replace(/\s/g, NBSP);
}

const monthLong = new Intl.DateTimeFormat("pt-PT", {
  month: "long",
  timeZone: "UTC",
});
const monthAbbr = new Intl.DateTimeFormat("pt-PT", {
  month: "short",
  timeZone: "UTC",
});

/** The month's name, 1 to 12: 11 → "novembro". */
export function monthName(month: number): string {
  return monthLong.format(Date.UTC(2026, month - 1, 1));
}

/** The short name of a "YYYY-MM" period, without the dot: "2026-08" → "ago". */
export function monthShort(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return monthAbbr.format(Date.UTC(year, month - 1, 1)).replace(".", "");
}

/** Euros rounded to the nearest ten: 2034.10 → "2030 €", 8646.15 → "8650 €". */
export function about(value: number): string {
  return eur(Math.round(value / 10) * 10);
}
