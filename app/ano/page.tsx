"use client";

import { useState } from "react";
import { type DetailPart, Detalhes } from "@/components/painel/detalhes";
import { Meses } from "@/components/painel/meses";
import { Resumo } from "@/components/painel/resumo";
import { useDashboard } from "@/hooks/useDashboard";
import { useData } from "@/hooks/useData";
import { usePainel } from "@/hooks/usePainel";
import { useReturningGuests } from "@/hooks/useReturningGuests";
import { SOURCES } from "@/lib/benchmarks";
import { ScreenState } from "../screen-state";

/** O ano: «Como correu o ano?» */
export default function Ano() {
  const { status, retry } = useData();
  const view = usePainel();
  const dashboard = useDashboard();
  const returning = useReturningGuests();
  const [detailsOpen, setDetailsOpen] = useState<DetailPart[]>([]);
  if (!view || !dashboard || !returning)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const bars = view.months.bars.flatMap((bar) => {
    const month = dashboard.thermometer.find((m) => m.period === bar.period);
    return month
      ? [{ ...bar, occupancy: month.occupancy, tone: month.level }]
      : [];
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h1 font-bold lg:text-h1-lg">Como correu o ano</h1>
      <Resumo summary={view.summary} period={view.period} />
      <Meses months={view.months} bars={bars} />
      <Detalhes
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        netByChannel={dashboard.netByChannel}
        roomMonth={dashboard.roomMonth}
        rooms={dashboard.byRoom}
        transitions={returning.transitions}
        sources={SOURCES}
      />
    </div>
  );
}
