import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";

/** While a screen has no data: the skeleton, or the error with a retry. */
export function ScreenState({
  failed,
  onRetry,
}: {
  failed: boolean;
  onRetry: () => void;
}) {
  return failed ? (
    <ErrorState
      message="Não foi possível carregar as reservas. Verifique a ligação à internet e tente de novo."
      onRetry={onRetry}
    />
  ) : (
    <LoadingState />
  );
}
