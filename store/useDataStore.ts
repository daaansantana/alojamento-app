import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { fetchBookings, fetchRooms } from "@/services/data";
import type { Booking, DataStatus, Room, TextSize } from "@/types";

interface DataState {
  rooms: Room[];
  bookings: Booking[];
  status: DataStatus;
  error: string | null;
  // month for the action alerts, 1 to 12; null = the reference date's month
  selectedMonth: number | null;
  // remembered on this device
  textSize: TextSize;
  load: () => Promise<void>;
  setSelectedMonth: (month: number | null) => void;
  setTextSize: (size: TextSize) => void;
}

// Storage can be missing or refuse to work (private windows, blocked site
// data). Then nothing is remembered, and nothing breaks.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // not remembered
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // nothing to forget
    }
  },
};

// Reads quartos.json and reservas.json once and shares them between pages.
// The data is the same static files for everyone and is only loaded in the
// browser, so one module-level store is enough. Only her choices are kept
// in storage, never the data.
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      rooms: [],
      bookings: [],
      status: "idle",
      error: null,
      selectedMonth: null,
      textSize: "normal",
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setTextSize: (textSize) => set({ textSize }),
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
    }),
    {
      name: "a-sua-casa",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ textSize: state.textSize }),
      // Read after the first render, so the prerendered HTML and the first
      // client render match.
      skipHydration: true,
    },
  ),
);

/** Loads the remembered choices once, after the first render. */
export function rehydrateChoices() {
  if (!useDataStore.persist.hasHydrated())
    void useDataStore.persist.rehydrate();
}
