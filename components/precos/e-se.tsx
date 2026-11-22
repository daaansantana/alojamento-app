"use client";

import { SnowflakeIcon } from "@solar-icons/react/linear/snowflake";
import Link from "next/link";
import { Choices } from "@/components/comum/escolha";

export type PriceQuestion = "verao" | "inverno" | "quarto";

/** «E se mudar o preço?»: three questions, each answered with buttons. */
export function PriceWhatIf({
  question,
  onQuestionChange,
  prompt,
  options,
  value,
  onValueChange,
  answer,
  detail,
  link,
  together,
}: {
  question: PriceQuestion;
  onQuestionChange: (question: PriceQuestion) => void;
  prompt: string;
  options: { value: number; label: string }[];
  value: number;
  onValueChange: (value: number) => void;
  answer: string;
  detail?: string;
  link?: { href: string; label: string };
  together: string;
}) {
  return (
    <section
      id="e-se"
      aria-labelledby="e-se-titulo"
      className="flex scroll-mt-28 flex-col gap-5 rounded-panel bg-muted p-5 sm:p-6"
    >
      <h2 id="e-se-titulo" className="text-h2 font-bold">
        E se mudar o preço?
      </h2>
      <Choices
        label="Pergunta"
        value={question}
        onChange={onQuestionChange}
        choices={[
          { value: "verao", label: "Verão" },
          { value: "inverno", label: "Inverno" },
          { value: "quarto", label: "Quarto ao mês" },
        ]}
      />
      <div className="flex flex-col gap-3">
        <p className="font-bold">{prompt}</p>
        <Choices
          label={prompt}
          value={String(value)}
          onChange={(v) => onValueChange(Number(v))}
          choices={options.map((o) => ({
            value: String(o.value),
            label: o.label,
          }))}
          className="tabular-nums"
        />
      </div>
      <div aria-live="polite" className="flex flex-col gap-2">
        <p className="text-lead font-bold">{answer}</p>
        {detail && <p className="text-muted-foreground">{detail}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="self-start font-bold text-primary underline underline-offset-4"
        >
          {link.label}
        </Link>
      )}
      <p className="flex gap-3 border-t pt-4 font-bold">
        <SnowflakeIcon
          size={24}
          aria-hidden={true}
          className="mt-0.5 shrink-0 text-primary"
        />
        {together}
      </p>
    </section>
  );
}
