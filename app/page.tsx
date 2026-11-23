"use client";

import {
  LeadAction,
  MonthHeading,
  NextActions,
  OtherMonth,
} from "@/components/inicio/acoes";
import { YearCard, YearGain } from "@/components/inicio/ano";
import { EmptyState } from "@/components/states/empty-state";
import { useDashboard } from "@/hooks/useDashboard";
import { useData } from "@/hooks/useData";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { usePainel } from "@/hooks/usePainel";
import { monthName } from "@/lib/format";
import { ScreenState } from "./screen-state";

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const around = (month: number, step: number) =>
  ((month - 1 + step + 12) % 12) + 1;

/** Início: «O que faço este mês?» */
export default function Inicio() {
  const { status, retry } = useData();
  const view = usePainel();
  const dashboard = useDashboard();
  const { setSelectedMonth } = useMonthSelection();
  if (!view || !dashboard)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const [lead, ...rest] = view.actions;
  const previous = around(view.month, -1);
  const next = around(view.month, 1);
  const top = Math.max(...dashboard.thermometer.map((m) => m.occupancy));
  const bars = dashboard.thermometer.map((m) => ({
    period: m.period,
    height: m.occupancy / top,
    current: Number(m.period.slice(5)) === view.month,
  }));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <MonthHeading
            title={`O que fazer em ${view.monthName}`}
            intro={view.intro}
          />
          <OtherMonth
            previous={{ month: previous, label: capital(monthName(previous)) }}
            next={{ month: next, label: capital(monthName(next)) }}
            onChange={setSelectedMonth}
          />
        </div>
        {lead ? (
          <>
            <LeadAction action={lead} />
            <NextActions actions={rest} />
          </>
        ) : (
          <EmptyState message="Neste mês não há sugestões: veja outro mês." />
        )}
      </div>
      <div className="flex flex-col gap-8 lg:gap-6">
        <YearGain gain={view.gain} />
        <YearCard text={view.summary.short} bars={bars} />
      </div>
    </div>
  );
}
