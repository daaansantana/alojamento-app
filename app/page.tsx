"use client";

import { type ReactNode, useEffect } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useData } from "@/hooks/useData";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { usePainel } from "@/hooks/usePainel";
import { int, monthName } from "@/lib/format";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const LINK = `inline-flex min-h-11 items-center font-medium underline underline-offset-4 ${FOCUS}`;

const FOLDED = ["#simular", "#detalhes"];

/** Opens the folded section a link points to and scrolls to it. */
function openFolded(hash: string) {
  if (!FOLDED.includes(hash)) return;
  const details = document.querySelector<HTMLDetailsElement>(hash);
  if (!details) return;
  details.open = true;
  details.scrollIntoView({ block: "start" });
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8 text-base leading-relaxed sm:py-12">
      {children}
    </main>
  );
}

export default function Home() {
  const { status, error, retry } = useData();
  const view = usePainel();
  const { setSelectedMonth } = useMonthSelection();
  const ready = view !== null;

  useEffect(() => {
    if (!ready) return;
    openFolded(window.location.hash);
    const onHashChange = () => openFolded(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ready]);

  if (status === "error") {
    return (
      <Shell>
        <ErrorState message={error ?? undefined} onRetry={retry} />
      </Shell>
    );
  }

  if (!view) {
    return (
      <Shell>
        <LoadingState />
      </Shell>
    );
  }

  const { summary, actions, contacts, gain, months } = view;

  return (
    <Shell>
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          A sua casa este ano
        </h1>
        <p className="text-muted-foreground">{view.period}</p>
      </header>

      <section aria-labelledby="resumo" className="flex flex-col gap-4">
        <h2 id="resumo" className="text-xl font-semibold">
          Como correu o ano
        </h2>
        <p className="text-lg">{summary.sentence}</p>
        <dl className="grid gap-4 sm:grid-cols-3">
          {summary.figures.map((figure) => (
            <div key={figure.label} className="flex flex-col">
              <dt className="order-2 text-base text-muted-foreground">
                {figure.label}
              </dt>
              <dd className="order-1 text-2xl font-semibold">{figure.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="fazer" className="flex flex-col gap-4">
        <h2 id="fazer" className="text-xl font-semibold">
          O que fazer
        </h2>
        <label className="flex flex-col gap-1 text-base">
          Ver outro mês
          <select
            value={view.month}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            className={`min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base sm:w-64 ${FOCUS}`}
          >
            {months.bars.map((bar) => {
              const month = Number(bar.period.split("-")[1]);
              return (
                <option key={bar.period} value={month}>
                  {monthName(month)}
                </option>
              );
            })}
          </select>
        </label>
        {actions.length === 0 ? (
          <EmptyState />
        ) : (
          <ol className="flex flex-col gap-4">
            {actions.map((action) => (
              <li
                key={action.id}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {action.when}
                </span>
                <h3 className="text-lg font-semibold">{action.title}</h3>
                <p>{action.text}</p>
                {action.worth && (
                  <p className="font-semibold">{action.worth}</p>
                )}
                <a
                  href={action.target}
                  onClick={() => openFolded(action.target)}
                  className={`self-start ${LINK}`}
                >
                  {action.cta}
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section
        id="contactos"
        aria-labelledby="contactos-titulo"
        className="flex flex-col gap-4"
      >
        <h2 id="contactos-titulo" className="text-xl font-semibold">
          Comece por estes três
        </h2>
        <ul className="flex flex-col divide-y">
          {contacts.first.map((guest) => (
            <li
              key={guest.mailto}
              className="flex flex-wrap items-center justify-between gap-x-4 py-3"
            >
              <span className="flex flex-col">
                <span className="font-medium">{guest.name}</span>
                <span className="text-muted-foreground">{guest.detail}</span>
              </span>
              <a href={guest.mailto} className={LINK}>
                Enviar email
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Ao todo, {int(contacts.total)} hóspedes.
        </p>
      </section>

      <section aria-labelledby="ganho" className="flex flex-col gap-2">
        <h2 id="ganho" className="text-xl font-semibold">
          Quanto pode ganhar por ano
        </h2>
        <p className="text-2xl font-semibold">{gain.likely}</p>
        <p>{gain.range}</p>
        <p className="text-muted-foreground">{gain.assumption}</p>
      </section>

      <section aria-labelledby="meses" className="flex flex-col gap-4">
        <h2 id="meses" className="text-xl font-semibold">
          O ano, mês a mês
        </h2>
        <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {months.bars.map((bar) => (
            <li
              key={bar.period}
              className="flex justify-between gap-4 border-b py-2"
            >
              <span>
                {bar.label} <span className="font-semibold">{bar.percent}</span>
              </span>
              <span className="text-muted-foreground">{bar.level}</span>
            </li>
          ))}
        </ul>
        <p>{months.best}</p>
        <p>{months.price}</p>
      </section>

      <section aria-labelledby="simular-titulo">
        <details id="simular" className="rounded-lg border p-4">
          <summary className={`min-h-11 cursor-pointer ${FOCUS}`}>
            <h2 id="simular-titulo" className="inline text-xl font-semibold">
              E se…?
            </h2>
          </summary>
          <p className="pt-2">Os gráficos entram aqui.</p>
        </details>
      </section>

      <section aria-labelledby="detalhes-titulo">
        <details id="detalhes" className="rounded-lg border p-4">
          <summary className={`min-h-11 cursor-pointer ${FOCUS}`}>
            <h2 id="detalhes-titulo" className="inline text-xl font-semibold">
              Ver os números
            </h2>
          </summary>
          <p className="pt-2">Os gráficos entram aqui.</p>
        </details>
      </section>
    </Shell>
  );
}
