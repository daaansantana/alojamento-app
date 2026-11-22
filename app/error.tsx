"use client"; // Error boundaries must be Client Components

import { LogoVertical } from "@/components/marca/logo-vertical";
import { ErrorState } from "@/components/states/error-state";

export default function PageError({
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <LogoVertical />
      <ErrorState
        message="Não foi possível mostrar a página."
        onRetry={reset}
      />
    </div>
  );
}
