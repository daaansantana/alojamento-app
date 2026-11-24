"use client";

import { SortVerticalIcon } from "@solar-icons/react/linear/sort-vertical";
import { Avatar, BUTTON, TAG } from "./comum";

export interface GuestRowView {
  key: string;
  name: string;
  initials: string;
  flag: string | null;
  country: string;
  language: string; // «Deutsch»
  level: string; // «Habitual», or «Habitual (à mão)»
  bigSpender: boolean;
  profile: string;
  labels: string[];
  stays: number;
  spent: string; // «1025 €»
  last: string; // «12 mai 2026»
  channel: string;
  contacted: string | null; // «21 de novembro»
  added: boolean;
  selected: boolean;
}

export type SortColumn = "name" | "stays" | "spent" | "last";

function SortButton({
  column,
  label,
  sort,
  onSort,
}: {
  column: SortColumn;
  label: string;
  sort: { column: SortColumn; direction: 1 | -1 };
  onSort: (column: SortColumn) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex min-h-11 items-center gap-1 font-bold hover:text-primary"
    >
      {label}
      <SortVerticalIcon
        size={18}
        aria-hidden={true}
        className={sort.column === column ? "text-primary" : "opacity-50"}
      />
    </button>
  );
}

function Tags({ row }: { row: GuestRowView }) {
  return (
    <span className="flex flex-wrap gap-1">
      <span className={TAG}>{row.level}</span>
      {row.bigSpender ? (
        <span className={`${TAG} border-primary font-bold`}>Gasta mais</span>
      ) : null}
      <span className={TAG}>{row.profile}</span>
      {row.labels.map((l) => (
        <span key={l} className={`${TAG} border-dashed`}>
          {l}
        </span>
      ))}
      {row.added ? (
        <span className={`${TAG} border-dashed`}>adicionado à mão</span>
      ) : null}
    </span>
  );
}

/** The guests: a table on a computer, a list of cards on a phone. */
export function GuestTable({
  rows,
  sort,
  onSort,
  allSelected,
  onSelectAll,
  onSelect,
  onOpen,
}: {
  rows: GuestRowView[];
  sort: { column: SortColumn; direction: 1 | -1 };
  onSort: (column: SortColumn) => void;
  allSelected: boolean;
  onSelectAll: () => void;
  onSelect: (key: string) => void;
  onOpen: (key: string) => void;
}) {
  const ariaSort = (column: SortColumn) =>
    sort.column === column
      ? sort.direction === 1
        ? "ascending"
        : "descending"
      : undefined;
  const check = "size-5 accent-primary";
  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b text-sm">
              <th scope="col" className="w-10 py-2 pr-2">
                <input
                  type="checkbox"
                  className={check}
                  checked={allSelected}
                  onChange={onSelectAll}
                  aria-label="Selecionar todos os da lista"
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("name")}
                className="py-2 pr-3"
              >
                <SortButton
                  column="name"
                  label="Hóspede"
                  sort={sort}
                  onSort={onSort}
                />
              </th>
              <th scope="col" className="py-2 pr-3 font-bold">
                Língua
              </th>
              <th scope="col" className="py-2 pr-3 font-bold">
                Etiquetas
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("stays")}
                className="py-2 pr-3 text-right"
              >
                <SortButton
                  column="stays"
                  label="Estadas"
                  sort={sort}
                  onSort={onSort}
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("spent")}
                className="py-2 pr-3 text-right"
              >
                <SortButton
                  column="spent"
                  label="Gasto"
                  sort={sort}
                  onSort={onSort}
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("last")}
                className="py-2 pr-3"
              >
                <SortButton
                  column="last"
                  label="Última estada"
                  sort={sort}
                  onSort={onSort}
                />
              </th>
              <th scope="col" className="py-2 font-bold">
                Contactado
              </th>
              <th scope="col" className="py-2">
                <span className="sr-only">Ficha</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b align-middle">
                <td className="py-3 pr-2">
                  <input
                    type="checkbox"
                    className={check}
                    checked={row.selected}
                    onChange={() => onSelect(row.key)}
                    aria-label={`Selecionar ${row.name}`}
                  />
                </td>
                <td className="py-3 pr-3">
                  <span className="flex items-center gap-3">
                    <Avatar
                      initials={row.initials}
                      flag={row.flag}
                      country={row.country}
                    />
                    <span className="flex flex-col">
                      <span className="font-bold">{row.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {row.country}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-3">{row.language}</td>
                <td className="py-3 pr-3">
                  <Tags row={row} />
                </td>
                <td className="py-3 pr-3 text-right tabular-nums">
                  {row.stays}
                </td>
                <td className="py-3 pr-3 text-right tabular-nums">
                  {row.spent}
                </td>
                <td className="py-3 pr-3">
                  <span className="flex flex-col">
                    <span className="whitespace-nowrap">{row.last}</span>
                    <span className="text-sm text-muted-foreground">
                      {row.channel}
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-3 text-sm">{row.contacted ?? "—"}</td>
                <td className="py-3">
                  <button
                    type="button"
                    className={BUTTON}
                    onClick={() => onOpen(row.key)}
                    aria-label={`Ficha de ${row.name}`}
                  >
                    Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col divide-y border-y sm:hidden">
        {rows.map((row) => (
          <li key={row.key} className="flex flex-col gap-3 py-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className={`${check} mt-2.5`}
                checked={row.selected}
                onChange={() => onSelect(row.key)}
                aria-label={`Selecionar ${row.name}`}
              />
              <Avatar
                initials={row.initials}
                flag={row.flag}
                country={row.country}
              />
              <span className="flex min-w-0 flex-col">
                <span className="font-bold">{row.name}</span>
                <span className="text-sm text-muted-foreground">
                  {row.country}, {row.language}
                </span>
              </span>
            </div>
            <Tags row={row} />
            <p className="text-sm">
              {row.stays} {row.stays === 1 ? "estada" : "estadas"}, {row.spent}.
              Última a {row.last}, {row.channel}.
              {row.contacted ? ` Contactado a ${row.contacted}.` : ""}
            </p>
            <button
              type="button"
              className={`${BUTTON} self-start`}
              onClick={() => onOpen(row.key)}
              aria-label={`Ficha de ${row.name}`}
            >
              Ficha
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
