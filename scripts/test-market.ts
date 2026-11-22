// MARKET_BY_MONTH: the same 12 months as kpisByMonth, positive values, and a
// source and a publication date for each one.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MARKET_BY_MONTH } from "../lib/benchmarks";
import { kpisByMonth } from "../lib/stats";
import type { Booking, Room } from "../types";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) console.log(`  ✔ ${name}`);
  else {
    failures += 1;
    console.error(`  ✘ ${name} ${detail}`);
  }
}

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), "public", "data", file), "utf8"));
const rooms = load<Room[]>("quartos.json");
const bookings = load<Booking[]>("reservas.json");
const periods = kpisByMonth(bookings, rooms).map((m) => m.period);

console.log("market by month");
check("12 months", MARKET_BY_MONTH.length === 12, `${MARKET_BY_MONTH.length}`);
check(
  "the same periods as kpisByMonth, in order",
  JSON.stringify(MARKET_BY_MONTH.map((m) => m.period)) ===
    JSON.stringify(periods),
);
check(
  "positive values",
  MARKET_BY_MONTH.every((m) => m.adr > 0 && m.revpar > 0),
);
check(
  "a price per occupied room above the price per available room",
  MARKET_BY_MONTH.every((m) => m.adr >= m.revpar),
);
check(
  "each value has an INE link and a publication date",
  MARKET_BY_MONTH.every(
    (m) =>
      m.url.startsWith("https://www.ine.pt/") &&
      /^\d{4}-\d{2}-\d{2}$/.test(m.published),
  ),
);
check(
  "a stand-in is the same month a year before",
  MARKET_BY_MONTH.every(
    (m) =>
      m.from === m.period ||
      m.from === `${Number(m.period.slice(0, 4)) - 1}${m.period.slice(4)}`,
  ),
);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
