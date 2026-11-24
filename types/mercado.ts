// The simulated market file (public/data/mercado-simulado.json, SPEC
// version 5): what a paid market-data service would send, with the house's
// real prices. The page says plainly that it is a simulation.

export interface MarketSource {
  nome: string;
  estado: "ligado" | "por ligar" | "em uso";
  detalhe: string;
}

export interface MarketRules {
  avisarDiasAntes: number; // warn this many days before the first night
  diferencaMinima: number; // warn from this gap to the market, 0.10 = 10%
  subirNoMaximo: number; // raise at most this much at a time
  descerNoMaximo: number; // lower at most this much at a time
  precoMinimo: number; // never below this share of today's price
  procuraAlta: number;
  procuraBaixa: number;
}

export interface MarketRoom {
  nome: string;
  tipo: string;
  preco: number; // today's price per night, from quartos.json
}

export interface MarketDay {
  data: string; // "2026-11-24"
  dia: string; // "ter"
  evento: string | null;
  mercado: { p25: number; mediana: number; p75: number; ocupacao: number }; // a double room
  casa: { reservados: number }; // of 8 rooms
}

export interface Competitor {
  id: string;
  nome: string;
  distanciaKm: number;
  nota: number;
  precos: number[]; // a double room, one per day
  esgotado: boolean[];
  mudou24h: { datas: string; variacao: number } | null;
}

export interface MarketAlertRoom {
  quarto: string;
  de: number;
  para: number;
  mercado: number; // the market against today's price, 0.33 = 33% above
}

export interface MarketAlert {
  id: string;
  estado: "hoje" | "esta-semana" | "ate" | "mais-tarde" | "informacao";
  tipo: "subir" | "descer" | "dados";
  titulo: string;
  datas: string;
  noites: string[];
  quartos: MarketAlertRoom[];
  quando: string;
  porque: string[];
  extra: string;
  ia: string;
  alternativa?: { texto: string; destino: string };
}

export interface MarketSimulation {
  simulado: boolean;
  atualizado: string; // "2026-11-24T07:00"
  nota: string;
  fontes: MarketSource[];
  definicoes: MarketRules;
  fatorTipo: Record<string, number>;
  quartos: MarketRoom[];
  dias: MarketDay[];
  concorrentes: Competitor[];
  alertas: MarketAlert[];
}

/** One day for one room: the market for that type of room and the house's price. */
export interface RoomDay {
  data: string;
  dia: string;
  evento: string | null;
  p25: number;
  mediana: number;
  p75: number;
  ocupacao: number;
  reservados: number;
  preco: number; // the house's price that night, after the alerts marked done
  gap: number; // mediana / preco − 1
  state: "market-above" | "near" | "house-above";
}
