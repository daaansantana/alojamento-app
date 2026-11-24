"use client";

import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useData } from "@/hooks/useData";
import {
  addedGuestCard,
  GUEST_RULES,
  guestCards,
  guestViews,
  segmentCounts,
} from "@/lib/guests";
import { rehydrateChoices, useDataStore } from "@/store/useDataStore";
import type {
  AddedGuest,
  GuestCard,
  GuestEdit,
  GuestRules,
  GuestView,
  SegmentCounts,
} from "@/types";

/**
 * Every guest with the host's changes, the counts, the label rules and the
 * actions that change them. Guests is null until the data is ready.
 */
export function useGuests(): {
  guests: GuestView[] | null;
  originals: Record<string, GuestCard>; // before the host's changes, by key
  counts: SegmentCounts | null;
  rules: GuestRules;
  countsWith: (rules: GuestRules) => SegmentCounts | null;
  setRules: (rules: GuestRules | null) => void;
  edit: (email: string, patch: GuestEdit) => void;
  clear: (email: string, field: keyof GuestEdit) => void;
  add: (guest: AddedGuest) => void;
} {
  useEffect(rehydrateChoices, []);
  const { bookings, status } = useData();
  const { edits, added, saved, edit, clear, add, setRules } = useDataStore(
    useShallow((state) => ({
      edits: state.guestEdits,
      added: state.addedGuests,
      saved: state.guestRules,
      edit: state.editGuest,
      clear: state.clearGuestField,
      add: state.addGuest,
      setRules: state.setGuestRules,
    })),
  );
  const rules = saved ?? GUEST_RULES;

  const guests = useMemo(
    () =>
      status === "ready"
        ? guestViews(guestCards(bookings, rules), added, edits, rules)
        : null,
    [bookings, status, rules, added, edits],
  );
  const originals = useMemo(() => {
    if (status !== "ready") return {};
    const cards = [
      ...added.map((guest) => addedGuestCard(guest, rules)),
      ...guestCards(bookings, rules),
    ];
    return Object.fromEntries(cards.map((card) => [card.email, card]));
  }, [bookings, status, rules, added]);
  const counts = useMemo(
    () => (guests ? segmentCounts(guests) : null),
    [guests],
  );
  const countsWith = useMemo(
    () => (next: GuestRules) =>
      status === "ready" ? segmentCounts(guestCards(bookings, next)) : null,
    [bookings, status],
  );

  return {
    guests,
    originals,
    counts,
    rules,
    countsWith,
    setRules,
    edit,
    clear,
    add,
  };
}
