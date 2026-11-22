import { firstName, invitationMailto, invitationText } from "../lib/email";

let failures = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  ✔ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${name} ${detail}`);
  }
}

function parts(link: string) {
  const [, query = ""] = link.split("?");
  const params = Object.fromEntries(
    query.split("&").map((pair) => {
      const [key, value = ""] = pair.split("=");
      return [key, decodeURIComponent(value)];
    }),
  );
  return { subject: params.subject ?? "", body: params.body ?? "" };
}

const guest = { name: "Helena Costa", email: "helena.costa@correio.example" };
const OPT_OUT =
  "Se preferir não receber mais mensagens nossas, responda com «Não» e retiramos o seu contacto.";

console.log("email: winter");
const winter = invitationMailto(guest, "winter");
check(
  "starts with mailto:<email>?subject=",
  winter.startsWith("mailto:helena.costa@correio.example?subject="),
  winter.slice(0, 60),
);
check("has a body", winter.includes("&body="));
check("no raw spaces or line breaks", !/[\s]/.test(winter));
const w = parts(winter);
check(
  "subject",
  w.subject === "Volte este inverno, com 10% de desconto",
  JSON.stringify(w.subject),
);
check(
  "greets by first name",
  w.body.startsWith("Olá Helena,\n\n"),
  JSON.stringify(w.body.slice(0, 20)),
);
check("not the full name", !w.body.includes("Costa"));
check("10% discount", w.body.includes("tem 10% de desconto."));
check(
  "ends with the opt-out line",
  w.body.endsWith(`Até breve!\n\n${OPT_OUT}`),
);

console.log("\nemail: direct");
const direct = invitationMailto(guest, "direct");
check(
  "starts with mailto:<email>?subject=",
  direct.startsWith("mailto:helena.costa@correio.example?subject="),
);
const d = parts(direct);
check(
  "subject",
  d.subject === "Da próxima vez, reserve diretamente connosco",
  JSON.stringify(d.subject),
);
check("greets by first name", d.body.startsWith("Olá Helena,\n\n"));
check("5% discount", d.body.includes("tem 5% de desconto."));
check(
  "ends with the opt-out line",
  d.body.endsWith(`Até breve!\n\n${OPT_OUT}`),
);

console.log("\nemail: the text on its own");
const text = invitationText("winter", "Helena");
check(
  "same subject as the link",
  text.subject === w.subject,
  JSON.stringify(text.subject),
);
check("same body as the link", text.body === w.body);
check(
  "direct: same body as the link",
  invitationText("direct", "Helena").body === d.body,
);
check(
  "firstName",
  firstName("  Helena  Costa ") === "Helena",
  JSON.stringify(firstName("  Helena  Costa ")),
);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nall passed");
