"use client";

import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { pct } from "@/lib/format";

/** «E se…?» with a step counter: −, the value, +, and the answer. */
export function StepWhatIf({
  title,
  question,
  value,
  min,
  max,
  step,
  onChange,
  answer,
}: {
  title: string;
  question: string;
  value: number; // whole percentages
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  answer: string;
}) {
  const button =
    "flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-14 border border-control bg-background hover:bg-muted aria-disabled:cursor-not-allowed aria-disabled:opacity-40";
  return (
    <section
      aria-labelledby="e-se-titulo"
      className="flex flex-col gap-4 rounded-panel bg-muted p-4 sm:p-6"
    >
      <h2 id="e-se-titulo" className="text-h2 font-bold">
        {title}
      </h2>
      <p id="e-se-pergunta" className="font-bold">
        {question}
      </p>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Menos"
          className={button}
          aria-disabled={value <= min}
          onClick={() => value > min && onChange(Math.max(min, value - step))}
        >
          <MinusIcon size={24} aria-hidden={true} />
        </button>
        <output
          aria-live="polite"
          aria-labelledby="e-se-pergunta"
          className="min-w-0 flex-1 text-center text-figure font-bold tabular-nums sm:flex-none sm:min-w-24 sm:text-kpi"
        >
          {pct(value / 100)}
        </output>
        <button
          type="button"
          aria-label="Mais"
          className={button}
          aria-disabled={value >= max}
          onClick={() => value < max && onChange(Math.min(max, value + step))}
        >
          <AddIcon size={24} aria-hidden={true} />
        </button>
      </div>
      <p aria-live="polite" className="text-lead font-bold">
        {answer}
      </p>
    </section>
  );
}
