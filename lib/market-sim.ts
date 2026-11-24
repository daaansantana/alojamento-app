// The simulated market, day by day and room by room (SPEC version 5): the
// house's price against quartos parecidos, how far apart they are, and the
// alerts' tag, how much and when. Only the arithmetic: the page shows it.

import { addDays, parseDate } from "@/lib/dates";
import type {
  MarketAlert,
  MarketRules,
  MarketSimulation,
  RoomDay,
} from "@/types/mercado";

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

/** "2026-12-14" → "14 dez". */
export function shortDay(date: string): string {
  return `${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
}

/** 0 for Monday up to 6 for Sunday: where a date sits in a week grid. */
export function weekdayOffset(date: string): number {
  return (parseDate(date).getUTCDay() + 6) % 7;
}

/**
 * The 90 days for one room. The market is the double room's, times the
 * room type's factor; the house's price is today's, or the new price of an
 * alert she marked as done for that room and night.
 */
export function roomDays(
  sim: MarketSimulation,
  roomName: string,
  doneIds: string[],
): RoomDay[] {
  const room = sim.quartos.find((r) => r.nome === roomName);
  if (!room) return [];
  const factor = sim.fatorTipo[room.tipo] ?? 1;
  const changed = new Map<string, number>();
  for (const alert of sim.alertas) {
    if (!doneIds.includes(alert.id)) continue;
    const mine = alert.quartos.find((q) => q.quarto === roomName);
    if (mine) for (const night of alert.noites) changed.set(night, mine.para);
  }
  const threshold = sim.definicoes.diferencaMinima;
  return sim.dias.map((day) => {
    const preco = changed.get(day.data) ?? room.preco;
    const mediana = day.mercado.mediana * factor;
    const gap = mediana / preco - 1;
    return {
      data: day.data,
      dia: day.dia,
      evento: day.evento,
      p25: day.mercado.p25 * factor,
      mediana,
      p75: day.mercado.p75 * factor,
      ocupacao: day.mercado.ocupacao,
      reservados: day.casa.reservados,
      preco,
      gap,
      state:
        gap >= threshold - 1e-9
          ? "market-above"
          : gap <= -threshold + 1e-9
            ? "house-above"
            : "near",
    };
  });
}

/** «Fazer hoje», «Esta semana», «Até 14 dez», «Mais tarde» or «Para saber». */
export function alertTag(alert: MarketAlert, rules: MarketRules): string {
  switch (alert.estado) {
    case "hoje":
      return "Fazer hoje";
    case "esta-semana":
      return "Esta semana";
    case "ate":
      return alert.noites[0]
        ? `Até ${shortDay(addDays(alert.noites[0], -rules.avisarDiasAntes))}`
        : "Mais tarde";
    case "mais-tarde":
      return "Mais tarde";
    default:
      return "Para saber";
  }
}

/** «subir 8 quartos, de 60–140 € para 65–160 € por noite», or null without rooms. */
export function alertHowMuch(alert: MarketAlert): string | null {
  const rooms = alert.quartos;
  if (rooms.length === 0) return null;
  const range = (xs: number[]) => {
    const low = Math.min(...xs);
    const high = Math.max(...xs);
    return low === high ? `${low} €` : `${low}–${high} €`;
  };
  const verb = alert.tipo === "descer" ? "baixar" : "subir";
  const what = rooms.length === 1 ? "1 quarto" : `${rooms.length} quartos`;
  return `${verb} ${what}, de ${range(rooms.map((r) => r.de))} para ${range(rooms.map((r) => r.para))} por noite`;
}
