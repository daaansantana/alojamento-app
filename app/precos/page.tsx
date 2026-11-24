"use client";

import { useEffect, useState } from "react";
import {
  type AlertView,
  DataSources,
  MarketAlerts,
} from "@/components/precos/avisos";
import { type CalendarCell, NextDays } from "@/components/precos/calendario";
import { type PriceQuestion, PriceWhatIf } from "@/components/precos/e-se";
import { MarketSource } from "@/components/precos/fonte";
import {
  FocusMonth,
  MonthByMonth,
  type ThermometerMonth,
  type Tick,
} from "@/components/precos/termometro";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useData } from "@/hooks/useData";
import { useMarket } from "@/hooks/useMarket";
import { useMarketSimulation } from "@/hooks/useMarketSimulation";
import { usePainel } from "@/hooks/usePainel";
import { usePricing } from "@/hooks/usePricing";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import { useWinterRoom } from "@/hooks/useWinterRoom";
import { MARKET_BY_MONTH, MARKET_SEGMENT } from "@/lib/benchmarks";
import { eur, monthName, monthShort, pct } from "@/lib/format";
import {
  alertHowMuch,
  alertTag,
  roomDays,
  shortDay,
  weekdayOffset,
} from "@/lib/market-sim";
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
  const { sim } = useMarketSimulation();
  const [alertOpen, setAlertOpen] = useState<string | null>("passagem-de-ano");
  const [alertDone, setAlertDone] = useState<Record<string, "feito" | "posto">>(
    {},
  );
  const [simRoom, setSimRoom] = useState("Quarto Duplo Vista Mar 1");
  const [simDay, setSimDay] = useState("2026-12-31");

  // /precos#verao, #inverno and #quarto pick the question of «E se…?».
  useEffect(() => {
    if (!ready) return;
    const read = () => {
      const next = window.location.hash.slice(1) as PriceQuestion;
      if (!QUESTIONS.includes(next)) return;
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

  // The market alerts, the next 90 days and the sources (simulated data).
  const signed = (x: number) => `${x >= 0 ? "+" : "−"}${pct(Math.abs(x))}`;
  const done = Object.keys(alertDone).filter((id) => alertDone[id] === "feito");
  const alertViews: AlertView[] = sim
    ? sim.alertas.map((a) => ({
        id: a.id,
        tag: alertTag(a, sim.definicoes),
        urgent: a.estado === "hoje",
        dates: a.datas,
        title: a.titulo,
        howMuch: alertHowMuch(a),
        when: a.quando,
        rows: a.quartos.map((q) => ({
          room: q.quarto,
          from: eur(q.de),
          to: eur(q.para),
          market: signed(q.mercado),
        })),
        why: a.porque,
        ai: a.ia || null,
        extra: a.extra || null,
        alternative: a.alternativa
          ? { text: a.alternativa.texto, href: a.alternativa.destino }
          : null,
        done:
          alertDone[a.id] === "feito"
            ? "Feito: marcou que mudou os preços. O calendário já mostra os novos."
            : alertDone[a.id] === "posto"
              ? "Posto de lado: a nexo não volta a avisar sobre estas datas."
              : null,
      }))
    : [];
  const pending = sim
    ? sim.alertas.filter((a) => a.quartos.length && !alertDone[a.id]).length
    : 0;
  const simRoomData = sim?.quartos.find((q) => q.nome === simRoom);
  const days = sim ? roomDays(sim, simRoom, done) : [];
  const dayIndex = Math.max(
    0,
    days.findIndex((d) => d.data === simDay),
  );
  const day = days[dayIndex];
  const factor =
    sim && simRoomData ? (sim.fatorTipo[simRoomData.tipo] ?? 1) : 1;
  const WEEKDAY: Record<string, string> = {
    seg: "segunda",
    ter: "terça",
    qua: "quarta",
    qui: "quinta",
    sex: "sexta",
    sáb: "sábado",
    dom: "domingo",
  };
  const cells: CalendarCell[] = days.map((d, i) => ({
    key: d.data,
    day:
      i === 0 || d.data.endsWith("-01")
        ? shortDay(d.data)
        : String(Number(d.data.slice(8))),
    state: d.state,
    event: d.evento !== null,
    selected: i === dayIndex,
    label: `${WEEKDAY[d.dia]}, ${shortDay(d.data)}: o seu preço ${eur(d.preco)}, quartos parecidos ${eur(d.mediana)}${d.evento ? `, ${d.evento}` : ""}`,
  }));
  const neighbours =
    sim && day
      ? sim.concorrentes
          .map((c) => ({
            c,
            price: c.precos[dayIndex] * factor,
            full: c.esgotado[dayIndex],
          }))
          .sort((a, b) => Number(a.full) - Number(b.full) || a.price - b.price)
          .map(({ c, price, full }) => ({
            name: c.nome,
            info: `${String(c.distanciaKm).replace(".", ",")} km, nota ${String(c.nota).replace(".", ",")}${c.mudou24h && ["2026-12-30", "2026-12-31", "2027-01-01"].includes(day.data) ? ", subiu ontem" : ""}`,
            price: full ? "Esgotado" : eur(price),
          }))
      : [];
  const showAlert = (id: string) => {
    const a = sim?.alertas.find((x) => x.id === id);
    if (!a) return;
    if (a.quartos.length && !a.quartos.some((q) => q.quarto === simRoom))
      setSimRoom(a.quartos[0].quarto);
    if (a.noites[0]) setSimDay(a.noites[0]);
    requestAnimationFrame(() =>
      document
        .getElementById("calendario")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="O seu preço e o do mercado"
        intro={marketYear(market)}
        emphasis
      />
      <div data-layout="colunas" className={COLUMNS}>
        <div className="flex flex-col gap-8">
          <MarketSource
            title="Como comparamos"
            paragraphs={[
              marketIntro(MARKET_SEGMENT),
              MARKET_NOTE,
              "Mercado: INE, «rendimento médio por quarto ocupado» de todo o alojamento turístico em Portugal (hotéis, alojamento local com 10 ou mais camas e turismo rural), no comunicado «Atividade Turística» de cada mês. Os valores são preliminares, como foram publicados.",
            ]}
            lines={MARKET_BY_MONTH.map((m) => ({
              url: m.url,
              text: marketSourceLine(m),
            }))}
          />
          <FocusMonth
            month={months[index]}
            ticks={ticks}
            sentence={marketGap(market.months[index])}
          />
          {sim ? (
            <MarketAlerts
              alerts={alertViews}
              pending={`${pending} por tratar`}
              updated={`Atualizado a ${shortDay(sim.atualizado.slice(0, 10))}, às ${sim.atualizado.slice(11, 16)}. Os preços da casa são os reais; o mercado é um exemplo.`}
              open={alertOpen}
              onOpen={setAlertOpen}
              onDone={(id) => setAlertDone((d) => ({ ...d, [id]: "feito" }))}
              onDismiss={(id) => setAlertDone((d) => ({ ...d, [id]: "posto" }))}
              onUndo={(id) =>
                setAlertDone((d) => {
                  const { [id]: _, ...rest } = d;
                  return rest;
                })
              }
              onShow={showAlert}
            />
          ) : null}
          <MonthByMonth
            months={months}
            selected={selected}
            onSelect={setFocus}
            ticks={ticks}
            marketLegend="Mercado (INE)"
            substituteNote={
              substitutes[0] ? marketStandIn(substitutes[0]) : null
            }
          />
          {sim && day ? (
            <NextDays
              rooms={sim.quartos.map((q) => ({
                value: q.nome,
                label: `${q.nome} (${eur(q.preco)})`,
              }))}
              room={simRoom}
              onRoom={setSimRoom}
              chart={days.map((d) => ({
                label: shortDay(d.data),
                price: d.preco,
                median: Math.round(d.mediana),
                band: [Math.round(d.p25), Math.round(d.p75)],
              }))}
              chartLabel={`O preço do ${simRoom} e o de quartos parecidos, de ${shortDay(days[0].data)} a ${shortDay(days[days.length - 1].data)}. Os valores estão na tabela abaixo.`}
              ticks={days
                .filter((d) => d.data.endsWith("-01"))
                .map((d) => shortDay(d.data))}
              selectedLabel={shortDay(day.data)}
              offset={weekdayOffset(days[0].data)}
              cells={cells}
              onPick={setSimDay}
              detail={{
                title: `${WEEKDAY[day.dia]}, ${shortDay(day.data)}`,
                event: day.evento,
                price:
                  simRoomData && day.preco !== simRoomData.preco
                    ? `${eur(day.preco)} (era ${eur(simRoomData.preco)})`
                    : eur(day.preco),
                market: `${eur(day.p25)} a ${eur(day.p75)}, a meio ${eur(day.mediana)} (${signed(day.gap)} face a si)`,
                occupancy: `${pct(day.ocupacao)} dos quartos`,
                booked: `${day.reservados} de 8`,
                neighbours,
              }}
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-6 lg:self-stretch">
          {sim ? (
            <DataSources
              sources={sim.fontes.map((f) => ({
                name: f.nome,
                detail: f.detalhe,
                state:
                  f.estado === "ligado"
                    ? "Ligado"
                    : f.estado === "em uso"
                      ? "Em uso"
                      : "Por ligar",
                on: f.estado === "ligado",
                inUse: f.estado === "em uso",
              }))}
              note="Os preços diários dos vizinhos só chegam com um serviço pago. Copiar preços do Booking com um programa é proibido pelas regras dele."
              rules={[
                `Avisar ${sim.definicoes.avisarDiasAntes} dias antes da primeira noite.`,
                `Avisar quando a diferença passa ${pct(sim.definicoes.diferencaMinima)}.`,
                `Subir no máximo ${pct(sim.definicoes.subirNoMaximo)} de cada vez.`,
                `Descer no máximo ${pct(sim.definicoes.descerNoMaximo)} de cada vez.`,
                `Nunca abaixo de ${pct(sim.definicoes.precoMinimo)} do preço de hoje.`,
              ]}
            />
          ) : null}
          <div className="lg:sticky lg:top-28">
            <PriceWhatIf
              question={question}
              onQuestionChange={setQuestion}
              {...whatIf}
              together={view.together}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
