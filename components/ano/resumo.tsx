import type { PainelFigure } from "@/types";

/** The year in one sentence, then two figures, each with its sentence below. */
export function YearSummary({
  sentence,
  figures,
}: {
  sentence: string;
  figures: PainelFigure[];
}) {
  return (
    <section aria-label="O ano em números" className="flex flex-col gap-6">
      <p className="text-statement leading-snug font-bold text-balance">
        {sentence}
      </p>
      <dl className="flex flex-col divide-y border-y">
        {figures.map((figure) => (
          <div key={figure.label} className="flex flex-col py-4">
            {/* The label comes first for screen readers, the number first on screen. */}
            <dt className="order-2 text-muted-foreground">{figure.label}</dt>
            <dd className="order-1 text-figure leading-tight font-bold tabular-nums">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
