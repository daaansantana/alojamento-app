"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { CheckIcon } from "@solar-icons/react/linear/check";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { UndoLeftIcon } from "@solar-icons/react/linear/undo-left";
import { useState } from "react";

const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-control bg-background px-4 font-bold hover:bg-muted";

/** «Ver o email que vai ser enviado»: the subject and the body, folded. */
export function EmailPreview({
  subject,
  body,
}: {
  subject: string;
  body: string;
}) {
  return (
    <details className="group border-y">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-bold [&::-webkit-details-marker]:hidden">
        Ver o email que vai ser enviado
        <AltArrowDownIcon
          size={24}
          aria-hidden={true}
          className="shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-muted p-5 sm:p-6">
        <p>
          <span className="text-muted-foreground">Assunto: </span>
          <span className="font-bold">{subject}</span>
        </p>
        <p className="whitespace-pre-line">{body}</p>
      </div>
    </details>
  );
}

/** «Já escreveu a 2 de 49», with a bar. */
export function Progress({
  text,
  done,
  total,
}: {
  text: string;
  done: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{text}</p>
      <div
        aria-hidden="true"
        className="h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export interface GuestRow {
  name: string;
  email: string;
  detail: string;
  mailto: string;
  written: string | null; // «Escreveu a 21 de novembro», once marked
}

/** The guests to write to: 10 first, then the rest on demand. */
export function GuestList({
  rows,
  moreLabel,
  onMark,
  onUnmark,
  firstShown = 10,
}: {
  rows: GuestRow[];
  moreLabel: string;
  onMark: (email: string) => void;
  onUnmark: (email: string) => void;
  firstShown?: number;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, firstShown);
  // Keep the keyboard on the row: the button that replaces the one pressed.
  const focusLater = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.focus());

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y border-y">
        {shown.map((row, i) => (
          <li key={row.email} className="flex flex-col gap-2 py-4">
            <p className="font-bold">{row.name}</p>
            <p className="text-muted-foreground">{row.detail}</p>
            {row.written ? (
              <div className="flex flex-col items-start gap-2">
                <p className="flex items-center gap-2 font-bold text-success">
                  <CheckCircleIcon size={22} aria-hidden={true} />
                  {row.written}
                </p>
                <button
                  id={`desfazer-${i}`}
                  type="button"
                  aria-label={`Desfazer: ainda não escreveu a ${row.name}`}
                  className={BUTTON}
                  onClick={() => {
                    onUnmark(row.email);
                    focusLater(`ja-escrevi-${i}`);
                  }}
                >
                  <UndoLeftIcon size={22} aria-hidden={true} />
                  Desfazer
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <a
                  href={row.mailto}
                  aria-label={`Escrever a ${row.name}`}
                  className={`${BUTTON} text-primary`}
                >
                  <LetterIcon size={22} aria-hidden={true} />
                  Escrever
                </a>
                <button
                  id={`ja-escrevi-${i}`}
                  type="button"
                  aria-label={`Já escrevi a ${row.name}`}
                  className={BUTTON}
                  onClick={() => {
                    onMark(row.email);
                    focusLater(`desfazer-${i}`);
                  }}
                >
                  <CheckIcon size={22} aria-hidden={true} />
                  Já escrevi
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!all && rows.length > firstShown && (
        <button
          type="button"
          className={`${BUTTON} w-full`}
          onClick={() => setAll(true)}
        >
          {moreLabel}
        </button>
      )}
    </div>
  );
}
