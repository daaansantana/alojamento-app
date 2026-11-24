"use client";

import { PenIcon } from "@solar-icons/react/linear/pen";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { UserPlusIcon } from "@solar-icons/react/linear/user-plus";
import { useEffect, useMemo, useState } from "react";
import { BUTTON, BUTTON_MAIN, Panel } from "@/components/hospedes/comum";
import { StepWhatIf } from "@/components/hospedes/e-se";
import {
  GuestDetails,
  type GuestDetailsView,
  GuestForm,
  type GuestFormValues,
} from "@/components/hospedes/ficha";
import {
  GuestFilters,
  ProfileSummary,
  Suggestions,
} from "@/components/hospedes/filtros";
import {
  AddGuestForm,
  type NewGuestValues,
  RulesForm,
} from "@/components/hospedes/formularios";
import {
  type ChannelId,
  MessageComposer,
  type MessageTarget,
} from "@/components/hospedes/mensagem";
import {
  type GuestRowView,
  GuestTable,
  type SortColumn,
} from "@/components/hospedes/tabela";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { useContacted } from "@/hooks/useContacted";
import { useData } from "@/hooks/useData";
import { useDirectSimulation } from "@/hooks/useDirectSimulation";
import { useGuests } from "@/hooks/useGuests";
import { useMessageSettings } from "@/hooks/useMessageSettings";
import { usePainel } from "@/hooks/usePainel";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import { dayMonth, eur, int, monthName } from "@/lib/format";
import {
  facetCounts,
  filterGuests,
  type GuestFilter,
  initials,
  LEVEL_NAMES,
  NO_FILTER,
  PROFILE_NAMES,
  profileSummary,
  shortDate,
  sortGuests,
} from "@/lib/guest-list";
import {
  COUNTRY_LANGUAGE,
  GUEST_RULES,
  profileOf,
  seasonOf,
} from "@/lib/guests";
import {
  formatDiscount,
  LANGUAGES,
  languageName,
  mailtoHref,
  messageFor,
  smsHref,
  TEMPLATE_FOR_PROFILE,
  TEMPLATE_IDS,
  type TemplateId,
  templateInfo,
  templateText,
  unknownVariables,
  VARIABLES,
  whatsappHref,
} from "@/lib/messages";
import {
  directAnswer,
  PAINEL_DIRECT,
  PAINEL_WINTER_CAMPAIGN,
  winterAnswer,
  writtenProgress,
} from "@/lib/painel";
import type {
  GuestEdit,
  GuestLevel,
  GuestProfileId,
  GuestRules,
  GuestView,
  LanguageCode,
} from "@/types";
import { ScreenState } from "../screen-state";

type List = "inverno" | "direto";
const LISTS: List[] = ["inverno", "direto"];
const LIST_TEMPLATE: Record<List, TemplateId> = {
  inverno: "inverno",
  direto: "direto",
};
const START = {
  inverno: Math.round(PAINEL_WINTER_CAMPAIGN.returnRate * 100),
  direto: Math.round(PAINEL_DIRECT.conversionRate * 100),
};
const PAGE = 20;
const COUNTRIES = Object.keys(COUNTRY_LANGUAGE);
const LANGUAGE_OF = Object.fromEntries(
  Object.entries(COUNTRY_LANGUAGE).map(([c, v]) => [c, v.language]),
);
const LANGUAGE_OPTIONS = LANGUAGES.map((code) => ({
  value: code,
  label: languageName(code),
}));
const VARIABLE_HELP = [
  { name: VARIABLES[0], says: "o primeiro nome do hóspede" },
  {
    name: VARIABLES[1],
    says: "o desconto, escrito como na língua da mensagem",
  },
  { name: VARIABLES[2], says: "quem assina" },
];

type PanelState =
  | { kind: "ficha"; key: string; editing: boolean }
  | { kind: "mensagem" }
  | { kind: "regras" }
  | { kind: "adicionar" }
  | null;

const textKey = (t: TemplateId, lang: LanguageCode, channel: ChannelId) =>
  `${t}|${lang}|${channel === "email" ? "email" : "curto"}`;

/** Hóspedes: everyone in one list, by profile and level, and who to write to. */
export default function Hospedes() {
  const { status, retry, rooms, bookings } = useData();
  const view = usePainel();
  const { contacted, mark } = useContacted();
  const g = useGuests();
  const settings = useMessageSettings();

  const [list, setList] = useState<List | null>(null);
  const [filter, setFilter] = useState<GuestFilter>(NO_FILTER);
  const [sort, setSort] = useState<{ column: SortColumn; direction: 1 | -1 }>({
    column: "last",
    direction: -1,
  });
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<string[]>([]);
  const [panel, setPanel] = useState<PanelState>(null);
  const [template, setTemplate] = useState<TemplateId>("inverno");
  const [discount, setDiscount] = useState(10);
  const [channel, setChannel] = useState<ChannelId>("email");
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [draft, setDraft] = useState<GuestRules | null>(null);
  const [applied, setApplied] = useState(false);
  const [share, setShare] = useState(START);
  const winter = useWinterCampaign({
    returnRate: share.inverno / 100,
    discount: PAINEL_WINTER_CAMPAIGN.discount,
  });
  const direct = useDirectSimulation({
    ...PAINEL_DIRECT,
    conversionRate: share.direto / 100,
  });

  const listGuests = useMemo(
    () =>
      view
        ? {
            inverno: view.contacts.all.map((c) => c.email),
            direto: view.directContacts.all.map((c) => c.email),
          }
        : null,
    [view],
  );

  // /hospedes#inverno and /hospedes#direto pick that suggestion's guests.
  useEffect(() => {
    if (!listGuests) return;
    const read = () => {
      const hash = window.location.hash.slice(1) as List;
      if (LISTS.includes(hash)) {
        setList(hash);
        setFilter({ ...NO_FILTER, only: listGuests[hash] });
        setShown(PAGE);
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [listGuests]);

  if (!view || !winter || !direct || !g.guests || !g.counts || !listGuests)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  const guests = g.guests;
  const byKey = new Map(guests.map((x) => [x.key, x]));
  const visible = sortGuests(
    filterGuests(guests, filter),
    sort.column,
    sort.direction,
  );
  const facets = facetCounts(guests, filter);
  const roomName = new Map(rooms.map((r) => [r.id, r.name]));

  const openMessage = (keys: string[], t: TemplateId) => {
    setSelected(keys);
    setTemplate(t);
    setDiscount(Math.round(templateInfo(t).discount * 100));
    setLanguage(null);
    setOpened([]);
    setPanel({ kind: "mensagem" });
  };
  const pickList = (id: string) => {
    const l = id as List;
    setList(l);
    setFilter({ ...NO_FILTER, only: listGuests[l] });
    setShown(PAGE);
    openMessage(listGuests[l], LIST_TEMPLATE[l]);
  };
  const changeFilter = (patch: Partial<GuestFilter>) => {
    setFilter((f) => ({ ...f, ...patch }));
    setShown(PAGE);
  };

  // The suggestions: the two actions of the page view.
  const progress = (keys: string[]) =>
    writtenProgress(keys.filter((k) => contacted[k]).length, keys.length);
  const suggestions = [
    {
      id: "inverno",
      action: view.contacts.action,
      count: view.contacts.count,
      worth: view.contacts.worth,
      progress: progress(listGuests.inverno),
    },
    {
      id: "direto",
      action: view.directContacts.action,
      count: view.directContacts.count,
      worth: view.directContacts.worth,
      progress: progress(listGuests.direto),
    },
  ];

  const profileOptions = (
    ["todos", "inverno", "verao", "meia", "longas"] as const
  ).map((p) => ({
    value: p,
    label: p === "todos" ? "Todos" : PROFILE_NAMES[p],
    count: facets.profiles[p],
  }));
  const levelOptions = (
    ["todos", "novo", "voltou", "habitual", "gasta"] as const
  ).map((l) => ({
    value: l,
    label:
      l === "todos" ? "Todos" : l === "gasta" ? "Gasta mais" : LEVEL_NAMES[l],
    count: facets.levels[l],
  }));
  const chosenProfile = filter.profile === "todos" ? null : filter.profile;
  const summary = chosenProfile
    ? profileSummary(guests, chosenProfile, g.rules.longStay, languageName)
    : null;
  const offerFor = (p: GuestProfileId) => {
    const t = TEMPLATE_FOR_PROFILE[p];
    const info = templateInfo(t);
    return `«${info.name}», com ${formatDiscount(info.discount, "pt-PT")} de desconto`;
  };

  const rows: GuestRowView[] = visible.slice(0, shown).map((x) => ({
    key: x.key,
    name: x.name,
    initials: initials(x.name),
    flag: x.flag,
    country: x.country,
    language: languageName(x.language),
    level: LEVEL_NAMES[x.level] + (x.manual.level ? " (à mão)" : ""),
    bigSpender: x.bigSpender,
    profile: PROFILE_NAMES[x.profile] + (x.manual.profile ? " (à mão)" : ""),
    labels: x.labels,
    stays: x.added ? 0 : x.stays,
    spent: eur(x.spent),
    last: shortDate(x.lastCheckIn),
    channel: x.lastChannel,
    contacted: contacted[x.key] ? dayMonth(contacted[x.key]) : null,
    added: x.added,
    selected: selected.includes(x.key),
  }));
  const allSelected =
    visible.length > 0 && visible.every((x) => selected.includes(x.key));
  const toggle = (key: string) =>
    setSelected((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key],
    );

  // The open guest.
  const open = panel?.kind === "ficha" ? byKey.get(panel.key) : undefined;
  const original = open ? g.originals[open.key] : undefined;
  const details: GuestDetailsView | null = open
    ? {
        name: open.name,
        initials: initials(open.name),
        flag: open.flag,
        country: open.country,
        countryNote:
          open.countries.length > 1
            ? `o da última estada; também reservou como ${open.countries.filter((c) => c !== open.country).join(", ")}`
            : null,
        language: languageName(open.language),
        tags: [
          {
            text: LEVEL_NAMES[open.level],
            origin: open.manual.level ? "mudado à mão" : "automático",
          },
          {
            text: PROFILE_NAMES[open.profile],
            origin: open.manual.profile ? "mudado à mão" : "automático",
          },
          ...(open.bigSpender ? [{ text: "Gasta mais", origin: null }] : []),
          ...open.labels.map((l) => ({ text: l, origin: null })),
        ],
        email: open.email,
        phone: open.phone || null,
        offers: open.acceptsOffers
          ? "Sim"
          : open.platformAlias
            ? "Não: o email é do Booking ou do Airbnb e só serve para a estada"
            : "Não: pediu para não receber",
        contacted: contacted[open.key] ? dayMonth(contacted[open.key]) : null,
        notes: open.notes,
        staysTitle: open.added
          ? "Adicionado à mão: ainda sem estadas na base"
          : `${open.stays} ${open.stays === 1 ? "estada" : "estadas"}, ${eur(open.spent)} no total`,
        stays: open.history.map((s) => ({
          date: shortDate(s.checkIn),
          room: roomName.get(s.roomId) ?? `Quarto ${s.roomId}`,
          info: `${s.nights} ${s.nights === 1 ? "noite" : "noites"}, ${s.guests} ${s.guests === 1 ? "pessoa" : "pessoas"}, ${s.channel}`,
          total: eur(s.total),
        })),
      }
    : null;
  const saveGuest = (
    values: GuestFormValues,
    reset: ("level" | "profile" | "language")[],
  ) => {
    if (!open || !original) return;
    const patch: GuestEdit = {};
    const clear: (keyof GuestEdit)[] = [...reset];
    const same = {
      name: values.name === original.name,
      email: values.email === original.email,
      country: values.country === original.country,
      language: values.language === original.language,
      level: values.level === original.level,
      profile: values.profile === original.profile,
    };
    for (const field of ["name", "email", "country"] as const) {
      if (same[field]) clear.push(field);
      else patch[field] = values[field];
    }
    if (!same.language) patch.language = values.language as LanguageCode;
    else clear.push("language");
    if (!same.level) patch.level = values.level as GuestLevel;
    else clear.push("level");
    if (!same.profile) patch.profile = values.profile as GuestProfileId;
    else clear.push("profile");
    patch.phone = values.phone;
    patch.labels = values.labels;
    patch.notes = values.notes;
    patch.acceptsOffers = values.acceptsOffers;
    g.edit(open.key, patch);
    for (const field of new Set(clear)) g.clear(open.key, field);
    setPanel({ kind: "ficha", key: open.key, editing: false });
  };

  // The message.
  const targets = selected
    .map((k) => byKey.get(k))
    .filter((x): x is GuestView => x !== undefined);
  const languageCounts = new Map<LanguageCode, number>();
  for (const t of targets)
    languageCounts.set(t.language, (languageCounts.get(t.language) ?? 0) + 1);
  const languages = [...languageCounts]
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, label: languageName(code), count }));
  const current =
    language && languageCounts.has(language)
      ? language
      : (languages[0]?.code ?? "pt-PT");
  const key = textKey(template, current, channel);
  const mask =
    settings.editedTexts[key] ?? templateText(template, current, channel);
  const editedFor = (lang: LanguageCode, kind: ChannelId) =>
    settings.editedTexts[textKey(template, lang, kind)];
  const options = (lang: LanguageCode, kind: ChannelId) => ({
    discount: discount / 100,
    signature: settings.signature,
    edited: editedFor(lang, kind),
  });
  const example = targets.find((t) => t.language === current);
  const preview = messageFor(
    { name: example?.name ?? "Helena", language: current },
    template,
    channel,
    options(current, channel),
  );
  const messageTargets: MessageTarget[] = targets.map((t) => {
    const kind: ChannelId = channel !== "email" && t.phone ? channel : "email";
    const m = messageFor(t, template, kind, options(t.language, kind));
    const noPhone = channel !== "email" && !t.phone ? " (sem telefone)" : "";
    return {
      key: t.key,
      name: t.name,
      flag: t.flag,
      country: t.country,
      via: `${languageName(t.language)}, por ${kind === "email" ? "email" : kind === "whatsapp" ? "WhatsApp" : "SMS"}${noPhone}`,
      kind,
      mailto: mailtoHref(t.email, m.subject, m.body),
      link:
        kind === "whatsapp"
          ? whatsappHref(t.phone, m.body)
          : kind === "sms"
            ? smsHref(t.phone, m.body)
            : "",
      opened: opened.includes(t.key),
      refused: t.acceptsOffers
        ? null
        : t.platformAlias
          ? "Email do Booking ou do Airbnb: só serve para a estada"
          : "Não aceita ofertas",
    };
  });
  const refused = messageTargets.filter((t) => t.refused).length;
  const byPhone = messageTargets.filter(
    (t) => !t.refused && t.kind !== "email",
  ).length;
  const withoutPhone = targets.filter((t) => !t.phone).length;
  const messageSummary = `${int(targets.length)} ${targets.length === 1 ? "hóspede" : "hóspedes"}: ${int(targets.length - refused - byPhone)} por email${byPhone ? `, ${int(byPhone)} por ${channel === "whatsapp" ? "WhatsApp" : "SMS"}` : ""}${refused ? `, ${int(refused)} não ${refused === 1 ? "aceita" : "aceitam"} ofertas` : ""}.`;

  // The label rules.
  const shownRules = draft ?? g.rules;
  const previewCounts = g.countsWith(shownRules);
  const rulesChanged = JSON.stringify(shownRules) !== JSON.stringify(g.rules);
  const isDefault = JSON.stringify(shownRules) === JSON.stringify(GUEST_RULES);

  // A new guest.
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: monthName(i + 1),
  }));
  const checkInOf = (month: number) =>
    `2026-${String(month).padStart(2, "0")}-01`;
  const suggestLabels = (v: NewGuestValues) => [
    LEVEL_NAMES.novo,
    PROFILE_NAMES[profileOf(v.nights, seasonOf(checkInOf(v.month)), g.rules)],
    languageName(v.language as LanguageCode),
  ];

  const whatIf =
    list === "direto" ? (
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
    ) : (
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
    );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hóspedes"
        intro={`${int(guests.length)} hóspedes de ${int(bookings.length)} reservas. Escolha um perfil ou um nível para ver só esse grupo e escrever-lhe.`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              setDraft(null);
              setApplied(false);
              setPanel({ kind: "regras" });
            }}
          >
            <SettingsIcon size={20} aria-hidden={true} />
            Regras das etiquetas
          </button>
          <button
            type="button"
            className={BUTTON}
            onClick={() => setPanel({ kind: "adicionar" })}
          >
            <UserPlusIcon size={20} aria-hidden={true} />
            Adicionar hóspede
          </button>
        </div>
      </PageHeader>

      <section aria-labelledby="sugestoes" className="flex flex-col gap-3">
        <h2 id="sugestoes" className="text-h2 font-bold">
          Sugestões
        </h2>
        <div data-layout="colunas" className={COLUMNS}>
          <Suggestions items={suggestions} active={list} onPick={pickList} />
          <div>{whatIf}</div>
        </div>
      </section>

      <GuestFilters
        profiles={profileOptions}
        profile={filter.profile}
        onProfile={(v) =>
          changeFilter({ profile: v as GuestFilter["profile"] })
        }
        levels={levelOptions}
        level={filter.level}
        onLevel={(v) => changeFilter({ level: v as GuestFilter["level"] })}
        languages={LANGUAGE_OPTIONS}
        language={filter.language}
        onLanguage={(v) =>
          changeFilter({ language: v as GuestFilter["language"] })
        }
        search={filter.search}
        onSearch={(v) => changeFilter({ search: v })}
        only={
          filter.only && list
            ? `Lista: ${suggestions.find((s) => s.id === list)?.action}`
            : null
        }
        onClearOnly={() => {
          setList(null);
          changeFilter({ only: null });
        }}
        canClear={JSON.stringify(filter) !== JSON.stringify(NO_FILTER)}
        onClear={() => {
          setList(null);
          setFilter(NO_FILTER);
          setShown(PAGE);
        }}
      />

      {summary && chosenProfile ? (
        <ProfileSummary
          title={summary.title}
          text={summary.text}
          offer={offerFor(chosenProfile)}
          write={`Escrever aos ${int(visible.length)} da lista`}
          onWrite={() =>
            openMessage(
              visible.map((x) => x.key),
              TEMPLATE_FOR_PROFILE[chosenProfile],
            )
          }
        />
      ) : null}

      <section
        aria-label="Lista de hóspedes"
        className="flex min-w-0 flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite">
            A mostrar {int(rows.length)} de {int(visible.length)}{" "}
            {visible.length === 1 ? "hóspede" : "hóspedes"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={selected.length ? "" : "text-muted-foreground"}>
              {selected.length === 0
                ? "Selecione hóspedes na lista"
                : `${int(selected.length)} ${selected.length === 1 ? "selecionado" : "selecionados"}`}
            </span>
            <button
              type="button"
              className={BUTTON_MAIN}
              disabled={selected.length === 0}
              onClick={() =>
                openMessage(
                  selected,
                  chosenProfile
                    ? TEMPLATE_FOR_PROFILE[chosenProfile]
                    : list
                      ? LIST_TEMPLATE[list]
                      : template,
                )
              }
            >
              <PenIcon size={20} aria-hidden={true} />
              Escrever mensagem
            </button>
          </div>
        </div>
        {visible.length === 0 ? (
          <EmptyState message="Nenhum hóspede com estes filtros. Tire um filtro para ver mais." />
        ) : (
          <GuestTable
            rows={rows}
            sort={sort}
            onSort={(column) =>
              setSort((s) => ({
                column,
                direction:
                  s.column === column
                    ? (-s.direction as 1 | -1)
                    : column === "name"
                      ? 1
                      : -1,
              }))
            }
            allSelected={allSelected}
            onSelectAll={() =>
              setSelected((s) =>
                allSelected
                  ? s.filter((k) => !visible.some((x) => x.key === k))
                  : [...new Set([...s, ...visible.map((x) => x.key)])],
              )
            }
            onSelect={toggle}
            onOpen={(k) => setPanel({ kind: "ficha", key: k, editing: false })}
          />
        )}
        {visible.length > shown ? (
          <button
            type="button"
            className={`${BUTTON} self-center`}
            onClick={() => setShown((n) => n + PAGE)}
          >
            Mostrar mais {int(Math.min(PAGE, visible.length - shown))}
          </button>
        ) : null}
      </section>

      <Panel
        open={panel?.kind === "ficha" && details !== null}
        title={open?.name ?? ""}
        onClose={() => setPanel(null)}
      >
        {open && details && original ? (
          panel?.kind === "ficha" && panel.editing ? (
            <GuestForm
              initial={{
                name: open.name,
                email: open.email,
                phone: open.phone,
                country: open.country,
                language: open.language,
                level: open.level,
                profile: open.profile,
                labels: open.labels,
                acceptsOffers: open.acceptsOffers,
                notes: open.notes,
              }}
              countries={
                COUNTRIES.includes(open.country)
                  ? COUNTRIES
                  : [open.country, ...COUNTRIES]
              }
              languageOf={LANGUAGE_OF}
              languages={LANGUAGE_OPTIONS}
              levels={(["novo", "voltou", "habitual"] as const).map((l) => ({
                value: l,
                label: LEVEL_NAMES[l],
              }))}
              profiles={(["inverno", "verao", "meia", "longas"] as const).map(
                (p) => ({ value: p, label: PROFILE_NAMES[p] }),
              )}
              manual={open.manual}
              auto={{
                level: original.level,
                profile: original.profile,
                language: original.language,
              }}
              offersLocked={
                open.platformAlias
                  ? "O email é do Booking ou do Airbnb: só serve para a estada."
                  : null
              }
              onSave={saveGuest}
              onCancel={() =>
                setPanel({ kind: "ficha", key: open.key, editing: false })
              }
            />
          ) : (
            <GuestDetails
              guest={details}
              onEdit={() =>
                setPanel({ kind: "ficha", key: open.key, editing: true })
              }
            />
          )
        ) : null}
      </Panel>

      <Panel
        open={panel?.kind === "mensagem"}
        title={`Mensagem para ${int(targets.length)} ${targets.length === 1 ? "hóspede" : "hóspedes"}`}
        onClose={() => setPanel(null)}
      >
        <MessageComposer
          templates={TEMPLATE_IDS.map((id) => {
            const info = templateInfo(id);
            return {
              id,
              name: info.name,
              discount: info.discount
                ? formatDiscount(info.discount, "pt-PT")
                : "",
              first: (
                templateText(id, "pt-PT", "email").body.split("\n\n")[1] ?? ""
              )
                .replace(/^[^.!?]*[.!?]\s*/, "")
                .split("{DESCONTO}")
                .join(formatDiscount(info.discount, "pt-PT")),
            };
          })}
          template={template}
          onTemplate={(id) => {
            const t = id as TemplateId;
            setTemplate(t);
            setDiscount(Math.round(templateInfo(t).discount * 100));
          }}
          discount={discount}
          onDiscount={setDiscount}
          signature={settings.signature}
          onSignature={settings.setSignature}
          channel={channel}
          onChannel={setChannel}
          channelNote={
            channel === "email"
              ? "O email leva o assunto e, no fim, como deixar de receber."
              : `Texto curto. ${int(withoutPhone)} de ${int(targets.length)} não têm telefone e recebem por email. Pode juntar o telefone na ficha.`
          }
          languages={languages}
          language={current}
          onLanguage={(code) => setLanguage(code as LanguageCode)}
          subject={channel === "email" ? (mask.subject ?? "") : null}
          onSubject={(subject) =>
            settings.setEditedText(key, { ...mask, subject })
          }
          body={mask.body ?? ""}
          onBody={(body) => settings.setEditedText(key, { ...mask, body })}
          edited={settings.editedTexts[key] !== undefined}
          onRestore={() => settings.setEditedText(key, null)}
          unknown={unknownVariables(
            `${channel === "email" ? (mask.subject ?? "") : ""} ${mask.body ?? ""}`,
          )}
          variables={VARIABLE_HELP}
          preview={{
            who: example
              ? `${example.name} (${languageName(current)})`
              : languageName(current),
            subject: channel === "email" ? preview.subject : null,
            body: preview.body,
          }}
          targets={messageTargets}
          summary={messageSummary}
          onOpened={(k) => {
            setOpened((o) => [...o, k]);
            mark(k);
          }}
        />
      </Panel>

      <Panel
        open={panel?.kind === "regras"}
        title="Regras das etiquetas"
        onClose={() => setPanel(null)}
      >
        <RulesForm
          values={shownRules}
          onChange={(v) => {
            setDraft(v);
            setApplied(false);
          }}
          preview={
            previewCounts
              ? `Novo ${int(previewCounts.levels.novo)}, Voltou ${int(previewCounts.levels.voltou)}, Habitual ${int(previewCounts.levels.habitual)}, Gasta mais ${int(previewCounts.bigSpenders)}. Inverno ${int(previewCounts.profiles.inverno)}, Verão ${int(previewCounts.profiles.verao)}, Meia-estação ${int(previewCounts.profiles.meia)}, Estadas longas ${int(previewCounts.profiles.longas)}.`
              : ""
          }
          applied={applied}
          changed={rulesChanged}
          onApply={() => {
            g.setRules(isDefault ? null : shownRules);
            setDraft(null);
            setApplied(true);
          }}
          onReset={() => {
            g.setRules(null);
            setDraft(null);
            setApplied(true);
          }}
          notes={[
            `Perfil: a altura do ano da maioria das estadas (inverno de novembro a fevereiro, verão de junho a setembro, o resto é meia-estação), ou «Estadas longas» com ${int(shownRules.longStay)} noites ou mais, em média.`,
            `País: o da última estada. ${int(g.counts.multiCountry)} hóspedes reservaram com mais de um país.`,
            "Língua: a do país. Pode mudá-la em cada ficha.",
            `Emails do Booking ou do Airbnb encontrados: ${int(g.counts.platformAlias)}. Estes só servem para a estada e ficam fora das ofertas.`,
          ]}
        />
      </Panel>

      <Panel
        open={panel?.kind === "adicionar"}
        title="Adicionar hóspede"
        onClose={() => setPanel(null)}
      >
        <AddGuestForm
          countries={COUNTRIES}
          languageOf={LANGUAGE_OF}
          languages={LANGUAGE_OPTIONS}
          months={months}
          suggest={suggestLabels}
          onSave={(v) => {
            g.add({
              email: v.email,
              name: v.name,
              phone: v.phone,
              country: v.country,
              language: v.language as LanguageCode,
              checkIn: checkInOf(v.month),
              nights: v.nights,
            });
            setFilter(NO_FILTER);
            setList(null);
            setPanel({ kind: "ficha", key: v.email, editing: false });
          }}
          onCancel={() => setPanel(null)}
        />
      </Panel>
    </div>
  );
}
