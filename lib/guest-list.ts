// The guest list on the Hóspedes page: names for the labels, the filters,
// the counts beside each filter, the order and the summary of a profile.

import { monthShort, pct } from "@/lib/format";
import type {
  GuestLevel,
  GuestProfileId,
  GuestView,
  LanguageCode,
} from "@/types";

export const PROFILE_NAMES: Record<GuestProfileId, string> = {
  inverno: "Inverno",
  verao: "Verão",
  meia: "Meia-estação",
  longas: "Estadas longas",
};

export const LEVEL_NAMES: Record<GuestLevel, string> = {
  novo: "Novo",
  voltou: "Voltou",
  habitual: "Habitual",
};

/** Who is in each profile, in one sentence. */
export function profileRule(profile: GuestProfileId, longStay: number): string {
  return {
    inverno: "A maioria das estadas foi de novembro a fevereiro.",
    verao: "A maioria das estadas foi de junho a setembro.",
    meia: "A maioria das estadas foi em março, abril, maio ou outubro.",
    longas: `Ficam ${longStay} noites ou mais, em média.`,
  }[profile];
}

export type ProfileFilter = GuestProfileId | "todos";
export type LevelFilter = GuestLevel | "gasta" | "todos";
export type SortKey = "name" | "stays" | "spent" | "last";

export interface GuestFilter {
  profile: ProfileFilter;
  level: LevelFilter;
  language: LanguageCode | "todas";
  search: string;
  only: string[] | null; // a suggestion's list of guests, by key
}

export const NO_FILTER: GuestFilter = {
  profile: "todos",
  level: "todos",
  language: "todas",
  search: "",
  only: null,
};

const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const byProfile = (g: GuestView, p: ProfileFilter) =>
  p === "todos" || g.profile === p;
const byLevel = (g: GuestView, l: LevelFilter) =>
  l === "todos" || (l === "gasta" ? g.bigSpender : g.level === l);
function byRest(g: GuestView, f: GuestFilter): boolean {
  const q = plain(f.search);
  return (
    (f.language === "todas" || g.language === f.language) &&
    (!q || plain(g.name).includes(q)) &&
    (f.only === null || f.only.includes(g.key))
  );
}

/** The guests that pass every filter. */
export function filterGuests(guests: GuestView[], f: GuestFilter): GuestView[] {
  return guests.filter(
    (g) => byProfile(g, f.profile) && byLevel(g, f.level) && byRest(g, f),
  );
}

/** How many guests each profile and each level would show, with the other filters on. */
export function facetCounts(
  guests: GuestView[],
  f: GuestFilter,
): {
  profiles: Record<ProfileFilter, number>;
  levels: Record<LevelFilter, number>;
} {
  const rest = guests.filter((g) => byRest(g, f));
  const profiles = { todos: 0, inverno: 0, verao: 0, meia: 0, longas: 0 };
  const levels = { todos: 0, novo: 0, voltou: 0, habitual: 0, gasta: 0 };
  for (const g of rest) {
    if (byLevel(g, f.level)) {
      profiles.todos += 1;
      profiles[g.profile] += 1;
    }
    if (byProfile(g, f.profile)) {
      levels.todos += 1;
      levels[g.level] += 1;
      if (g.bigSpender) levels.gasta += 1;
    }
  }
  return { profiles, levels };
}

/** The list in the order she chose; ties by name. */
export function sortGuests(
  guests: GuestView[],
  key: SortKey,
  direction: 1 | -1,
): GuestView[] {
  const value = (g: GuestView): string | number =>
    key === "name"
      ? plain(g.name)
      : key === "stays"
        ? g.stays
        : key === "spent"
          ? g.spent
          : g.lastCheckIn;
  return [...guests].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    const order = x < y ? -1 : x > y ? 1 : 0;
    return (
      order * direction || plain(a.name).localeCompare(plain(b.name), "pt")
    );
  });
}

/** "2025-11-27" → "27 nov 2025". */
export function shortDate(date: string): string {
  return `${Number(date.slice(8, 10))} ${monthShort(date.slice(0, 7))} ${date.slice(0, 4)}`;
}

/** "Marta Oliveira" → "MO". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** A profile in one line: who, how they stay, and the three main languages. */
export function profileSummary(
  guests: GuestView[],
  profile: GuestProfileId,
  longStay: number,
  languageName: (code: LanguageCode) => string,
): { title: string; text: string } {
  const inProfile = guests.filter((g) => g.profile === profile);
  const stays = inProfile.flatMap((g) => g.history);
  const avg = (xs: number[]) =>
    (xs.reduce((a, b) => a + b, 0) / (xs.length || 1))
      .toFixed(1)
      .replace(".", ",");
  const byLanguage = new Map<LanguageCode, number>();
  for (const g of inProfile)
    byLanguage.set(g.language, (byLanguage.get(g.language) ?? 0) + 1);
  const top = [...byLanguage]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code, n]) => `${languageName(code)} ${n}`)
    .join(", ");
  const returning = inProfile.filter((g) => g.level !== "novo").length;
  return {
    title: `${PROFILE_NAMES[profile]}: ${inProfile.length} hóspedes. ${profileRule(profile, longStay)}`,
    text: `Em média ${avg(stays.map((s) => s.nights))} noites e ${avg(stays.map((s) => s.guests))} pessoas por estada. ${pct(returning / (inProfile.length || 1))} voltaram. Línguas: ${top}.`,
  };
}
