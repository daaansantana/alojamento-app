"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDay {
  label: string; // «14 dez»
  price: number;
  median: number;
  band: [number, number];
}

export interface CalendarCell {
  key: string;
  day: string; // «1 dez» on the first of a month, otherwise «14»
  state: "market-above" | "near" | "house-above";
  event: boolean;
  selected: boolean;
  label: string; // for screen readers
}

export interface DayDetail {
  title: string; // «quinta, 31 dez»
  event: string | null;
  price: string; // «120 € (era 105 €)»
  market: string; // «148 € a 202 €, a meio 172 € (+64% face a si)»
  occupancy: string;
  booked: string;
  neighbours: { name: string; info: string; price: string }[];
}

const CELL = {
  "market-above": "border-l-4 border-l-[#1f8a5f] bg-[#dcefe5]",
  near: "bg-muted",
  "house-above":
    "border-l-4 border-l-[#b7791f] bg-[repeating-linear-gradient(135deg,#f6e6c9_0_5px,#fcf6ea_5px_10px)]",
};
const MARK = { "market-above": "↑", near: "", "house-above": "↓" };

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDay }[];
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="rounded-xl border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-bold">{d.label}</p>
      <p>O seu preço: {d.price} €</p>
      <p>Quartos parecidos: {d.median} € a meio</p>
      <p className="text-muted-foreground">
        A maioria entre {d.band[0]} € e {d.band[1]} €
      </p>
    </div>
  );
}

/** The next 90 days for one room: a chart, a calendar and the chosen day. */
export function NextDays({
  rooms,
  room,
  onRoom,
  chart,
  chartLabel,
  ticks,
  selectedLabel,
  offset,
  cells,
  onPick,
  detail,
}: {
  rooms: { value: string; label: string }[];
  room: string;
  onRoom: (room: string) => void;
  chart: ChartDay[];
  chartLabel: string;
  ticks: string[];
  selectedLabel: string;
  offset: number; // empty cells before the first day, Monday first
  cells: CalendarCell[];
  onPick: (key: string) => void;
  detail: DayDetail;
}) {
  const values = chart.flatMap((d) => [d.price, d.band[0], d.band[1]]);
  const low = Math.floor(Math.min(...values) / 20) * 20;
  const high = Math.ceil(Math.max(...values) / 20) * 20;
  const step = Math.max(20, Math.ceil((high - low) / 4 / 20) * 20);
  const yTicks: number[] = [];
  for (let v = low; v < high + step; v += step) yTicks.push(v);
  return (
    <section
      id="calendario"
      aria-labelledby="calendario-titulo"
      className="flex scroll-mt-28 flex-col gap-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="calendario-titulo" className="text-h2 font-bold">
            Próximos 90 dias
          </h2>
          <p className="text-muted-foreground">
            O seu preço por noite e o de quartos parecidos, dia a dia. Dados
            simulados.
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">Quarto</span>
          <select
            className="min-h-11 rounded-xl border border-control bg-background px-3"
            value={room}
            onChange={(e) => onRoom(e.target.value)}
          >
            {rooms.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div role="img" aria-label={chartLabel} className="h-64 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 320, height: 256 }}
          >
            <ComposedChart
              data={chart}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                ticks={ticks}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 14 }}
              />
              <YAxis
                width={56}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v} €`}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 14 }}
                domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                ticks={yTicks}
              />
              <Tooltip
                content={<Tip />}
                cursor={{ stroke: "var(--color-control)" }}
              />
              <Area
                dataKey="band"
                stroke="none"
                fill="var(--color-mint)"
                fillOpacity={0.55}
                isAnimationActive={false}
              />
              <Line
                dataKey="median"
                stroke="var(--color-muted-foreground)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="price"
                type="stepAfter"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine
                x={selectedLabel}
                stroke="var(--color-foreground)"
                strokeWidth={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ul
          aria-label="Legenda do gráfico"
          className="flex flex-wrap gap-x-5 gap-y-1 text-sm"
        >
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-6 bg-primary" />O seu
            preço
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-6 border-t-2 border-dashed border-muted-foreground"
            />
            Quartos parecidos, a meio
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-6 rounded-sm bg-mint" />
            Onde está a maioria deles
          </li>
        </ul>
        <details className="group border-y">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-bold [&::-webkit-details-marker]:hidden">
            Ver os valores numa tabela
            <AltArrowDownIcon
              size={24}
              aria-hidden={true}
              className="shrink-0 group-open:rotate-180"
            />
          </summary>
          <div className="max-h-80 overflow-y-auto pb-4">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-1.5 pr-3">
                    Dia
                  </th>
                  <th scope="col" className="py-1.5 pr-3 text-right">
                    O seu preço
                  </th>
                  <th scope="col" className="py-1.5 pr-3 text-right">
                    A meio
                  </th>
                  <th scope="col" className="py-1.5 text-right">
                    A maioria
                  </th>
                </tr>
              </thead>
              <tbody>
                {chart.map((d) => (
                  <tr key={d.label} className="border-b">
                    <td className="py-1.5 pr-3">{d.label}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">
                      {d.price} €
                    </td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">
                      {d.median} €
                    </td>
                    <td className="py-1.5 text-right tabular-nums">
                      {d.band[0]}–{d.band[1]} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <ul
        aria-label="Legenda do calendário"
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
      >
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex size-6 items-center justify-center rounded ${CELL["market-above"]}`}
          >
            ↑
          </span>
          Quartos parecidos 10% ou mais acima de si: pode subir
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className={`size-6 rounded ${CELL.near}`} />
          Perto do mercado
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex size-6 items-center justify-center rounded ${CELL["house-above"]}`}
          >
            ↓
          </span>
          Está 10% ou mais acima do mercado
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-foreground"
          />
          Feriado ou data especial
        </li>
      </ul>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid grid-cols-7 gap-1">
          {["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((d) => (
            <span
              key={d}
              aria-hidden="true"
              className="text-center text-sm text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {cells.map((c, i) => (
            <button
              key={c.key}
              style={i === 0 ? { gridColumnStart: offset + 1 } : undefined}
              type="button"
              aria-label={c.label}
              aria-pressed={c.selected}
              onClick={() => onPick(c.key)}
              className={`relative flex min-h-12 flex-col items-start justify-between rounded-md px-1.5 py-1 text-left text-sm hover:outline-2 hover:outline-control ${CELL[c.state]} ${c.selected ? "outline-3 outline-offset-1 outline-foreground" : ""}`}
            >
              <span aria-hidden="true" className="leading-tight">
                {c.day}
              </span>
              <span
                aria-hidden="true"
                className="flex w-full items-center justify-between"
              >
                <span className="font-bold">{MARK[c.state]}</span>
                {c.event ? (
                  <span className="size-2 rounded-full bg-foreground" />
                ) : null}
              </span>
            </button>
          ))}
        </div>
        <div
          aria-live="polite"
          className="flex flex-col gap-2 rounded-panel border bg-background p-5 sm:p-6"
        >
          <h3 className="font-bold first-letter:uppercase">{detail.title}</h3>
          {detail.event ? (
            <span className="self-start rounded-full border border-control px-2.5 py-0.5 text-sm">
              {detail.event}
            </span>
          ) : null}
          <p>
            O seu preço: <strong>{detail.price}</strong>
          </p>
          <p>Quartos parecidos: {detail.market}</p>
          <p>Ocupação da zona: {detail.occupancy}</p>
          <p>Os seus quartos já reservados: {detail.booked}</p>
          <h4 className="mt-2 font-bold">Os 8 vizinhos nesta noite</h4>
          <ul className="flex flex-col divide-y text-sm">
            {detail.neighbours.map((n) => (
              <li key={n.name} className="flex justify-between gap-3 py-1.5">
                <span>
                  {n.name}{" "}
                  <span className="text-muted-foreground">{n.info}</span>
                </span>
                <span className="shrink-0 tabular-nums">{n.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
