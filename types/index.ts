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
}

export interface ReturningData {
  returning: GuestProfile[];
  contactFirst: GuestProfile[];
  winterReturners: GuestProfile[];
  transitions: ChannelTransition[];
  returnStays: Booking[];
}
