"use client"; // Error boundaries must be Client Components

import { ErrorState } from "@/components/states/error-state";

export default function PageError({
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 pt-6 pb-16 text-base leading-relaxed sm:px-6 sm:pt-10">
      <ErrorState
        message="Não foi possível mostrar a página."
        onRetry={reset}
      />
    </main>
  );
}
