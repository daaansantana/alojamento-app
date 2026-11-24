import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  alertHowMuch,
  alertTag,
  roomDays,
  weekdayOffset,
} from "../lib/market-sim";
import type { MarketSimulation } from "../types/mercado";

let failures = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  ✔ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${name} ${detail}`);
  }
}
const close = (a: number, b: number) => Math.abs(a - b) < 0.0005;

const sim: MarketSimulation = JSON.parse(
  readFileSync(
    join(process.cwd(), "public", "data", "mercado-simulado.json"),
    "utf8",
  ),
);
const ROOM = "Quarto Duplo Vista Mar 1";
const days = roomDays(sim, ROOM, []);
const day = (date: string) => days.find((d) => d.data === date);

console.log("simulated market: the 90 days");
check(
  "90 days, 2026-11-24 to 2027-02-21",
  days.length === 90 &&
    days[0].data === "2026-11-24" &&
    days[89].data === "2027-02-21",
);
check("2026-11-24 is a Tuesday", weekdayOffset("2026-11-24") === 1);
const nye = day("2026-12-31");
check(
  "31 dez: market 172, price 105, gap 0.638, market above",
  !!nye &&
    nye.mediana === 172 &&
    nye.preco === 105 &&
    close(nye.gap, 172 / 105 - 1) &&
    nye.state === "market-above",
  JSON.stringify(nye),
);
const jan = day("2027-01-12");
check(
  "12 jan: market 87, gap −0.171, house above",
  !!jan &&
    jan.mediana === 87 &&
    close(jan.gap, 87 / 105 - 1) &&
    jan.state === "house-above",
  JSON.stringify(jan),
);
const nov = day("2026-11-28");
check(
  "28 nov: market 114, gap 0.086, near",
  !!nov &&
    nov.mediana === 114 &&
    close(nov.gap, 114 / 105 - 1) &&
    nov.state === "near",
  JSON.stringify(nov),
);
const done = roomDays(sim, ROOM, ["passagem-de-ano"]).find(
  (d) => d.data === "2026-12-31",
);
check(
  "with the New Year alert done, 31 dez is 120 €",
  done?.preco === 120,
  JSON.stringify(done),
);

console.log("simulated market: the alerts");
const rooms = Object.fromEntries(
  sim.alertas.map((a) => [a.id, a.quartos.length]),
);
check(
  "rooms per alert",
  JSON.stringify(rooms) ===
    JSON.stringify({
      "passagem-de-ano": 8,
      "fins-de-semana": 3,
      janeiro: 4,
      carnaval: 6,
      "ine-outubro": 0,
    }),
  JSON.stringify(rooms),
);
const january = sim.alertas.find((a) => a.id === "janeiro");
check(
  "January: doubles 105 → 95, family 120 → 110, studio 110 → 100",
  JSON.stringify(january?.quartos.map((q) => [q.quarto, q.de, q.para])) ===
    JSON.stringify([
      ["Quarto Duplo Vista Mar 1", 105, 95],
      ["Quarto Duplo Vista Mar 2", 105, 95],
      ["Quarto Familiar", 120, 110],
      ["Estúdio Terraço", 110, 100],
    ]),
);
check(
  "January's tag is «Até 14 dez»",
  !!january && alertTag(january, sim.definicoes) === "Até 14 dez",
  january ? alertTag(january, sim.definicoes) : "",
);
const ny = sim.alertas.find((a) => a.id === "passagem-de-ano");
check(
  "New Year: how much",
  !!ny &&
    alertHowMuch(ny) === "subir 8 quartos, de 60–140 € para 65–160 € por noite",
  ny ? String(alertHowMuch(ny)) : "",
);
const ine = sim.alertas.find((a) => a.id === "ine-outubro");
check("the INE alert has no how much", !!ine && alertHowMuch(ine) === null);

if (failures > 0) {
  console.error(`\n${failures} market check(s) failed`);
  process.exit(1);
}
