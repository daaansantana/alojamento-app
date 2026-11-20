// Placeholder values for the functions that are not implemented yet.
// Same shape and size as the real results (12 months, 8 rooms, 3 channels),
// but deliberately different numbers, so the golden tests fail until each
// function is implemented. Delete this file once nothing imports it.

import type { Booking, GuestProfile } from "@/types";

export const EXAMPLE_CHANNELS = ["Booking", "Airbnb", "Direto"];

export const EXAMPLE_COUNTRIES = [
  "Portugal",
  "Espanha",
  "Reino Unido",
  "Alemanha",
  "Brasil",
  "França",
  "Países Baixos",
];

export const EXAMPLE_ROOM_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

// A year that is not the data's period, so no month can match by accident.
export const EXAMPLE_MONTHS = Array.from(
  { length: 12 },
  (_, i) => `2024-${String(i + 1).padStart(2, "0")}`,
);

export function exampleProfiles(count: number, minStays = 1): GuestProfile[] {
  return Array.from({ length: count }, (_, i) => {
    const stays = minStays + (i % 3);
    return {
      email: `hospede${i + 1}@exemplo.pt`,
      name: `Hóspede ${i + 1}`,
      stays,
      spent: 300 * stays,
      firstCheckIn: "2024-03-01",
      lastCheckOut: "2024-09-01",
      recencyDays: 60,
      firstChannel: EXAMPLE_CHANNELS[i % 3],
      lastChannel: EXAMPLE_CHANNELS[(i + 1) % 2],
      everDirect: i % 2 === 0,
      r: 2,
      f: stays >= 3 ? 3 : stays === 2 ? 2 : 1,
      m: 2,
    };
  });
}

export function exampleBookings(count: number): Booking[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    room_id: EXAMPLE_ROOM_IDS[i % 8],
    guest_name: `Hóspede ${i + 1}`,
    guest_email: `hospede${i + 1}@exemplo.pt`,
    country: EXAMPLE_COUNTRIES[i % 7],
    check_in: "2024-06-01",
    check_out: "2024-06-04",
    nights: 3,
    guests: 2,
    channel: EXAMPLE_CHANNELS[i % 3],
    total: 300,
    status: "Concluída",
  }));
}
