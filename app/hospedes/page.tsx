"use client";

import { useState } from "react";
import { Contactos } from "@/components/painel/contactos";
import { useData } from "@/hooks/useData";
import { usePainel } from "@/hooks/usePainel";
import { ScreenState } from "../screen-state";

/** Hóspedes: «A quem escrevo?» */
export default function Hospedes() {
  const { status, retry } = useData();
  const view = usePainel();
  const [listOpen, setListOpen] = useState(false);
  if (!view) return <ScreenState failed={status === "error"} onRetry={retry} />;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h1 font-bold lg:text-h1-lg">A quem escrever</h1>
      <Contactos
        contacts={view.contacts}
        listOpen={listOpen}
        onListOpenChange={setListOpen}
      />
    </div>
  );
}
