"use client"; // Error boundaries must be Client Components

import { ErrorState } from "@/components/states/error-state";

export default function PageError({
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <ErrorState message="Não foi possível mostrar a página." onRetry={reset} />
  );
}
