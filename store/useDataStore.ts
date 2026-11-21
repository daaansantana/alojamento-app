import { create } from "zustand";
import { fetchBookings, fetchRooms } from "@/services/data";
import type { Booking, DataStatus, Room } from "@/types";

interface DataState {
  rooms: Room[];
  bookings: Booking[];
  status: DataStatus;
  error: string | null;
  load: () => Promise<void>;
}

// Reads quartos.json and reservas.json once and shares them between pages.
// The data is the same static files for everyone and is only loaded in the
// browser, so one module-level store is enough.
export const useDataStore = create<DataState>()((set, get) => ({
  rooms: [],
  bookings: [],
  status: "idle",
  error: null,
  load: async () => {
    const { status } = get();
    if (status === "loading" || status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const [rooms, bookings] = await Promise.all([
        fetchRooms(),
        fetchBookings(),
      ]);
      set({ rooms, bookings, status: "ready" });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
}));
