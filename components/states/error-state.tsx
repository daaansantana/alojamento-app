import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-4 text-base text-destructive"
    >
      <p>{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="h-11 border-control px-4 text-base text-foreground"
        >
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
