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
