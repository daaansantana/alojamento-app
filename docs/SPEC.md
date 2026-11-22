# SPEC: data rules, function contract and expected values

This is the contract between the data functions in `lib/` and the interface. Every expected value was computed twice, independently: once in Python from `alojamento.xlsx`, once in TypeScript from the JSON files. `npm run gabaritos` runs `scripts/golden.test.ts`, which checks them all.

Version 2 adds the guest totals, the price thermometer, the winter campaign and the action alerts (sections 2, 3, 4 and 6). Their expected values were also computed twice, independently, in Python and in TypeScript.

Version 3 adds the yearly gain scenarios, the KPI, and the page view, every text of the single page (sections 2, 3, 4 and 6). The gain scenarios only combine two simulators; their expected values were computed in Python from `public/data/`. The page view only writes text from the other results; its expected texts are in section 4.

If a check fails, fix the function, never the expected value. If you believe an expected value is wrong, stop and tell the team before changing anything.

## 1. Data rules

- **Statuses** (exact strings): `"Concluída"` = completed stay, `"Cancelada"` = cancelled, `"Confirmada"` = booked, not yet happened.
- **Channels** (exact strings): `"Booking"`, `"Airbnb"`, `"Direto"`. Platforms = Booking and Airbnb.
- **Period:** 2025-11-01 to 2026-10-31. 365 days × 8 rooms = 2,920 room-nights available.
- **Reference date:** the latest check-out of a completed stay, **2026-11-02**. Compute it from the data; never use today's date.
- **Completed stays only** for nights, revenue, occupancy and everything about guests. Cancelled bookings only count in cancellation rates and in the bookings column of `channelMix`. The 4 `"Confirmada"` bookings (ids 478 to 481, check-ins 29 to 31 Oct 2026) are not revenue.
- **A night belongs to its own date.** A stay's nights run from `check_in` to the day before `check_out`. A stay from 30 Jan to 2 Feb puts 2 nights in January and 1 in February.
- **Nights after 31 Oct 2026 are outside the period.** Booking 477 (Quarto Twin, 28 Oct to 2 Nov) has 1 night outside. That is why the period has 1,344 nights and €133,985, while the completed bookings add up to 1,345 nights and €134,065.
- **Revenue per night** = `total ÷ nights`. It equals the room's `price_per_night` on every row.
- **`total` is the list price before any commission.** It is the same on every channel. Commissions come from the public rates in `lib/benchmarks.ts` (section 3).
- **Join bookings to rooms with a `Map` by id**, built once, as the brief shows.
- **A guest is a `guest_email`.** Each email has exactly one name.
- **Country belongs to the booking, not to the guest.** 82 of the 102 returning guests appear with more than one country. Use country for booking-level views (cancellations), never to describe a guest.
- **A guest's stays are ordered by `check_in`, then `id`.** One guest (teresa.martins@correio.example) has two overlapping stays (ids 123 and 127); the second still counts as a return stay.
- **Dates:** parse `"2025-11-01"` as UTC (`Date.parse("2025-11-01T00:00:00Z")` or `Date.UTC`) and read them with `getUTC…` methods. Local time can shift a night into the wrong day or month. Keep this in `lib/dates.ts`.
- **Numbers:** rates are 0 to 1, money is in euros, and functions return them unrounded. Round only when displaying (`Intl.NumberFormat("pt-PT")`). The rounded values below are for reading; the tests compare exact fractions.

## 2. Output types

Add these to `types/index.ts`, next to `Room` and `Booking`.

```ts
export interface PeriodKpi {
  period: string; // "2025-11" for a month, "year" for the whole period
  nightsSold: number;
  nightsAvailable: number;
  occupancy: number; // nightsSold ÷ nightsAvailable
  revenue: number;
  adr: number; // revenue ÷ nightsSold
  revpar: number; // revenue ÷ nightsAvailable
}

export interface RoomKpi {
  roomId: number;
  name: string;
  nightsSold: number;
  nightsAvailable: number; // 365
  occupancy: number;
  revenue: number;
}

export interface ChannelMix {
  channel: string;
  bookings: number; // all statuses
  bookingsShare: number;
  nightsSold: number; // completed stays, nights inside the period
  nightsShare: number;
  revenue: number; // completed stays, nights inside the period
  revenueShare: number;
}

export interface CancellationRate {
  key: string; // a channel or a country
  bookings: number; // all statuses
  cancelled: number;
  rate: number;
}

export interface GuestProfile {
  email: string;
  name: string;
  stays: number; // completed stays
  spent: number; // sum of total, completed stays
  firstCheckIn: string;
  lastCheckOut: string;
  recencyDays: number; // reference date − lastCheckOut, in days
  firstChannel: string;
  lastChannel: string;
  everDirect: boolean;
  r: 1 | 2 | 3;
  f: 1 | 2 | 3;
  m: 1 | 2 | 3;
}

export interface DirectBookingScenario {
  commissionRate: number; // what the platforms charge
  conversionRate: number; // share of platform return stays that move to direct
  directDiscount: number; // discount offered on the direct channel
}

export interface DirectBookingResult {
  baseStays: number; // return stays booked through a platform
  baseRevenue: number;
  commissionToday: number; // baseRevenue × commissionRate
  yearlyGain: number; // baseRevenue × conversionRate × (commissionRate − directDiscount)
  breakEvenDiscount: number; // = commissionRate
}

export interface WinterRoomScenario {
  roomId: number;
  monthlyRate: number; // euros per month for one long stay, November to February
}

export interface WinterRoomResult {
  roomId: number;
  months: number; // always 4
  winterNights: number; // nights the room sold between 2025-11-01 and 2026-02-28
  winterRevenue: number;
  displacedStays: number; // completed stays in the room with at least one night in that window
  relocatableStays: number;
  lostRevenue: number; // total of the displaced stays that fit nowhere else
  longStayRevenue: number; // monthlyRate × months
  netGain: number; // longStayRevenue − lostRevenue
}

export type CommissionRates = Record<string, number>; // channel → rate, e.g. { Booking: 0.15, Airbnb: 0.155, Direto: 0 }

export interface ChannelNet {
  channel: string;
  nightsSold: number; // completed stays, nights inside the period
  revenue: number;
  commissionRate: number;
  commission: number;
  netRevenue: number;
  netAdr: number; // netRevenue ÷ nightsSold
}

export interface RoomMonthOccupancy {
  roomId: number;
  month: string; // "2025-11"
  nightsSold: number;
  nightsAvailable: number; // days in that month
  occupancy: number;
}

export interface ChannelTransition {
  from: string; // channel of the guest's first completed stay
  to: string; // channel of a later completed stay
  stays: number;
}

export interface OrphanNight {
  roomId: number;
  date: string; // the empty night, "YYYY-MM-DD"
}

export interface PricingScenario {
  priceChange: number; // 0.1 = +10%, -0.1 = -10%
  months: string[]; // "YYYY-MM" keys inside the period
}

export interface PricingResult {
  nightsSold: number;
  baseRevenue: number;
  newRevenue: number; // baseRevenue × (1 + priceChange), if the same nights sell
  nightsForSameRevenue: number; // nightsSold ÷ (1 + priceChange)
}

// Version 2

export interface GuestTotals {
  guests: number; // guests with at least one completed stay
  stays: number; // completed stays
  spent: number; // sum of the whole `total` of those stays, as in guestProfiles
  returningGuests: number; // guests with 2 or more completed stays
  returningStays: number;
  returningSpent: number;
}

export type MonthLevel = "hot" | "normal" | "cold";

export interface ThermometerThresholds {
  hot: number; // occupancy at or above this is hot
  cold: number; // occupancy at or below this is cold
}

export interface MonthTemperature {
  period: string; // "2025-11"
  occupancy: number;
  adr: number;
  level: MonthLevel;
}

export interface WinterCampaignScenario {
  returnRate: number; // share of the winter returners who come back once, 0 to 1
  discount: number; // campaign discount, 0 to 1
}

export interface WinterCampaignResult {
  guests: number; // winterReturners(bookings).length
  extraStays: number; // Math.round(guests × returnRate): whole stays
  avgStayValue: number; // mean `total` of the completed stays that check in from 2025-11-01 to 2026-02-28
  extraRevenue: number; // extraStays × avgStayValue × (1 − discount)
  discountCost: number; // extraStays × avgStayValue × discount
}

export interface AlertFacts {
  winterEmptyNights: number; // room-nights not sold from 2025-11-01 to 2026-02-28
  winterReturners: number; // winterReturners(bookings).length
  platformReturnStays: number; // return stays through Booking or Airbnb
  commissionToday: number; // sum of the `total` of those stays × BOOKING_COMMISSION
  julyOccupancy: number; // occupancy of 2026-07 in kpisByMonth
  augustOccupancy: number; // occupancy of 2026-08 in kpisByMonth
  summerGain: number; // simulatePricing with { priceChange: 0.1, months: ["2026-07", "2026-08"] }: newRevenue − baseRevenue
  orphanNights: number; // orphanNights(bookings, rooms).length
  summerOrphanNights: number; // the orphan nights from June to September
}

export type AlertId = "winter" | "commission" | "summer" | "orphans";
export type AlertWhen = "now" | "prepare" | "always" | "later";

export interface Alert {
  id: AlertId;
  when: AlertWhen;
}

// Version 3

export type GainScenarioId = "cautious" | "likely" | "optimistic";

export interface GainScenario {
  id: GainScenarioId;
  conversionRate: number; // share of platform return stays that move to direct
  directDiscount: number; // discount offered on the direct channel
  winterReturnRate: number; // share of the winter returners who come back once
  directGain: number; // simulateDirectBookings(…).yearlyGain
  winterGain: number; // simulateWinterCampaign(…, { discount: 0 }).extraRevenue
  total: number; // directGain + winterGain
}

export interface PainelInput {
  year: PeriodKpi;
  byMonth: PeriodKpi[];
  thermometer: MonthTemperature[];
  totals: GuestTotals;
  facts: AlertFacts;
  alerts: Alert[]; // already in the order for `month`
  month: number; // 1 to 12
  winterReturners: GuestProfile[];
  campaign: WinterCampaignResult; // with PAINEL_WINTER_CAMPAIGN
  direct: DirectBookingResult; // with PAINEL_DIRECT
  gains: GainScenario[]; // gainScenarios(bookings)
}

export interface PainelFigure {
  value: string; // "133 985 €"
  label: string; // "recebeu no ano"
}

export interface PainelAction {
  id: AlertId;
  when: string; // "Agora", "A preparar", "Sempre" or "Mais tarde"
  title: string;
  text: string;
  worth: string | null; // what it is worth, when there is a number for it
  cta: string;
  target: string; // "#contactos", "#simular" or "#detalhes"
}

export interface PainelContact {
  name: string;
  detail: string; // "4 estadas · 1810 € · última pelo Airbnb"
  mailto: string;
}

export interface PainelMonth {
  period: string; // "2026-08"
  label: string; // "ago"
  percent: string; // "65%"
  level: string; // "mais procurado", "normal" or "menos procurado"
}

export interface PainelView {
  month: number;
  monthName: string; // "novembro"
  period: string;
  summary: { sentence: string; figures: PainelFigure[] };
  actions: PainelAction[];
  contacts: {
    first: PainelContact[]; // the first 3 winterReturners
    all: PainelContact[]; // every winterReturner, same order
    total: number;
  };
  gain: { likely: string; range: string; assumption: string };
  months: { bars: PainelMonth[]; best: string; price: string };
}
```

## 3. Functions

| File | Function | Returns |
| --- | --- | --- |
| `lib/stats.ts` | `kpisForYear(bookings, rooms)` | `PeriodKpi` with `period: "year"` |
| `lib/stats.ts` | `kpisByMonth(bookings, rooms)` | `PeriodKpi[]`, 12 rows, oldest first |
| `lib/stats.ts` | `kpisByRoom(bookings, rooms)` | `RoomKpi[]`, 8 rows |
| `lib/stats.ts` | `channelMix(bookings)` | `ChannelMix[]`, 3 rows, highest revenue first |
| `lib/stats.ts` | `cancellationRates(bookings, by)` | `CancellationRate[]`, `by` = `"channel"` or `"country"`, highest rate first |
| `lib/guests.ts` | `guestProfiles(bookings)` | `GuestProfile[]`, every guest with at least one completed stay |
| `lib/guests.ts` | `returningGuests(profiles)` | the profiles with 2 or more stays |
| `lib/guests.ts` | `contactFirst(profiles)` | returning guests whose `lastChannel` is a platform, sorted by `spent` (high first), then `stays` (high first), `recencyDays` (low first), `email` |
| `lib/guests.ts` | `returnStays(bookings)` | `Booking[]`: every completed stay after each guest's first |
| `lib/simulator.ts` | `simulateDirectBookings(bookings, scenario)` | `DirectBookingResult` |
| `lib/simulator.ts` | `simulateWinterRoom(bookings, rooms, scenario)` | `WinterRoomResult` (optional screen) |
| `lib/stats.ts` | `channelNet(bookings, rates)` | `ChannelNet[]`, 3 rows, highest net revenue first |
| `lib/stats.ts` | `occupancyByRoomMonth(bookings, rooms)` | `RoomMonthOccupancy[]`, 96 rows, by room then month |
| `lib/stats.ts` | `orphanNights(bookings, rooms)` | `OrphanNight[]`: empty nights inside the period with the same room occupied the night before and the night after, by room then date |
| `lib/guests.ts` | `channelTransitions(bookings)` | `ChannelTransition[]`: for each return stay, the channel of the guest's first stay and of that stay |
| `lib/guests.ts` | `winterReturners(bookings)` | returning guests with at least one night between 2025-11-01 and 2026-02-28, sorted like `contactFirst` |
| `lib/simulator.ts` | `simulatePricing(bookings, scenario)` | `PricingResult` |
| `lib/guests.ts` | `guestTotals(bookings)` | `GuestTotals` |
| `lib/stats.ts` | `priceThermometer(byMonth, thresholds)` | `MonthTemperature[]`, one per row of `byMonth`, same order: `"hot"` when occupancy ≥ `thresholds.hot`, `"cold"` when occupancy ≤ `thresholds.cold`, else `"normal"` |
| `lib/simulator.ts` | `simulateWinterCampaign(bookings, scenario)` | `WinterCampaignResult` |
| `lib/alerts.ts` | `alertFacts(bookings, rooms)` | `AlertFacts` |
| `lib/alerts.ts` | `actionAlerts(facts, month)` | `Alert[]` in the order for `month` (1 to 12); an alert whose number is 0 is left out |
| `lib/kpi.ts` | `gainScenarios(bookings)` | `GainScenario[]`, 3 rows: cautious, likely, optimistic (version 3) |
| `lib/painel.ts` | `buildPainel(input)` | `PainelView`: every text of the single page (version 3) |
| `lib/format.ts` | `eur`, `int`, `pct`, `monthName`, `monthShort`, `about` | display text in pt-PT (version 3) |
| `lib/email.ts` | `invitationMailto(guest, kind)` | a `mailto:` link with the subject and body filled in, `kind` = `"winter"` or `"direct"` (version 3) |

`lib/dates.ts` keeps the date helpers. No function in `lib/` fetches data or reads the store.

`lib/benchmarks.ts` keeps the market constants, each with its source in a comment:

| Constant | Value | Source |
| --- | --- | --- |
| `BOOKING_COMMISSION` | typical 0.15; range 0.10 to 0.25; +0.03 with Preferred Partner | Hostfully, "Booking.com host fees", 4 Nov 2026 |
| `AIRBNB_HOST_FEE` | 0.155 host-only fee; about 0.03 with the split fee | Airbnb, "Simplifying Airbnb service fees" |
| `HOTREC_SMALL_HOTEL_OTA_SHARE` | 0.321 (direct 0.595), hotels with fewer than 20 rooms, 2023 data | HOTREC European Hotel Distribution Study 2024 |
| `INE_REVPAR_PT_2025` | 72.4 € | INE, Estatísticas do Turismo 2025 (reported by ECO, 10 Jul 2026) |
| `DMA_PARITY_BAN_SINCE` | "2024-11-14" | European Commission, DMA factsheet on Booking.com, 28 Sep 2026 |

`lib/stats.ts` also exports `THERMOMETER = { hot: 0.55, cold: 0.4 }`, the thresholds the app uses.

`alertFacts` only combines version 1 functions (`kpisByMonth`, `returnStays`, `winterReturners`, `orphanNights`, `simulatePricing`) with `BOOKING_COMMISSION`. `simulateWinterCampaign` uses `winterReturners` and the mean `total` of the winter stays. Neither adds a data rule.

**The order of the action alerts.** `actionAlerts` only reads the month and the facts. The month is a number from 1 to 12.

| Months | Alerts in order, with `when` |
| --- | --- |
| 11, 12, 1, 2 | winter now · commission always · summer prepare · orphans later |
| 3, 4, 5, 6 | summer prepare · commission always · orphans prepare · winter later |
| 7, 8 | summer now · orphans now · commission always · winter prepare |
| 9, 10 | winter prepare · commission always · orphans later · summer later |

**The yearly gain scenarios (version 3).** The KPI is how much the house can gain in a year. `lib/kpi.ts` exports `GAIN_SCENARIOS`, the three sets of assumptions, and `gainScenarios(bookings)`, which returns one `GainScenario` per set, in the order cautious, likely, optimistic:

- `directGain` = `simulateDirectBookings(bookings, { commissionRate: BOOKING_COMMISSION, conversionRate, directDiscount }).yearlyGain`
- `winterGain` = `simulateWinterCampaign(bookings, { returnRate: winterReturnRate, discount: 0 }).extraRevenue`: the extra winter stays at the normal price
- `total` = `directGain + winterGain`

It adds no data rule.

**The page view (version 3).** `buildPainel` is pure and writes every text of the page from `PainelInput`. Its input comes from the hooks: `campaign` is `simulateWinterCampaign` with `PAINEL_WINTER_CAMPAIGN` = `{ returnRate: 0.2, discount: 0.1 }`, `direct` is `simulateDirectBookings` with `PAINEL_DIRECT` = `{ commissionRate: BOOKING_COMMISSION, conversionRate: 0.5, directDiscount: 0.05 }`, `gains` is `gainScenarios`. The summer action's +10% is `PAINEL_SUMMER` = `{ priceChange: 0.1, months: ["2026-07", "2026-08"] }`, the scenario behind `AlertFacts.summerGain`; the page's «E se…?» starts from these three scenarios. Numbers are formatted with `lib/format.ts`: the spaces inside numbers and before the € are no-break spaces (U+00A0), so the € never ends up alone on a line. The best month is the one with the highest occupancy. `actions` follow the order of `alerts`. `contacts.first` are the first 3 `winterReturners` and `contacts.all` all of them, in the same order and written the same way; their link is `invitationMailto(guest, "winter")`, in the guest's first name and with an opt-out line.

An alert is left out when its number is 0: winter → `winterReturners`, commission → `platformReturnStays`, summer → `summerGain`, orphans → `orphanNights`. The interface shows `when` as «Agora» (now), «A preparar» (prepare), «Sempre» (always) and «Mais tarde» (later), and writes each alert's sentence from the facts.

## 4. Expected values

### Whole period

| nightsSold | nightsAvailable | occupancy | revenue | adr | revpar |
| --- | --- | --- | --- | --- | --- |
| 1,344 | 2,920 | 0.4603 | €133,985 | €99.69 | €45.89 |

### By month

| Month | Nights | Available | Occupancy | Revenue (€) | ADR (€) | RevPAR (€) |
| --- | --- | --- | --- | --- | --- | --- |
| 2025-11 | 92 | 240 | 0.3833 | 9,550 | 103.80 | 39.79 |
| 2025-12 | 97 | 248 | 0.3911 | 9,595 | 98.92 | 38.69 |
| 2026-01 | 79 | 248 | 0.3185 | 7,715 | 97.66 | 31.11 |
| 2026-02 | 92 | 224 | 0.4107 | 9,180 | 99.78 | 40.98 |
| 2026-03 | 108 | 248 | 0.4355 | 10,615 | 98.29 | 42.80 |
| 2026-04 | 119 | 240 | 0.4958 | 12,390 | 104.12 | 51.63 |
| 2026-05 | 123 | 248 | 0.4960 | 12,105 | 98.41 | 48.81 |
| 2026-06 | 122 | 240 | 0.5083 | 12,400 | 101.64 | 51.67 |
| 2026-07 | 139 | 248 | 0.5605 | 13,475 | 96.94 | 54.33 |
| 2026-08 | 160 | 248 | 0.6452 | 15,990 | 99.94 | 64.48 |
| 2026-09 | 115 | 240 | 0.4792 | 11,555 | 100.48 | 48.15 |
| 2026-10 | 98 | 248 | 0.3952 | 9,415 | 96.07 | 37.96 |

April's RevPAR is exactly 51.625: it shows as 51.63 with the usual rounding.

### By room (365 nights available each)

| Room | Name | Nights | Occupancy | Revenue (€) |
| --- | --- | --- | --- | --- |
| 1 | Suite Mar | 146 | 0.4000 | 20,440 |
| 2 | Quarto Duplo Vista Mar 1 | 191 | 0.5233 | 20,055 |
| 3 | Quarto Duplo Vista Mar 2 | 156 | 0.4274 | 16,380 |
| 4 | Quarto Duplo Jardim | 188 | 0.5151 | 15,980 |
| 5 | Quarto Twin | 166 | 0.4548 | 13,280 |
| 6 | Quarto Familiar | 173 | 0.4740 | 20,760 |
| 7 | Estúdio Terraço | 153 | 0.4192 | 16,830 |
| 8 | Quarto Individual | 171 | 0.4685 | 10,260 |

### Channel mix

| Channel | Bookings | Share | Nights | Share | Revenue (€) | Share |
| --- | --- | --- | --- | --- | --- | --- |
| Booking | 220 | 0.4574 | 632 | 0.4702 | 62,595 | 0.4672 |
| Direto | 127 | 0.2640 | 383 | 0.2850 | 37,605 | 0.2807 |
| Airbnb | 134 | 0.2786 | 329 | 0.2448 | 33,785 | 0.2522 |

Bookings count every status (481). Nights and revenue are completed stays inside the period, the same base as the KPIs.

### Cancellations (all 481 bookings)

Overall: 37 of 481 = 0.0769.

| Channel | Cancelled / bookings | Rate |
| --- | --- | --- |
| Airbnb | 11 / 134 | 0.0821 |
| Booking | 17 / 220 | 0.0773 |
| Direto | 9 / 127 | 0.0709 |

| Country | Cancelled / bookings | Rate |
| --- | --- | --- |
| Alemanha | 6 / 46 | 0.1304 |
| Espanha | 10 / 81 | 0.1235 |
| Brasil | 5 / 45 | 0.1111 |
| França | 4 / 39 | 0.1026 |
| Portugal | 9 / 166 | 0.0542 |
| Países Baixos | 2 / 38 | 0.0526 |
| Reino Unido | 1 / 66 | 0.0152 |

### Guests

- `guestProfiles`: 312 guests. By number of stays: 1 → 210, 2 → 81, 3 → 17, 4 → 3, 5 → 1.
- RFM scores:
  - **R**, days from the last check-out to 2026-11-02: up to 90 → 3, up to 180 → 2, more → 1. Counts: 3 → 107, 2 → 79, 1 → 126.
  - **F**, completed stays: 3 or more → 3, 2 → 2, 1 → 1. Counts: 3 → 21, 2 → 81, 1 → 210.
  - **M**, euros spent: 600 or more → 3, 300 or more → 2, less → 1. Counts: 3 → 78, 2 → 113, 1 → 121.
- One guest in detail: helena.costa@correio.example has 4 stays, €1,810 spent, last channel Airbnb, recency 40 days, scores 3/3/3.
- `returningGuests`: **102**. Of these, 56 never booked direct.
- `returnStays`: 128 stays, €38,115. Booking 65 (€20,580), Airbnb 30 (€7,685), Direto 33 (€9,850). Through platforms: **95 stays, €28,265**.
- `contactFirst`: 80 guests. The first three:

| Email | Stays | Spent (€) | Last channel |
| --- | --- | --- | --- |
| helena.costa@correio.example | 4 | 1,810 | Airbnb |
| filipa.teixeira@correio.example | 3 | 1,565 | Booking |
| sofia.teixeira@correio.example | 2 | 1,435 | Airbnb |

Counting bookings of any status, 120 guests have 2 or more. That number mixes in cancellations; the app shows 102.

### Direct-booking simulator

`baseStays` = 95 and `baseRevenue` = €28,265 in every case.

| commissionRate | conversionRate | directDiscount | yearlyGain (€) | commissionToday (€) |
| --- | --- | --- | --- | --- |
| 0.15 | 0.5 | 0.05 | 1,413.25 | 4,239.75 |
| 0.10 | 1 | 0 | 2,826.50 | 2,826.50 |
| 0.20 | 1 | 0 | 5,653.00 | 5,653.00 |
| 0.15 | 0.3 | 0.15 | 0.00 (break-even) | 4,239.75 |

### Winter room

The idea: one room leaves short stays from November to February and goes to one long stay at a monthly rate.

How to compute it:

1. Window: 2025-11-01 to 2026-02-28 (120 nights, 4 months).
2. Displaced stays: completed stays in that room with at least one night in the window, in check-in order (then id).
3. Each displaced stay moves to the cheapest other room (then the lowest id) with `capacity` ≥ `guests` that is free on every night of the stay. Free means no completed stay there and no stay already moved there. Cheapest first keeps upgrades as the last resort.
4. A stay that fits nowhere is lost: its whole `total` goes to `lostRevenue`.
5. Stays that move keep their revenue. `netGain` = `monthlyRate × 4 − lostRevenue`.

| Scenario | winterNights | winterRevenue | displaced | relocatable | lostRevenue | longStayRevenue | netGain |
| --- | --- | --- | --- | --- | --- | --- | --- |
| room 3, €900 a month | 26 | 2,730 | 11 | 11 | 0 | 3,600 | 3,600 |
| room 7, €900 a month | 43 | 4,730 | 13 | 8 | 2,530 | 3,600 | 1,070 |

Room 3 (Quarto Duplo Vista Mar 2) is the one in the proposal: it was occupied on 26 of the 120 winter nights, and all 11 of its stays fit in another room. On no winter night were all 8 rooms occupied (7 at most). With this rule, 10 of those 11 stays go to cheaper rooms without sea view and 1 to the Suite; only 1 of the 11 would fit in the other sea-view double. Keeping each stay's revenue is therefore an optimistic assumption.

### Net revenue by channel

With `{ Booking: 0.15, Airbnb: 0.155, Direto: 0 }`:

| Channel | Nights | Revenue (€) | Commission (€) | Net (€) | Net per night (€) |
| --- | --- | --- | --- | --- | --- |
| Booking | 632 | 62,595 | 9,389.25 | 53,205.75 | 84.19 |
| Direto | 383 | 37,605 | 0 | 37,605 | 98.19 |
| Airbnb | 329 | 33,785 | 5,236.675 | 28,548.325 | 86.77 |

Commissions add up to 14,625.93 €, 10.9% of the period's revenue.

### Occupancy by room and month

96 cells that add up to 1,344 nights. Winter nights (Nov, Dec, Jan, Feb) for the two sea-view doubles: room 2 → 14, 17, 16, 12; room 3 → 2, 8, 9, 7. Busiest cell: room 5 in 2026-08, 26 of 31 nights. Quietest: room 3 in 2025-11, 2 of 30 nights.

### Channel transitions (first stay → each return stay)

| From \ to | Booking | Airbnb | Direto |
| --- | --- | --- | --- |
| Booking | 26 | 11 | 13 |
| Airbnb | 23 | 8 | 10 |
| Direto | 16 | 11 | 10 |

128 return stays in total.

### Orphan nights

87. By room: 1 → 13, 2 → 11, 3 → 11, 4 → 13, 5 → 12, 6 → 5, 7 → 11, 8 → 11. 46 of them fall between June and September.

### Winter returners

49 of the 102 returning guests.

### Pricing simulator

| Scenario | nightsSold | baseRevenue (€) | newRevenue (€) | nightsForSameRevenue |
| --- | --- | --- | --- | --- |
| +10% in 2026-07 and 2026-08 | 299 | 29,465 | 32,411.50 | 271.82 |
| −10% from 2025-11 to 2026-02 | 360 | 36,040 | 32,436.00 | 400.00 |

Read it as: with +10% in July and August, the house can sell up to 27 fewer nights and still earn the same; with −10% in winter, it needs 40 more nights to earn the same.


### Guest totals

`guestTotals`: 312 guests, 440 stays, €134,065. Returning: 102 guests, 230 stays, €69,535 (51.9% of the spend). The spend counts each stay's whole `total`, as `guestProfiles` does, so it adds up to €134,065 and not to the period's €133,985.

### Price thermometer

With `THERMOMETER` and the rows of `kpisByMonth`:

| Month | Occupancy | Level |
| --- | --- | --- |
| 2025-11 | 92 / 240 = 0.3833 | cold |
| 2025-12 | 97 / 248 = 0.3911 | cold |
| 2026-01 | 79 / 248 = 0.3185 | cold |
| 2026-02 | 92 / 224 = 0.4107 | normal |
| 2026-03 | 108 / 248 = 0.4355 | normal |
| 2026-04 | 119 / 240 = 0.4958 | normal |
| 2026-05 | 123 / 248 = 0.4960 | normal |
| 2026-06 | 122 / 240 = 0.5083 | normal |
| 2026-07 | 139 / 248 = 0.5605 | hot |
| 2026-08 | 160 / 248 = 0.6452 | hot |
| 2026-09 | 115 / 240 = 0.4792 | normal |
| 2026-10 | 98 / 248 = 0.3952 | cold |

`adr` is the month's `adr`: it stays between €96.07 and €104.12 while occupancy goes from 0.32 to 0.65.

### Winter campaign

`avgStayValue`: 125 completed stays check in from 2025-11-01 to 2026-02-28, for €36,720, so €293.76. `guests` = 49, the winter returners.

| returnRate | discount | extraStays | extraRevenue (€) | discountCost (€) |
| --- | --- | --- | --- | --- |
| 0.2 | 0.1 | 10 | 2,643.84 | 293.76 |
| 0.1 | 0 | 5 | 1,468.80 | 0 |
| 0.3 | 0.05 | 15 | 4,186.08 | 220.32 |

`extraStays` counts whole stays: 49 × 0.2 = 9.8, so 10. Read it with the pricing simulator: +10% in July and August brings €2,946.50 with the same nights, about 10 times the €293.76 the campaign's discount costs.

### Alert facts and action alerts

| `alertFacts` field | Value |
| --- | --- |
| winterEmptyNights | 600 (960 room-nights, 360 sold) |
| winterReturners | 49 |
| platformReturnStays | 95 |
| commissionToday | 4,239.75 (28,265 × 0.15) |
| julyOccupancy | 139 / 248 |
| augustOccupancy | 160 / 248 |
| summerGain | 2,946.50 |
| orphanNights | 87 |
| summerOrphanNights | 46 |

`actionAlerts` with these facts follows the order table in section 3; the tests use months 11, 4, 8 and 10. With `orphanNights: 0`, month 11 gives 3 alerts: winter, commission and summer.

### Yearly gain scenarios

`gainScenarios`, with `BOOKING_COMMISSION` = 0.15 (version 3):

| id | conversionRate | directDiscount | winterReturnRate | directGain (€) | winterGain (€) | total (€) |
| --- | --- | --- | --- | --- | --- | --- |
| cautious | 0.2 | 0.05 | 0.1 | 565.30 | 1,468.80 | 2,034.10 |
| likely | 0.5 | 0.05 | 0.2 | 1,413.25 | 2,937.60 | 4,350.85 |
| optimistic | 1 | 0 | 0.3 | 4,239.75 | 4,406.40 | 8,646.15 |

`directGain` is 28,265 × `conversionRate` × (0.15 − `directDiscount`). `winterGain` is `Math.round(49 × winterReturnRate)` stays of €293.76: 5, 10 and 15 stays.

### Page view

`buildPainel` with the values of this section, for month 11. Every space shown inside a number or before € is U+00A0.

| Field | Text |
| --- | --- |
| `monthName` | novembro |
| `period` | De novembro de 2025 a outubro de 2026 |
| `summary.sentence` | Este ano a casa rendeu 133 985 €. Agosto foi o melhor mês: 65% das noites com hóspedes. |
| `summary.figures` | «133 985 €» recebeu no ano · «46%» das noites com hóspedes · «102» hóspedes voltaram e trouxeram 52% da receita (52% = `returningSpent ÷ spent`) |
| `gain.likely` | Cerca de 4350 € por ano |
| `gain.range` | Entre cerca de 2030 € e 8650 €, conforme quantos hóspedes aceitarem. |
| `gain.assumption` | No cenário mais provável, metade de quem volta pelas plataformas passa a reservar diretamente, com 5% de desconto, e 1 em cada 5 hóspedes de inverno volta mais uma vez. |
| `months.best` | Agosto foi o melhor mês: 65% das noites com hóspedes. |
| `months.price` | O preço por noite quase não mudou: entre 96 € e 104 €. |

`gain` rounds each total to the nearest ten (`about`).

The actions, with `when` as «Agora», «A preparar», «Sempre» or «Mais tarde»:

| id | title | text | worth | cta → target |
| --- | --- | --- | --- | --- |
| winter | Convide quem já cá esteve no inverno | Ficaram 600 noites por vender de novembro a fevereiro. 49 hóspedes que voltam já cá estiveram nesta altura do ano. | Com 10% de desconto, cerca de 10 estadas: mais 2644 €. | Ver os 49 hóspedes → `#contactos` |
| commission | Peça a quem volta que reserve diretamente | Este ano pagou 4240 € de comissão em 95 regressos pelo Booking e pelo Airbnb. | Se metade passar a reservar diretamente, com 5% de desconto: mais 1413 € por ano. | Simular o desconto → `#simular` |
| summer | Suba um pouco o preço em julho e agosto | Julho e agosto tiveram 56% e 65% das noites com hóspedes, com o preço de sempre. | Com mais 10%, nas mesmas noites: mais 2947 €. | Simular o verão → `#simular` |
| orphans | Venda as noites soltas | Há 87 noites vazias entre duas estadas no mesmo quarto, 46 delas de junho a setembro. | `null` | Ver o mapa → `#detalhes` |

Order for month 11: winter Agora · commission Sempre · summer A preparar · orphans Mais tarde. For month 8: summer Agora · orphans Agora · commission Sempre · winter A preparar.

Each contact's `detail` is «4 estadas · 1810 € · última pelo Airbnb», or «· última direta» when the last channel is Direto. `contacts.all` has one row per winter returner, in their order, so its first 3 rows are `contacts.first`. `contacts.total` = `winterReturners.length`.

`months.bars` has 12 rows `{ period, label, percent, level }`: `label` is the short month without a dot («ago»), `percent` the occupancy («65%») and `level` «mais procurado» (hot), «normal» or «menos procurado» (cold).

The invitation emails (`lib/email.ts`), both in the guest's first name and both ending with «Se preferir não receber mais mensagens nossas, responda com «Não» e retiramos o seu contacto.»:

| kind | Subject | Discount in the body |
| --- | --- | --- |
| winter | Volte este inverno, com 10% de desconto | 10% if they book directly |
| direct | Da próxima vez, reserve diretamente connosco | 5% |

`npm test` checks these texts letter by letter (`scripts/test-format.ts`, `scripts/test-email.ts`, `scripts/test-painel.ts`).

## 5. Hypotheses: how each was computed, and the result

These were registered in `HIPOTESES.md` before looking at the results. The criteria do not change.

| # | Computation | Value | Result |
| --- | --- | --- | --- |
| H1 | Share of return stays booked through the same channel as the guest's first completed stay | 0.344 (44 of 128) | Rejected (criterion: more than 0.5) |
| H2 | Average stay, completed: direct 3.302 nights vs platforms 2.969 (+0.333). Cancellation, all bookings: direct 0.0709 vs platforms 0.0791 (0.82 points lower) | Stay passes, cancellation does not | Rejected (both conditions needed) |
| H3 | Share of nights sold in the period through platforms | 0.715 | Confirmed (benchmark 0.321) |
| H4 | Share of one-person completed stays in rooms for 3 or 4 | 0.212 (48 of 226) | Confirmed, narrowly (criterion: more than 0.20) |
| H5 | Most rooms occupied on one night between 2025-11-01 and 2026-02-28, completed stays | 7 | Confirmed (never 8) |
| H6 | The 2 lowest cancellation rates by country vs the 3 countries with the most returning guests | Lowest: Reino Unido, Países Baixos. Most returning: Portugal, Espanha, Reino Unido | Rejected |

Notes:

- **H1:** if the channel of each return stay were drawn at random with the base's channel shares, the same channel would repeat 35.8% of the time. The observed 34.4% is about that: returning guests show no loyalty to a channel. A chi-square test on the transition table agrees (p = 0.80).
- **H2:** the longer direct stays are not statistically significant (Mann–Whitney p = 0.13; t-test p = 0.08), and cancellation does not differ by channel (chi-square p = 0.94).
- **H4:** passes the registered criterion, but 21.2% is statistically the same as 20% (binomial p = 0.35).
- **H6:** because country belongs to the booking (section 1), "returning guests by country" can be read three ways: the country of the guest's first stay, of the last stay, or of each return stay. All three give the same top 3, without Países Baixos, so the result holds either way.

### Exploratory findings (not registered before seeing the data)

These came from exploring the data after the hypotheses were tested. They are reported apart, with their uncertainty.

- One list price per room: the same all year, on every channel and for any number of guests.
- After commission, a night is worth 98.19 € direct, 86.77 € on Airbnb and 84.19 € on Booking (rates in section 3).
- Returning guests spend the same per stay as one-time guests (302 € vs 307 €). They are worth 2.2 times more in the year because they come back.
- Of the 25 returning guests whose first stay was direct, 27 of their 37 later stays went through platforms (73%, 95% interval 57% to 85%).
- Returning guests come less in winter (25% of their stays vs 32% for one-time guests), but 49 of them stayed at least one night from November to February.
- 87 orphan nights, 46 of them from June to September.
- Week-long stays look more direct (14 of 36, 39%), but the 95% interval (25% to 55%) includes the overall 26%: not a finding.

## 6. Hooks: the seam between data and screens

This follows the brief: one data hook with data, status and error; hooks for computed data; Zustand to read the files once; components that never know the store or `fetch`.

Pages call these hooks and pass the results to components as props. Components never call `lib/`, the store or `fetch`.

```ts
type DataStatus = "idle" | "loading" | "ready" | "error";
type TextSize = "normal" | "maior";

interface DashboardData {
  year: PeriodKpi;
  byMonth: PeriodKpi[];
  byRoom: RoomKpi[];
  channels: ChannelMix[];
  netByChannel: ChannelNet[]; // with the typical rates in lib/benchmarks.ts
  roomMonth: RoomMonthOccupancy[];
  orphanNights: OrphanNight[];
  cancellationsByChannel: CancellationRate[];
  cancellationsByCountry: CancellationRate[];
  thermometer: MonthTemperature[]; // with THERMOMETER
}

interface ReturningData {
  returning: GuestProfile[];
  contactFirst: GuestProfile[];
  winterReturners: GuestProfile[];
  transitions: ChannelTransition[];
  returnStays: Booking[];
  totals: GuestTotals;
}

useData(): { rooms: Room[]; bookings: Booking[]; status: DataStatus; error: string | null; retry: () => void }
useDashboard(): DashboardData | null
useReturningGuests(): ReturningData | null
useDirectSimulation(scenario: DirectBookingScenario): DirectBookingResult | null
usePricing(scenario: PricingScenario): PricingResult | null
useWinterRoom(scenario: WinterRoomScenario): WinterRoomResult | null
useAlerts(): { month: number; alerts: Alert[]; facts: AlertFacts } | null
useWinterCampaign(scenario: WinterCampaignScenario): WinterCampaignResult | null
useMonthSelection(): { selectedMonth: number | null; setSelectedMonth: (month: number | null) => void }
usePainel(): PainelView | null // version 3
useTextSize(): { textSize: TextSize; setTextSize: (size: TextSize) => void }
```

- `useData` loads `quartos.json` and `reservas.json` once, through a Zustand store and `services/data.ts`.
- The other hooks return `null` until `status` is `"ready"`. While they are `null`, the page shows the loading or error state from `components/states/`.
- They compute with `useMemo` over the functions in `lib/`, so a screen shows real numbers as soon as its function is implemented, with no change to the components.
- `DataStatus`, `DashboardData` and `ReturningData` go in `types/index.ts`.
- `retry` loads the files again after an error, through the store's `load`. Pages pass it to the error state as `onRetry`, which shows a «Tentar de novo» button.
- The store keeps `selectedMonth: number | null` and `setSelectedMonth(month)`. `null` means the month of the reference date, 11. `useAlerts` reads it and returns the month it used. Pages read and change it through `useMonthSelection`, never the store itself.
- `usePainel` (version 3) joins `useDashboard`, `useReturningGuests`, `useAlerts`, `useWinterCampaign(PAINEL_WINTER_CAMPAIGN)`, `useDirectSimulation(PAINEL_DIRECT)` and `gainScenarios`, and passes them to `buildPainel`. It follows the selected month through `useAlerts`.
- The store also keeps `textSize`, the «Letra maior» choice, and `setTextSize(size)`. It is the only thing kept on the device: the store's `persist` saves it in `localStorage`, under `a-sua-casa`, never the data. Reading and writing are guarded, so the page works without storage. The store reads it back after the first render (`skipHydration`), so the prerendered HTML matches. Pages read and change it through `useTextSize`. `TextSize` goes in `types/index.ts`.
- A type or a hook only changes through a reviewed PR, with `npm run verificar` passing.
