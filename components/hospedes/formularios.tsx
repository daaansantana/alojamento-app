"use client";

import { useState } from "react";
import { BUTTON, BUTTON_MAIN, FIELD, TAG } from "./comum";

export interface RulesValues {
  returned: number;
  regular: number;
  bigSpender: number;
  longStay: number;
}

/** The four label rules, with the counts they would give before applying. */
export function RulesForm({
  values,
  onChange,
  preview,
  applied,
  changed,
  onApply,
  onReset,
  notes,
}: {
  values: RulesValues;
  onChange: (values: RulesValues) => void;
  preview: string;
  applied: boolean;
  changed: boolean;
  onApply: () => void;
  onReset: () => void;
  notes: string[];
}) {
  const field = (
    key: keyof RulesValues,
    before: string,
    after: string,
    step = 1,
  ) => (
    <label className="flex flex-wrap items-center gap-2">
      <span>{before}</span>
      <input
        type="number"
        min={key === "bigSpender" ? 0 : 1}
        step={step}
        className={`${FIELD} w-24`}
        value={values[key]}
        onChange={(e) =>
          onChange({
            ...values,
            [key]: Math.max(0, Number(e.target.value) || 0),
          })
        }
      />
      <span>{after}</span>
    </label>
  );
  return (
    <div className="flex flex-col gap-5">
      <p>
        Quando as reservas entram na nexo, cada hóspede recebe estas etiquetas.
        As que mudar à mão ficam como estão.
      </p>
      <div className="flex flex-col gap-3">
        {field("returned", "«Voltou» a partir de", "estadas")}
        {field("regular", "«Habitual» a partir de", "estadas")}
        {field("bigSpender", "«Gasta mais» a partir de", "€ no total", 10)}
        {field("longStay", "«Estadas longas» com", "noites ou mais, em média")}
      </div>
      <div className="flex flex-col gap-1 rounded-xl bg-muted p-5 sm:p-6">
        <span className="text-sm text-muted-foreground">Com estes valores</span>
        <span>{preview}</span>
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_MAIN}
          onClick={onApply}
          disabled={!changed}
        >
          Aplicar
        </button>
        <button type="button" className={BUTTON} onClick={onReset}>
          Repor os valores de origem
        </button>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {applied
          ? "Aplicado: a lista já usa estes valores."
          : changed
            ? "Ainda não aplicado."
            : ""}
      </p>
    </div>
  );
}

export interface NewGuestValues {
  name: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  month: number;
  nights: number;
}

/** A guest she adds by hand, with the labels the nexo suggests. */
export function AddGuestForm({
  countries,
  languageOf,
  languages,
  months,
  suggest,
  onSave,
  onCancel,
}: {
  countries: string[];
  languageOf: Record<string, string>;
  languages: { value: string; label: string }[];
  months: { value: number; label: string }[];
  suggest: (values: NewGuestValues) => string[];
  onSave: (values: NewGuestValues) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<NewGuestValues>({
    name: "",
    email: "",
    phone: "",
    country: countries[0] ?? "Portugal",
    language: languageOf[countries[0] ?? "Portugal"] ?? "pt-PT",
    month: months[0]?.value ?? 12,
    nights: 2,
  });
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<NewGuestValues>) =>
    setV((old) => ({ ...old, ...patch }));
  const errors = {
    name: v.name.trim() ? null : "Escreva o nome.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())
      ? null
      : "Escreva um email com «@», por exemplo nome@exemplo.pt.",
    phone: /^[+\d\s]*$/.test(v.phone) ? null : "Use só números, espaços e «+».",
  };
  const row = (label: string, error: string | null, input: React.ReactNode) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: the input is passed in and sits inside the label
    <label className="flex flex-col gap-1.5">
      <span className="font-bold">{label}</span>
      {input}
      {tried && error ? (
        <span className="text-sm text-destructive">{error}</span>
      ) : null}
    </label>
  );
  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (errors.name || errors.email || errors.phone) return;
        onSave({
          ...v,
          name: v.name.trim(),
          email: v.email.trim(),
          phone: v.phone.trim(),
        });
      }}
    >
      {row(
        "Nome",
        errors.name,
        <input
          className={FIELD}
          value={v.name}
          onChange={(e) => set({ name: e.target.value })}
        />,
      )}
      {row(
        "Email",
        errors.email,
        <input
          type="email"
          className={FIELD}
          value={v.email}
          onChange={(e) => set({ email: e.target.value })}
        />,
      )}
      {row(
        "Telefone, para WhatsApp e SMS",
        errors.phone,
        <input
          type="tel"
          inputMode="tel"
          placeholder="+351 912 345 678"
          className={FIELD}
          value={v.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />,
      )}
      {row(
        "País",
        null,
        <select
          className={FIELD}
          value={v.country}
          onChange={(e) =>
            set({
              country: e.target.value,
              ...(languageOf[e.target.value]
                ? { language: languageOf[e.target.value] }
                : {}),
            })
          }
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>,
      )}
      {row(
        "Língua das mensagens (vem do país)",
        null,
        <select
          className={FIELD}
          value={v.language}
          onChange={(e) => set({ language: e.target.value })}
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>,
      )}
      <div className="flex flex-wrap gap-4">
        {row(
          "Mês da estada",
          null,
          <select
            className={FIELD}
            value={v.month}
            onChange={(e) => set({ month: Number(e.target.value) })}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>,
        )}
        {row(
          "Noites",
          null,
          <input
            type="number"
            min={1}
            className={`${FIELD} w-24`}
            value={v.nights}
            onChange={(e) =>
              set({ nights: Math.max(1, Number(e.target.value) || 1) })
            }
          />,
        )}
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-muted p-5 sm:p-6">
        <span className="text-sm text-muted-foreground">
          Etiquetas sugeridas (pode mudá-las na ficha)
        </span>
        <span className="flex flex-wrap gap-2">
          {suggest(v).map((t) => (
            <span key={t} className={TAG}>
              {t}
            </span>
          ))}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BUTTON_MAIN}>
          Guardar hóspede
        </button>
        <button type="button" className={BUTTON} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
