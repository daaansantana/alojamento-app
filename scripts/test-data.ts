import { monthNumber, referenceDate } from "../lib/dates";
import roomsJson from "../public/data/quartos.json";
import bookingsJson from "../public/data/reservas.json";
import type { Booking, Room } from "../types";

const rooms: Room[] = roomsJson;
const bookings: Booking[] = bookingsJson;
let failures = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  ✔ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${name} ${detail}`);
  }
}

console.log("data");
check("8 rooms in quartos.json", rooms.length === 8, `(got ${rooms.length})`);
check(
  "481 bookings in reservas.json",
  bookings.length === 481,
  `(got ${bookings.length})`,
);

console.log("\ndates");
const reference = referenceDate(bookings);
check(
  "reference date is the latest completed check-out, 2026-11-02",
  reference === "2026-11-02",
  `(got ${reference})`,
);
check("its month is 11", monthNumber("2026-11-02") === 11);
check("month of 2026-01-31 is 1", monthNumber("2026-01-31") === 1);
check("no completed stay gives null", referenceDate([]) === null);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
