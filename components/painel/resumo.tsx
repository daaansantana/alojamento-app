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
    <section aria-labelledby="resumo" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="resumo" className="text-xl font-semibold tracking-tight">
          Como correu o ano
        </h2>
        <p className="text-muted-foreground">{period}</p>
      </div>
      <p className="max-w-[60ch] text-xl leading-snug text-balance sm:text-2xl">
        {summary.sentence}
      </p>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        {summary.figures.map((figure) => (
          <div
            key={figure.label}
            className="flex flex-col gap-1 bg-background p-4"
          >
            <dt className="order-2 text-base leading-snug text-muted-foreground">
              {figure.label}
            </dt>
            <dd className="order-1 text-3xl font-semibold tracking-tight tabular-nums">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
