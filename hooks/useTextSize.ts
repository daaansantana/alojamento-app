"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { rehydrateChoices, useDataStore } from "@/store/useDataStore";
import type { TextSize } from "@/types";

/** The text size she chose, remembered on this device, and how to change it. */
export function useTextSize(): {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
} {
  useEffect(rehydrateChoices, []);
  return useDataStore(
    useShallow((state) => ({
      textSize: state.textSize,
      setTextSize: state.setTextSize,
    })),
  );
}
