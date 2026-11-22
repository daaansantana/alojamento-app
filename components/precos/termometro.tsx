"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Tick {
  label: string; // "60 €"
  at: number; // 0 to 1 along the ruler
}

export interface ThermometerMonth {
  period: string;
  name: string; // "novembro"
  short: string; // "nov"
  house: string; // "104 €"
  market: string; // "96 €"
  difference: string; // "+8 €"
  houseAt: number; // 0 to 1
  marketAt: number;
  label: string; // the whole row, for screen readers
  substitute: boolean;
  marketYear: string | null; // "2025" when the market value is from the year before
}

const HOUSE = "rounded-full bg-primary ring-2 ring-background";
const MARKET = "rounded-full border-foreground bg-background";

/** The two markers on one ruler: a filled circle for the house, a ring for the market. */
function Ruler({
  houseAt,
  marketAt,
  size,
}: {
  houseAt: number;
  marketAt: number;
  size: "large" | "small";
}) {
  const from = Math.min(houseAt, marketAt);
  const to = Math.max(houseAt, marketAt);
  // The ring is a little larger, so a dot on top of it still shows both.
  const dot = size === "large" ? "size-6" : "size-4";
  const ring =
    size === "large" ? "size-8 border-[3px]" : "size-6 border-[2.5px]";
  return (
    <div aria-hidden="true" className="relative h-8 w-full">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full bg-control",
          size === "large" ? "h-2" : "h-1.5",
        )}
        style={{ left: `${from * 100}%`, width: `${(to - from) * 100}%` }}
      />
      <span
        className={cn(
          "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
          MARKET,
          ring,
        )}
        style={{ left: `${marketAt * 100}%` }}
      />
      <span
        className={cn(
          "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
          HOUSE,
          dot,
        )}
        style={{ left: `${houseAt * 100}%` }}
      />
    </div>
  );
}

/** The axis under a ruler, on one line; the first and last marks flush to the ends. */
function Axis({ ticks }: { ticks: Tick[] }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-6 text-sm text-muted-foreground tabular-nums"
    >
      {ticks.map((tick, i) => (
        <span
          key={tick.label}
          className={cn(
            "absolute top-0 whitespace-nowrap",
            i === 0
              ? "translate-x-0"
              : i === ticks.length - 1
                ? "-translate-x-full"
                : "-translate-x-1/2",
          )}
          style={{ left: `${tick.at * 100}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

export function Legend({ market }: { market: string }) {
  return (
    <p className="flex flex-wrap gap-x-6 gap-y-1">
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={cn(HOUSE, "size-4 ring-0")} />A sua
        casa
      </span>
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(MARKET, "size-4 border-[2.5px]")}
        />
        {market}
      </span>
    </p>
  );
}

/** The month in focus: both prices large, on the ruler, and the sentence. */
export function FocusMonth({
  month,
  ticks,
  sentence,
}: {
  month: ThermometerMonth;
  ticks: Tick[];
  sentence: string;
}) {
  return (
    <section
      aria-labelledby="mes-em-foco"
      className="flex flex-col gap-4 rounded-panel bg-accent p-5 sm:p-7"
    >
      <h2 id="mes-em-foco" className="text-h2 font-bold">
        Em {month.name}
      </h2>
      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span aria-hidden="true" className={cn(HOUSE, "size-4 ring-0")} />A
            sua casa
          </dt>
          <dd className="text-[1.889rem] font-bold leading-tight tabular-nums">
            {month.house}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(MARKET, "size-4 border-[2.5px]")}
            />
            Mercado{month.marketYear && ` (${month.marketYear})`}
          </dt>
          <dd className="text-[1.889rem] font-bold leading-tight tabular-nums">
            {month.market}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-1">
        <Ruler houseAt={month.houseAt} marketAt={month.marketAt} size="large" />
        <Axis ticks={ticks} />
      </div>
      <p aria-live="polite" className="text-lead font-bold">
        {sentence}
      </p>
    </section>
  );
}

/** «Mês a mês»: one button per month, the same ruler with smaller markers. */
export function MonthByMonth({
  months,
  selected,
  onSelect,
  ticks,
  marketLegend,
  substituteNote,
}: {
  months: ThermometerMonth[];
  selected: string;
  onSelect: (period: string) => void;
  ticks: Tick[];
  marketLegend: string;
  substituteNote: string | null;
}) {
  const grid =
    "grid grid-cols-[3rem_1fr] items-center gap-x-4 lg:grid-cols-[3rem_1fr_5.5rem_5.5rem]";
  return (
    <section aria-labelledby="mes-a-mes" className="flex flex-col gap-4">
      <h2 id="mes-a-mes" className="text-h2 font-bold">
        Mês a mês
      </h2>
      <Legend market={marketLegend} />
      <div className="flex flex-col">
        <div
          aria-hidden="true"
          className={cn(grid, "hidden px-3 pb-1 text-muted-foreground lg:grid")}
        >
          <span />
          <span />
          <span className="text-right">A sua casa</span>
          <span className="text-right">Mercado</span>
        </div>
        <ul className="flex flex-col">
          {months.map((m) => {
            const active = m.period === selected;
            return (
              <li key={m.period}>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={m.label}
                  onClick={() => onSelect(m.period)}
                  className={cn(
                    grid,
                    "min-h-12 w-full rounded-xl px-3 text-left hover:bg-muted",
                    active && "bg-accent font-bold hover:bg-accent",
                  )}
                >
                  <span>
                    {m.short}
                    {m.substitute && "*"}
                  </span>
                  <Ruler
                    houseAt={m.houseAt}
                    marketAt={m.marketAt}
                    size="small"
                  />
                  <span className="hidden text-right tabular-nums lg:block">
                    {m.house}
                  </span>
                  <span className="hidden text-right tabular-nums lg:block">
                    {m.market}
                    {m.substitute && "*"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className={cn(grid, "px-3 pt-1")}>
          <span />
          <Axis ticks={ticks} />
        </div>
        {substituteNote && (
          <p className="pt-3 text-muted-foreground">* {substituteNote}</p>
        )}
      </div>
      <details className="group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 font-bold text-primary underline underline-offset-4 [&::-webkit-details-marker]:hidden">
          Ver os valores numa tabela
          <AltArrowDownIcon
            size={22}
            aria-hidden={true}
            className="shrink-0 group-open:rotate-180"
          />
        </summary>
        <Table className="text-base">
          <TableCaption className="text-left text-sm">
            O preço médio por noite, em cada mês.
            {substituteNote && ` * ${substituteNote}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base text-foreground">Mês</TableHead>
              <TableHead className="text-right text-base text-foreground">
                A sua casa
              </TableHead>
              <TableHead className="text-right text-base text-foreground">
                Mercado
              </TableHead>
              <TableHead className="text-right text-base text-foreground">
                Diferença
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map((m) => (
              <TableRow key={m.period}>
                <TableCell className="capitalize">{m.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.house}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.market}
                  {m.substitute && "*"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.difference}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </details>
    </section>
  );
}
