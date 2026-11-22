import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { int } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PainelContact, PainelView } from "@/types";

/** «Comece por estes três», and the full list in a side sheet. */
export function Contactos({
  contacts,
  listOpen,
  onListOpenChange,
}: {
  contacts: PainelView["contacts"];
  listOpen?: boolean;
  onListOpenChange?: (open: boolean) => void;
}) {
  const all = `Ver os ${int(contacts.total)} hóspedes`;

  return (
    <section
      id="contactos"
      aria-labelledby="contactos-titulo"
      className="flex scroll-mt-6 flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="contactos-titulo"
          className="text-xl font-semibold tracking-tight"
        >
          Comece por estes três
        </h2>
        <p className="text-muted-foreground">
          Já cá estiveram no inverno e voltaram mais de uma vez. O email vai
          escrito; só tem de o enviar.
        </p>
      </div>

      <ul className="flex flex-col divide-y border-y">
        {contacts.first.map((guest) => (
          <ContactRow key={guest.mailto} guest={guest} />
        ))}
      </ul>

      <Sheet open={listOpen} onOpenChange={onListOpenChange}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              className="h-11 self-start px-4 text-base"
            />
          }
        >
          <UsersGroupRoundedIcon size={20} aria-hidden="true" />
          {all}
        </SheetTrigger>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full gap-0 text-base data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        >
          <SheetHeader className="flex-row items-start justify-between gap-4 border-b p-4">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-xl font-semibold">
                Hóspedes que já vieram no inverno
              </SheetTitle>
              <SheetDescription className="text-base">
                {int(contacts.total)} hóspedes, de quem mais gastou para quem
                menos gastou.
              </SheetDescription>
            </div>
            <SheetClose
              render={
                <Button variant="ghost" size="icon" className="size-11" />
              }
            >
              <CloseCircleIcon size={24} aria-hidden="true" />
              <span className="sr-only">Fechar</span>
            </SheetClose>
          </SheetHeader>
          <ul className="flex flex-col divide-y overflow-y-auto px-4">
            {contacts.all.map((guest) => (
              <ContactRow key={guest.mailto} guest={guest} />
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function ContactRow({ guest }: { guest: PainelContact }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="font-medium">{guest.name}</span>
        <span className="text-muted-foreground tabular-nums">
          {guest.detail}
        </span>
      </span>
      <a
        href={guest.mailto}
        aria-label={`Enviar email a ${guest.name}`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 gap-2 px-4 text-base",
        )}
      >
        <LetterIcon size={20} aria-hidden="true" />
        Enviar email
      </a>
    </li>
  );
}
