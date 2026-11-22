"use client";

import { useEffect, useState } from "react";
import { YearChart } from "@/components/ano/meses";
import { Numbers, type NumbersPart } from "@/components/ano/numeros";
import { YearSummary } from "@/components/ano/resumo";
import { useDashboard } from "@/hooks/useDashboard";
import { useData } from "@/hooks/useData";
import { useMarket } from "@/hooks/useMarket";
import { usePainel } from "@/hooks/usePainel";
import { useReturningGuests } from "@/hooks/useReturningGuests";
import { SOURCES } from "@/lib/benchmarks";
import { monthName } from "@/lib/format";
import { channelFlowSentence, marketSentence } from "@/lib/painel";
import { ScreenState } from "../screen-state";

/** O ano: «Como correu o ano?» */
export default function Ano() {
  const { status, retry } = useData();
  const view = usePainel();
  const dashboard = useDashboard();
  const returning = useReturningGuests();
  const market = useMarket();
  const [open, setOpen] = useState<NumbersPart[]>([]);
  const ready = view !== null && dashboard !== null && returning !== null;

  // /ano#mapa opens «O mapa das noites» and scrolls to it.
  useEffect(() => {
    if (!ready) return;
    const read = () => {
      if (window.location.hash !== "#mapa") return;
      setOpen((parts) => (parts.includes("mapa") ? parts : [...parts, "mapa"]));
      requestAnimationFrame(() =>
        document.getElementById("mapa")?.scrollIntoView({ block: "start" }),
      );
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [ready]);

  if (!view || !dashboard || !returning)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const occupancies = dashboard.thermometer.map((m) => m.occupancy);
  const top = Math.max(...occupancies);
  const bottom = Math.min(...occupancies);
  const bars = dashboard.thermometer.map((m, i) => {
    const month = Number(m.period.slice(5));
    return {
      period: m.period,
      label: view.months.bars[i]?.label ?? "",
      percent: view.months.bars[i]?.percent ?? "",
      occupancy: m.occupancy,
      name: monthName(month),
      best: m.occupancy === top,
      shown:
        m.occupancy === top || m.occupancy === bottom || month === view.month,
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 font-bold lg:text-h1-lg">Como correu o ano</h1>
        <p className="text-lead">{view.period}.</p>
      </div>
      <YearSummary
        sentence={view.summary.sentence}
        figures={view.summary.figures.slice(1)}
      />
      <YearChart
        bars={bars}
        summary={view.months.best}
        levels={view.months.levels}
        price={view.months.price}
        market={market ? marketSentence(market) : null}
      />
      <Numbers
        open={open}
        onOpenChange={setOpen}
        netByChannel={dashboard.netByChannel}
        roomMonth={dashboard.roomMonth}
        rooms={dashboard.byRoom}
        transitions={returning.transitions}
        flowSentence={channelFlowSentence(returning.transitions)}
        sources={SOURCES}
      />
    </div>
  );
}
