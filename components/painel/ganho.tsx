import type { PainelView } from "@/types";

/** «Quanto pode ganhar por ano»: the KPI. */
export function Ganho({ gain }: { gain: PainelView["gain"] }) {
  return (
    <section aria-labelledby="ganho" className="flex flex-col gap-3">
      <h2 id="ganho" className="text-xl font-semibold tracking-tight">
        Quanto pode ganhar por ano
      </h2>
      <p className="text-4xl font-semibold tracking-tight text-balance tabular-nums sm:text-5xl">
        {gain.likely}
      </p>
      <p className="max-w-[65ch] text-lg">{gain.range}</p>
      <p className="max-w-[65ch] text-muted-foreground">{gain.assumption}</p>
    </section>
  );
}
