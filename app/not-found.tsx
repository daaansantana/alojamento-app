import Link from "next/link";
import { EmptyState } from "@/components/states/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-6 pb-16 text-base leading-relaxed sm:px-6 sm:pt-10">
      <EmptyState message="Esta página não existe." />
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 self-center px-4 text-base",
        )}
      >
        Voltar à página inicial
      </Link>
    </main>
  );
}
