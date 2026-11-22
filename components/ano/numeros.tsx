"use client";

import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  type SankeyLinkProps,
  type SankeyNodeProps,
} from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { eur, int, monthName, monthShort, pct } from "@/lib/format";
import type {
  ChannelNet,
  ChannelTransition,
  RoomMonthOccupancy,
} from "@/types";

export type NumbersPart = "noite" | "mapa" | "regressos" | "fontes";

export interface SourceRow {
  name: string;
  value: number | string;
  kind: "share" | "eur" | "date";
  source: string;
}

// One colour, lighter to darker; at its darkest it still keeps dark text readable.
const mapShade = (occupancy: number) =>
  `color-mix(in oklch, var(--map) ${Math.round(8 + occupancy * 52)}%, white)`;

const CHANNEL: Record<string, string> = {
  Direto: "var(--channel-direct)",
  Booking: "var(--channel-booking)",
  Airbnb: "var(--channel-airbnb)",
};

const TRIGGER = "min-h-14 items-center py-3 text-left text-lg font-bold";

/** «Ver os números»: four folded parts with the numbers behind the screens. */
export function Numbers({
  open,
  onOpenChange,
  netByChannel,
  roomMonth,
  rooms,
  transitions,
  flowSentence,
  sources,
}: {
  open: NumbersPart[];
  onOpenChange: (open: NumbersPart[]) => void;
  netByChannel: ChannelNet[];
  roomMonth: RoomMonthOccupancy[];
  rooms: { roomId: number; name: string }[];
  transitions: ChannelTransition[];
  flowSentence: string;
  sources: SourceRow[];
}) {
  return (
    <section aria-labelledby="numeros" className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h2 id="numeros" className="text-h2 font-bold">
          Ver os números
        </h2>
        <p className="text-muted-foreground">
          As contas por trás das sugestões, fechadas até precisar delas.
        </p>
      </div>
      <Accordion
        multiple
        value={open}
        onValueChange={(value) => onOpenChange(value as NumbersPart[])}
        className="border-y"
      >
        <AccordionItem value="noite">
          <AccordionTrigger className={TRIGGER}>
            O que fica de cada noite, depois da comissão
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <NetPerNight rows={netByChannel} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mapa" id="mapa" className="scroll-mt-28">
          <AccordionTrigger className={TRIGGER}>
            O mapa das noites, quarto a quarto
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <OccupancyMap cells={roomMonth} rooms={rooms} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="regressos">
          <AccordionTrigger className={TRIGGER}>
            Quem volta, e por onde
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <ChannelFlow rows={transitions} sentence={flowSentence} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fontes">
          <AccordionTrigger className={TRIGGER}>
            De onde vêm os números
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <Sources rows={sources} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

interface FlowNode {
  name: string;
  channel: string;
  side: "first" | "back";
  value?: number;
}

/** A Sankey from the channel of the first stay to the channel of each return. */
function ChannelFlow({
  rows,
  sentence,
}: {
  rows: ChannelTransition[];
  sentence: string;
}) {
  const channels = [...new Set(rows.flatMap((r) => [r.from, r.to]))];
  const nodes: FlowNode[] = [
    ...channels.map((c) => ({ name: c, channel: c, side: "first" as const })),
    ...channels.map((c) => ({ name: c, channel: c, side: "back" as const })),
  ];
  const links = rows
    .filter((r) => r.stays > 0)
    .map((r) => ({
      source: channels.indexOf(r.from),
      target: channels.length + channels.indexOf(r.to),
      value: r.stays,
    }));
  const stays = (from: string, to: string) =>
    rows.find((r) => r.from === from && r.to === to)?.stays ?? 0;

  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="max-w-[65ch] font-bold">{sentence}</p>
      <div
        aria-hidden="true"
        className="flex justify-between text-muted-foreground"
      >
        <span>Primeira vez</span>
        <span>Voltou por</span>
      </div>
      <div role="img" aria-label={`Fluxo dos regressos por canal. ${sentence}`}>
        <div aria-hidden="true" className="h-72 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 320, height: 288 }}
          >
            <Sankey
              data={{ nodes, links }}
              nodePadding={28}
              nodeWidth={12}
              iterations={0}
              margin={{ top: 8, right: 104, bottom: 8, left: 104 }}
              node={(props: SankeyNodeProps) => {
                const payload = props.payload as unknown as FlowNode & {
                  value: number;
                };
                const { x, y, width, height } = props;
                const first = payload.side === "first";
                return (
                  <Layer>
                    <Rectangle
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={CHANNEL[payload.channel]}
                    />
                    <text
                      x={first ? x - 8 : x + width + 8}
                      y={y + height / 2}
                      textAnchor={first ? "end" : "start"}
                      dominantBaseline="middle"
                      fontSize={16}
                      className="fill-foreground"
                    >
                      {payload.name} {payload.value}
                    </text>
                  </Layer>
                );
              }}
              link={(props: SankeyLinkProps) => {
                const source = props.payload.source as unknown as FlowNode;
                const {
                  sourceX,
                  targetX,
                  sourceY,
                  targetY,
                  sourceControlX,
                  targetControlX,
                  linkWidth,
                } = props;
                return (
                  <path
                    d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
                    fill="none"
                    stroke={CHANNEL[source.channel]}
                    strokeOpacity={0.35}
                    strokeWidth={Math.max(1, linkWidth)}
                  />
                );
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>
      <div className="sr-only">
        <table>
          <caption>Canal da primeira estada e canal de cada regresso</caption>
          <thead>
            <tr>
              <th scope="col">Primeira vez</th>
              {channels.map((to) => (
                <th key={to} scope="col">
                  Voltou por {to}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((from) => (
              <tr key={from}>
                <th scope="row">{from}</th>
                {channels.map((to) => (
                  <td key={to}>{int(stays(from, to))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NetPerNight({ rows }: { rows: ChannelNet[] }) {
  const gross = (r: ChannelNet) =>
    r.nightsSold ? r.revenue / r.nightsSold : 0;
  const max = Math.max(...rows.map(gross), 1);
  const lowest = rows.reduce<ChannelNet | null>(
    (low, r) => (low === null || r.netAdr < low.netAdr ? r : low),
    null,
  );
  const highest = rows.reduce<ChannelNet | null>(
    (high, r) => (high === null || r.netAdr > high.netAdr ? r : high),
    null,
  );
  return (
    <div className="flex flex-col gap-4 pb-2">
      {highest && lowest && (
        <p className="max-w-[65ch]">
          Por cada noite, fica com {eur(highest.netAdr, 2)} quando a reserva vem
          pelo canal {highest.channel} e com {eur(lowest.netAdr, 2)} quando vem
          pelo {lowest.channel}, depois da comissão.
        </p>
      )}
      <p aria-hidden="true" className="flex flex-wrap gap-x-6 gap-y-1">
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-sm bg-primary" />O que fica
        </span>
        <span className="flex items-center gap-2">
          <span className="size-4 rounded-sm bg-commission" />
          Comissão
        </span>
      </p>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.channel} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="font-bold">{row.channel}</span>
              <span className="tabular-nums">
                fica com {eur(row.netAdr, 2)}{" "}
                <span className="text-muted-foreground">
                  (comissão de {pct(row.commissionRate, 1)})
                </span>
              </span>
            </div>
            <div
              aria-hidden="true"
              className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-primary"
                style={{ width: `${(row.netAdr / max) * 100}%` }}
              />
              <div
                className="h-full bg-commission"
                style={{ width: `${((gross(row) - row.netAdr) / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OccupancyMap({
  cells,
  rooms,
}: {
  cells: RoomMonthOccupancy[];
  rooms: { roomId: number; name: string }[];
}) {
  const months = [...new Set(cells.map((c) => c.month))];
  const byKey = new Map(cells.map((c) => [`${c.roomId} ${c.month}`, c]));
  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="max-w-[65ch]">
        Cada quadrado é um quarto num mês. Quanto mais escuro, mais noites teve
        hóspedes; a percentagem está escrita em cada um.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 text-sm tabular-nums">
          <caption className="sr-only">
            Parte das noites com hóspedes, por quarto e por mês
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-background" />
              {months.map((month) => (
                <th
                  key={month}
                  scope="col"
                  className="px-1 py-1 font-medium text-muted-foreground"
                >
                  {monthShort(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.roomId}>
                <th
                  scope="row"
                  className="sticky left-0 max-w-32 bg-background py-1 pr-2 text-left text-sm font-medium"
                >
                  {room.name}
                </th>
                {months.map((month) => {
                  const cell = byKey.get(`${room.roomId} ${month}`);
                  return (
                    <td
                      key={month}
                      className="min-w-10 rounded-sm px-1 py-2 text-center text-foreground"
                      style={{
                        backgroundColor: cell
                          ? mapShade(cell.occupancy)
                          : undefined,
                      }}
                    >
                      {cell ? pct(cell.occupancy) : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function sourceValue(row: SourceRow): string {
  if (row.kind === "share" && typeof row.value === "number")
    return pct(row.value, 1);
  if (row.kind === "eur" && typeof row.value === "number")
    return eur(row.value, 2);
  const [year, month, day] = String(row.value).split("-");
  return `${Number(day)} de ${monthName(Number(month))} de ${year}`;
}

function Sources({ rows }: { rows: SourceRow[] }) {
  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="max-w-[65ch]">
        Os números do mercado com que a casa é comparada, e de onde vêm.
      </p>
      <dl className="flex flex-col divide-y">
        {rows.map((row) => (
          <div key={row.name} className="flex flex-col gap-0.5 py-3">
            <dt className="font-medium">{row.name}</dt>
            <dd className="tabular-nums">{sourceValue(row)}</dd>
            <dd className="text-muted-foreground">{row.source}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
