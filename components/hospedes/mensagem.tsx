"use client";

import { ChatRoundLineIcon } from "@solar-icons/react/linear/chat-round-line";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { SmartphoneIcon } from "@solar-icons/react/linear/smartphone";
import { useRef, useState } from "react";
import { BUTTON, FIELD, PILL } from "./comum";

export type ChannelId = "email" | "whatsapp" | "sms";

export interface MessageTarget {
  key: string;
  name: string;
  flag: string | null;
  country: string;
  via: string; // «Deutsch, por email (sem telefone)»
  kind: ChannelId;
  mailto: string; // the email link
  link: string; // the WhatsApp or SMS link, when it goes that way
  opened: boolean;
  refused: string | null; // why this guest gets no offer
}

const ICON = {
  email: LetterIcon,
  whatsapp: ChatRoundLineIcon,
  sms: SmartphoneIcon,
};
const OPEN = {
  email: "Abrir email",
  whatsapp: "Abrir WhatsApp",
  sms: "Abrir SMS",
};

/** Write to a group: a ready message, edited in each guest's language. */
export function MessageComposer({
  templates,
  template,
  onTemplate,
  discount,
  onDiscount,
  signature,
  onSignature,
  channel,
  onChannel,
  channelNote,
  languages,
  language,
  onLanguage,
  subject,
  onSubject,
  body,
  onBody,
  edited,
  onRestore,
  unknown,
  variables,
  preview,
  targets,
  summary,
  onOpened,
}: {
  templates: { id: string; name: string; discount: string; first: string }[];
  template: string;
  onTemplate: (id: string) => void;
  discount: number;
  onDiscount: (percent: number) => void;
  signature: string;
  onSignature: (signature: string) => void;
  channel: ChannelId;
  onChannel: (channel: ChannelId) => void;
  channelNote: string;
  languages: { code: string; label: string; count: number }[];
  language: string;
  onLanguage: (code: string) => void;
  subject: string | null;
  onSubject: (subject: string) => void;
  body: string;
  onBody: (body: string) => void;
  edited: boolean;
  onRestore: () => void;
  unknown: string[];
  variables: { name: string; says: string }[];
  preview: { who: string; subject: string | null; body: string };
  targets: MessageTarget[];
  summary: string;
  onOpened: (key: string) => void;
}) {
  const text = useRef<HTMLTextAreaElement>(null);
  const [all, setAll] = useState(false);
  const insert = (variable: string) => {
    const el = text.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    onBody(body.slice(0, start) + variable + body.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + variable.length, start + variable.length);
    });
  };
  const shown = all ? targets : targets.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-bold">Escolha uma mensagem pronta</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={template === t.id}
              onClick={() => onTemplate(t.id)}
              className="flex flex-col items-start gap-1 rounded-xl border border-control p-4 text-left hover:bg-muted aria-pressed:border-primary aria-pressed:bg-accent"
            >
              <span className="font-bold">
                {t.name}
                {t.discount ? `, ${t.discount}` : ""}
              </span>
              <span className="line-clamp-2 text-sm text-muted-foreground">
                {t.first}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">Desconto</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={50}
              step={1}
              className={`${FIELD} w-24`}
              value={discount}
              onChange={(e) =>
                onDiscount(
                  Math.max(0, Math.min(50, Number(e.target.value) || 0)),
                )
              }
            />
            %
          </span>
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="font-bold">Assinatura</span>
          <input
            className={FIELD}
            value={signature}
            onChange={(e) => onSignature(e.target.value)}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">Como enviar</legend>
        <div className="flex flex-wrap gap-2">
          {(["email", "whatsapp", "sms"] as const).map((c) => {
            const Icon = ICON[c];
            return (
              <button
                key={c}
                type="button"
                aria-pressed={channel === c}
                onClick={() => onChannel(c)}
                className={PILL}
              >
                <Icon size={20} aria-hidden={true} />
                {c === "email"
                  ? "Email"
                  : c === "whatsapp"
                    ? "WhatsApp"
                    : "SMS"}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{channelNote}</p>
      </fieldset>

      <section aria-label="O texto" className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="font-bold">
            Cada hóspede recebe na sua língua. Ver e editar em:
          </span>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                aria-pressed={language === l.code}
                onClick={() => onLanguage(l.code)}
                className={PILL}
              >
                {l.label}
                <span className="tabular-nums opacity-80">{l.count}</span>
              </button>
            ))}
          </div>
        </div>
        {subject !== null ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-bold">Assunto</span>
            <input
              className={FIELD}
              value={subject}
              onChange={(e) => onSubject(e.target.value)}
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className="font-bold">
            Texto{" "}
            {edited ? (
              <span className="font-normal text-muted-foreground">
                (mudado por si)
              </span>
            ) : null}
          </span>
          <textarea
            ref={text}
            rows={12}
            className={`${FIELD} py-2 leading-relaxed`}
            value={body}
            onChange={(e) => onBody(e.target.value)}
            aria-describedby={
              unknown.length ? "variaveis-desconhecidas" : undefined
            }
          />
        </label>
        {unknown.length ? (
          <p id="variaveis-desconhecidas" className="text-sm text-destructive">
            {unknown.join(", ")}{" "}
            {unknown.length === 1
              ? "não é uma variável conhecida"
              : "não são variáveis conhecidas"}
            . Use {variables.map((v) => v.name).join(", ")}.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Pôr no texto:</span>
          {variables.map((v) => (
            <button
              key={v.name}
              type="button"
              className={BUTTON}
              onClick={() => insert(v.name)}
              title={v.says}
            >
              {v.name}
            </button>
          ))}
          {edited ? (
            <button type="button" className={BUTTON} onClick={onRestore}>
              <RestartIcon size={20} aria-hidden={true} />
              Repor o texto original
            </button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          As traduções são um rascunho: peça a quem fala a língua que as reveja.
        </p>
      </section>

      <section
        aria-label="Como fica"
        className="flex flex-col gap-2 rounded-xl bg-muted p-5 sm:p-6"
      >
        <span className="text-sm text-muted-foreground">
          Como fica para {preview.who}
        </span>
        {preview.subject !== null ? (
          <p className="font-bold">{preview.subject}</p>
        ) : null}
        <p className="whitespace-pre-line">{preview.body}</p>
      </section>

      <section aria-label="Enviar" className="flex flex-col gap-2">
        <h3 className="font-bold">Enviar, um a um</h3>
        <p className="text-sm">{summary}</p>
        <ul className="flex flex-col divide-y border-y">
          {shown.map((t) => {
            const Icon = ICON[t.kind];
            return (
              <li
                key={t.key}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                {t.flag ? (
                  // biome-ignore lint/performance/noImgElement: a 30×20 svg
                  <img
                    src={`/bandeiras/${t.flag}.svg`}
                    alt={t.country}
                    width={20}
                    height={14}
                    className="h-3.5 w-5 rounded-[3px]"
                  />
                ) : null}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{t.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {t.refused ?? t.via}
                  </span>
                </span>
                {t.refused ? null : t.opened ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-success">
                    <CheckCircleIcon size={20} aria-hidden={true} />
                    Aberto
                  </span>
                ) : t.kind === "email" ? (
                  <a
                    href={t.mailto}
                    className={`${BUTTON} text-primary`}
                    onClick={() => onOpened(t.key)}
                  >
                    <Icon size={20} aria-hidden={true} />
                    {OPEN.email}
                  </a>
                ) : (
                  <a
                    href={t.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`${BUTTON} text-primary`}
                    onClick={() => onOpened(t.key)}
                  >
                    <Icon size={20} aria-hidden={true} />
                    {OPEN[t.kind]}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        {targets.length > 8 ? (
          <button
            type="button"
            className={`${BUTTON} self-start`}
            onClick={() => setAll((a) => !a)}
          >
            {all ? "Mostrar menos" : `Mostrar todos os ${targets.length}`}
          </button>
        ) : null}
        <p className="text-sm text-muted-foreground">
          A nexo abre o seu email, WhatsApp ou SMS com o texto escrito. Quem
          envia é a Isabel.
        </p>
      </section>
    </div>
  );
}
