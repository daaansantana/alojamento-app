"use client";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { eur, int, pct } from "@/lib/format";
import type {
  DirectBookingResult,
  PricingResult,
  WinterCampaignResult,
} from "@/types";

export type Question = "summer" | "winter" | "direct";

export interface SliderRange {
  min: number; // whole percentages
  max: number;
  step: number;
}

const QUESTIONS: { id: Question; label: string; slider: string }[] = [
  {
    id: "summer",
    label: "Subir o preço no verão",
    slider: "Quanto quer subir em julho e agosto?",
  },
  {
    id: "winter",
    label: "Convidar quem volta no inverno",
    slider: "Que parte dos hóspedes de inverno volta?",
  },
  {
    id: "direct",
    label: "Trazer os regressos para reserva direta",
    slider: "Que parte de quem volta pelas plataformas reserva diretamente?",
  },
];

// Makes the thumb and its touch area bigger without editing components/ui.
const SLIDER =
  "py-3 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:after:-inset-2.5";

/** «E se…?»: one question at a time, one value to move, the answer in euros. */
export function Simular({
  question,
  onQuestionChange,
  values,
  onValueChange,
  ranges,
  onReset,
  discounts,
  pricing,
  winter,
  direct,
}: {
  question: Question;
  onQuestionChange: (question: Question) => void;
  values: Record<Question, number>; // whole percentages
  onValueChange: (question: Question, value: number) => void;
  ranges: Record<Question, SliderRange>;
  onReset: () => void;
  discounts: { winter: number; direct: number };
  pricing: PricingResult | null;
  winter: WinterCampaignResult | null;
  direct: DirectBookingResult | null;
}) {
  const current = QUESTIONS.find((q) => q.id === question) ?? QUESTIONS[0];
  const value = values[question];
  const range = ranges[question];
  const share = value / 100;

  let answer: ReactNode = null;
  if (question === "summer" && pricing) {
    const nights = Math.floor(
      pricing.nightsSold - pricing.nightsForSameRevenue,
    );
    answer = (
      <>
        <p>
          Com mais {pct(share)} em julho e agosto, nas mesmas noites, ganha mais{" "}
          <Amount>{eur(pricing.newRevenue - pricing.baseRevenue)}</Amount>.
        </p>
        {nights > 0 && (
          <p>
            Também pode vender até {int(nights)} noites a menos e ganhar o mesmo
            que hoje.
          </p>
        )}
      </>
    );
  } else if (question === "winter" && winter) {
    answer = (
      <p>
        Se {pct(share)} dos {int(winter.guests)} hóspedes de inverno voltarem,
        com {pct(discounts.winter)} de desconto, são cerca de{" "}
        {int(winter.extraStays)} estadas e mais{" "}
        <Amount>{eur(winter.extraRevenue)}</Amount>.
      </p>
    );
  } else if (question === "direct" && direct) {
    answer = (
      <p>
        Se {pct(share)} de quem volta pelas plataformas passar a reservar
        diretamente, com {pct(discounts.direct)} de desconto, fica com mais{" "}
        <Amount>{eur(direct.yearlyGain)}</Amount> por ano.
      </p>
    );
  }

  return (
    <section aria-labelledby="simular-titulo">
      <details
        id="simular"
        className="group scroll-mt-6 rounded-xl border bg-card"
      >
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-3 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col">
            <h2
              id="simular-titulo"
              className="text-xl font-semibold tracking-tight"
            >
              E se…?
            </h2>
            <span className="text-muted-foreground">
              Escolha uma pergunta e mexa num só valor.
            </span>
          </div>
          <AltArrowDownIcon
            size={24}
            aria-hidden="true"
            className="shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="flex flex-col gap-6 border-t px-5 pt-5 pb-6">
          <ToggleGroup
            aria-label="Pergunta"
            value={[question]}
            onValueChange={(group) => {
              const next = group[0] as Question | undefined;
              if (next) onQuestionChange(next);
            }}
            variant="outline"
            className="w-full flex-col items-stretch gap-2 sm:flex-row"
          >
            {QUESTIONS.map((q) => (
              <ToggleGroupItem
                key={q.id}
                value={q.id}
                className="h-auto min-h-11 flex-1 justify-start rounded-lg! border! px-4 py-2 text-left text-base whitespace-normal aria-pressed:border-primary! aria-pressed:bg-primary aria-pressed:text-primary-foreground data-[state=on]:bg-primary"
              >
                {q.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span id="simular-valor">{current.slider}</span>
              <span className="text-lg font-semibold tabular-nums">
                {pct(share)}
              </span>
            </div>
            <Slider
              aria-labelledby="simular-valor"
              value={value}
              min={range.min}
              max={range.max}
              step={range.step}
              onValueChange={(next) => {
                if (typeof next === "number") onValueChange(question, next);
              }}
              className={SLIDER}
            />
            <div
              aria-hidden="true"
              className="flex justify-between text-sm text-muted-foreground tabular-nums"
            >
              <span>{pct(range.min / 100)}</span>
              <span>{pct(range.max / 100)}</span>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex flex-col gap-1 rounded-lg bg-muted p-4 text-lg"
          >
            {answer}
          </div>

          <Button
            variant="outline"
            onClick={onReset}
            className="h-11 gap-2 self-start px-4 text-base"
          >
            <RestartIcon size={20} aria-hidden="true" />
            Repor
          </Button>
        </div>
      </details>
    </section>
  );
}

function Amount({ children }: { children: ReactNode }) {
  return (
    <strong className="text-2xl font-semibold tabular-nums">{children}</strong>
  );
}
