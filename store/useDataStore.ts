import { create } from "zustand";
import { fetchBookings, fetchRooms } from "@/services/data";
import type { Booking, DataStatus, Room } from "@/types";

interface DataState {
  rooms: Room[];
  bookings: Booking[];
  status: DataStatus;
  error: string | null;
  // month for the action alerts, 1 to 12; null = the reference date's month
  selectedMonth: number | null;
  load: () => Promise<void>;
  setSelectedMonth: (month: number | null) => void;
}

// Reads quartos.json and reservas.json once and shares them between pages.
// The data is the same static files for everyone and is only loaded in the
// browser, so one module-level store is enough.
export const useDataStore = create<DataState>()((set, get) => ({
  rooms: [],
  bookings: [],
  status: "idle",
  error: null,
  selectedMonth: null,
  setSelectedMonth: (month) => set({ selectedMonth: month }),
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
