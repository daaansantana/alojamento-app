"use client";

import { useEffect, useState } from "react";
import { Choices } from "@/components/comum/escolha";
import { StepWhatIf } from "@/components/hospedes/e-se";
import { EmailPreview, GuestList, Progress } from "@/components/hospedes/lista";
import { EmptyState } from "@/components/states/empty-state";
import { useContacted } from "@/hooks/useContacted";
import { useData } from "@/hooks/useData";
import { useDirectSimulation } from "@/hooks/useDirectSimulation";
import { usePainel } from "@/hooks/usePainel";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import {
  directAnswer,
  PAINEL_DIRECT,
  PAINEL_WINTER_CAMPAIGN,
  showMoreGuests,
  winterAnswer,
  writtenOn,
  writtenProgress,
} from "@/lib/painel";
import { ScreenState } from "../screen-state";

type List = "inverno" | "direto";
const LISTS: List[] = ["inverno", "direto"];
const START = {
  inverno: Math.round(PAINEL_WINTER_CAMPAIGN.returnRate * 100),
  direto: Math.round(PAINEL_DIRECT.conversionRate * 100),
};

/** Hóspedes: «A quem escrevo?» */
export default function Hospedes() {
  const { status, retry } = useData();
  const view = usePainel();
  const { contacted, mark, unmark } = useContacted();
  const [list, setList] = useState<List>("inverno");
  const [share, setShare] = useState(START);
  const winter = useWinterCampaign({
    returnRate: share.inverno / 100,
    discount: PAINEL_WINTER_CAMPAIGN.discount,
  });
  const direct = useDirectSimulation({
    ...PAINEL_DIRECT,
    conversionRate: share.direto / 100,
  });

  // /hospedes#inverno and /hospedes#direto pick the list.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1) as List;
      if (LISTS.includes(hash)) setList(hash);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (!view || !winter || !direct)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const guests = list === "inverno" ? view.contacts : view.directContacts;
  const rows = guests.all.map((c) => ({
    ...c,
    written: contacted[c.email] ? writtenOn(contacted[c.email]) : null,
  }));
  const done = rows.filter((r) => r.written).length;

  const whatIf =
    list === "inverno" ? (
      <StepWhatIf
        title="E se só alguns voltarem?"
        question="Que parte dos hóspedes de inverno volta mais uma vez?"
        value={share.inverno}
        min={0}
        max={50}
        step={5}
        onChange={(v) => setShare((s) => ({ ...s, inverno: v }))}
        answer={winterAnswer(winter)}
      />
    ) : (
      <StepWhatIf
        title="E se só alguns aceitarem?"
        question="Que parte de quem volta pelas plataformas passa a reservar diretamente?"
        value={share.direto}
        min={0}
        max={100}
        step={10}
        onChange={(v) => setShare((s) => ({ ...s, direto: v }))}
        answer={directAnswer(direct)}
      />
    );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-bold lg:text-h1-lg">A quem escrever</h1>
          <p className="text-lead">{view.guestsIntro}</p>
        </div>
        <Choices
          label="Lista"
          value={list}
          onChange={setList}
          choices={[
            { value: "inverno", label: "Inverno", detail: view.contacts.count },
            {
              value: "direto",
              label: "Reservar direto",
              detail: view.directContacts.count,
            },
          ]}
        />
        <p>{guests.explain}</p>
        <EmailPreview
          subject={guests.preview.subject}
          body={guests.preview.body}
        />
        {rows.length === 0 ? (
          <EmptyState message="Nesta lista ainda não há ninguém: veja a outra lista." />
        ) : (
          <>
            <Progress
              text={writtenProgress(done, guests.total)}
              done={done}
              total={guests.total}
            />
            <GuestList
              key={list}
              rows={rows}
              moreLabel={showMoreGuests(rows.length - 10)}
              onMark={mark}
              onUnmark={unmark}
            />
          </>
        )}
      </div>
      <div className="lg:sticky lg:top-28">{whatIf}</div>
    </div>
  );
}
