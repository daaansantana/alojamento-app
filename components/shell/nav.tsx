import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { HomeAngleIcon } from "@solar-icons/react/linear/home-angle";
import { TagIcon } from "@solar-icons/react/linear/tag";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";
import Link from "next/link";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface Destination {
  href: string;
  label: string;
  Icon: ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}

// Her four questions, always one tap away.
const DESTINATIONS: Destination[] = [
  { href: "/", label: "Início", Icon: HomeAngleIcon },
  { href: "/hospedes", label: "Hóspedes", Icon: UsersGroupRoundedIcon },
  { href: "/precos", label: "Preços", Icon: TagIcon },
  { href: "/ano", label: "O ano", Icon: CalendarIcon },
];

const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

/** From 1024 px: the four screens at the top, the active one underlined. */
export function TopNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Principal" className="hidden self-stretch lg:flex">
      <ul className="flex items-stretch gap-2">
        {DESTINATIONS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2 border-y-[3px] border-transparent px-3 text-foreground hover:text-primary",
                  active && "border-b-primary font-bold text-primary",
                )}
              >
                <Icon size={24} aria-hidden={true} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Below 1024 px: the four screens in a bar fixed at the bottom. */
export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {DESTINATIONS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-sm leading-tight",
                  active ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full",
                    active && "bg-nav-pill",
                  )}
                >
                  <Icon size={24} aria-hidden={true} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
