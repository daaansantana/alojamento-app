"use client";

import { useEffect, useState } from "react";
import { type PriceQuestion, PriceWhatIf } from "@/components/precos/e-se";
import { MarketSource } from "@/components/precos/fonte";
import {
  FocusMonth,
  MonthByMonth,
  type ThermometerMonth,
  type Tick,
} from "@/components/precos/termometro";
import { useData } from "@/hooks/useData";
import { useMarket } from "@/hooks/useMarket";
import { usePainel } from "@/hooks/usePainel";
import { usePricing } from "@/hooks/usePricing";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import { useWinterRoom } from "@/hooks/useWinterRoom";
import { MARKET_BY_MONTH, MARKET_SEGMENT } from "@/lib/benchmarks";
import { eur, monthName, monthShort, pct } from "@/lib/format";
import {
  MARKET_NOTE,
  marketDifference,
  marketGap,
  marketIntro,
  marketMonthLabel,
  marketSourceLine,
  marketStandIn,
  marketYear,
  PAINEL_SUMMER,
  PAINEL_WINTER_CAMPAIGN,
  PAINEL_WINTER_ROOM,
  summerAnswer,
  winterDiscountAnswer,
  winterRoomAnswer,
  winterRoomPrompt,
} from "@/lib/painel";
import { ScreenState } from "../screen-state";

const QUESTIONS: PriceQuestion[] = ["verao", "inverno", "quarto"];
const HASH: Record<string, PriceQuestion> = {
  verao: "verao",
  inverno: "inverno",
  quarto: "quarto",
};
const SUMMER = [0, 5, 10, 15, 20];
const DISCOUNT = [0, 5, 10, 15, 20];
const RATES = [600, 750, 900, 1050];

/** The ruler: from 60 € to 180 €, wider only if a price falls outside. */
function scale(values: number[]) {
  const low = Math.min(60, Math.floor(Math.min(...values) / 20) * 20);
  const high = Math.max(180, Math.ceil(Math.max(...values) / 20) * 20);
  const at = (value: number) => (value - low) / (high - low);
  const ticks: Tick[] = [];
  for (let v = low; v <= high; v += (high - low) / 3)
    ticks.push({ label: eur(v), at: at(v) });
  return { at, ticks };
}

/** Preços: «O meu preço está bem?» */
export default function Precos() {
  const { status, retry, rooms } = useData();
  const view = usePainel();
  const market = useMarket();
  const [focus, setFocus] = useState<string | null>(null);
  const [question, setQuestion] = useState<PriceQuestion>("verao");
  const [summer, setSummer] = useState(
    Math.round(PAINEL_SUMMER.priceChange * 100),
  );
  const [discount, setDiscount] = useState(
    Math.round(PAINEL_WINTER_CAMPAIGN.discount * 100),
  );
  const [rate, setRate] = useState(PAINEL_WINTER_ROOM.monthlyRate);
  const pricing = usePricing({
    priceChange: summer / 100,
    months: PAINEL_SUMMER.months,
  });
  const campaign = useWinterCampaign({
    returnRate: PAINEL_WINTER_CAMPAIGN.returnRate,
    discount: discount / 100,
  });
  const room = useWinterRoom({
    roomId: PAINEL_WINTER_ROOM.roomId,
    monthlyRate: rate,
  });
  const ready = view !== null && market !== null;

  // /precos#verao, #inverno and #quarto pick the question of «E se…?».
  useEffect(() => {
    if (!ready) return;
    const read = () => {
      const next = HASH[window.location.hash.slice(1)];
      if (!next) return;
      setQuestion(next);
      requestAnimationFrame(() =>
        document.getElementById("e-se")?.scrollIntoView({ block: "start" }),
      );
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [ready]);

  if (!view || !market || !pricing || !campaign || !room)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const { at, ticks } = scale(
    market.months.flatMap((m) => [m.house, m.market]),
  );
  const months: ThermometerMonth[] = market.months.map((m) => ({
    period: m.period,
    name: monthName(Number(m.period.slice(5))),
    short: monthShort(m.period),
    house: eur(m.house),
    market: eur(m.market),
    difference: marketDifference(m),
    houseAt: at(m.house),
    marketAt: at(m.market),
    label: marketMonthLabel(m),
    substitute: m.substitute,
    marketYear: m.substitute ? m.from.slice(0, 4) : null,
  }));
  const selected =
    focus ??
    market.months.find((m) => Number(m.period.slice(5)) === view.month)
      ?.period ??
    market.months[0].period;
  const index = market.months.findIndex((m) => m.period === selected);
  const roomName =
    rooms.find((r) => r.id === PAINEL_WINTER_ROOM.roomId)?.name ?? "quarto";
  const roomAnswer = winterRoomAnswer(room);
  const summerText = view.actions.find((a) => a.id === "summer")?.text;

  const whatIf = {
    verao: {
      prompt: "Quanto sobe em julho e agosto?",
      options: SUMMER.map((v) => ({ value: v, label: pct(v / 100) })),
      value: summer,
      onValueChange: setSummer,
      answer: summerAnswer(pricing, summer / 100),
      detail: summerText,
    },
    inverno: {
      prompt: `Que desconto dá a quem volta no inverno? Conta com ${pct(PAINEL_WINTER_CAMPAIGN.returnRate)} de regresso.`,
      options: DISCOUNT.map((v) => ({ value: v, label: pct(v / 100) })),
      value: discount,
      onValueChange: setDiscount,
      answer: winterDiscountAnswer(campaign, discount / 100),
      link: {
        href: "/hospedes#inverno",
        label: `Ver os ${view.contacts.count} de inverno`,
      },
    },
    quarto: {
      prompt: winterRoomPrompt(roomName),
      options: RATES.map((v) => ({ value: v, label: eur(v) })),
      value: rate,
      onValueChange: setRate,
      answer: roomAnswer.gain,
      detail: roomAnswer.stays,
    },
  }[question];

  const substitutes = market.months.filter((m) => m.substitute);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-bold lg:text-h1-lg">
            O seu preço e o do mercado
          </h1>
          <p className="text-lead">{marketIntro(MARKET_SEGMENT)}</p>
          <p className="text-muted-foreground">{MARKET_NOTE}</p>
        </div>
        <p className="text-statement leading-snug font-bold text-balance">
          {marketYear(market)}
        </p>
        <FocusMonth
          month={months[index]}
          ticks={ticks}
          sentence={marketGap(market.months[index])}
        />
        <MonthByMonth
          months={months}
          selected={selected}
          onSelect={setFocus}
          ticks={ticks}
          marketLegend="Mercado (INE)"
          substituteNote={substitutes[0] ? marketStandIn(substitutes[0]) : null}
        />
      </div>
      <div className="flex flex-col gap-6 lg:sticky lg:top-28">
        <PriceWhatIf
          question={question}
          onQuestionChange={(q) => QUESTIONS.includes(q) && setQuestion(q)}
          {...whatIf}
          together={view.together}
        />
        <MarketSource
          intro="Mercado: INE, «rendimento médio por quarto ocupado» de todo o alojamento turístico em Portugal (hotéis, alojamento local com 10 ou mais camas e turismo rural), no comunicado «Atividade Turística» de cada mês. Os valores são preliminares, como foram publicados."
          lines={MARKET_BY_MONTH.map((m) => ({
            url: m.url,
            text: marketSourceLine(m),
          }))}
        />
      </div>
    </div>
  );
}
