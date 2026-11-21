// One interface per sheet. Keys match the JSON (= the Excel headers) exactly.

/** quartos.json */
export interface Room {
  id: number;
  name: string;
  type: string; // "Suite", "Duplo", "Twin", "Familiar", "Estúdio", "Individual"
  capacity: number;
  price_per_night: number;
}

/** reservas.json. room_id links to Room.id */
export interface Booking {
  id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  country: string;
  check_in: string; // "2025-11-01", text in the JSON
  check_out: string; // "2025-11-03", text in the JSON
  nights: number;
  guests: number;
  channel: string; // "Direto", "Airbnb", "Booking"
  total: number;
  status: string; // "Concluída", "Confirmada", "Cancelada"
}

// Output types of the functions in lib/ (SPEC section 2).

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
  contacts: { first: PainelContact[]; total: number };
  gain: { likely: string; range: string; assumption: string };
  months: { bars: PainelMonth[]; best: string; price: string };
}

// What the hooks return (SPEC section 6).

export type DataStatus = "idle" | "loading" | "ready" | "error";

export interface DashboardData {
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

export interface ReturningData {
  returning: GuestProfile[];
  contactFirst: GuestProfile[];
  winterReturners: GuestProfile[];
  transitions: ChannelTransition[];
  returnStays: Booking[];
  totals: GuestTotals;
}
