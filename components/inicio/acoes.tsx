import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { BedIcon } from "@solar-icons/react/linear/bed";
import { HandMoneyIcon } from "@solar-icons/react/linear/hand-money";
import { SnowflakeIcon } from "@solar-icons/react/linear/snowflake";
import { Sun2Icon } from "@solar-icons/react/linear/sun-2";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlertId, PainelAction } from "@/types";

type Icon = ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

const ICON: Record<AlertId, Icon> = {
  winter: SnowflakeIcon,
  commission: HandMoneyIcon,
  summer: Sun2Icon,
  orphans: BedIcon,
};

/** The action of the month: the one green panel on the screen. */
export function LeadAction({ action }: { action: PainelAction }) {
  const Icon = ICON[action.id];
  return (
    <section
      aria-labelledby="acao-do-mes"
      className="flex flex-col gap-4 rounded-panel bg-accent p-5 sm:p-7"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary">
        <Icon size={28} aria-hidden={true} />
      </span>
      <h2 id="acao-do-mes" className="text-h2 font-bold text-balance">
        {action.title}
      </h2>
      <p className="max-w-[60ch]">{action.text}</p>
      {action.worth && <p className="font-bold">{action.worth}</p>}
      <Link
        href={action.target}
        className={cn(
          buttonVariants(),
          "mt-1 min-h-12 w-full gap-3 rounded-xl px-6 text-base font-bold whitespace-normal hover:bg-primary-pressed sm:w-fit",
        )}
      >
        <UsersOrArrow id={action.id} />
        {action.cta}
      </Link>
    </section>
  );
}

function UsersOrArrow({ id }: { id: AlertId }) {
  return id === "winter" || id === "commission" ? (
    <UsersGroupRoundedIcon size={24} aria-hidden={true} />
  ) : (
    <AltArrowRightIcon size={24} aria-hidden={true} />
  );
}

/** «E depois»: the other actions, each row a link to where it is done. */
export function NextActions({ actions }: { actions: PainelAction[] }) {
  if (actions.length === 0) return null;
  return (
    <section aria-labelledby="e-depois" className="flex flex-col gap-2">
      <h2 id="e-depois" className="text-h2 font-bold">
        E depois
      </h2>
      <ul className="divide-y border-y">
        {actions.map((action) => {
          const Icon = ICON[action.id];
          return (
            <li key={action.id}>
              <Link
                href={action.target}
                className="group flex min-h-[4rem] items-center gap-4 py-4 hover:bg-muted/60"
              >
                <Icon
                  size={26}
                  aria-hidden={true}
                  className="shrink-0 text-muted-foreground"
                />
                <span className="flex flex-1 flex-col">
                  <span className="text-sm text-muted-foreground">
                    {action.when}
                  </span>
                  <span className="font-bold group-hover:text-primary">
                    {action.title}
                  </span>
                  <span>{action.short}</span>
                </span>
                <AltArrowRightIcon
                  size={24}
                  aria-hidden={true}
                  className="shrink-0 text-muted-foreground"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** «Ver outro mês»: the month before and the month after. */
export function OtherMonth({
  previous,
  next,
  onChange,
}: {
  previous: { month: number; label: string };
  next: { month: number; label: string };
  onChange: (month: number) => void;
}) {
  const button =
    "inline-flex min-h-11 items-center gap-2 rounded-xl border border-control bg-background px-4 font-bold hover:bg-muted";
  return (
    <fieldset className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <legend className="float-left text-muted-foreground">
        Ver outro mês
      </legend>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={button}
          onClick={() => onChange(previous.month)}
        >
          <AltArrowLeftIcon size={22} aria-hidden={true} />
          {previous.label}
        </button>
        <button
          type="button"
          className={button}
          onClick={() => onChange(next.month)}
        >
          {next.label}
          <AltArrowRightIcon size={22} aria-hidden={true} />
        </button>
      </div>
    </fieldset>
  );
}

/** The title and the sentence that opens the screen. */
export function MonthHeading({
  title,
  intro,
}: {
  title: string;
  intro: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-h1 font-bold lg:text-h1-lg">{title}</h1>
      <p className="text-lead">{intro}</p>
    </div>
  );
}
