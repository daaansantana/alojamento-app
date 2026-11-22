// buildPainel with a fixed input made of the SPEC's expected values:
// every text of the page, letter by letter, and the order of the actions.
import { invitationMailto } from "../lib/email";
import { buildPainel } from "../lib/painel";
import type {
  Alert,
  GuestProfile,
  MonthLevel,
  PainelInput,
  PeriodKpi,
} from "../types";

let failures = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✔ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${name}\n    expected ${e}\n    got      ${a}`);
  }
}

// No-break space: inside numbers and before the €.
const _ = " ";

// SPEC section 4, "By month" and "Price thermometer".
const MONTHS: [string, number, number, number, MonthLevel][] = [
  ["2025-11", 92, 240, 9550, "cold"],
  ["2025-12", 97, 248, 9595, "cold"],
  ["2026-01", 79, 248, 7715, "cold"],
  ["2026-02", 92, 224, 9180, "normal"],
  ["2026-03", 108, 248, 10615, "normal"],
  ["2026-04", 119, 240, 12390, "normal"],
  ["2026-05", 123, 248, 12105, "normal"],
  ["2026-06", 122, 240, 12400, "normal"],
  ["2026-07", 139, 248, 13475, "hot"],
  ["2026-08", 160, 248, 15990, "hot"],
  ["2026-09", 115, 240, 11555, "normal"],
  ["2026-10", 98, 248, 9415, "cold"],
];
const byMonth: PeriodKpi[] = MONTHS.map(([period, nights, available, rev]) => ({
  period,
  nightsSold: nights,
  nightsAvailable: available,
  occupancy: nights / available,
  revenue: rev,
  adr: rev / nights,
  revpar: rev / available,
}));
const thermometer = MONTHS.map(([period, nights, available, rev, level]) => ({
  period,
  occupancy: nights / available,
  adr: rev / nights,
  level,
}));

function guest(
  name: string,
  email: string,
  stays: number,
  spent: number,
  lastChannel: string,
): GuestProfile {
  return {
    email,
    name,
    stays,
    spent,
    firstCheckIn: "2025-11-10",
    lastCheckOut: "2026-09-23",
    recencyDays: 40,
    firstChannel: "Booking",
    lastChannel,
    everDirect: lastChannel === "Direto",
    r: 3,
    f: stays >= 3 ? 3 : 2,
    m: 3,
  };
}
const guests = [
  guest("Helena Costa", "helena.costa@correio.example", 4, 1810, "Airbnb"),
  guest("Sofia Teixeira", "sofia.teixeira@correio.example", 2, 1435, "Airbnb"),
  guest(
    "Ricardo Carvalho",
    "ricardo.carvalho@correio.example",
    3,
    1335,
    "Direto",
  ),
];

// SPEC section 3, "The order of the action alerts".
const ALERTS: Record<number, Alert[]> = {
  11: [
    { id: "winter", when: "now" },
    { id: "commission", when: "always" },
    { id: "summer", when: "prepare" },
    { id: "orphans", when: "later" },
  ],
  8: [
    { id: "summer", when: "now" },
    { id: "orphans", when: "now" },
    { id: "commission", when: "always" },
    { id: "winter", when: "prepare" },
  ],
};

const input = (month: number): PainelInput => ({
  year: {
    period: "year",
    nightsSold: 1344,
    nightsAvailable: 2920,
    occupancy: 1344 / 2920,
    revenue: 133985,
    adr: 133985 / 1344,
    revpar: 133985 / 2920,
  },
  byMonth,
  thermometer,
  totals: {
    guests: 312,
    stays: 440,
    spent: 134065,
    returningGuests: 102,
    returningStays: 230,
    returningSpent: 69535,
  },
  facts: {
    winterEmptyNights: 600,
    winterReturners: 49,
    platformReturnStays: 95,
    commissionToday: 4239.75,
    julyOccupancy: 139 / 248,
    augustOccupancy: 160 / 248,
    summerGain: 2946.5,
    orphanNights: 87,
    summerOrphanNights: 46,
  },
  alerts: ALERTS[month],
  month,
  winterReturners: guests,
  campaign: {
    guests: 49,
    extraStays: 10,
    avgStayValue: 293.76,
    extraRevenue: 2643.84,
    discountCost: 293.76,
  },
  direct: {
    baseStays: 95,
    baseRevenue: 28265,
    commissionToday: 4239.75,
    yearlyGain: 1413.25,
    breakEvenDiscount: 0.15,
  },
  gains: [
    {
      id: "cautious",
      conversionRate: 0.2,
      directDiscount: 0.05,
      winterReturnRate: 0.1,
      directGain: 565.3,
      winterGain: 1468.8,
      total: 2034.1,
    },
    {
      id: "likely",
      conversionRate: 0.5,
      directDiscount: 0.05,
      winterReturnRate: 0.2,
      directGain: 1413.25,
      winterGain: 2937.6,
      total: 4350.85,
    },
    {
      id: "optimistic",
      conversionRate: 1,
      directDiscount: 0,
      winterReturnRate: 0.3,
      directGain: 4239.75,
      winterGain: 4406.4,
      total: 8646.15,
    },
  ],
});

const view = buildPainel(input(11));
const best = "Agosto foi o melhor mês: 65% das noites com hóspedes.";

console.log("painel: header and summary");
check("month", view.month, 11);
check("monthName", view.monthName, "novembro");
check("period", view.period, "De novembro de 2025 a outubro de 2026");
check(
  "intro",
  view.intro,
  `Pode ganhar mais cerca de 4350${_}€ por ano. Comece por isto:`,
);
check(
  "summary.short",
  view.summary.short,
  `Recebeu 133${_}985${_}€ e teve hóspedes em 46% das noites.`,
);
check(
  "summary.sentence",
  view.summary.sentence,
  `Este ano a casa rendeu 133${_}985${_}€. ${best}`,
);
check("summary.figures", view.summary.figures, [
  { value: `133${_}985${_}€`, label: "recebeu no ano" },
  { value: "46%", label: "das noites com hóspedes" },
  { value: "102", label: "hóspedes voltaram e trouxeram 52% da receita" },
]);

console.log("\npainel: actions");
const byId = Object.fromEntries(view.actions.map((a) => [a.id, a]));
check("winter", byId.winter, {
  id: "winter",
  when: "Agora",
  title: "Convide quem já cá esteve no inverno",
  text: "Ficaram 600 noites por vender de novembro a fevereiro. 49 hóspedes que voltam já cá estiveram nesta altura do ano.",
  worth: `Com 10% de desconto, cerca de 10 estadas: mais 2644${_}€.`,
  short: `Mais 2644${_}€ no inverno`,
  cta: "Ver os 49 hóspedes",
  target: "/hospedes#inverno",
});
check("commission", byId.commission, {
  id: "commission",
  when: "Sempre",
  title: "Peça a quem volta que reserve diretamente",
  text: `Este ano pagou 4240${_}€ de comissão em 95 regressos pelo Booking e pelo Airbnb.`,
  worth: `Se metade passar a reservar diretamente, com 5% de desconto: mais 1413${_}€ por ano.`,
  short: `Mais 1413${_}€ por ano`,
  cta: "Simular o desconto",
  target: "/hospedes#direto",
});
check("summer", byId.summer, {
  id: "summer",
  when: "A preparar",
  title: "Suba um pouco o preço em julho e agosto",
  text: "Julho e agosto tiveram 56% e 65% das noites com hóspedes, com o preço de sempre.",
  worth: `Com mais 10%, nas mesmas noites: mais 2947${_}€.`,
  short: `Mais 2947${_}€ no verão`,
  cta: "Simular o verão",
  target: "/precos#verao",
});
check("orphans", byId.orphans, {
  id: "orphans",
  when: "Mais tarde",
  title: "Venda as noites soltas",
  text: "Há 87 noites vazias entre duas estadas no mesmo quarto, 46 delas de junho a setembro.",
  worth: null,
  short: "87 noites vazias entre duas estadas",
  cta: "Ver o mapa",
  target: "/ano#mapa",
});
check(
  "month 11: order and when",
  view.actions.map((a) => `${a.id} ${a.when}`),
  [
    "winter Agora",
    "commission Sempre",
    "summer A preparar",
    "orphans Mais tarde",
  ],
);
check(
  "month 8: order and when",
  buildPainel(input(8)).actions.map((a) => `${a.id} ${a.when}`),
  ["summer Agora", "orphans Agora", "commission Sempre", "winter A preparar"],
);
check("month 8: monthName", buildPainel(input(8)).monthName, "agosto");

console.log("\npainel: contacts");
check("contacts.first", view.contacts.first, [
  {
    name: "Helena Costa",
    detail: `4 estadas · 1810${_}€ · última pelo Airbnb`,
    mailto: invitationMailto(guests[0], "winter"),
  },
  {
    name: "Sofia Teixeira",
    detail: `2 estadas · 1435${_}€ · última pelo Airbnb`,
    mailto: invitationMailto(guests[1], "winter"),
  },
  {
    name: "Ricardo Carvalho",
    detail: `3 estadas · 1335${_}€ · última direta`,
    mailto: invitationMailto(guests[2], "winter"),
  },
]);
check("contacts.total", view.contacts.total, 3);
check(
  "contacts.all: one per winter returner",
  view.contacts.all.length,
  guests.length,
);
check(
  "contacts.all: the first three are contacts.first",
  view.contacts.all.slice(0, 3),
  view.contacts.first,
);

console.log("\npainel: gain");
check("gain", view.gain, {
  likely: `Cerca de 4350${_}€`,
  range: `Entre cerca de 2030${_}€ e 8650${_}€, conforme quantos hóspedes aceitarem.`,
  assumption:
    "No cenário mais provável, metade de quem volta pelas plataformas passa a reservar diretamente, com 5% de desconto, e 1 em cada 5 hóspedes de inverno volta mais uma vez.",
});

console.log("\npainel: months");
check(
  "months.bars",
  view.months.bars.map((b) => `${b.period} ${b.label} ${b.percent} ${b.level}`),
  [
    "2025-11 nov 38% menos procurado",
    "2025-12 dez 39% menos procurado",
    "2026-01 jan 32% menos procurado",
    "2026-02 fev 41% normal",
    "2026-03 mar 44% normal",
    "2026-04 abr 50% normal",
    "2026-05 mai 50% normal",
    "2026-06 jun 51% normal",
    "2026-07 jul 56% mais procurado",
    "2026-08 ago 65% mais procurado",
    "2026-09 set 48% normal",
    "2026-10 out 40% menos procurado",
  ],
);
check("months.best", view.months.best, best);
check(
  "months.price",
  view.months.price,
  `O preço por noite quase não mudou: entre 96${_}€ e 104${_}€.`,
);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
