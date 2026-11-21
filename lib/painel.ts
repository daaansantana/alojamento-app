// The single page in plain Portuguese: every text the page shows, written
// from the results of the other lib/ functions (SPEC section 4, "Page view").
// Pure: no fetch, no store, no React.

import { BOOKING_COMMISSION } from "@/lib/benchmarks";
import { invitationMailto } from "@/lib/email";
import { about, eur, int, monthName, monthShort, pct } from "@/lib/format";
import type {
  AlertId,
  AlertWhen,
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
  WinterCampaignScenario,
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
const SUMMER_PRICE_CHANGE = 0.1;

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
        cta: `Ver os ${int(facts.winterReturners)} hóspedes`,
        target: "#contactos",
      };
    case "commission":
      return {
        ...base,
        title: "Peça a quem volta que reserve diretamente",
        text: `Este ano pagou ${eur(facts.commissionToday)} de comissão em ${int(facts.platformReturnStays)} regressos pelo Booking e pelo Airbnb.`,
        worth: `Se ${shareInWords(PAINEL_DIRECT.conversionRate)} passar a reservar diretamente, com ${pct(PAINEL_DIRECT.directDiscount)} de desconto: mais ${eur(direct.yearlyGain)} por ano.`,
        cta: "Simular o desconto",
        target: "#simular",
      };
    case "summer":
      return {
        ...base,
        title: "Suba um pouco o preço em julho e agosto",
        text: `Julho e agosto tiveram ${pct(facts.julyOccupancy)} e ${pct(facts.augustOccupancy)} das noites com hóspedes, com o preço de sempre.`,
        worth: `Com mais ${pct(SUMMER_PRICE_CHANGE)}, nas mesmas noites: mais ${eur(facts.summerGain)}.`,
        cta: "Simular o verão",
        target: "#simular",
      };
    case "orphans":
      return {
        ...base,
        title: "Venda as noites soltas",
        text: `Há ${int(facts.orphanNights)} noites vazias entre duas estadas no mesmo quarto, ${int(facts.summerOrphanNights)} delas de junho a setembro.`,
        worth: null,
        cta: "Ver o mapa",
        target: "#detalhes",
      };
  }
}

function contact(guest: GuestProfile): PainelContact {
  const last =
    guest.lastChannel === "Direto" ? "direta" : `pelo ${guest.lastChannel}`;
  return {
    name: guest.name,
    detail: `${int(guest.stays)} estadas · ${eur(guest.spent)} · última ${last}`,
    mailto: invitationMailto(guest, "winter"),
  };
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
  const contacts = input.winterReturners.map(contact);

  return {
    month: input.month,
    monthName: monthName(input.month),
    period: `De ${monthOfYear(byMonth[0].period)} a ${monthOfYear(byMonth[byMonth.length - 1].period)}`,
    summary: {
      sentence: `Este ano a casa rendeu ${eur(year.revenue)}. ${best}`,
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
    },
    gain: {
      likely: `Cerca de ${about(likely.total)} por ano`,
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
      price: `O preço por noite quase não mudou: entre ${eur(Math.min(...adrs))} e ${eur(Math.max(...adrs))}.`,
    },
  };
}
