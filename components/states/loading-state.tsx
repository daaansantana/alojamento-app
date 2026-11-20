import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <output aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">A carregar…</span>
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </output>
  );
}
