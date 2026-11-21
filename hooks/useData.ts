"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDataStore } from "@/store/useDataStore";
import type { Booking, DataStatus, Room } from "@/types";

/** Rooms and bookings, loaded once, with their status and error. */
export function useData(): {
  rooms: Room[];
  bookings: Booking[];
  status: DataStatus;
  error: string | null;
} {
  const { rooms, bookings, status, error, load } = useDataStore(
    useShallow((state) => ({
      rooms: state.rooms,
      bookings: state.bookings,
      status: state.status,
      error: state.error,
      load: state.load,
    })),
  );

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  return { rooms, bookings, status, error };
}
