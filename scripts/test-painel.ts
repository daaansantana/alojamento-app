// buildPainel with a fixed input made of the SPEC's expected values:
// every text of the page, letter by letter, and the order of the actions.
import { MARKET_BY_MONTH, MARKET_SEGMENT } from "../lib/benchmarks";
import { invitationMailto, invitationText } from "../lib/email";
import { marketComparison } from "../lib/market";
import {
  buildPainel,
  channelFlowSentence,
  directAnswer,
  MARKET_NOTE,
  marketDifference,
  marketGap,
  marketIntro,
  marketMonthLabel,
  marketSentence,
  marketSourceLine,
  marketStandIn,
  marketYear,
  showMoreGuests,
  summerAnswer,
  winterAnswer,
  winterDiscountAnswer,
  winterRoomAnswer,
  winterRoomPrompt,
  writtenOn,
  writtenProgress,
} from "../lib/painel";
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

// SPEC section 4, contactFirst: the first three.
const platformGuests = [
  guests[0],
  guest(
    "Filipa Teixeira",
    "filipa.teixeira@correio.example",
    3,
    1565,
    "Booking",
  ),
  guests[1],
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
  contactFirst: platformGuests,
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
  cta: "Ver os 3 hóspedes",
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
    email: "helena.costa@correio.example",
    detail: `4 estadas, 1810${_}€ no total. A última foi pelo Airbnb.`,
    mailto: invitationMailto(guests[0], "winter"),
  },
  {
    name: "Sofia Teixeira",
    email: "sofia.teixeira@correio.example",
    detail: `2 estadas, 1435${_}€ no total. A última foi pelo Airbnb.`,
    mailto: invitationMailto(guests[1], "winter"),
  },
  {
    name: "Ricardo Carvalho",
    email: "ricardo.carvalho@correio.example",
    detail: `3 estadas, 1335${_}€ no total. A última foi direta.`,
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

console.log("\npainel: direct-booking contacts");
check("directContacts.first", view.directContacts.first, [
  {
    name: "Helena Costa",
    email: "helena.costa@correio.example",
    detail: `4 estadas, 1810${_}€ no total. A última foi pelo Airbnb.`,
    mailto: invitationMailto(platformGuests[0], "direct"),
  },
  {
    name: "Filipa Teixeira",
    email: "filipa.teixeira@correio.example",
    detail: `3 estadas, 1565${_}€ no total. A última foi pelo Booking.`,
    mailto: invitationMailto(platformGuests[1], "direct"),
  },
  {
    name: "Sofia Teixeira",
    email: "sofia.teixeira@correio.example",
    detail: `2 estadas, 1435${_}€ no total. A última foi pelo Airbnb.`,
    mailto: invitationMailto(platformGuests[2], "direct"),
  },
]);
check("directContacts.total", view.directContacts.total, 3);
check(
  "directContacts.all: one per guest in contactFirst",
  view.directContacts.all.length,
  platformGuests.length,
);
check(
  "directContacts: the email is the direct-booking one",
  view.directContacts.all.every((c) =>
    c.mailto.includes("reserve%20diretamente"),
  ),
  true,
);

console.log("\npainel: the guest lists");
check(
  "guestsIntro",
  view.guestsIntro,
  "102 hóspedes voltaram e trouxeram 52% da receita. Escolha o que lhes quer pedir.",
);
check("contacts.count", view.contacts.count, "3 hóspedes");
check("contacts.action", view.contacts.action, "Convidar para o inverno");
check("contacts.worth", view.contacts.worth, `Mais 2644${_}€ no inverno`);
check(
  "contacts.who",
  view.contacts.who,
  "Já cá estiveram no inverno e voltaram mais de uma vez.",
);
check(
  "contacts.what",
  view.contacts.what,
  "O email já está escrito e oferece 10% de desconto para voltarem no inverno. Depois de o enviar, marque «Já escrevi».",
);
check(
  "contacts.preview: the email to the first guest",
  view.contacts.preview,
  invitationText("winter", "Helena"),
);
check("directContacts.count", view.directContacts.count, "3 hóspedes");
check(
  "directContacts.action",
  view.directContacts.action,
  "Pedir que reservem direto",
);
check(
  "directContacts.worth",
  view.directContacts.worth,
  `Mais 1413${_}€ por ano`,
);
check(
  "directContacts.who",
  view.directContacts.who,
  `Voltaram, e a última reserva veio pelo Booking ou pelo Airbnb. Nesses regressos pagou 4240${_}€ de comissão.`,
);
check(
  "directContacts.what",
  view.directContacts.what,
  "O email já está escrito e oferece 5% de desconto na próxima reserva feita diretamente consigo. Depois de o enviar, marque «Já escrevi».",
);
check(
  "directContacts.preview",
  view.directContacts.preview,
  invitationText("direct", "Helena"),
);
check(
  "writtenProgress(2, 49)",
  writtenProgress(2, 49),
  "Já escreveu a 2 de 49",
);
check(
  "writtenProgress(0, 49)",
  writtenProgress(0, 49),
  "Ainda não escreveu a nenhum dos 49",
);
check("writtenOn", writtenOn("2026-11-21"), "Escreveu a 21 de novembro");
check("showMoreGuests(39)", showMoreGuests(39), "Mostrar mais 39 hóspedes");
check("showMoreGuests(1)", showMoreGuests(1), "Mostrar mais 1 hóspede");
check(
  "winterAnswer",
  winterAnswer({
    guests: 49,
    extraStays: 10,
    avgStayValue: 293.76,
    extraRevenue: 2643.84,
    discountCost: 293.76,
  }),
  `Cerca de 10 estadas: mais 2644${_}€.`,
);
check(
  "winterAnswer, nobody returns",
  winterAnswer({
    guests: 49,
    extraStays: 0,
    avgStayValue: 293.76,
    extraRevenue: 0,
    discountCost: 0,
  }),
  "Nenhuma estada a mais.",
);
check(
  "directAnswer",
  directAnswer({
    baseStays: 95,
    baseRevenue: 28265,
    commissionToday: 4239.75,
    yearlyGain: 1413.25,
    breakEvenDiscount: 0.15,
  }),
  `Mais 1413${_}€ por ano.`,
);

console.log("\npainel: what if the price changes");
const pricing = (change: number) => ({
  nightsSold: 299,
  baseRevenue: 29465,
  newRevenue: 29465 * (1 + change),
  nightsForSameRevenue: 299 / (1 + change),
});
check(
  "summerAnswer(10%)",
  summerAnswer(pricing(0.1), 0.1),
  `Com mais 10%, nas mesmas noites: mais 2947${_}€.`,
);
check(
  "summerAnswer(0)",
  summerAnswer(pricing(0), 0),
  "Com o preço de sempre, fica tudo igual.",
);
const campaign = (discount: number) => ({
  guests: 49,
  extraStays: 10,
  avgStayValue: 293.76,
  extraRevenue: 10 * 293.76 * (1 - discount),
  discountCost: 10 * 293.76 * discount,
});
check(
  "winterDiscountAnswer(10%)",
  winterDiscountAnswer(campaign(0.1), 0.1),
  `Com 10% de desconto, cerca de 10 estadas: mais 2644${_}€.`,
);
check(
  "winterDiscountAnswer(0)",
  winterDiscountAnswer(campaign(0), 0),
  `Sem desconto, cerca de 10 estadas: mais 2938${_}€.`,
);
check(
  "winterRoomPrompt",
  winterRoomPrompt("Quarto Duplo Vista Mar 2"),
  "Alugar o Quarto Duplo Vista Mar 2 de novembro a fevereiro, a uma só pessoa",
);
check(
  "winterRoomAnswer, room 3 at 900 € (SPEC)",
  winterRoomAnswer({
    roomId: 3,
    months: 4,
    winterNights: 26,
    winterRevenue: 2730,
    displacedStays: 11,
    relocatableStays: 11,
    lostRevenue: 0,
    longStayRevenue: 3600,
    netGain: 3600,
  }),
  {
    gain: `Mais 3600${_}€ no inverno.`,
    stays:
      "As 11 estadas que este quarto teve no inverno cabem noutros quartos.",
  },
);
check(
  "winterRoomAnswer, room 7 at 900 € (SPEC)",
  winterRoomAnswer({
    roomId: 7,
    months: 4,
    winterNights: 43,
    winterRevenue: 4730,
    displacedStays: 13,
    relocatableStays: 8,
    lostRevenue: 2530,
    longStayRevenue: 3600,
    netGain: 1070,
  }),
  {
    gain: `Mais 1070${_}€ no inverno.`,
    stays: `Das 13 estadas que este quarto teve no inverno, 8 cabem noutros quartos; as outras valiam 2530${_}€.`,
  },
);
check(
  "together",
  view.together,
  `Verão e inverno juntos: o verão paga o desconto do inverno. Mais 5590${_}€ no ano.`,
);

console.log("\npainel: the year");
check(
  "months.levels",
  view.months.levels,
  "Mais procurados: julho e agosto. Menos procurados: de outubro a janeiro.",
);
check(
  "channelFlowSentence (SPEC transitions)",
  channelFlowSentence([
    { from: "Booking", to: "Booking", stays: 26 },
    { from: "Booking", to: "Airbnb", stays: 11 },
    { from: "Booking", to: "Direto", stays: 13 },
    { from: "Airbnb", to: "Booking", stays: 23 },
    { from: "Airbnb", to: "Airbnb", stays: 8 },
    { from: "Airbnb", to: "Direto", stays: 10 },
    { from: "Direto", to: "Booking", stays: 16 },
    { from: "Direto", to: "Airbnb", stays: 11 },
    { from: "Direto", to: "Direto", stays: 10 },
  ]),
  "27 das 37 estadas de quem reservou direto voltaram pelas plataformas.",
);

console.log("\npainel: the market");
const market = marketComparison(byMonth, MARKET_BY_MONTH);
const at = (period: string) => {
  const found = market.months.find((m) => m.period === period);
  if (!found) throw new Error(period);
  return found;
};
check(
  "marketIntro",
  marketIntro(MARKET_SEGMENT),
  "O preço médio por noite da sua casa, ao lado da média de todo o alojamento turístico em Portugal, hotéis incluídos, segundo o INE.",
);
check(
  "MARKET_NOTE",
  MARKET_NOTE,
  "Os hotéis puxam a média para cima: serve de referência, não de alvo.",
);
check(
  "marketYear",
  marketYear(market),
  "Em 7 dos 12 meses, cobra menos do que o mercado.",
);
check(
  "marketGap, November",
  marketGap(at("2025-11")),
  `Está 6${_}€ acima do mercado.`,
);
check(
  "marketGap, August",
  marketGap(at("2026-08")),
  `Está 63${_}€ abaixo do mercado.`,
);
check(
  "marketGap, December (within 1 €)",
  marketGap(at("2025-12")),
  "Está ao nível do mercado.",
);
check(
  "marketMonthLabel, August",
  marketMonthLabel(at("2026-08")),
  `Agosto: a sua casa 100${_}€, o mercado 163${_}€.`,
);
check(
  "marketMonthLabel, October (2025 value)",
  marketMonthLabel(at("2026-10")),
  `Outubro: a sua casa 96${_}€, o mercado 123${_}€. O valor do mercado é de outubro de 2025.`,
);
check(
  "marketStandIn",
  marketStandIn(at("2026-10")),
  "Valor de outubro de 2025: o deste ano ainda não foi publicado.",
);
check("marketDifference, November", marketDifference(at("2025-11")), `+6${_}€`);
check("marketDifference, August", marketDifference(at("2026-08")), `−63${_}€`);
check("marketDifference, December", marketDifference(at("2025-12")), `0${_}€`);
check(
  "marketSentence",
  marketSentence(market),
  `Em agosto, o mercado cobrou em média 163${_}€ por noite; a casa, 100${_}€.`,
);

check(
  "marketSourceLine, November",
  marketSourceLine(MARKET_BY_MONTH[0]),
  `novembro de 2025: 97,8${_}€, publicado a 31 de dezembro de 2025`,
);
check(
  "marketSourceLine, October (stand-in)",
  marketSourceLine(MARKET_BY_MONTH[11]),
  `outubro de 2025 (em vez de outubro de 2026): 122,6${_}€, publicado a 28 de novembro de 2025`,
);

console.log("\npainel: gain");
check("gain", view.gain, {
  likely: `Mais cerca de 4350${_}€ por ano`,
  share: `É mais 3,2% do que os 133${_}985${_}€ que recebeu este ano.`,
  range: `Entre cerca de 2030${_}€ e 8650${_}€ a mais, conforme quantos hóspedes aceitarem.`,
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
