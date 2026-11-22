import Link from "next/link";
import { TopNav } from "./nav";

export const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 lg:px-10";

/** The nexo logo, the four screens on a computer, and «Letra maior». */
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
          aria-label="nexo"
          className="flex min-h-12 shrink-0 items-center rounded-xl px-1.5"
        >
          {/* The logo file as it is; the link carries the name. */}
          {/* biome-ignore lint/performance/noImgElement: a static SVG, served as it is */}
          <img
            src="/marca/logo-horizontal.svg"
            alt=""
            width={143}
            height={30}
            className="h-[1.667rem] w-auto"
          />
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
