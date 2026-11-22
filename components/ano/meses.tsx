"use client";

import Link from "next/link";
import { Bar, BarChart, LabelList, Rectangle, XAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

export interface YearBar {
  period: string;
  label: string; // "ago"
  percent: string; // "65%"
  occupancy: number; // 0 to 1
  name: string; // "agosto", for the hidden list
  best: boolean;
  shown: boolean; // the best, the worst and the month in focus carry their number
}

const config = {
  occupancy: { label: "Noites com hóspedes" },
} satisfies ChartConfig;

/** «O ano, mês a mês»: sage bars, the best month in nexo green. */
export function YearChart({
  bars,
  summary,
  levels,
  price,
  market,
}: {
  bars: YearBar[];
  summary: string; // for the chart's aria-label
  levels: string;
  price: string;
  market: string | null;
}) {
  return (
    <section aria-labelledby="meses" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="meses" className="text-h2 font-bold">
          O ano, mês a mês
        </h2>
        <p className="text-muted-foreground">
          A percentagem é a parte das noites com hóspedes.
        </p>
      </div>
      <div
        role="img"
        aria-label={`Gráfico das noites com hóspedes em cada mês. ${summary}`}
      >
        <ChartContainer
          config={config}
          // Phones: 15 px month names, so the 12 stand apart.
          className="aspect-auto h-64 w-full text-base max-sm:[&_.recharts-cartesian-axis-tick_text]:text-[15px]"
          aria-hidden="true"
        >
          <BarChart
            data={bars}
            margin={{ top: 30, right: 4, bottom: 0, left: 4 }}
            barCategoryGap="14%"
            accessibilityLayer={false}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={8}
              tick={{ fontSize: 16 }}
            />
            <Bar
              dataKey="occupancy"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              shape={(
                props: React.ComponentProps<typeof Rectangle> & {
                  payload?: YearBar;
                },
              ) => (
                <Rectangle
                  {...props}
                  fill={
                    props.payload?.best ? "var(--primary)" : "var(--chart-bar)"
                  }
                />
              )}
            >
              <LabelList
                dataKey="percent"
                position="top"
                offset={8}
                content={(props) => {
                  const { x, y, width, index, value } = props as {
                    x: number;
                    y: number;
                    width: number;
                    index: number;
                    value: string;
                  };
                  if (!bars[index]?.shown) return null;
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 8}
                      textAnchor="middle"
                      className="fill-foreground font-bold"
                      fontSize={16}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <ul className="sr-only">
        {bars.map((bar) => (
          <li key={bar.period}>
            {bar.name}: {bar.percent}
          </li>
        ))}
      </ul>
      <p>{levels}</p>
      <p className="text-muted-foreground">{price}</p>
      {market && (
        <p>
          {market}{" "}
          <Link
            href="/precos"
            className="font-bold text-primary underline underline-offset-4"
          >
            Ver os preços
          </Link>
        </p>
      )}
    </section>
  );
}
