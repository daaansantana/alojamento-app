import type { ReactNode } from "react";

/** The columns under the header: the main one and the side one. */
export const COLUMNS =
  "grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12";

/**
 * The top of every page, across the full width: the title, one sentence
 * and the page's own controls. The columns start together below it.
 */
export function PageHeader({
  title,
  intro,
  emphasis = false,
  children,
}: {
  title: string;
  intro?: ReactNode;
  /** The sentence is the page's conclusion: larger and bold. */
  emphasis?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 font-bold lg:text-h1-lg">{title}</h1>
        {intro ? (
          <p
            className={
              emphasis
                ? "max-w-[65ch] text-statement leading-snug font-bold text-balance"
                : "max-w-[65ch] text-lead"
            }
          >
            {intro}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
