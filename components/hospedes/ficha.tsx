"use client";

import { PenIcon } from "@solar-icons/react/linear/pen";
import { useState } from "react";
import { Avatar, BUTTON, BUTTON_MAIN, FIELD, TAG } from "./comum";

export interface GuestDetailsView {
  name: string;
  initials: string;
  flag: string | null;
  country: string;
  countryNote: string | null; // «o da última estada; também reservou como Países Baixos»
  language: string;
  tags: { text: string; origin: string | null }[];
  email: string;
  phone: string | null;
  offers: string; // «Sim» or why not
  contacted: string | null;
  notes: string;
  staysTitle: string;
  stays: { date: string; room: string; info: string; total: string }[];
}

/** The guest's card, to read. */
export function GuestDetails({
  guest,
  onEdit,
}: {
  guest: GuestDetailsView;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar
          initials={guest.initials}
          flag={guest.flag}
          country={guest.country}
          large
        />
        <button type="button" className={BUTTON} onClick={onEdit}>
          <PenIcon size={20} aria-hidden={true} />
          Editar ficha
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <dt className="text-muted-foreground">País</dt>
        <dd>
          {guest.country}
          {guest.countryNote ? (
            <span className="text-muted-foreground">
              {" "}
              ({guest.countryNote})
            </span>
          ) : null}
        </dd>
        <dt className="text-muted-foreground">Língua das mensagens</dt>
        <dd>{guest.language}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd className="break-all">{guest.email}</dd>
        <dt className="text-muted-foreground">Telefone</dt>
        <dd>{guest.phone ?? "Sem telefone"}</dd>
        <dt className="text-muted-foreground">Aceita ofertas</dt>
        <dd>{guest.offers}</dd>
        {guest.contacted ? (
          <>
            <dt className="text-muted-foreground">Contactado</dt>
            <dd>{guest.contacted}</dd>
          </>
        ) : null}
      </dl>
      <section aria-label="Etiquetas" className="flex flex-col gap-2">
        <h3 className="font-bold">Etiquetas</h3>
        <ul className="flex flex-wrap gap-2">
          {guest.tags.map((t) => (
            <li key={t.text} className={TAG}>
              {t.text}
              {t.origin ? (
                <span className="text-muted-foreground">({t.origin})</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      {guest.notes ? (
        <section aria-label="Notas" className="flex flex-col gap-1">
          <h3 className="font-bold">Notas</h3>
          <p className="whitespace-pre-line">{guest.notes}</p>
        </section>
      ) : null}
      <section aria-label="Estadas" className="flex flex-col gap-2">
        <h3 className="font-bold">{guest.staysTitle}</h3>
        <ul className="flex flex-col divide-y border-y">
          {guest.stays.map((s) => (
            <li
              key={`${s.date}-${s.room}`}
              className="flex justify-between gap-4 py-3"
            >
              <span className="flex flex-col">
                <span>
                  {s.date}, {s.room}
                </span>
                <span className="text-sm text-muted-foreground">{s.info}</span>
              </span>
              <span className="tabular-nums">{s.total}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export interface GuestFormValues {
  name: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  level: string;
  profile: string;
  labels: string[];
  acceptsOffers: boolean;
  notes: string;
}

/** The guest's card, to edit. Nothing is kept until «Guardar». */
export function GuestForm({
  initial,
  countries,
  languageOf,
  languages,
  levels,
  profiles,
  manual,
  auto,
  offersLocked,
  onSave,
  onCancel,
}: {
  initial: GuestFormValues;
  countries: string[];
  languageOf: Record<string, string>;
  languages: { value: string; label: string }[];
  levels: { value: string; label: string }[];
  profiles: { value: string; label: string }[];
  manual: { level: boolean; profile: boolean; language: boolean };
  auto: { level: string; profile: string; language: string };
  offersLocked: string | null; // why offers can't be sent, or null
  onSave: (
    values: GuestFormValues,
    reset: ("level" | "profile" | "language")[],
  ) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const [reset, setReset] = useState<("level" | "profile" | "language")[]>([]);
  const [label, setLabel] = useState("");
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<GuestFormValues>) =>
    setV((old) => ({ ...old, ...patch }));
  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())
    ? null
    : "Escreva um email com «@», por exemplo nome@exemplo.pt.";
  const phoneError = /^[+\d\s]*$/.test(v.phone)
    ? null
    : "Use só números, espaços e «+», por exemplo +351 912 345 678.";
  const nameError = v.name.trim() ? null : "Escreva o nome.";
  const back = (field: "level" | "profile" | "language") => {
    set({ [field]: auto[field] });
    setReset((r) => [...r.filter((x) => x !== field), field]);
  };
  const isManual = (field: "level" | "profile" | "language") =>
    (manual[field] && !reset.includes(field)) || v[field] !== auto[field];
  const addLabel = () => {
    const t = label.trim();
    if (t && !v.labels.includes(t)) set({ labels: [...v.labels, t] });
    setLabel("");
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (nameError || emailError || phoneError) return;
        onSave(
          {
            ...v,
            name: v.name.trim(),
            email: v.email.trim(),
            phone: v.phone.trim(),
          },
          reset.filter((f) => v[f] === auto[f]),
        );
      }}
    >
      <Field label="Nome" error={tried ? nameError : null}>
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            className={FIELD}
            value={v.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        )}
      </Field>
      <Field label="Email" error={tried ? emailError : null}>
        {(id, describedBy) => (
          <input
            id={id}
            type="email"
            aria-describedby={describedBy}
            className={FIELD}
            value={v.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        )}
      </Field>
      <Field
        label="Telefone, para WhatsApp e SMS"
        error={tried ? phoneError : null}
      >
        {(id, describedBy) => (
          <input
            id={id}
            type="tel"
            inputMode="tel"
            placeholder="+351 912 345 678"
            aria-describedby={describedBy}
            className={FIELD}
            value={v.phone}
            onChange={(e) => set({ phone: e.target.value })}
          />
        )}
      </Field>
      <Field label="País">
        {(id) => (
          <select
            id={id}
            className={FIELD}
            value={v.country}
            onChange={(e) => {
              const country = e.target.value;
              set({
                country,
                ...(languageOf[country]
                  ? { language: languageOf[country] }
                  : {}),
              });
            }}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Choice
        label="Língua das mensagens"
        value={v.language}
        options={languages}
        onChange={(language) => set({ language })}
        manual={isManual("language")}
        onBack={() => back("language")}
      />
      <Choice
        label="Nível"
        value={v.level}
        options={levels}
        onChange={(level) => set({ level })}
        manual={isManual("level")}
        onBack={() => back("level")}
      />
      <Choice
        label="Perfil"
        value={v.profile}
        options={profiles}
        onChange={(profile) => set({ profile })}
        manual={isManual("profile")}
        onBack={() => back("profile")}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">As suas etiquetas</legend>
        {v.labels.length ? (
          <ul className="flex flex-wrap gap-2">
            {v.labels.map((l) => (
              <li key={l} className={`${TAG} border-dashed`}>
                {l}
                <button
                  type="button"
                  className="ml-1 rounded-full px-1 hover:bg-muted"
                  aria-label={`Tirar a etiqueta ${l}`}
                  onClick={() =>
                    set({ labels: v.labels.filter((x) => x !== l) })
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Nova etiqueta</span>
            <input
              className={FIELD}
              placeholder="Por exemplo «traz cão»"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLabel();
                }
              }}
            />
          </label>
          <button type="button" className={BUTTON} onClick={addLabel}>
            Juntar
          </button>
        </div>
      </fieldset>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-5 accent-primary"
          checked={v.acceptsOffers && !offersLocked}
          disabled={offersLocked !== null}
          onChange={(e) => set({ acceptsOffers: e.target.checked })}
        />
        <span className="flex flex-col">
          <span>Aceita receber ofertas</span>
          <span className="text-sm text-muted-foreground">
            {offersLocked ?? "Se responder «Não» a uma mensagem, desmarque."}
          </span>
        </span>
      </label>
      <Field label="Notas">
        {(id) => (
          <textarea
            id={id}
            rows={3}
            className={`${FIELD} py-2`}
            value={v.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        )}
      </Field>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BUTTON_MAIN}>
          Guardar
        </button>
        <button type="button" className={BUTTON} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error = null,
  children,
}: {
  label: string;
  error?: string | null;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}) {
  const id = `campo-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  const errorId = `${id}-erro`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children(id, error ? errorId : undefined)}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
  manual,
  onBack,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  manual: boolean;
  onBack: () => void;
}) {
  const id = `escolha-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}{" "}
        <span className="font-normal text-muted-foreground">
          ({manual ? "mudado à mão" : "automático"})
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id={id}
          className={`${FIELD} flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {manual ? (
          <button type="button" className={BUTTON} onClick={onBack}>
            Voltar ao automático
          </button>
        ) : null}
      </div>
    </div>
  );
}
