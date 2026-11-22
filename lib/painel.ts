// The single page in plain Portuguese: every text the page shows, written
// from the results of the other lib/ functions (SPEC section 4, "Page view").
// Pure: no fetch, no store, no React.

import { BOOKING_COMMISSION } from "@/lib/benchmarks";
import {
  firstName,
  type InvitationKind,
  invitationMailto,
  invitationText,
} from "@/lib/email";
import {
  about,
  dayMonth,
  eur,
  int,
  monthName,
  monthShort,
  pct,
} from "@/lib/format";
import type {
  AlertId,
  AlertWhen,
  ChannelTransition,
  DirectBookingResult,
  DirectBookingScenario,
  GainScenario,
  GainScenarioId,
  GuestProfile,
  MonthLevel,
  PainelAction,
  PainelContact,
  PainelInput,
  PainelView,
  PeriodKpi,
  PricingResult,
  PricingScenario,
  WinterCampaignResult,
  WinterCampaignScenario,
  WinterRoomResult,
  WinterRoomScenario,
} from "@/types";

/** The winter campaign the page proposes. */
export const PAINEL_WINTER_CAMPAIGN: WinterCampaignScenario = {
  returnRate: 0.2,
  discount: 0.1,
};

/** The direct-booking change the page proposes. */
export const PAINEL_DIRECT: DirectBookingScenario = {
  commissionRate: BOOKING_COMMISSION,
  conversionRate: 0.5,
  directDiscount: 0.05,
};

/** The summer price change behind AlertFacts.summerGain. */
export const PAINEL_SUMMER: PricingScenario = {
  priceChange: 0.1,
  months: ["2026-07", "2026-08"],
};

// «Quarto ao mês»: the room in the proposal, at the rate the SPEC checks.
export const PAINEL_WINTER_ROOM: WinterRoomScenario = {
  roomId: 3,
  monthlyRate: 900,
};

const WHEN: Record<AlertWhen, string> = {
  now: "Agora",
  prepare: "A preparar",
  always: "Sempre",
  later: "Mais tarde",
};

const LEVEL: Record<MonthLevel, string> = {
  hot: "mais procurado",
  normal: "normal",
  cold: "menos procurado",
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** "2025-11" → "novembro de 2025". */
function monthOfYear(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return `${monthName(month)} de ${year}`;
}

/** 0.5 → "metade", otherwise a percentage. */
function shareInWords(share: number): string {
  return share === 0.5 ? "metade" : pct(share);
}

function bestMonthSentence(byMonth: PeriodKpi[]): string {
  const best = byMonth.reduce((a, b) => (b.occupancy > a.occupancy ? b : a));
  const month = Number(best.period.split("-")[1]);
  return `${capitalize(monthName(month))} foi o melhor mês: ${pct(best.occupancy)} das noites com hóspedes.`;
}

function action(
  id: AlertId,
  when: AlertWhen,
  input: PainelInput,
): PainelAction {
  const { facts, campaign, direct } = input;
  const base = { id, when: WHEN[when] };
  switch (id) {
    case "winter":
      return {
        ...base,
        title: "Convide quem já cá esteve no inverno",
        text: `Ficaram ${int(facts.winterEmptyNights)} noites por vender de novembro a fevereiro. ${int(facts.winterReturners)} hóspedes que voltam já cá estiveram nesta altura do ano.`,
        worth: `Com ${pct(PAINEL_WINTER_CAMPAIGN.discount)} de desconto, cerca de ${int(campaign.extraStays)} estadas: mais ${eur(campaign.extraRevenue)}.`,
        short: `Mais ${eur(campaign.extraRevenue)} no inverno`,
        cta: `Ver os ${int(facts.winterReturners)} hóspedes`,
        target: "/hospedes#inverno",
      };
    case "commission":
      return {
        ...base,
        title: "Peça a quem volta que reserve diretamente",
        text: `Este ano pagou ${eur(facts.commissionToday)} de comissão em ${int(facts.platformReturnStays)} regressos pelo Booking e pelo Airbnb.`,
        worth: `Se ${shareInWords(PAINEL_DIRECT.conversionRate)} passar a reservar diretamente, com ${pct(PAINEL_DIRECT.directDiscount)} de desconto: mais ${eur(direct.yearlyGain)} por ano.`,
        short: `Mais ${eur(direct.yearlyGain)} por ano`,
        cta: `Ver os ${int(input.contactFirst.length)} hóspedes`,
        target: "/hospedes#direto",
      };
    case "summer":
      return {
        ...base,
        title: "Suba um pouco o preço em julho e agosto",
        text: `Julho e agosto tiveram ${pct(facts.julyOccupancy)} e ${pct(facts.augustOccupancy)} das noites com hóspedes, com o preço de sempre.`,
        worth: `Com mais ${pct(PAINEL_SUMMER.priceChange)}, nas mesmas noites: mais ${eur(facts.summerGain)}.`,
        short: `Mais ${eur(facts.summerGain)} no verão`,
        cta: "Simular o verão",
        target: "/precos#verao",
      };
    case "orphans":
      return {
        ...base,
        title: "Venda as noites soltas",
        text: `Há ${int(facts.orphanNights)} noites vazias entre duas estadas no mesmo quarto, ${int(facts.summerOrphanNights)} delas de junho a setembro.`,
        worth: null,
        short: `${int(facts.orphanNights)} noites vazias entre duas estadas`,
        cta: "Ver o mapa",
        target: "/ano#mapa",
      };
  }
}

function contact(guest: GuestProfile, kind: InvitationKind): PainelContact {
  const last =
    guest.lastChannel === "Direto" ? "direta" : `pelo ${guest.lastChannel}`;
  const stays = guest.stays === 1 ? "1 estada" : `${int(guest.stays)} estadas`;
  return {
    name: guest.name,
    email: guest.email,
    detail: `${stays}, ${eur(guest.spent)} no total. A última foi ${last}.`,
    mailto: invitationMailto(guest, kind),
  };
}

const guestsWord = (n: number) =>
  n === 1 ? "1 hóspede" : `${int(n)} hóspedes`;

/** «Já escreveu a 2 de 49»: how many of a list she has written to. */
export function writtenProgress(done: number, total: number): string {
  return done === 0
    ? `Ainda não escreveu a nenhum dos ${int(total)}`
    : `Já escreveu a ${int(done)} de ${int(total)}`;
}

/** «Escreveu a 21 de novembro», from the day she marked it, "YYYY-MM-DD". */
export function writtenOn(day: string): string {
  return `Escreveu a ${dayMonth(day)}`;
}

/** «Mostrar mais 39 hóspedes». */
export function showMoreGuests(hidden: number): string {
  return `Mostrar mais ${guestsWord(hidden)}`;
}

/** The answer to «E se só alguns voltarem?», for the winter list. */
export function winterAnswer(campaign: WinterCampaignResult): string {
  if (campaign.extraStays === 0) return "Nenhuma estada a mais.";
  const stays =
    campaign.extraStays === 1
      ? "1 estada"
      : `${int(campaign.extraStays)} estadas`;
  return `Cerca de ${stays}: mais ${eur(campaign.extraRevenue)}.`;
}

const listInWords = (words: string[]) =>
  words.length <= 1
    ? (words[0] ?? "")
    : `${words.slice(0, -1).join(", ")} e ${words[words.length - 1]}`;

/** Months in words, in the year's order; a run of 3 or more wraps as «de outubro a janeiro». */
function monthsInWords(periods: string[], year: string[]): string {
  const name = (i: number) => monthName(Number(year[i].slice(5)));
  const at = periods.map((p) => year.indexOf(p)).sort((a, b) => a - b);
  const n = year.length;
  if (at.length >= 3)
    for (const start of at)
      if (at.every((_, k) => at.includes((start + k) % n)))
        return `de ${name(start)} a ${name((start + at.length - 1) % n)}`;
  return listInWords(at.map(name));
}

/** «Mais procurados: julho e agosto. Menos procurados: de outubro a janeiro.» */
function levelsSentence(thermometer: PainelInput["thermometer"]): string {
  const year = thermometer.map((m) => m.period);
  const part = (level: MonthLevel, one: string, many: string) => {
    const periods = thermometer
      .filter((m) => m.level === level)
      .map((m) => m.period);
    if (periods.length === 0) return null;
    return `${periods.length === 1 ? one : many}: ${monthsInWords(periods, year)}.`;
  };
  return [
    part("hot", "Mais procurado", "Mais procurados"),
    part("cold", "Menos procurado", "Menos procurados"),
  ]
    .filter(Boolean)
    .join(" ");
}

/** «27 das 37 estadas de quem reservou direto voltaram pelas plataformas.» */
export function channelFlowSentence(transitions: ChannelTransition[]): string {
  const fromDirect = transitions.filter((t) => t.from === "Direto");
  const total = fromDirect.reduce((sum, t) => sum + t.stays, 0);
  const platforms = fromDirect
    .filter((t) => t.to !== "Direto")
    .reduce((sum, t) => sum + t.stays, 0);
  return `${int(platforms)} das ${int(total)} estadas de quem reservou direto voltaram pelas plataformas.`;
}

/** «E se mudar o preço?», summer: what a price change in July and August brings. */
export function summerAnswer(
  pricing: PricingResult,
  priceChange: number,
): string {
  if (priceChange === 0) return "Com o preço de sempre, fica tudo igual.";
  return `Com mais ${pct(priceChange)}, nas mesmas noites: mais ${eur(pricing.newRevenue - pricing.baseRevenue)}.`;
}

/** «E se mudar o preço?», winter: the discount for the guests who come back. */
export function winterDiscountAnswer(
  campaign: WinterCampaignResult,
  discount: number,
): string {
  const off =
    discount === 0 ? "Sem desconto" : `Com ${pct(discount)} de desconto`;
  const stays =
    campaign.extraStays === 1
      ? "1 estada"
      : `${int(campaign.extraStays)} estadas`;
  return `${off}, cerca de ${stays}: mais ${eur(campaign.extraRevenue)}.`;
}

/** «Quarto ao mês»: what she would do, with the room's own name. */
export function winterRoomPrompt(roomName: string): string {
  return `Alugar o ${roomName} de novembro a fevereiro, a uma só pessoa`;
}

/** «Quarto ao mês»: the gain, and whether the room's winter stays fit elsewhere. */
export function winterRoomAnswer(result: WinterRoomResult): {
  gain: string;
  stays: string;
} {
  const gain =
    result.netGain >= 0
      ? `Mais ${eur(result.netGain)} no inverno.`
      : `Menos ${eur(-result.netGain)} no inverno.`;
  const stays =
    result.relocatableStays === result.displacedStays
      ? `As ${int(result.displacedStays)} estadas que este quarto teve no inverno cabem noutros quartos.`
      : `Das ${int(result.displacedStays)} estadas que este quarto teve no inverno, ${int(result.relocatableStays)} cabem noutros quartos; as outras valiam ${eur(result.lostRevenue)}.`;
  return { gain, stays };
}

/** The answer to «E se só alguns aceitarem?», for the direct-booking list. */
export function directAnswer(direct: DirectBookingResult): string {
  return direct.yearlyGain > 0
    ? `Mais ${eur(direct.yearlyGain)} por ano.`
    : "Nada a mais por ano.";
}

function scenario(gains: GainScenario[], id: GainScenarioId): GainScenario {
  const found = gains.find((g) => g.id === id);
  if (!found) throw new Error(`no gain scenario "${id}"`);
  return found;
}

/** Every text of the single page, from the results of lib/. */
export function buildPainel(input: PainelInput): PainelView {
  const { year, byMonth, thermometer, totals, gains } = input;
  const best = bestMonthSentence(byMonth);

  const cautious = scenario(gains, "cautious");
  const likely = scenario(gains, "likely");
  const optimistic = scenario(gains, "optimistic");

  const adrs = thermometer.map((m) => m.adr);
  const contacts = input.winterReturners.map((g) => contact(g, "winter"));
  const directContacts = input.contactFirst.map((g) => contact(g, "direct"));
  const preview = (kind: InvitationKind, list: GuestProfile[]) =>
    invitationText(kind, list.length ? firstName(list[0].name) : "Helena");

  return {
    month: input.month,
    monthName: monthName(input.month),
    period: `De ${monthOfYear(byMonth[0].period)} a ${monthOfYear(byMonth[byMonth.length - 1].period)}`,
    intro: `Pode ganhar mais cerca de ${about(likely.total)} por ano. Comece por isto:`,
    together: `Verão e inverno juntos: o verão paga o desconto do inverno. Mais ${eur(input.facts.summerGain + input.campaign.extraRevenue)} no ano.`,
    guestsIntro: `Se estes hóspedes voltarem ou reservarem diretamente, pode ganhar mais cerca de ${about(likely.total)} por ano.`,
    summary: {
      sentence: `Este ano a casa rendeu ${eur(year.revenue)}. ${best}`,
      short: `Recebeu ${eur(year.revenue)} e teve hóspedes em ${pct(year.occupancy)} das noites.`,
      figures: [
        { value: eur(year.revenue), label: "recebeu no ano" },
        { value: pct(year.occupancy), label: "das noites com hóspedes" },
        {
          value: int(totals.returningGuests),
          label: `hóspedes voltaram e trouxeram ${pct(totals.returningSpent / totals.spent)} da receita`,
        },
      ],
    },
    actions: input.alerts.map((a) => action(a.id, a.when, input)),
    contacts: {
      first: contacts.slice(0, 3),
      all: contacts,
      total: input.winterReturners.length,
      count: guestsWord(input.winterReturners.length),
      explain: `Já cá estiveram no inverno e voltaram mais de uma vez. O email convida a voltar, com ${pct(PAINEL_WINTER_CAMPAIGN.discount)} de desconto. Só tem de o enviar.`,
      preview: preview("winter", input.winterReturners),
    },
    directContacts: {
      first: directContacts.slice(0, 3),
      all: directContacts,
      total: input.contactFirst.length,
      count: guestsWord(input.contactFirst.length),
      explain: `Voltaram e a última reserva veio pelo Booking ou pelo Airbnb. Nesses regressos pagou ${eur(input.facts.commissionToday)} de comissão. O email oferece ${pct(PAINEL_DIRECT.directDiscount)} de desconto a quem reservar diretamente. Só tem de o enviar.`,
      preview: preview("direct", input.contactFirst),
    },
    gain: {
      likely: `Cerca de ${about(likely.total)}`,
      range: `Entre cerca de ${about(cautious.total)} e ${about(optimistic.total)}, conforme quantos hóspedes aceitarem.`,
      assumption: `No cenário mais provável, ${shareInWords(likely.conversionRate)} de quem volta pelas plataformas passa a reservar diretamente, com ${pct(likely.directDiscount)} de desconto, e 1 em cada ${Math.round(1 / likely.winterReturnRate)} hóspedes de inverno volta mais uma vez.`,
    },
    months: {
      bars: thermometer.map((m) => ({
        period: m.period,
        label: monthShort(m.period),
        percent: pct(m.occupancy),
        level: LEVEL[m.level],
      })),
      best,
      levels: levelsSentence(thermometer),
      price: `O preço por noite quase não mudou: entre ${eur(Math.min(...adrs))} e ${eur(Math.max(...adrs))}.`,
    },
  };
}
