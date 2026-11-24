"use client";

import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { type ReactNode, useEffect, useId, useRef } from "react";

export const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-control bg-background px-4 font-bold hover:bg-muted";
export const BUTTON_MAIN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-50";
export const FIELD =
  "min-h-11 w-full rounded-xl border border-control bg-background px-3 text-base";
export const PILL =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-control bg-background px-4 font-bold hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground";
export const TAG =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm whitespace-nowrap";

/** The guest's initials, with the flag of their country in the corner. */
export function Avatar({
  initials,
  flag,
  country,
  large = false,
}: {
  initials: string;
  flag: string | null;
  country: string;
  large?: boolean;
}) {
  const size = large ? "size-12 text-base" : "size-10 text-sm";
  return (
    <span className={`relative inline-flex shrink-0 ${size}`}>
      <span
        aria-hidden="true"
        className={`flex ${size} items-center justify-center rounded-full bg-sage font-bold text-foreground`}
      >
        {initials}
      </span>
      {flag ? (
        // biome-ignore lint/performance/noImgElement: a 30×20 svg
        <img
          src={`/bandeiras/${flag}.svg`}
          alt={country}
          width={20}
          height={14}
          className="absolute -right-1 -bottom-0.5 h-3.5 w-5 rounded-[3px] border-2 border-background"
        />
      ) : null}
    </span>
  );
}

/**
 * A panel over the page: on the right on a computer, the whole screen on a
 * phone. Esc closes it and the focus goes back to the button that opened it.
 */
export function Panel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-full overflow-y-auto border-l bg-background p-0 text-foreground backdrop:bg-foreground/40 sm:max-w-[36rem]"
    >
      {open ? (
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-h2 font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            >
              <CloseCircleIcon size={26} aria-hidden={true} />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
