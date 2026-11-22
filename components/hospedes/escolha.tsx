"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface Choice<T extends string> {
  value: T;
  label: string;
  detail?: string; // a second line, e.g. "49 hóspedes"
}

/** Two or three large buttons to pick one, with `aria-pressed`. */
export function Choices<T extends string>({
  label,
  value,
  onChange,
  choices,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  className?: string;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(group) => {
        const next = group[0] as T | undefined;
        if (next) onChange(next);
      }}
      className={cn(
        "grid w-full auto-cols-fr grid-flow-col gap-1 rounded-xl border border-control bg-background p-1",
        className,
      )}
    >
      {choices.map((choice) => (
        <ToggleGroupItem
          key={choice.value}
          value={choice.value}
          className="h-auto min-h-12 flex-col gap-0 rounded-lg! px-3 py-2 text-base leading-snug whitespace-normal hover:bg-muted aria-pressed:bg-primary aria-pressed:text-primary-foreground data-[state=on]:bg-primary"
        >
          <span className="font-bold">{choice.label}</span>
          {choice.detail && <span className="text-sm">{choice.detail}</span>}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
