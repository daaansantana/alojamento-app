import { HomeAngleIcon } from "@solar-icons/react/linear/home-angle";
import Link from "next/link";
import { TopNav } from "./nav";

export const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 lg:px-10";

/** The house's name, the four screens on a computer, and «Letra maior». */
export function Header({
  pathname,
  largeText,
  onLargeTextChange,
}: {
  pathname: string;
  largeText: boolean;
  onLargeTextChange: (large: boolean) => void;
}) {
  return (
    <header className="border-b bg-background lg:sticky lg:top-0 lg:z-30">
      <div
        className={`${CONTAINER} flex min-h-18 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 lg:py-0`}
      >
        <Link
          href="/"
          className="flex min-h-12 items-center gap-3 rounded-xl font-bold text-lg"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HomeAngleIcon size={24} aria-hidden={true} />
          </span>
          A sua casa
        </Link>
        <TopNav pathname={pathname} />
        <button
          type="button"
          aria-pressed={largeText}
          onClick={() => onLargeTextChange(!largeText)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-control bg-background px-4 font-medium aria-pressed:border-primary aria-pressed:bg-nav-pill aria-pressed:text-primary"
        >
          <span aria-hidden="true" className="font-bold text-lg">
            Aa
          </span>
          Letra maior
        </button>
      </div>
    </header>
  );
}
