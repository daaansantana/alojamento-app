import { BedIcon } from "@solar-icons/react/linear/bed";
import { HandMoneyIcon } from "@solar-icons/react/linear/hand-money";
import { SnowflakeIcon } from "@solar-icons/react/linear/snowflake";
import { Sun2Icon } from "@solar-icons/react/linear/sun-2";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AlertId, PainelAction } from "@/types";

export interface MonthOption {
  value: number;
  label: string;
}

const ICONS: Record<AlertId, typeof Sun2Icon> = {
  winter: SnowflakeIcon,
  commission: HandMoneyIcon,
  summer: Sun2Icon,
  orphans: BedIcon,
};

const LINK =
  "inline-flex min-h-11 items-center font-medium underline underline-offset-4 hover:decoration-2";

/** «O que fazer»: the month picker, the first action in front and the others after it. */
export function Acoes({
  actions,
  month,
  onMonthChange,
  monthOptions,
  onAction,
  empty,
}: {
  actions: PainelAction[];
  month: number;
  onMonthChange: (month: number) => void;
  monthOptions: MonthOption[];
  onAction?: (action: PainelAction) => void;
  empty?: ReactNode;
}) {
  const [first, ...rest] = actions;

  return (
    <section aria-labelledby="fazer" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="fazer" className="text-xl font-semibold tracking-tight">
          O que fazer
        </h2>
        <div className="flex flex-col gap-1">
          <span id="mes-label" className="text-base text-muted-foreground">
            Ver outro mês
          </span>
          <Select
            items={monthOptions}
            value={month}
            onValueChange={(value) => {
              if (typeof value === "number") onMonthChange(value);
            }}
          >
            <SelectTrigger
              aria-labelledby="mes-label"
              className="h-11 w-full px-3 text-base sm:w-56"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="min-h-11 px-3 text-base"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!first ? (
        empty
      ) : (
        <>
          <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <ActionIcon id={first.id} />
              <Badge className="h-6 px-2.5 text-sm">{first.when}</Badge>
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-balance">
              {first.title}
            </h3>
            <p className="max-w-[65ch]">{first.text}</p>
            {first.worth && (
              <p className="max-w-[65ch] text-lg font-semibold">
                {first.worth}
              </p>
            )}
            <a
              href={first.target}
              onClick={() => onAction?.(first)}
              className={cn(
                buttonVariants(),
                "mt-1 h-11 self-start px-4 text-base",
              )}
            >
              {first.cta}
            </a>
          </article>

          {rest.length > 0 && (
            <ul className="flex flex-col divide-y border-y">
              {rest.map((action) => (
                <li key={action.id} className="flex gap-4 py-4">
                  <ActionIcon id={action.id} />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                      {action.when}
                    </span>
                    <h3 className="text-lg font-semibold text-balance">
                      {action.title}
                    </h3>
                    <p className="max-w-[65ch]">{action.text}</p>
                    {action.worth && (
                      <p className="max-w-[65ch] font-semibold">
                        {action.worth}
                      </p>
                    )}
                    <a
                      href={action.target}
                      onClick={() => onAction?.(action)}
                      className={cn(LINK, "self-start")}
                    >
                      {action.cta}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function ActionIcon({ id }: { id: AlertId }) {
  const Icon = ICONS[id];
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
      <Icon size={22} aria-hidden="true" />
    </span>
  );
}
