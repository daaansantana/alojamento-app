"use client";

import { useMemo } from "react";
import { useData } from "@/hooks/useData";
import { simulateWinterRoom } from "@/lib/simulator";
import type { WinterRoomResult, WinterRoomScenario } from "@/types";

/** Winter-room simulator; null until the data is ready. */
export function useWinterRoom(
  scenario: WinterRoomScenario,
): WinterRoomResult | null {
  const { rooms, bookings, status } = useData();
  const { roomId, monthlyRate } = scenario;

  return useMemo(() => {
    if (status !== "ready") return null;
    return simulateWinterRoom(bookings, rooms, { roomId, monthlyRate });
  }, [rooms, bookings, status, roomId, monthlyRate]);
}
