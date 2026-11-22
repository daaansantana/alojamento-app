import type { MarketMonth } from "@/types";

// Market reference values to compare the house against (SPEC section 3).
// Each constant carries its source. Rates are 0 to 1, money is in euros.

// Typical Booking.com commission. Range 0.10 to 0.25; about +0.03 with
// Preferred Partner.
// Source: Hostfully, "Booking.com host fees", 4 Nov 2026.
export const BOOKING_COMMISSION = 0.15;

// Airbnb host-only fee. About 0.03 with the split fee.
// Source: Airbnb, "Simplifying Airbnb service fees".
export const AIRBNB_HOST_FEE = 0.155;

// Share of nights sold through online travel agencies by European hotels
// with fewer than 20 rooms, 2023 data (direct share: 0.595).
// Source: HOTREC European Hotel Distribution Study 2024.
export const HOTREC_SMALL_HOTEL_OTA_SHARE = 0.321;

// Revenue per available room in Portugal, 2025, in euros.
// Source: INE, Estatísticas do Turismo 2025 (reported by ECO, 10 Jul 2026).
export const INE_REVPAR_PT_2025 = 72.4;

// Date since which Booking.com may not impose price parity on hotels.
// Source: European Commission, DMA factsheet on Booking.com, 28 Sep 2026.
export const DMA_PARITY_BAN_SINCE = "2024-11-14";

export interface Source {
  name: string; // what the value is, in the interface's words
  value: number | string;
  kind: "share" | "eur" | "date";
  source: string;
}

/** The references above, for the page's «Fontes». */
export const SOURCES: Source[] = [
  {
    name: "Comissão típica do Booking",
    value: BOOKING_COMMISSION,
    kind: "share",
    source: "Hostfully, «Booking.com host fees», 4 nov 2026",
  },
  {
    name: "Taxa do Airbnb paga só pelo anfitrião",
    value: AIRBNB_HOST_FEE,
    kind: "share",
    source: "Airbnb, «Simplifying Airbnb service fees»",
  },
  {
    name: "Noites vendidas por plataformas em hotéis europeus com menos de 20 quartos",
    value: HOTREC_SMALL_HOTEL_OTA_SHARE,
    kind: "share",
    source: "HOTREC, European Hotel Distribution Study 2024",
  },
  {
    name: "Receita por quarto disponível em Portugal, 2025",
    value: INE_REVPAR_PT_2025,
    kind: "eur",
    source:
      "INE, Estatísticas do Turismo 2025 (noticiado pelo ECO, 10 jul 2026)",
  },
  {
    name: "Desde quando o Booking não pode impor preços iguais aos do seu site",
    value: DMA_PARITY_BAN_SINCE,
    kind: "date",
    source:
      "Comissão Europeia, ficha do Regulamento dos Mercados Digitais sobre o Booking.com, 28 set 2026",
  },
];

// The market, month by month: INE's «rendimento médio por quarto ocupado»
// (ADR) and «rendimento médio por quarto disponível» (RevPAR), in euros, for
// all tourist accommodation in Portugal: hotels, local accommodation with 10
// or more beds, and rural tourism. INE does not publish local accommodation
// on its own by month, only by quarter. Each value is the one in that month's
// release «Atividade Turística – Estatísticas Rápidas» (preliminary, as
// published). October 2026 comes out on 30 Nov 2026: until then, October 2025
// stands in for it.
const ine = (id: string) =>
  `https://www.ine.pt/ngt_server/attachfileu.jsp?look_parentBoui=${id}&att_display=n&att_download=y`;

/** How the screen names the market. */
export const MARKET_SEGMENT =
  "da média de todo o alojamento turístico em Portugal, hotéis incluídos, segundo o INE";

export const MARKET_BY_MONTH: MarketMonth[] = [
  {
    period: "2025-11",
    adr: 97.8,
    revpar: 47.1,
    from: "2025-11",
    url: ine("769179168"),
    published: "2025-12-31",
  },
  {
    period: "2025-12",
    adr: 99.7,
    revpar: 38.9,
    from: "2025-12",
    url: ine("774661220"),
    published: "2026-01-30",
  },
  {
    period: "2026-01",
    adr: 92.1,
    revpar: 33.8,
    from: "2026-01",
    url: ine("779090002"),
    published: "2026-02-27",
  },
  {
    period: "2026-02",
    adr: 89.6,
    revpar: 39.7,
    from: "2026-02",
    url: ine("784542481"),
    published: "2026-03-31",
  },
  {
    period: "2026-03",
    adr: 98.6,
    revpar: 49.7,
    from: "2026-03",
    url: ine("790535834"),
    published: "2026-04-30",
  },
  {
    period: "2026-04",
    adr: 118.0,
    revpar: 69.8,
    from: "2026-04",
    url: ine("795601140"),
    published: "2026-05-29",
  },
  {
    period: "2026-05",
    adr: 130.9,
    revpar: 84.0,
    from: "2026-05",
    url: ine("801032080"),
    published: "2026-06-30",
  },
  {
    period: "2026-06",
    adr: 140.8,
    revpar: 90.5,
    from: "2026-06",
    url: ine("806454204"),
    published: "2026-07-31",
  },
  {
    period: "2026-07",
    adr: 154.9,
    revpar: 104.3,
    from: "2026-07",
    url: ine("810308232"),
    published: "2026-08-31",
  },
  {
    period: "2026-08",
    adr: 163.2,
    revpar: 119.1,
    from: "2026-08",
    url: ine("817591985"),
    published: "2026-09-30",
  },
  {
    period: "2026-09",
    adr: 147.3,
    revpar: 102.0,
    from: "2026-09",
    url: ine("825209253"),
    published: "2026-10-30",
  },
  {
    period: "2026-10",
    adr: 122.6,
    revpar: 77.5,
    from: "2025-10",
    url: ine("763612793"),
    published: "2025-11-28",
  },
];
