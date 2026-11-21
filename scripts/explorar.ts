// Data exploration: only what docs/SPEC.md does not already have.
// Run: npm run explorar
// Reads public/data/ and prints short tables. Numbers marked "SPEC" are taken
// from docs/SPEC.md section 4, not recomputed.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eur, int, pct } from "../lib/format";
import type { Booking, Room } from "../types";

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), "public", "data", file), "utf8"));
const rooms = load<Room[]>("quartos.json");
const bookings = load<Booking[]>("reservas.json");
const completed = bookings.filter((b) => b.status === "Concluída");

// ---------------------------------------------------------------- printing

function table(title: string, head: string[], rows: (string | number)[][]) {
  const cells = [head, ...rows.map((r) => r.map(String))];
  const widths = head.map((_, i) => Math.max(...cells.map((r) => r[i].length)));
  const line = (r: string[]) =>
    `  ${r.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join("  ")}`;
  console.log(`\n${title}`);
  console.log(line(head));
  console.log(`  ${widths.map((w) => "-".repeat(w)).join("  ")}`);
  for (const r of cells.slice(1)) console.log(line(r));
}

const pct1 = (share: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(share);

const dec = (value: number, digits = 2) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

function expect(label: string, actual: string, expected: string) {
  const ok = actual === expected;
  console.log(
    `  ${ok ? "✓" : "✗"} ${label}: ${actual}${ok ? "" : ` (expected ${expected})`}`,
  );
  if (!ok) mismatches.push(`${label}: ${actual}, expected ${expected}`);
}
const mismatches: string[] = [];

function countBy<T>(items: T[], key: (item: T) => string | number) {
  const out = new Map<string | number, number>();
  for (const item of items) out.set(key(item), (out.get(key(item)) ?? 0) + 1);
  return out;
}

// ---------------------------------------------------------------- dates

const DAY = 86_400_000;
const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const daysBetween = (from: string, to: string) => (utc(to) - utc(from)) / DAY;
const monthOf = (date: string) => Number(date.slice(5, 7));
const WINTER = new Set([11, 12, 1, 2]);
const WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];
const MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

// ---------------------------------------------------------------- 1. quality

console.log("1. Qualidade dos dados");

function profile(name: string, rows: Record<string, unknown>[]) {
  const columns = Object.keys(rows[0] ?? {});
  const sameKeys = rows.every((r) => Object.keys(r).join() === columns.join());
  const empty = (v: unknown) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "");
  const exact = rows.length - new Set(rows.map((r) => JSON.stringify(r))).size;
  const ids = rows.length - new Set(rows.map((r) => r.id)).size;
  table(
    `${name}: ${int(rows.length)} linhas × ${columns.length} colunas, mesmas chaves em todas: ${sameKeys ? "sim" : "não"}; duplicados exatos: ${exact}; ids repetidos: ${ids}`,
    ["coluna", "tipo", "vazios", "valores distintos"],
    columns.map((c) => [
      c,
      [...new Set(rows.map((r) => typeof r[c]))].join("/"),
      rows.filter((r) => empty(r[c])).length,
      new Set(rows.map((r) => r[c])).size,
    ]),
  );
  return {
    exact,
    ids,
    sameKeys,
    empties: columns.some((c) => rows.some((r) => empty(r[c]))),
  };
}
const qRooms = profile(
  "quartos",
  rooms as unknown as Record<string, unknown>[],
);
const qBookings = profile(
  "reservas",
  bookings as unknown as Record<string, unknown>[],
);

const checkIns = bookings.map((b) => b.check_in).sort();
const reference = completed
  .map((b) => b.check_out)
  .sort()
  .at(-1);
const checkOuts = bookings.map((b) => b.check_out).sort();
console.log(
  `\n  Datas: check_in de ${checkIns[0]} a ${checkIns.at(-1)}; check_out de ${checkOuts[0]} a ${checkOuts.at(-1)}; data de referência (último check_out concluído): ${reference}`,
);
const badDates = bookings.filter(
  (b) =>
    !/^\d{4}-\d{2}-\d{2}$/.test(b.check_in) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.check_out) ||
    Number.isNaN(utc(b.check_in)) ||
    Number.isNaN(utc(b.check_out)),
).length;

table(
  "Estados das reservas",
  ["estado", "reservas", "parte"],
  [...countBy(bookings, (b) => b.status)].map(([s, n]) => [
    s,
    n,
    pct(n / bookings.length),
  ]),
);

const nightsWrong = bookings.filter(
  (b) => daysBetween(b.check_in, b.check_out) !== b.nights,
).length;
const nonPositive = bookings.filter(
  (b) => b.nights <= 0 || b.total <= 0 || b.guests <= 0,
).length;
const roomIds = new Set(rooms.map((r) => r.id));
const orphanRooms = bookings.filter((b) => !roomIds.has(b.room_id)).length;
const roomById = new Map(rooms.map((r) => [r.id, r]));
const overCapacity = bookings.filter(
  (b) => b.guests > (roomById.get(b.room_id)?.capacity ?? 0),
).length;
const namesPerEmail = new Map<string, Set<string>>();
const emailsPerName = new Map<string, Set<string>>();
for (const b of bookings) {
  if (!namesPerEmail.has(b.guest_email))
    namesPerEmail.set(b.guest_email, new Set());
  namesPerEmail.get(b.guest_email)?.add(b.guest_name);
  if (!emailsPerName.has(b.guest_name))
    emailsPerName.set(b.guest_name, new Set());
  emailsPerName.get(b.guest_name)?.add(b.guest_email);
}
const emailsWithManyNames = [...namesPerEmail.values()].filter(
  (s) => s.size > 1,
).length;
const namesWithManyEmails = [...emailsPerName.values()].filter(
  (s) => s.size > 1,
).length;
const badEmails = bookings.filter(
  (b) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.guest_email),
).length;

table(
  "Regras",
  ["regra", "reservas que falham"],
  [
    ["datas em AAAA-MM-DD válidas", badDates],
    ["nights = check_out − check_in", nightsWrong],
    ["nights, guests e total acima de 0", nonPositive],
    ["room_id existe em quartos", orphanRooms],
    ["guests ≤ capacidade do quarto", overCapacity],
    ["email com formato válido", badEmails],
    ["um nome por email (emails com mais de um)", emailsWithManyNames],
  ],
);
console.log(
  `  ${int(namesPerEmail.size)} emails e ${int(emailsPerName.size)} nomes; ${namesWithManyEmails} nomes aparecem com mais de um email (pessoas diferentes com o mesmo nome).`,
);

const offList = bookings.filter(
  (b) =>
    b.total !==
    (roomById.get(b.room_id)?.price_per_night ?? Number.NaN) * b.nights,
).length;
const score = (ok: boolean) => (ok ? 5 : 3);
table(
  "Scorecard de qualidade (1 a 5)",
  ["dimensão", "nota", "evidência"],
  [
    [
      "Completude",
      score(!qRooms.empties && !qBookings.empties),
      "nenhum vazio nas duas folhas",
    ],
    [
      "Consistência",
      score(
        nightsWrong + nonPositive + badDates + badEmails + overCapacity === 0,
      ),
      "datas, noites, valores e capacidade batem",
    ],
    [
      "Unicidade",
      score(qRooms.exact + qBookings.exact + qRooms.ids + qBookings.ids === 0),
      "sem duplicados nem ids repetidos",
    ],
    [
      "Atualidade",
      4,
      `fotografia fixa de um ano; último check_out concluído ${reference}`,
    ],
    [
      "Exatidão",
      score(emailsWithManyNames === 0 && offList === 0),
      "um nome por email; preço igual ao do quarto (ponto 2)",
    ],
    [
      "Integridade",
      score(orphanRooms === 0),
      "todo o room_id existe em quartos",
    ],
  ],
);

// ---------------------------------------------------------------- 2. price

console.log("\n2. Preço");
const perNight = (b: Booking) => b.total / b.nights;
console.log(
  `  total = preço do quarto × noites: ${offList === 0 ? "sempre" : `falha em ${offList}`} (${int(bookings.length)} reservas, todos os estados)`,
);
const distinct = (key: (b: Booking) => string | number) =>
  rooms.map((r) => {
    const groups = new Map<string | number, Set<number>>();
    for (const b of bookings.filter((x) => x.room_id === r.id)) {
      const k = key(b);
      if (!groups.has(k)) groups.set(k, new Set());
      groups.get(k)?.add(perNight(b));
    }
    const prices = new Set([...groups.values()].flatMap((s) => [...s]));
    return prices.size;
  });
const byChannel = distinct((b) => b.channel);
const bySeason = distinct((b) => monthOf(b.check_in));
const byGuests = distinct((b) => b.guests);
table(
  "Preços por noite distintos em cada quarto",
  ["quarto", "preço", "por canal", "por mês de entrada", "por nº de hóspedes"],
  rooms.map((r, i) => [
    r.name,
    eur(r.price_per_night),
    byChannel[i],
    bySeason[i],
    byGuests[i],
  ]),
);
console.log(
  `  O preço ${[...byChannel, ...bySeason, ...byGuests].every((n) => n === 1) ? "não muda" : "muda"} com o canal, a época ou o número de hóspedes.`,
);

// ---------------------------------------------------------------- 3. distributions

console.log(
  `\n3. Distribuições das ${int(completed.length)} estadas concluídas`,
);
const share = (n: number) => pct(n / completed.length);
const sorted = <K>(m: Map<K, number>) =>
  [...m].sort((a, b) => (a[0] as number) - (b[0] as number));
table(
  "Noites por estada",
  ["noites", "estadas", "parte"],
  sorted(countBy(completed, (b) => b.nights)).map(([k, n]) => [k, n, share(n)]),
);
const meanNights =
  completed.reduce((s, b) => s + b.nights, 0) / completed.length;
console.log(`  média: ${dec(meanNights)} noites`);
table(
  "Hóspedes por estada",
  ["hóspedes", "estadas", "parte"],
  sorted(countBy(completed, (b) => b.guests)).map(([k, n]) => [k, n, share(n)]),
);
table(
  "Países (5 primeiros, país da reserva)",
  ["país", "estadas", "parte"],
  [...countBy(completed, (b) => b.country)]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, 5)
    .map(([k, n]) => [k, n, share(n)]),
);
const weekday = countBy(completed, (b) =>
  new Date(utc(b.check_in)).getUTCDay(),
);
table(
  "Dia da semana de entrada",
  ["dia", "estadas", "parte"],
  [1, 2, 3, 4, 5, 6, 0].map((d) => [
    WEEKDAYS[d],
    weekday.get(d) ?? 0,
    share(weekday.get(d) ?? 0),
  ]),
);
const months = countBy(completed, (b) => b.check_in.slice(0, 7));
table(
  "Mês de entrada",
  ["mês", "estadas", "parte"],
  [...months]
    .sort()
    .map(([k, n]) => [
      `${MONTHS[monthOf(`${k}-01`) - 1]} ${String(k).slice(0, 4)}`,
      n,
      share(n),
    ]),
);

// ---------------------------------------------------------------- guests

// Completed stays by guest (guest = email), as in SPEC section 1.
const stays = new Map<string, Booking[]>();
for (const b of completed) {
  if (!stays.has(b.guest_email)) stays.set(b.guest_email, []);
  stays.get(b.guest_email)?.push(b);
}
for (const list of stays.values())
  list.sort((a, b) => a.check_in.localeCompare(b.check_in) || a.id - b.id);
const returning = [...stays.values()].filter((s) => s.length >= 2);
const once = [...stays.values()].filter((s) => s.length === 1);
const sum = (list: Booking[]) => list.reduce((s, b) => s + b.total, 0);

console.log("\n4. Valor de quem volta");
const groups = [
  ["quem volta", returning],
  ["veio uma vez", once],
] as const;
const value = groups.map(([name, guests]) => {
  const all = guests.flat();
  return {
    name,
    guests: guests.length,
    stays: all.length,
    spent: sum(all),
    perStay: sum(all) / all.length,
    perGuest: sum(all) / guests.length,
  };
});
table(
  "Gasto das estadas concluídas (total inteiro de cada estada)",
  ["grupo", "hóspedes", "estadas", "gasto", "por estada", "por hóspede"],
  value.map((v) => [
    v.name,
    v.guests,
    v.stays,
    eur(v.spent),
    eur(v.perStay),
    eur(v.perGuest),
  ]),
);
const ratio = value[0].perGuest / value[1].perGuest;
console.log(`  quem volta vale ${dec(ratio, 2)} vezes mais por hóspede no ano`);
expect("por estada, quem volta", eur(value[0].perStay), eur(302));
expect("por estada, uma vez", eur(value[1].perStay), eur(307));
expect("rácio por hóspede", dec(ratio, 1), dec(2.2, 1));

console.log("\n5. Inverno (entrada de novembro a fevereiro)");
const winter = groups.map(([name, guests]) => {
  const all = guests.flat();
  const w = all.filter((b) => WINTER.has(monthOf(b.check_in))).length;
  return [name, all.length, w, pct(w / all.length)] as const;
});
table(
  "Estadas de inverno",
  ["grupo", "estadas", "de inverno", "parte"],
  winter.map((r) => [...r]),
);
expect("parte de inverno, quem volta", winter[0][3], "25%");
expect("parte de inverno, uma vez", winter[1][3], "32%");

console.log("\n6. Sensibilidade das comissões nos regressos pelas plataformas");
const returnStays = returning.flatMap((s) => s.slice(1));
const base = (channel: string) =>
  sum(returnStays.filter((b) => b.channel === channel));
const booking = base("Booking");
const airbnb = base("Airbnb");
console.log(
  `  base: Booking ${eur(booking)} e Airbnb ${eur(airbnb)} (SPEC §4: 20 580 € e 7685 €)`,
);
const scenarios = [
  ["mínimo", 0.15, 0.03],
  ["15% nas duas, como no SPEC", 0.15, 0.15],
  ["Booking 15%, Airbnb 15,5%", 0.15, 0.155],
  ["máximo", 0.18, 0.155],
] as const;
table(
  "Comissão paga num ano",
  ["cenário", "Booking", "Airbnb", "comissão"],
  scenarios.map(([name, b, a]) => [
    name,
    pct1(b),
    pct1(a),
    eur(booking * b + airbnb * a, 2),
  ]),
);
const min = booking * 0.15 + airbnb * 0.03;
const max = booking * 0.18 + airbnb * 0.155;
expect("mínimo, às centenas", eur(Math.round(min / 100) * 100), eur(3300));
expect("máximo, às centenas", eur(Math.round(max / 100) * 100), eur(4900));

console.log("\n7. Valor de um ponto de ocupação");
const adr = 133985 / 1344; // SPEC §4, whole period
const point = 0.01 * 2920 * adr;
console.log(
  `  1% de 2920 noites = ${dec(29.2, 1)} noites × ${eur(adr, 2)} (preço médio por noite, SPEC §4) = ${eur(point, 2)}`,
);
expect("às centenas", eur(Math.round(point / 100) * 100), eur(2900));

console.log("\n8. Partes que a análise usa (a partir dos números do SPEC §4)");
const YEAR_REVENUE = 133985;
table(
  "Partes",
  ["o quê", "conta", "resultado"],
  [
    [
      "noites por vender no ano",
      "(2920 − 1344) ÷ 2920",
      pct((2920 - 1344) / 2920),
    ],
    ["noites por vender no inverno", "600 ÷ 960", pct1(600 / 960)],
    ["regressos pelas plataformas", "95 ÷ 128", pct(95 / 128)],
    [
      "noites pelas plataformas",
      "(632 + 329) ÷ 1344",
      pct1((632 + 329) / 1344),
    ],
    [
      "receita por quarto disponível vs INE",
      "45,89 ÷ 72,4",
      pct(133985 / 2920 / 72.4),
    ],
    [
      "KPI prudente na receita do ano",
      "2034,10 ÷ 133 985",
      pct1(2034.1 / YEAR_REVENUE),
    ],
    [
      "KPI provável na receita do ano",
      "4350,85 ÷ 133 985",
      pct1(4350.85 / YEAR_REVENUE),
    ],
    [
      "KPI otimista na receita do ano",
      "8646,15 ÷ 133 985",
      pct1(8646.15 / YEAR_REVENUE),
    ],
  ],
);

console.log(
  mismatches.length
    ? `\n${mismatches.length} valores esperados não bateram.`
    : "\nTodos os valores esperados batem.",
);
