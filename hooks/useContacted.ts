"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { rehydrateChoices, useDataStore } from "@/store/useDataStore";

/** Who she has written to (email → "YYYY-MM-DD"), remembered on this device. */
export function useContacted(): {
  contacted: Record<string, string>;
  mark: (email: string) => void;
  unmark: (email: string) => void;
} {
  useEffect(rehydrateChoices, []);
  return useDataStore(
    useShallow((state) => ({
      contacted: state.contacted,
      mark: state.markContacted,
      unmark: state.unmarkContacted,
    })),
  );
}
