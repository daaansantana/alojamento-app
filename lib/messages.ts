// Ready messages in seven languages (lib/data/mensagens.json): a mask with
// {NOME}, {DESCONTO} and {ASSINATURA}, filled for each guest in their own
// language, with the opt-out line always added at the end.

import data from "@/lib/data/mensagens.json";
import type { GuestProfileId, LanguageCode } from "@/types";

export type Channel = "email" | "whatsapp" | "sms";
export type TemplateId =
  | "inverno"
  | "maio-outubro"
  | "direto"
  | "semana"
  | "livre";

export const TEMPLATE_IDS: TemplateId[] = [
  "inverno",
  "maio-outubro",
  "direto",
  "semana",
  "livre",
];
export const LANGUAGES: LanguageCode[] = [
  "pt-PT",
  "pt-BR",
  "es",
  "en",
  "de",
  "fr",
  "nl",
];
export const VARIABLES = ["{NOME}", "{DESCONTO}", "{ASSINATURA}"] as const;

/** The ready message for each profile. */
export const TEMPLATE_FOR_PROFILE: Record<GuestProfileId, TemplateId> = {
  inverno: "inverno",
  verao: "maio-outubro",
  meia: "direto",
  longas: "semana",
};

interface Template {
  nome: string;
  perfil: string | null;
  desconto: number;
  assunto: Record<LanguageCode, string>;
  email: Record<LanguageCode, string>;
  curto: Record<LanguageCode, string>;
}
const TEMPLATES = data.modelos as Record<TemplateId, Template>;
const LANGS = data.linguas as Record<
  LanguageCode,
  { nome: string; sair: string; sairCurto: string }
>;

/** «Deutsch», «Français»: each language in its own words. */
export function languageName(code: LanguageCode): string {
  return LANGS[code].nome;
}

/** The name and default discount of a ready message. */
export function templateInfo(id: TemplateId): {
  name: string;
  discount: number;
} {
  return { name: TEMPLATES[id].nome, discount: TEMPLATES[id].desconto };
}

/** The mask before it is filled: the subject (email only) and the text. */
export function templateText(
  id: TemplateId,
  lang: LanguageCode,
  channel: Channel,
): { subject: string; body: string } {
  const t = TEMPLATES[id];
  return channel === "email"
    ? { subject: t.assunto[lang], body: t.email[lang] }
    : { subject: "", body: t.curto[lang] };
}

/** "Helena Costa" → "Helena". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** 0.1 → «10%» in Portuguese, «10 %» in German and French. */
export function formatDiscount(discount: number, lang: LanguageCode): string {
  return new Intl.NumberFormat(lang, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(discount);
}

/** Puts the guest's first name, the discount and the signature in the mask. */
export function fillMessage(
  mask: string,
  values: { name: string; discount: number; signature: string },
  lang: LanguageCode,
): string {
  return mask
    .split("{NOME}")
    .join(firstName(values.name))
    .split("{DESCONTO}")
    .join(formatDiscount(values.discount, lang))
    .split("{ASSINATURA}")
    .join(values.signature);
}

/** The {…} in a text that are not one of the three variables. */
export function unknownVariables(text: string): string[] {
  const found = text.match(/\{[^{}\s]+\}/g) ?? [];
  return [
    ...new Set(
      found.filter((v) => !(VARIABLES as readonly string[]).includes(v)),
    ),
  ];
}

/**
 * The message one guest receives, in their language. The host's edited text
 * for that language replaces the ready one; the opt-out line is always added.
 */
export function messageFor(
  guest: { name: string; language: LanguageCode },
  id: TemplateId,
  channel: Channel,
  options: {
    discount: number;
    signature: string;
    edited?: { subject?: string; body?: string };
  },
): { subject: string; body: string } {
  const mask = templateText(id, guest.language, channel);
  const subject = options.edited?.subject ?? mask.subject;
  const body = options.edited?.body ?? mask.body;
  const values = {
    name: guest.name,
    discount: options.discount,
    signature: options.signature,
  };
  const optOut =
    channel === "email"
      ? `\n\n${LANGS[guest.language].sair}`
      : ` ${LANGS[guest.language].sairCurto}`;
  return {
    subject: fillMessage(subject, values, guest.language),
    body: fillMessage(body, values, guest.language).trimEnd() + optOut,
  };
}

/** A mailto: link with the subject and the text filled in. */
export function mailtoHref(
  email: string,
  subject: string,
  body: string,
): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** WhatsApp's click-to-chat link: the number in digits only. */
export function whatsappHref(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** An SMS link that opens the phone's messages with the text written. */
export function smsHref(phone: string, text: string): string {
  return `sms:${phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(text)}`;
}
