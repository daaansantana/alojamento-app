"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { CONTAINER, Header } from "@/components/shell/header";
import { BottomNav } from "@/components/shell/nav";
import { useTextSize } from "@/hooks/useTextSize";

/** The frame of every screen: header, content and the navigation. */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { textSize, setTextSize } = useTextSize();

  useEffect(() => {
    const html = document.documentElement;
    if (textSize === "maior") html.dataset.letra = "maior";
    else delete html.dataset.letra;
  }, [textSize]);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-background focus:px-4 focus:py-3"
      >
        Saltar para o conteúdo
      </a>
      <Header
        pathname={pathname}
        largeText={textSize === "maior"}
        onLargeTextChange={(large) => setTextSize(large ? "maior" : "normal")}
      />
      <main
        id="conteudo"
        className={`${CONTAINER} flex flex-1 flex-col pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pt-10 lg:pb-16`}
      >
        {children}
      </main>
      <BottomNav pathname={pathname} />
    </>
  );
}
