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
