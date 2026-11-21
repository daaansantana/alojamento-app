"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Acoes } from "@/components/painel/acoes";
import { Contactos } from "@/components/painel/contactos";
import { type DetailPart, Detalhes } from "@/components/painel/detalhes";
import { Ganho } from "@/components/painel/ganho";
import { Meses } from "@/components/painel/meses";
import { Resumo } from "@/components/painel/resumo";
import {
  type Question,
  Simular,
  type SliderRange,
} from "@/components/painel/simular";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useDashboard } from "@/hooks/useDashboard";
import { useData } from "@/hooks/useData";
import { useDirectSimulation } from "@/hooks/useDirectSimulation";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { usePainel } from "@/hooks/usePainel";
import { usePricing } from "@/hooks/usePricing";
import { useReturningGuests } from "@/hooks/useReturningGuests";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import { SOURCES } from "@/lib/benchmarks";
import { monthName } from "@/lib/format";
import {
  PAINEL_DIRECT,
  PAINEL_SUMMER,
  PAINEL_WINTER_CAMPAIGN,
} from "@/lib/painel";
import type { AlertId } from "@/types";

const FOLDED = ["#simular", "#detalhes"];

// «E se…?» starts from the scenarios behind the actions' worth.
const INITIAL: Record<Question, number> = {
  summer: Math.round(PAINEL_SUMMER.priceChange * 100),
  winter: Math.round(PAINEL_WINTER_CAMPAIGN.returnRate * 100),
  direct: Math.round(PAINEL_DIRECT.conversionRate * 100),
};
const RANGES: Record<Question, SliderRange> = {
  summer: { min: 0, max: 20, step: 5 },
  winter: { min: 0, max: 50, step: 5 },
  direct: { min: 0, max: 100, step: 10 },
};
// The question or the part each action's link opens.
const QUESTION_FOR: Partial<Record<AlertId, Question>> = {
  summer: "summer",
  commission: "direct",
};
const DETAIL_FOR: Partial<Record<AlertId, DetailPart>> = {
  orphans: "mapa",
};

/** Opens the folded section a link points to and scrolls to it. */
function openFolded(hash: string) {
  if (!FOLDED.includes(hash)) return;
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (target instanceof HTMLDetailsElement) target.open = true;
  target.scrollIntoView({ block: "start" });
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
  const dashboard = useDashboard();
  const { setSelectedMonth } = useMonthSelection();
  const [listOpen, setListOpen] = useState(false);
  const [question, setQuestion] = useState<Question>("summer");
  const [values, setValues] = useState(INITIAL);
  const [detailsOpen, setDetailsOpen] = useState<DetailPart[]>([]);
  const returning = useReturningGuests();
  const pricing = usePricing({
    priceChange: values.summer / 100,
    months: PAINEL_SUMMER.months,
  });
  const winter = useWinterCampaign({
    returnRate: values.winter / 100,
    discount: PAINEL_WINTER_CAMPAIGN.discount,
  });
  const direct = useDirectSimulation({
    ...PAINEL_DIRECT,
    conversionRate: values.direct / 100,
  });
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
  const monthBars = months.bars.flatMap((bar) => {
    const month = dashboard?.thermometer.find((m) => m.period === bar.period);
    return month
      ? [{ ...bar, occupancy: month.occupancy, tone: month.level }]
      : [];
  });
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
          const next = QUESTION_FOR[action.id];
          if (action.target === "#simular" && next) setQuestion(next);
          const part = DETAIL_FOR[action.id];
          if (action.target === "#detalhes" && part)
            setDetailsOpen((open) =>
              open.includes(part) ? open : [...open, part],
            );
          openFolded(action.target);
        }}
        empty={<EmptyState />}
      />

      <Contactos
        contacts={contacts}
        listOpen={listOpen}
        onListOpenChange={setListOpen}
      />

      <Ganho gain={gain} />

      <Meses months={months} bars={monthBars} />

      <Simular
        question={question}
        onQuestionChange={setQuestion}
        values={values}
        onValueChange={(q, value) =>
          setValues((current) => ({ ...current, [q]: value }))
        }
        ranges={RANGES}
        onReset={() => setValues(INITIAL)}
        discounts={{
          winter: PAINEL_WINTER_CAMPAIGN.discount,
          direct: PAINEL_DIRECT.directDiscount,
        }}
        pricing={pricing}
        winter={winter}
        direct={direct}
      />

      {dashboard && returning && (
        <Detalhes
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          netByChannel={dashboard.netByChannel}
          roomMonth={dashboard.roomMonth}
          rooms={dashboard.byRoom}
          transitions={returning.transitions}
          sources={SOURCES}
        />
      )}
    </Shell>
  );
}
