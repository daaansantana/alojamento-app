"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Acoes } from "@/components/painel/acoes";
import { Contactos } from "@/components/painel/contactos";
import { Resumo } from "@/components/painel/resumo";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useData } from "@/hooks/useData";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { usePainel } from "@/hooks/usePainel";
import { monthName } from "@/lib/format";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

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
  const [listOpen, setListOpen] = useState(false);
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
  const monthOptions = months.bars.map((bar) => {
    const month = Number(bar.period.split("-")[1]);
    return { value: month, label: monthName(month) };
  });

  return (
    <Shell>
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          A sua casa este ano
        </h1>
        <p className="text-muted-foreground">{view.period}</p>
      </header>

      <Resumo summary={summary} period={view.period} />

      <Acoes
        actions={actions}
        month={view.month}
        onMonthChange={setSelectedMonth}
        monthOptions={monthOptions}
        onAction={(action) => {
          if (action.target === "#contactos") setListOpen(true);
          else openFolded(action.target);
        }}
        empty={<EmptyState />}
      />

      <Contactos
        contacts={contacts}
        listOpen={listOpen}
        onListOpenChange={setListOpen}
      />

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
