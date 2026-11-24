import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { dayOf } from "@/lib/dates";
import { fetchBookings, fetchRooms } from "@/services/data";
import type {
  AddedGuest,
  Booking,
  DataStatus,
  GuestEdit,
  GuestRules,
  Room,
  TextSize,
} from "@/types";

interface DataState {
  rooms: Room[];
  bookings: Booking[];
  status: DataStatus;
  error: string | null;
  // month for the action alerts, 1 to 12; null = the reference date's month
  selectedMonth: number | null;
  // remembered on this device
  textSize: TextSize;
  contacted: Record<string, string>; // guest email → the day she wrote, "YYYY-MM-DD"
  guestEdits: Record<string, GuestEdit>; // by the guest's original email
  addedGuests: AddedGuest[];
  guestRules: GuestRules | null; // null: the starting values, GUEST_RULES
  signature: string;
  editedTexts: Record<string, { subject?: string; body?: string }>; // "template|language|channel"
  load: () => Promise<void>;
  setSelectedMonth: (month: number | null) => void;
  setTextSize: (size: TextSize) => void;
  markContacted: (email: string) => void;
  unmarkContacted: (email: string) => void;
  editGuest: (email: string, patch: GuestEdit) => void;
  clearGuestField: (email: string, field: keyof GuestEdit) => void;
  addGuest: (guest: AddedGuest) => void;
  setGuestRules: (rules: GuestRules | null) => void;
  setSignature: (signature: string) => void;
  setEditedText: (
    key: string,
    text: { subject?: string; body?: string } | null,
  ) => void;
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
// in storage: the text size, who she has written to, and what she changed
// in the guests' cards, the label rules and the message texts.
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      rooms: [],
      bookings: [],
      status: "idle",
      error: null,
      selectedMonth: null,
      textSize: "normal",
      contacted: {},
      guestEdits: {},
      addedGuests: [],
      guestRules: null,
      signature: "Isabel",
      editedTexts: {},
      editGuest: (email, patch) =>
        set((state) => ({
          guestEdits: {
            ...state.guestEdits,
            [email]: { ...state.guestEdits[email], ...patch },
          },
        })),
      clearGuestField: (email, field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.guestEdits[email] ?? {};
          return { guestEdits: { ...state.guestEdits, [email]: rest } };
        }),
      addGuest: (guest) =>
        set((state) => ({ addedGuests: [guest, ...state.addedGuests] })),
      setGuestRules: (guestRules) => set({ guestRules }),
      setSignature: (signature) => set({ signature }),
      setEditedText: (key, text) =>
        set((state) => {
          const { [key]: _, ...rest } = state.editedTexts;
          return { editedTexts: text ? { ...rest, [key]: text } : rest };
        }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setTextSize: (textSize) => set({ textSize }),
      markContacted: (email) =>
        set((state) => ({
          contacted: { ...state.contacted, [email]: dayOf(Date.now()) },
        })),
      unmarkContacted: (email) =>
        set((state) => {
          const { [email]: _, ...rest } = state.contacted;
          return { contacted: rest };
        }),
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
      partialize: (state) => ({
        textSize: state.textSize,
        contacted: state.contacted,
        guestEdits: state.guestEdits,
        addedGuests: state.addedGuests,
        guestRules: state.guestRules,
        signature: state.signature,
        editedTexts: state.editedTexts,
      }),
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
