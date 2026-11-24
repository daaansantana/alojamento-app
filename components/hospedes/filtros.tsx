"use client";

import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { BUTTON, BUTTON_MAIN, FIELD, PILL } from "./comum";

export interface Suggestion {
  id: string;
  action: string; // «Convidar para o inverno»
  count: string; // «49 hóspedes»
  worth: string; // «Mais 2644 € no inverno»
  progress: string; // «Já escreveu a 2 de 49»
}

/** The two actions the app suggests, as cards that pick their guests. */
export function Suggestions({
  items,
  active,
  onPick,
}: {
  items: Suggestion[];
  active: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <section aria-labelledby="sugestoes" className="flex flex-col gap-3">
      <h2 id="sugestoes" className="text-h2 font-bold">
        Sugestões
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {items.map((s) => (
          <button
            key={s.id}
            id={s.id}
            type="button"
            aria-pressed={active === s.id}
            onClick={() => onPick(s.id)}
            className="flex scroll-mt-28 flex-col items-start gap-1 rounded-panel border border-control bg-background p-5 text-left hover:bg-muted aria-pressed:border-primary aria-pressed:bg-accent sm:p-6"
          >
            <span className="flex items-center gap-2 font-bold text-primary">
              <LetterIcon size={22} aria-hidden={true} />
              {s.action}
            </span>
            <span>
              {s.count}. {s.worth}.
            </span>
            <span className="text-sm text-muted-foreground">{s.progress}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of toggle buttons
    <div
      role="group"
      aria-label={label}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
    >
      <span className="w-16 shrink-0 font-bold">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={PILL}
          >
            {o.label}
            <span className="tabular-nums opacity-80">{o.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Profile, level, language and a name search, across the full width. */
export function GuestFilters({
  profiles,
  profile,
  onProfile,
  levels,
  level,
  onLevel,
  languages,
  language,
  onLanguage,
  search,
  onSearch,
  only,
  onClearOnly,
  canClear,
  onClear,
}: {
  profiles: FilterOption[];
  profile: string;
  onProfile: (value: string) => void;
  levels: FilterOption[];
  level: string;
  onLevel: (value: string) => void;
  languages: { value: string; label: string }[];
  language: string;
  onLanguage: (value: string) => void;
  search: string;
  onSearch: (value: string) => void;
  only: string | null; // «Lista: Convidar para o inverno»
  onClearOnly: () => void;
  canClear: boolean;
  onClear: () => void;
}) {
  return (
    <section
      aria-label="Filtros"
      className="flex flex-col gap-4 rounded-panel border p-5 sm:p-6"
    >
      {only ? (
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{only}</span>
          <button type="button" className={BUTTON} onClick={onClearOnly}>
            <CloseCircleIcon size={20} aria-hidden={true} />
            Ver todos
          </button>
        </p>
      ) : null}
      <FilterRow
        label="Perfil"
        options={profiles}
        value={profile}
        onChange={onProfile}
      />
      <FilterRow
        label="Nível"
        options={levels}
        value={level}
        onChange={onLevel}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="w-16 shrink-0 font-bold">Língua</span>
          <select
            className={`${FIELD} sm:w-56`}
            value={language}
            onChange={(e) => onLanguage(e.target.value)}
          >
            <option value="todas">Todas</option>
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="relative flex-1 sm:max-w-80">
          <span className="sr-only">Procurar pelo nome</span>
          <MagnifierIcon
            size={20}
            aria-hidden={true}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Procurar pelo nome"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className={`${FIELD} pl-10`}
          />
        </label>
        {canClear ? (
          <button type="button" className={BUTTON} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}

/** The chosen profile in one line, with the offer and a button to write. */
export function ProfileSummary({
  title,
  text,
  offer,
  write,
  onWrite,
}: {
  title: string;
  text: string;
  offer: string;
  write: string;
  onWrite: () => void;
}) {
  return (
    <section
      aria-label="O perfil escolhido"
      className="flex flex-col gap-3 rounded-panel bg-muted p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex max-w-[70ch] flex-col gap-1">
        <p className="font-bold">{title}</p>
        <p>{text}</p>
        <p>
          Sugestão: <strong>{offer}</strong>
        </p>
      </div>
      <button type="button" className={BUTTON_MAIN} onClick={onWrite}>
        <LetterIcon size={22} aria-hidden={true} />
        {write}
      </button>
    </section>
  );
}
