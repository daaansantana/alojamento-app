"use client";

import { Acoes } from "@/components/painel/acoes";
import { Ganho } from "@/components/painel/ganho";
import { EmptyState } from "@/components/states/empty-state";
import { useData } from "@/hooks/useData";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { usePainel } from "@/hooks/usePainel";
import { monthName } from "@/lib/format";
import { ScreenState } from "./screen-state";

/** Início: «O que faço este mês?» */
export default function Inicio() {
  const { status, retry } = useData();
  const view = usePainel();
  const { setSelectedMonth } = useMonthSelection();
  if (!view) return <ScreenState failed={status === "error"} onRetry={retry} />;

  const monthOptions = view.months.bars.map((bar) => {
    const month = Number(bar.period.split("-")[1]);
    return { value: month, label: monthName(month) };
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h1 font-bold lg:text-h1-lg">
        O que fazer em {monthName(view.month)}
      </h1>
      <Acoes
        actions={view.actions}
        month={view.month}
        onMonthChange={setSelectedMonth}
        monthOptions={monthOptions}
        empty={<EmptyState message="Neste mês não há nenhuma sugestão." />}
      />
      <Ganho gain={view.gain} />
    </div>
  );
}
