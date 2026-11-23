import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PainelView } from "@/types";

/** «Quanto pode ganhar a mais»: the KPI as an increase on the year, with how it was reached folded. */
export function YearGain({ gain }: { gain: PainelView["gain"] }) {
  return (
    <section
      aria-labelledby="ganho"
      className="flex flex-col gap-3 lg:rounded-xl lg:border lg:bg-card lg:p-6"
    >
      <h2 id="ganho" className="text-h2 font-bold">
        Quanto pode ganhar a mais
      </h2>
      <p className="text-kpi font-bold tabular-nums">{gain.likely}</p>
      <p>{gain.share}</p>
      <p className="text-muted-foreground">{gain.range}</p>
      <details className="group border-y">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-bold [&::-webkit-details-marker]:hidden">
          Como chegámos a este valor
          <AltArrowDownIcon
            size={24}
            aria-hidden={true}
            className="shrink-0 group-open:rotate-180"
          />
        </summary>
        <p className="pb-4 text-muted-foreground">{gain.assumption}</p>
      </details>
    </section>
  );
}

/** «O seu ano»: a card that leads to O ano, with the months drawn small. */
export function YearCard({
  text,
  bars,
}: {
  text: string;
  bars: { period: string; height: number; current: boolean }[];
}) {
  return (
    <Link
      href="/ano"
      className="group flex flex-col gap-2 rounded-xl border bg-card p-5 hover:border-control"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h2 font-bold group-hover:text-primary">
          O seu ano
        </h2>
        <AltArrowRightIcon
          size={24}
          aria-hidden={true}
          className="shrink-0 text-muted-foreground"
        />
      </div>
      <p className="text-muted-foreground">{text}</p>
      <div
        aria-hidden="true"
        className="mt-2 hidden h-16 items-end gap-1 lg:flex"
      >
        {bars.map((bar) => (
          <span
            key={bar.period}
            className={cn(
              "flex-1 rounded-t-sm",
              bar.current ? "bg-primary" : "bg-chart-bar",
            )}
            style={{ height: `${Math.max(8, bar.height * 100)}%` }}
          />
        ))}
      </div>
    </Link>
  );
}
