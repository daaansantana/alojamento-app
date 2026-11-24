import {
  formatDiscount,
  messageFor,
  smsHref,
  unknownVariables,
  whatsappHref,
} from "../lib/messages";

let failures = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  ✔ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${name} ${detail}`);
  }
}

const OPT_OUT =
  "Se preferir não receber mais mensagens nossas, responda com «Não» e retiramos o seu contacto.";
const marta = { name: "Marta Oliveira", language: "pt-PT" as const };

console.log("messages: winter, in Portuguese");
const pt = messageFor(marta, "inverno", "email", {
  discount: 0.1,
  signature: "Isabel",
});
check(
  "opens with the first name",
  pt.body.startsWith("Olá Marta,"),
  pt.body.slice(0, 20),
);
check("says the discount", pt.body.includes("tem 10% de desconto"));
check("signed", pt.body.includes("Até breve!\nIsabel"));
check("ends with the opt-out line", pt.body.endsWith(OPT_OUT));
check(
  "subject filled",
  pt.subject === "Volte este inverno, com 10% de desconto",
  pt.subject,
);
check("no variable left", !/\{[A-Z]+\}/.test(pt.subject + pt.body));

console.log("messages: other languages and channels");
const de = messageFor(
  { name: "Rita Santos", language: "de" },
  "inverno",
  "email",
  { discount: 0.1, signature: "Isabel" },
);
check(
  "German writes the percent its own way",
  de.body.includes(`${formatDiscount(0.1, "de")} Rabatt`) &&
    formatDiscount(0.1, "de") !== "10%",
  formatDiscount(0.1, "de"),
);
const short = messageFor(marta, "direto", "whatsapp", {
  discount: 0.05,
  signature: "Isabel",
});
check("short text has no subject", short.subject === "");
check(
  "short text ends with the short opt-out",
  short.body.endsWith("Para não receber mais, responda NÃO."),
);
check("short text says 5%", short.body.includes("5% de desconto"));
const edited = messageFor(marta, "livre", "email", {
  discount: 0.1,
  signature: "Isabel",
  edited: {
    subject: "Novidades",
    body: "Olá {NOME},\n\nTemos {DESCONTO} para si.\n\n{ASSINATURA}",
  },
});
check(
  "an edited text is filled the same way",
  edited.body.startsWith("Olá Marta,\n\nTemos 10% para si.\n\nIsabel"),
);

console.log("messages: checks and links");
check(
  "unknown variables",
  JSON.stringify(unknownVariables("Olá {NOME}, {DATA}")) === '["{DATA}"]',
);
check(
  "no unknown variables",
  unknownVariables("Olá {NOME}, {DESCONTO} {ASSINATURA}").length === 0,
);
check(
  "WhatsApp link",
  whatsappHref("+351 912 000 101", "Olá") ===
    "https://wa.me/351912000101?text=Ol%C3%A1",
  whatsappHref("+351 912 000 101", "Olá"),
);
check(
  "SMS link",
  smsHref("+351 912 000 101", "Olá") === "sms:+351912000101?&body=Ol%C3%A1",
);

if (failures > 0) {
  console.error(`\n${failures} message check(s) failed`);
  process.exit(1);
}
