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

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
