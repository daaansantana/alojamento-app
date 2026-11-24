"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { UndoLeftIcon } from "@solar-icons/react/linear/undo-left";
import Link from "next/link";

const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-control bg-background px-4 font-bold hover:bg-muted";
const BUTTON_MAIN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-pressed";

export interface AlertView {
  id: string;
  tag: string; // «Fazer hoje»
  urgent: boolean;
  dates: string;
  title: string;
  howMuch: string | null;
  when: string;
  rows: { room: string; from: string; to: string; market: string }[];
  why: string[];
  ai: string | null;
  extra: string | null;
  alternative: { text: string; href: string } | null;
  done: string | null; // what she did with it, or null
}

/** The alerts: how much and when to change the price, with the reasons. */
export function MarketAlerts({
  alerts,
  pending,
  updated,
  open,
  onOpen,
  onDone,
  onDismiss,
  onUndo,
  onShow,
}: {
  alerts: AlertView[];
  pending: string; // «4 por tratar»
  updated: string; // «Atualizado a 24 nov, às 07:00»
  open: string | null;
  onOpen: (id: string | null) => void;
  onDone: (id: string) => void;
  onDismiss: (id: string) => void;
  onUndo: (id: string) => void;
  onShow: (id: string) => void;
}) {
  return (
    <section
      id="avisos"
      aria-labelledby="avisos-titulo"
      className="flex scroll-mt-28 flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="avisos-titulo" className="text-h2 font-bold">
            Avisos
          </h2>
          <span className="rounded-full border border-dashed border-control px-2.5 py-0.5 text-sm">
            Dados simulados
          </span>
          <span className="font-bold">{pending}</span>
        </div>
        <p className="text-sm text-muted-foreground">{updated}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {alerts.map((a) => {
          const isOpen = open === a.id;
          return (
            <li
              key={a.id}
              className={`flex flex-col gap-3 rounded-panel border p-5 sm:p-6 ${a.done ? "bg-muted" : a.urgent ? "border-2 border-primary bg-background" : "bg-background"}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold ${a.urgent && !a.done ? "bg-primary text-primary-foreground" : "border border-control"}`}
                >
                  {a.tag}
                </span>
                <span className="text-muted-foreground">{a.dates}</span>
              </div>
              <h3 className="text-lg font-bold leading-snug">{a.title}</h3>
              {a.howMuch ? (
                <p>
                  <strong>Quanto:</strong> {a.howMuch}
                </p>
              ) : null}
              <p>
                <strong>Quando:</strong> {a.when}
              </p>
              {a.done ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="flex items-center gap-2 font-bold text-success">
                    <CheckCircleIcon size={22} aria-hidden={true} />
                    {a.done}
                  </p>
                  <button
                    type="button"
                    className={BUTTON}
                    onClick={() => onUndo(a.id)}
                  >
                    <UndoLeftIcon size={20} aria-hidden={true} />
                    Desfazer
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className={`${BUTTON} self-start`}
                    aria-expanded={isOpen}
                    aria-controls={`aviso-${a.id}`}
                    onClick={() => onOpen(isOpen ? null : a.id)}
                  >
                    {isOpen
                      ? "Fechar"
                      : a.rows.length
                        ? "Ver quanto e porquê"
                        : "Ver mais"}
                    <AltArrowDownIcon
                      size={20}
                      aria-hidden={true}
                      className={isOpen ? "rotate-180" : ""}
                    />
                  </button>
                  {isOpen ? (
                    <div
                      id={`aviso-${a.id}`}
                      className="flex flex-col gap-4 border-t pt-4"
                    >
                      {a.rows.length ? (
                        <div className="flex flex-col gap-2">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b text-sm whitespace-nowrap">
                                  <th scope="col" className="py-2 pr-3">
                                    Quarto
                                  </th>
                                  <th
                                    scope="col"
                                    className="py-2 pr-3 text-right"
                                  >
                                    Hoje
                                  </th>
                                  <th
                                    scope="col"
                                    className="py-2 pr-3 text-right"
                                  >
                                    Passa a
                                  </th>
                                  <th scope="col" className="py-2 text-right">
                                    Mercado
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {a.rows.map((r) => (
                                  <tr key={r.room} className="border-b">
                                    <td className="py-2 pr-3">{r.room}</td>
                                    <td className="py-2 pr-3 text-right tabular-nums">
                                      {r.from}
                                    </td>
                                    <td className="py-2 pr-3 text-right font-bold tabular-nums">
                                      {r.to}
                                    </td>
                                    <td className="py-2 text-right tabular-nums">
                                      {r.market}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Mercado: quanto quartos parecidos cobram nessas
                            noites, comparado com o seu preço de hoje.
                          </p>
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold">Porquê</h4>
                        <ul className="flex list-disc flex-col gap-1 pl-5">
                          {a.why.map((w) => (
                            <li key={w}>{w}</li>
                          ))}
                        </ul>
                      </div>
                      {a.ai ? (
                        <div className="flex flex-col gap-1 rounded-xl bg-muted p-5 sm:p-6">
                          <p className="text-sm text-muted-foreground">
                            Explicação em linguagem simples (exemplo do texto
                            que a IA escreveria a partir destes números)
                          </p>
                          <p>{a.ai}</p>
                        </div>
                      ) : null}
                      {a.extra ? <p>{a.extra}</p> : null}
                      <div className="flex flex-wrap gap-2">
                        {a.rows.length ? (
                          <button
                            type="button"
                            className={BUTTON_MAIN}
                            onClick={() => onDone(a.id)}
                          >
                            Já mudei os preços
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={BUTTON}
                          onClick={() => onDismiss(a.id)}
                        >
                          {a.rows.length ? "Agora não" : "Percebi"}
                        </button>
                        {a.alternative ? (
                          <Link
                            href={a.alternative.href}
                            className={`${BUTTON} text-primary`}
                          >
                            {a.alternative.text}
                          </Link>
                        ) : null}
                        {a.rows.length ? (
                          <button
                            type="button"
                            className={BUTTON}
                            onClick={() => onShow(a.id)}
                          >
                            <CalendarIcon size={20} aria-hidden={true} />
                            Ver no calendário
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted-foreground">
        A nexo não muda os preços no Booking nem no Airbnb: diz quanto e quando.
        Quem muda é a Isabel.
      </p>
    </section>
  );
}

/** Where the data comes from, and the rules behind the alerts. */
export function DataSources({
  sources,
  note,
  rules,
}: {
  sources: {
    name: string;
    detail: string;
    state: string;
    on: boolean;
    inUse: boolean;
  }[];
  note: string;
  rules: string[];
}) {
  return (
    <section
      aria-labelledby="fontes-titulo"
      className="flex flex-col gap-4 rounded-panel border bg-background p-5 sm:p-6"
    >
      <h2 id="fontes-titulo" className="text-h2 font-bold">
        De onde vêm os dados
      </h2>
      <ul className="flex flex-col divide-y">
        {sources.map((s) => (
          <li
            key={s.name}
            className="flex items-start justify-between gap-3 py-3 first:pt-0"
          >
            <span className="flex flex-col">
              <span className="font-bold">{s.name}</span>
              <span className="text-sm text-muted-foreground">{s.detail}</span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm ${s.on ? "border border-primary font-bold" : s.inUse ? "border border-dashed border-control" : "border border-border text-muted-foreground"}`}
            >
              {s.state}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm">{note}</p>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">Regras dos avisos</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
