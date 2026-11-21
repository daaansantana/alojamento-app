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

export type DetailPart = "noite" | "mapa" | "regressos" | "fontes";

export interface SourceRow {
  name: string;
  value: number | string;
  kind: "share" | "eur" | "date";
  source: string;
}

// One colour, lighter to darker; at its darkest it still keeps dark text readable.
const MAP_COLOUR = "#0369a1";
const mapShade = (occupancy: number) =>
  `color-mix(in oklch, ${MAP_COLOUR} ${Math.round(8 + occupancy * 62)}%, white)`;

const TRIGGER = "min-h-14 items-center py-3 text-left text-lg font-medium";

/** «Ver os números»: four folded parts with the numbers behind the page. */
export function Detalhes({
  open,
  onOpenChange,
  netByChannel,
  roomMonth,
  rooms,
  transitions,
  sources,
}: {
  open: DetailPart[];
  onOpenChange: (open: DetailPart[]) => void;
  netByChannel: ChannelNet[];
  roomMonth: RoomMonthOccupancy[];
  rooms: { roomId: number; name: string }[];
  transitions: ChannelTransition[];
  sources: SourceRow[];
}) {
  return (
    <section
      id="detalhes"
      aria-labelledby="detalhes-titulo"
      className="flex scroll-mt-6 flex-col gap-2"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="detalhes-titulo"
          className="text-xl font-semibold tracking-tight"
        >
          Ver os números
        </h2>
        <p className="text-muted-foreground">
          As contas por trás das sugestões, fechadas até precisar delas.
        </p>
      </div>
      <Accordion
        multiple
        value={open}
        onValueChange={(value) => onOpenChange(value as DetailPart[])}
        className="border-y"
      >
        <AccordionItem value="noite">
          <AccordionTrigger className={TRIGGER}>
            O que fica de cada noite depois da comissão
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <NetPerNight rows={netByChannel} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mapa">
          <AccordionTrigger className={TRIGGER}>
            Que quartos e meses ficaram vazios
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <OccupancyMap cells={roomMonth} rooms={rooms} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="regressos">
          <AccordionTrigger className={TRIGGER}>
            Por onde reservam os que voltam
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <Transitions rows={transitions} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fontes">
          <AccordionTrigger className={TRIGGER}>Fontes</AccordionTrigger>
          <AccordionContent className="text-base">
            <Sources rows={sources} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function NetPerNight({ rows }: { rows: ChannelNet[] }) {
  const max = Math.max(...rows.map((r) => r.netAdr), 1);
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
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.channel} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{row.channel}</span>
              <span className="tabular-nums">
                {eur(row.netAdr, 2)}{" "}
                <span className="text-muted-foreground">
                  · comissão {pct(row.commissionRate, 1)}
                </span>
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${(row.netAdr / max) * 100}%` }}
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

function Transitions({ rows }: { rows: ChannelTransition[] }) {
  const channels = [...new Set(rows.flatMap((r) => [r.from, r.to]))];
  const stays = (from: string, to: string) =>
    rows.find((r) => r.from === from && r.to === to)?.stays ?? 0;
  const total = rows.reduce((sum, r) => sum + r.stays, 0);
  const same = rows
    .filter((r) => r.from === r.to)
    .reduce((sum, r) => sum + r.stays, 0);
  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="max-w-[65ch]">
        De {int(total)} regressos, {int(same)} usaram o mesmo canal da primeira
        vez. Quem volta não fica preso a um canal.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left tabular-nums">
          <caption className="sr-only">
            Canal da primeira estada e canal de cada regresso
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 pr-3 font-medium">
                Primeira vez
              </th>
              {channels.map((to) => (
                <th
                  key={to}
                  scope="col"
                  className="px-3 py-2 text-right font-medium"
                >
                  Voltou por {to}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((from) => (
              <tr key={from} className="border-b last:border-b-0">
                <th scope="row" className="py-2 pr-3 font-medium">
                  {from}
                </th>
                {channels.map((to) => (
                  <td key={to} className="px-3 py-2 text-right">
                    {int(stays(from, to))}
                  </td>
                ))}
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
