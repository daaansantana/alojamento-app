export function ErrorState({
  message = "Não foi possível carregar os dados.",
}: {
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
