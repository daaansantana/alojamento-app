"use client";

import { Bar, BarChart, LabelList, Rectangle, XAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { MonthLevel, PainelMonth, PainelView } from "@/types";

export interface MonthBar extends PainelMonth {
  occupancy: number; // 0 to 1, the bar's height
  tone: MonthLevel; // picks the colour; the word is in `level`
}

// Each colour has a contrast of 3:1 or more against the white background.
const TONE: Record<MonthLevel, string> = {
  hot: "#c2410c",
  normal: "#64748b",
  cold: "#0369a1",
};
const LEGEND: { tone: MonthLevel; label: string }[] = [
  { tone: "hot", label: "mais procurado" },
  { tone: "normal", label: "normal" },
  { tone: "cold", label: "menos procurado" },
];

const config = {
  occupancy: { label: "Noites com hóspedes" },
} satisfies ChartConfig;

/** «O ano, mês a mês»: one bar per month, coloured by demand. */
export function Meses({
  months,
  bars,
}: {
  months: Pick<PainelView["months"], "best" | "price">;
  bars: MonthBar[];
}) {
  return (
    <section aria-labelledby="meses" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="meses" className="text-xl font-semibold tracking-tight">
          O ano, mês a mês
        </h2>
        <p className="text-muted-foreground">
          A percentagem é a parte das noites com hóspedes.
        </p>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda">
        {LEGEND.map((item) => (
          <li key={item.tone} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3.5 rounded-sm"
              style={{ backgroundColor: TONE[item.tone] }}
            />
            {item.label}
          </li>
        ))}
      </ul>

      <div
        role="img"
        aria-label={`Gráfico das noites com hóspedes em cada mês. ${months.best}`}
      >
        <ChartContainer
          config={config}
          className="aspect-auto h-60 w-full text-sm"
          aria-hidden="true"
        >
          <BarChart
            data={bars}
            margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
            accessibilityLayer={false}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={8}
              tick={{ fontSize: 13 }}
            />
            <Bar
              dataKey="occupancy"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              shape={(
                props: React.ComponentProps<typeof Rectangle> & {
                  payload?: MonthBar;
                },
              ) => (
                <Rectangle
                  {...props}
                  fill={props.payload ? TONE[props.payload.tone] : undefined}
                />
              )}
            >
              <LabelList
                dataKey="percent"
                position="top"
                offset={6}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <dl className="flex flex-col gap-1">
        {LEGEND.filter((item) => item.tone !== "normal").map((item) => {
          const names = bars
            .filter((bar) => bar.tone === item.tone)
            .map((bar) => bar.label);
          if (names.length === 0) return null;
          return (
            <div key={item.tone} className="flex flex-wrap gap-x-2">
              <dt className="font-medium">
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}:
              </dt>
              <dd>{names.join(", ")}</dd>
            </div>
          );
        })}
      </dl>

      <ul className="sr-only">
        {bars.map((bar) => (
          <li key={bar.period}>
            {bar.label}: {bar.percent}, {bar.level}
          </li>
        ))}
      </ul>

      <p className="max-w-[65ch]">{months.best}</p>
      <p className="max-w-[65ch] text-muted-foreground">{months.price}</p>
    </section>
  );
}
