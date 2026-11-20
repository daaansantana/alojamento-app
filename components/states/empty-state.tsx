export function EmptyState({
  message = "Sem resultados para mostrar.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
