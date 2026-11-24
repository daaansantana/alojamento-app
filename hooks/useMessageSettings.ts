"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { rehydrateChoices, useDataStore } from "@/store/useDataStore";

/** Who signs the messages and the texts the host rewrote, kept on this device. */
export function useMessageSettings(): {
  signature: string;
  setSignature: (signature: string) => void;
  editedTexts: Record<string, { subject?: string; body?: string }>;
  setEditedText: (
    key: string,
    text: { subject?: string; body?: string } | null,
  ) => void;
} {
  useEffect(rehydrateChoices, []);
  return useDataStore(
    useShallow((state) => ({
      signature: state.signature,
      setSignature: state.setSignature,
      editedTexts: state.editedTexts,
      setEditedText: state.setEditedText,
    })),
  );
}
