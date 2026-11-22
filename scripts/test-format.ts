import { dayOf } from "../lib/dates";
import {
  about,
  dayMonth,
  eur,
  int,
  monthName,
  monthShort,
  pct,
} from "../lib/format";

let failures = 0;

function check(name: string, actual: string, expected: string) {
  if (actual === expected) {
    console.log(`  ✔ ${name} → ${actual}`);
  } else {
    failures += 1;
    console.error(
      `  ✘ ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

const NBSP = " ";

console.log("format");
check("eur(1413)", eur(1413), `1413${NBSP}€`);
check("eur(14625.93)", eur(14625.93), `14${NBSP}626${NBSP}€`);
check("eur(2643.84, 2)", eur(2643.84, 2), `2643,84${NBSP}€`);
check("int(1344)", int(1344), "1344");
check("int(14626)", int(14626), `14${NBSP}626`);
check("pct(0.4603)", pct(0.4603), "46%");
check("pct(0.6452)", pct(0.6452), "65%");
check("pct(0.155, 1)", pct(0.155, 1), "15,5%");
check("pct(0.15, 1)", pct(0.15, 1), "15%");
check("monthName(11)", monthName(11), "novembro");
check('monthShort("2026-08")', monthShort("2026-08"), "ago");
check("about(2034.10)", about(2034.1), `2030${NBSP}€`);
check('dayMonth("2026-11-21")', dayMonth("2026-11-21"), "21 de novembro");
check('dayMonth("2026-03-01")', dayMonth("2026-03-01"), "1 de março");
check(
  "dayOf(a local moment)",
  dayOf(new Date(2026, 10, 21, 23, 30).getTime()),
  "2026-11-21",
);
check("about(4350.85)", about(4350.85), `4350${NBSP}€`);
check("about(8646.15)", about(8646.15), `8650${NBSP}€`);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
