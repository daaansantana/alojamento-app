// Prefilled invitation emails: a mailto: link with the subject and the body
// already written, in the guest's first name, with the opt-out line.

export type InvitationKind = "winter" | "direct";

const OPT_OUT =
  "\n\nSe preferir não receber mais mensagens nossas, responda com «Não» e retiramos o seu contacto.";

const TEXTS: Record<
  InvitationKind,
  { subject: string; body: (name: string) => string }
> = {
  winter: {
    subject: "Volte este inverno, com 10% de desconto",
    body: (name) =>
      `Olá ${name},\n\nObrigada por ter ficado connosco. Este inverno temos quartos livres e seria um gosto voltar a receber a sua visita. Se reservar diretamente connosco, tem 10% de desconto.\n\nPara reservar, basta responder a este email com as datas que prefere.\n\nAté breve!`,
  },
  direct: {
    subject: "Da próxima vez, reserve diretamente connosco",
    body: (name) =>
      `Olá ${name},\n\nObrigada por voltar a ficar connosco. Da próxima vez pode reservar diretamente: responda a este email com as datas e tem 5% de desconto.\n\nAté breve!`,
  },
};

/** A mailto: link to one guest, with the subject and the body filled in. */
export function invitationMailto(
  guest: { name: string; email: string },
  kind: InvitationKind,
): string {
  const firstName = guest.name.trim().split(/\s+/)[0];
  const { subject, body } = TEXTS[kind];
  return `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body(firstName) + OPT_OUT)}`;
}
