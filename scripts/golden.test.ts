// Golden tests: the expected values in docs/SPEC.md, each computed twice, independently.
// Run: npm run gabaritos
// If a check fails, fix the function, never the expected value. If you think a value is wrong, stop and tell the team.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { actionAlerts, alertFacts } from "../lib/alerts";
import { MARKET_BY_MONTH } from "../lib/benchmarks";
import {
  channelTransitions,
  contactFirst,
  guestProfiles,
  guestTotals,
  returningGuests,
  returnStays,
  winterReturners,
} from "../lib/guests";
import { gainScenarios } from "../lib/kpi";
import { marketComparison } from "../lib/market";
import {
  simulateDirectBookings,
  simulatePricing,
  simulateWinterCampaign,
  simulateWinterRoom,
} from "../lib/simulator";
import {
  cancellationRates,
  channelMix,
  channelNet,
  kpisByMonth,
  kpisByRoom,
  kpisForYear,
  occupancyByRoomMonth,
  orphanNights,
  priceThermometer,
  THERMOMETER,
} from "../lib/stats";
import type { Booking, Room } from "../types";

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), "public", "data", file), "utf8"));
const rooms = load<Room[]>("quartos.json");
const bookings = load<Booking[]>("reservas.json");

let passed = 0;
const failed: string[] = [];

function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed.push(name);
    const message =
      error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.log(`  ✗ ${name}\n    ${message}`);
  }
}

function eq(actual: unknown, expected: unknown, label: string) {
  assert.deepStrictEqual(
    actual,
    expected,
    `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

// Ratios are compared with the exact fraction, so rounding never decides a test.
function close(actual: number, expected: number, label: string) {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${label}: expected ${expected}, got ${actual}`,
  );
}

function count<T>(
  items: T[],
  key: (item: T) => string | number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

console.log("\nData");
check("8 rooms and 481 bookings", () => {
  eq(rooms.length, 8, "rooms");
  eq(bookings.length, 481, "bookings");
});

console.log("\nkpisForYear");
check("1,344 nights sold of 2,920, €133,985", () => {
  const k = kpisForYear(bookings, rooms);
  eq(k.period, "year", "period");
  eq(k.nightsSold, 1344, "nightsSold");
  eq(k.nightsAvailable, 2920, "nightsAvailable");
  eq(k.revenue, 133985, "revenue");
  close(k.occupancy, 1344 / 2920, "occupancy");
  close(k.adr, 133985 / 1344, "adr");
  close(k.revpar, 133985 / 2920, "revpar");
});

console.log("\nkpisByMonth");
const MONTHS: [string, number, number, number][] = [
  // period, nightsSold, nightsAvailable, revenue
  ["2025-11", 92, 240, 9550],
  ["2025-12", 97, 248, 9595],
  ["2026-01", 79, 248, 7715],
  ["2026-02", 92, 224, 9180],
  ["2026-03", 108, 248, 10615],
  ["2026-04", 119, 240, 12390],
  ["2026-05", 123, 248, 12105],
  ["2026-06", 122, 240, 12400],
  ["2026-07", 139, 248, 13475],
  ["2026-08", 160, 248, 15990],
  ["2026-09", 115, 240, 11555],
  ["2026-10", 98, 248, 9415],
];
check("12 months, oldest first", () => {
  eq(
    kpisByMonth(bookings, rooms).map((m) => m.period),
    MONTHS.map(([period]) => period),
    "periods",
  );
});
for (const [period, nights, available, revenue] of MONTHS) {
  check(`${period}: ${nights} nights, €${revenue}`, () => {
    const m = kpisByMonth(bookings, rooms).find((x) => x.period === period);
    assert.ok(m, `no row for ${period}`);
    eq(m.nightsSold, nights, "nightsSold");
    eq(m.nightsAvailable, available, "nightsAvailable");
    eq(m.revenue, revenue, "revenue");
    close(m.occupancy, nights / available, "occupancy");
    close(m.adr, revenue / nights, "adr");
    close(m.revpar, revenue / available, "revpar");
  });
}

console.log("\nkpisByRoom");
const ROOMS: [number, number, number][] = [
  // roomId, nightsSold, revenue
  [1, 146, 20440],
  [2, 191, 20055],
  [3, 156, 16380],
  [4, 188, 15980],
  [5, 166, 13280],
  [6, 173, 20760],
  [7, 153, 16830],
  [8, 171, 10260],
];
for (const [roomId, nights, revenue] of ROOMS) {
  check(`room ${roomId}: ${nights} nights, €${revenue}`, () => {
    const r = kpisByRoom(bookings, rooms).find((x) => x.roomId === roomId);
    assert.ok(r, `no row for room ${roomId}`);
    eq(r.nightsSold, nights, "nightsSold");
    eq(r.nightsAvailable, 365, "nightsAvailable");
    eq(r.revenue, revenue, "revenue");
    close(r.occupancy, nights / 365, "occupancy");
  });
}

console.log("\nchannelMix");
const CHANNELS: [string, number, number, number][] = [
  // channel, bookings (all statuses), nightsSold, revenue
  ["Booking", 220, 632, 62595],
  ["Direto", 127, 383, 37605],
  ["Airbnb", 134, 329, 33785],
];
for (const [channel, count_, nights, revenue] of CHANNELS) {
  check(`${channel}: ${count_} bookings, ${nights} nights, €${revenue}`, () => {
    const c = channelMix(bookings).find((x) => x.channel === channel);
    assert.ok(c, `no row for ${channel}`);
    eq(c.bookings, count_, "bookings");
    eq(c.nightsSold, nights, "nightsSold");
    eq(c.revenue, revenue, "revenue");
    close(c.bookingsShare, count_ / 481, "bookingsShare");
    close(c.nightsShare, nights / 1344, "nightsShare");
    close(c.revenueShare, revenue / 133985, "revenueShare");
  });
}

console.log("\ncancellationRates");
const BY_CHANNEL: [string, number, number][] = [
  ["Airbnb", 134, 11],
  ["Booking", 220, 17],
  ["Direto", 127, 9],
];
const BY_COUNTRY: [string, number, number][] = [
  ["Alemanha", 46, 6],
  ["Espanha", 81, 10],
  ["Brasil", 45, 5],
  ["França", 39, 4],
  ["Portugal", 166, 9],
  ["Países Baixos", 38, 2],
  ["Reino Unido", 66, 1],
];
for (const [by, rows] of [
  ["channel", BY_CHANNEL],
  ["country", BY_COUNTRY],
] as const) {
  check(`by ${by}`, () => {
    const result = cancellationRates(bookings, by);
    eq(result.length, rows.length, "rows");
    for (const [key, total, cancelled] of rows) {
      const row = result.find((x) => x.key === key);
      assert.ok(row, `no row for ${key}`);
      eq(row.bookings, total, `${key} bookings`);
      eq(row.cancelled, cancelled, `${key} cancelled`);
      close(row.rate, cancelled / total, `${key} rate`);
    }
  });
}

console.log("\nguestProfiles");
check("312 guests with a completed stay", () => {
  const profiles = guestProfiles(bookings);
  eq(profiles.length, 312, "guests");
  eq(
    count(profiles, (p) => p.stays),
    { 1: 210, 2: 81, 3: 17, 4: 3, 5: 1 },
    "guests by number of stays",
  );
});
check("RFM scores", () => {
  const profiles = guestProfiles(bookings);
  eq(
    count(profiles, (p) => p.r),
    { 1: 126, 2: 79, 3: 107 },
    "r",
  );
  eq(
    count(profiles, (p) => p.f),
    { 1: 210, 2: 81, 3: 21 },
    "f",
  );
  eq(
    count(profiles, (p) => p.m),
    { 1: 121, 2: 113, 3: 78 },
    "m",
  );
});
check("one guest in detail: helena.costa@correio.example", () => {
  const p = guestProfiles(bookings).find(
    (x) => x.email === "helena.costa@correio.example",
  );
  assert.ok(p, "guest not found");
  eq(p.stays, 4, "stays");
  eq(p.spent, 1810, "spent");
  eq(p.lastChannel, "Airbnb", "lastChannel");
  eq(p.recencyDays, 40, "recencyDays");
  eq([p.r, p.f, p.m], [3, 3, 3], "r, f, m");
});

console.log("\nreturningGuests and returnStays");
check("102 returning guests, 56 never booked direct", () => {
  const returning = returningGuests(guestProfiles(bookings));
  eq(returning.length, 102, "returning guests");
  eq(returning.filter((p) => !p.everDirect).length, 56, "never booked direct");
});
check("128 return stays, €38,115", () => {
  const stays = returnStays(bookings);
  eq(stays.length, 128, "return stays");
  eq(
    stays.reduce((s, b) => s + b.total, 0),
    38115,
    "revenue",
  );
  eq(
    count(stays, (b) => b.channel),
    { Booking: 65, Airbnb: 30, Direto: 33 },
    "by channel",
  );
});

console.log("\ncontactFirst");
check("80 guests, highest spend first", () => {
  const list = contactFirst(guestProfiles(bookings));
  eq(list.length, 80, "guests");
  eq(
    list.slice(0, 3).map((p) => [p.email, p.stays, p.spent, p.lastChannel]),
    [
      ["helena.costa@correio.example", 4, 1810, "Airbnb"],
      ["filipa.teixeira@correio.example", 3, 1565, "Booking"],
      ["sofia.teixeira@correio.example", 2, 1435, "Airbnb"],
    ],
    "first three",
  );
});

console.log("\nsimulateDirectBookings");
const SCENARIOS: [number, number, number, number, number][] = [
  // commissionRate, conversionRate, directDiscount, yearlyGain, commissionToday
  [0.15, 0.5, 0.05, 1413.25, 4239.75],
  [0.1, 1, 0, 2826.5, 2826.5],
  [0.2, 1, 0, 5653, 5653],
  [0.15, 0.3, 0.15, 0, 4239.75],
];
for (const [
  commissionRate,
  conversionRate,
  directDiscount,
  gain,
  today,
] of SCENARIOS) {
  check(
    `commission ${commissionRate}, conversion ${conversionRate}, discount ${directDiscount} → €${gain}`,
    () => {
      const r = simulateDirectBookings(bookings, {
        commissionRate,
        conversionRate,
        directDiscount,
      });
      eq(r.baseStays, 95, "baseStays");
      eq(r.baseRevenue, 28265, "baseRevenue");
      assert.ok(
        Math.abs(r.yearlyGain - gain) < 0.005,
        `yearlyGain: expected ${gain}, got ${r.yearlyGain}`,
      );
      assert.ok(
        Math.abs(r.commissionToday - today) < 0.005,
        `commissionToday: expected ${today}, got ${r.commissionToday}`,
      );
      eq(r.breakEvenDiscount, commissionRate, "breakEvenDiscount");
    },
  );
}

console.log("\nsimulateWinterRoom");
check("room 3 at €900 a month: every stay fits elsewhere", () => {
  eq(
    simulateWinterRoom(bookings, rooms, { roomId: 3, monthlyRate: 900 }),
    {
      roomId: 3,
      months: 4,
      winterNights: 26,
      winterRevenue: 2730,
      displacedStays: 11,
      relocatableStays: 11,
      lostRevenue: 0,
      longStayRevenue: 3600,
      netGain: 3600,
    },
    "result",
  );
});
check("room 7 at €900 a month: 5 stays fit nowhere else", () => {
  eq(
    simulateWinterRoom(bookings, rooms, { roomId: 7, monthlyRate: 900 }),
    {
      roomId: 7,
      months: 4,
      winterNights: 43,
      winterRevenue: 4730,
      displacedStays: 13,
      relocatableStays: 8,
      lostRevenue: 2530,
      longStayRevenue: 3600,
      netGain: 1070,
    },
    "result",
  );
});

console.log("\nchannelNet");
const NET: [string, number, number, number][] = [
  // channel, nightsSold, revenue, commission with Booking 15%, Airbnb 15.5%, Direto 0
  ["Booking", 632, 62595, 9389.25],
  ["Airbnb", 329, 33785, 5236.675],
  ["Direto", 383, 37605, 0],
];
for (const [channel, nights, revenue, commission] of NET) {
  check(`${channel}: €${revenue} minus €${commission} commission`, () => {
    const c = channelNet(bookings, {
      Booking: 0.15,
      Airbnb: 0.155,
      Direto: 0,
    }).find((x) => x.channel === channel);
    assert.ok(c, `no row for ${channel}`);
    eq(c.nightsSold, nights, "nightsSold");
    eq(c.revenue, revenue, "revenue");
    close(c.commission, commission, "commission");
    close(c.netRevenue, revenue - commission, "netRevenue");
    close(c.netAdr, (revenue - commission) / nights, "netAdr");
  });
}

console.log("\noccupancyByRoomMonth");
check("96 cells that add up to 1,344 nights", () => {
  const cells = occupancyByRoomMonth(bookings, rooms);
  eq(cells.length, 96, "cells");
  eq(
    cells.reduce((s, c) => s + c.nightsSold, 0),
    1344,
    "nights",
  );
});
check("the two sea-view doubles in winter", () => {
  const cells = occupancyByRoomMonth(bookings, rooms);
  const winter = (roomId: number) =>
    ["2025-11", "2025-12", "2026-01", "2026-02"].map(
      (m) =>
        cells.find((c) => c.roomId === roomId && c.month === m)?.nightsSold,
    );
  eq(winter(2), [14, 17, 16, 12], "room 2");
  eq(winter(3), [2, 8, 9, 7], "room 3");
});
check("busiest cell: room 5 in August 2026, 26 of 31 nights", () => {
  const c = occupancyByRoomMonth(bookings, rooms).find(
    (x) => x.roomId === 5 && x.month === "2026-08",
  );
  assert.ok(c, "no cell for room 5 in 2026-08");
  eq(c.nightsSold, 26, "nightsSold");
  eq(c.nightsAvailable, 31, "nightsAvailable");
  close(c.occupancy, 26 / 31, "occupancy");
});

console.log("\nchannelTransitions");
check("first-stay channel to return-stay channel", () => {
  const t = channelTransitions(bookings);
  const get = (from: string, to: string) =>
    t.find((x) => x.from === from && x.to === to)?.stays ?? 0;
  eq(
    [
      get("Booking", "Booking"),
      get("Booking", "Airbnb"),
      get("Booking", "Direto"),
    ],
    [26, 11, 13],
    "from Booking",
  );
  eq(
    [
      get("Airbnb", "Booking"),
      get("Airbnb", "Airbnb"),
      get("Airbnb", "Direto"),
    ],
    [23, 8, 10],
    "from Airbnb",
  );
  eq(
    [
      get("Direto", "Booking"),
      get("Direto", "Airbnb"),
      get("Direto", "Direto"),
    ],
    [16, 11, 10],
    "from Direto",
  );
  eq(
    t.reduce((s, x) => s + x.stays, 0),
    128,
    "return stays",
  );
});

console.log("\norphanNights");
check("87 single empty nights between two stays in the same room", () => {
  const o = orphanNights(bookings, rooms);
  eq(o.length, 87, "orphan nights");
  eq(
    count(o, (x) => x.roomId),
    { 1: 13, 2: 11, 3: 11, 4: 13, 5: 12, 6: 5, 7: 11, 8: 11 },
    "by room",
  );
});

console.log("\nwinterReturners");
check(
  "49 returning guests with at least one night from November to February",
  () => {
    eq(winterReturners(bookings).length, 49, "guests");
  },
);

console.log("\nsimulatePricing");
check("+10% in July and August", () => {
  const r = simulatePricing(bookings, {
    priceChange: 0.1,
    months: ["2026-07", "2026-08"],
  });
  eq(r.nightsSold, 299, "nightsSold");
  eq(r.baseRevenue, 29465, "baseRevenue");
  close(r.newRevenue, 29465 * 1.1, "newRevenue");
  close(r.nightsForSameRevenue, 299 / 1.1, "nightsForSameRevenue");
});
check("-10% from November to February", () => {
  const r = simulatePricing(bookings, {
    priceChange: -0.1,
    months: ["2025-11", "2025-12", "2026-01", "2026-02"],
  });
  eq(r.nightsSold, 360, "nightsSold");
  eq(r.baseRevenue, 36040, "baseRevenue");
  close(r.newRevenue, 36040 * 0.9, "newRevenue");
  close(r.nightsForSameRevenue, 360 / 0.9, "nightsForSameRevenue");
});

// Version 2

console.log("\nguestTotals");
check("312 guests, 440 stays, €134,065; 102 of them come back", () => {
  eq(
    guestTotals(bookings),
    {
      guests: 312,
      stays: 440,
      spent: 134065,
      returningGuests: 102,
      returningStays: 230,
      returningSpent: 69535,
    },
    "totals",
  );
});

console.log("\npriceThermometer");
check("hot in July and August, cold from October to January", () => {
  eq(THERMOMETER, { hot: 0.55, cold: 0.4 }, "THERMOMETER");
  const byMonth = MONTHS.map(
    ([period, nightsSold, nightsAvailable, revenue]) => ({
      period,
      nightsSold,
      nightsAvailable,
      revenue,
      occupancy: nightsSold / nightsAvailable,
      adr: revenue / nightsSold,
      revpar: revenue / nightsAvailable,
    }),
  );
  const t = priceThermometer(byMonth, { hot: 0.55, cold: 0.4 });
  eq(
    t.map((m) => `${m.period} ${m.level}`),
    [
      "2025-11 cold",
      "2025-12 cold",
      "2026-01 cold",
      "2026-02 normal",
      "2026-03 normal",
      "2026-04 normal",
      "2026-05 normal",
      "2026-06 normal",
      "2026-07 hot",
      "2026-08 hot",
      "2026-09 normal",
      "2026-10 cold",
    ],
    "levels",
  );
  const august = t.find((m) => m.period === "2026-08");
  assert.ok(august, "no row for 2026-08");
  close(august.occupancy, 160 / 248, "August occupancy");
  close(august.adr, 15990 / 160, "August adr");
});

console.log("\nsimulateWinterCampaign");
const CAMPAIGN: [number, number, number, number, number][] = [
  // returnRate, discount, extraStays, extraRevenue, discountCost
  [0.2, 0.1, 10, 2643.84, 293.76],
  [0.1, 0, 5, 1468.8, 0],
  [0.3, 0.05, 15, 4186.08, 220.32],
];
for (const [returnRate, discount, stays, revenue, cost] of CAMPAIGN) {
  check(
    `${Math.round(returnRate * 100)}% of the 49 come back with ${Math.round(discount * 100)}% off`,
    () => {
      const r = simulateWinterCampaign(bookings, { returnRate, discount });
      eq(r.guests, 49, "guests");
      eq(r.extraStays, stays, "extraStays");
      close(r.avgStayValue, 36720 / 125, "avgStayValue");
      close(r.extraRevenue, revenue, "extraRevenue");
      close(r.discountCost, cost, "discountCost");
    },
  );
}

console.log("\nalertFacts");
check("the numbers behind the four alerts", () => {
  const f = alertFacts(bookings, rooms);
  eq(
    [
      f.winterEmptyNights,
      f.winterReturners,
      f.platformReturnStays,
      f.orphanNights,
      f.summerOrphanNights,
    ],
    [600, 49, 95, 87, 46],
    "counts",
  );
  close(f.commissionToday, 28265 * 0.15, "commissionToday");
  close(f.julyOccupancy, 139 / 248, "julyOccupancy");
  close(f.augustOccupancy, 160 / 248, "augustOccupancy");
  close(f.summerGain, 29465 * 0.1, "summerGain");
});

console.log("\nactionAlerts");
const FACTS = {
  winterEmptyNights: 600,
  winterReturners: 49,
  platformReturnStays: 95,
  commissionToday: 4239.75,
  julyOccupancy: 139 / 248,
  augustOccupancy: 160 / 248,
  summerGain: 2946.5,
  orphanNights: 87,
  summerOrphanNights: 46,
};
const ORDER: [number, string][] = [
  [11, "winter now, commission always, summer prepare, orphans later"],
  [4, "summer prepare, commission always, orphans prepare, winter later"],
  [8, "summer now, orphans now, commission always, winter prepare"],
  [10, "winter prepare, commission always, orphans later, summer later"],
];
for (const [month, order] of ORDER) {
  check(`month ${month}: ${order}`, () => {
    eq(
      actionAlerts(FACTS, month)
        .map((a) => `${a.id} ${a.when}`)
        .join(", "),
      order,
      "order",
    );
  });
}
check("an alert whose number is 0 is left out", () => {
  eq(
    actionAlerts({ ...FACTS, orphanNights: 0 }, 11).map((a) => a.id),
    ["winter", "commission", "summer"],
    "ids",
  );
});

// Version 3

console.log("\ngainScenarios");
const GAINS: [string, number, number, number][] = [
  // id, directGain, winterGain, total
  ["cautious", 565.3, 1468.8, 2034.1],
  ["likely", 1413.25, 2937.6, 4350.85],
  ["optimistic", 4239.75, 4406.4, 8646.15],
];
for (const [index, [id, direct, winter, sum]] of GAINS.entries()) {
  check(`${id}: about €${Math.round(sum)} a year`, () => {
    const g = gainScenarios(bookings)[index];
    assert.ok(g, `no row ${index + 1}`);
    eq(g.id, id, "id");
    close(g.directGain, direct, "directGain");
    close(g.winterGain, winter, "winterGain");
    close(g.total, sum, "total");
  });
}

// Version 4

console.log("\nmarketComparison");
// House adr (revenue ÷ nights, SPEC "By month") minus the market's adr
// (SPEC "Market by month"), € per night.
const MARKET: [string, number][] = [
  ["2025-11", 9550 / 92 - 97.8],
  ["2025-12", 9595 / 97 - 99.7],
  ["2026-01", 7715 / 79 - 92.1],
  ["2026-02", 9180 / 92 - 89.6],
  ["2026-03", 10615 / 108 - 98.6],
  ["2026-04", 12390 / 119 - 118.0],
  ["2026-05", 12105 / 123 - 130.9],
  ["2026-06", 12400 / 122 - 140.8],
  ["2026-07", 13475 / 139 - 154.9],
  ["2026-08", 15990 / 160 - 163.2],
  ["2026-09", 11555 / 115 - 147.3],
  ["2026-10", 9415 / 98 - 122.6],
];
const market = () =>
  marketComparison(kpisByMonth(bookings, rooms), MARKET_BY_MONTH);
check("12 months: the house's price minus the market's", () => {
  const c = market();
  eq(c.months.length, 12, "months");
  for (const [index, [period, difference]] of MARKET.entries()) {
    eq(c.months[index].period, period, "period");
    close(c.months[index].difference, difference, period);
  }
});
check("7 months below, 3 above, 2 within 1 €; widest in August", () => {
  const c = market();
  eq(c.below, 7, "below");
  eq(c.above, 3, "above");
  eq(c.level, 2, "level");
  eq(c.widest.period, "2026-08", "widest");
  eq(
    c.months.filter((m) => m.substitute).map((m) => m.period),
    ["2026-10"],
    "stand-in months",
  );
});

const total = passed + failed.length;
console.log(`\n${passed} of ${total} checks pass.`);
if (failed.length > 0) {
  console.log("Fix the function, never the expected value.");
  process.exit(1);
}
