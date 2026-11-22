import Link from "next/link";
import { LogoVertical } from "@/components/marca/logo-vertical";
import { EmptyState } from "@/components/states/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="sr-only">Página não encontrada</h1>
      <LogoVertical />
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
    </div>
  );
}
