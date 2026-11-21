import type { PainelView } from "@/types";

/** «Como correu o ano»: the sentence and the three figures of the year. */
export function Resumo({
  summary,
  period,
}: {
  summary: PainelView["summary"];
  period: string;
}) {
  return (
    <section aria-labelledby="resumo" className="flex flex-col gap-4">
      <h2 id="resumo" className="text-xl font-semibold tracking-tight">
        Como correu o ano
      </h2>
      <p className="max-w-[60ch] text-lg leading-snug text-balance sm:text-2xl">
        {summary.sentence}
      </p>
      <dl
        aria-label={`O ano em números, ${period.charAt(0).toLowerCase()}${period.slice(1)}`}
        className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3"
      >
        {summary.figures.map((figure) => (
          <div
            key={figure.label}
            className="flex items-baseline gap-3 bg-background px-4 py-3 sm:flex-col sm:items-start sm:gap-1 sm:p-4"
          >
            <dt className="order-2 text-base leading-snug text-muted-foreground">
              {figure.label}
            </dt>
            <dd className="order-1 shrink-0 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
