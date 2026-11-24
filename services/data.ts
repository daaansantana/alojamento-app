import type { Booking, Room } from "@/types";
import type { MarketSimulation } from "@/types/mercado";

async function fetchJson<T>(file: string): Promise<T> {
  const response = await fetch(`/data/${file}.json`);
  if (!response.ok) {
    throw new Error(`Could not load ${file}.json`);
  }
  return response.json();
}

export const fetchRooms = () => fetchJson<Room[]>("quartos");
export const fetchBookings = () => fetchJson<Booking[]>("reservas");
/** The simulated market file: a stand-in for a paid market-data service. */
export const fetchMarketSimulation = () =>
  fetchJson<MarketSimulation>("mercado-simulado");
