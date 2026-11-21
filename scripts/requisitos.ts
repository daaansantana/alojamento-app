// Requirements check: the brief («Projeto final») and the rules in docs/SPEC.md.
// Run: npm run requisitos              report; fails only if a rule is broken
//      npm run requisitos -- --final   also fails if a deliverable is missing
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const ROOT = process.cwd();
const FINAL = process.argv.includes("--final");

type Level = "rule" | "deliverable" | "recommended";
interface Result {
  level: Level;
  id: string;
  name: string;
  ok: boolean;
  detail: string;
}
const results: Result[] = [];

function add(level: Level, id: string, name: string, run: () => string[]) {
  let problems: string[];
  try {
    problems = run();
  } catch (error) {
    problems = [error instanceof Error ? error.message : String(error)];
  }
  results.push({
    level,
    id,
    name,
    ok: problems.length === 0,
    detail: problems.slice(0, 3).join("; "),
  });
}

// ---------------------------------------------------------------- files

const read = (file: string) => readFileSync(join(ROOT, file), "utf8");
const exists = (file: string) => existsSync(join(ROOT, file));

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (rel: string) => {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs)) {
      const child = join(rel, name);
      if (statSync(join(ROOT, child)).isDirectory()) walk(child);
      else if (/\.(ts|tsx|js|jsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
}

// Code without comments, so that a word in a comment is never a finding.
function code(file: string): string {
  const s = read(file);
  let out = "";
  let quote = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += s[i + 1] ?? "";
        i++;
      } else if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
    } else if (c === "/" && s[i + 1] === "/") {
      while (i < s.length && s[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && s[i + 1] === "*") {
      const end = s.indexOf("*/", i + 2);
      i = end === -1 ? s.length : end + 1;
    } else out += c;
  }
  return out;
}

// Where each import of a file points: a project folder ("store/...") or a package.
function imports(file: string): string[] {
  const text = code(file);
  const specs = [
    ...text.matchAll(/\bfrom\s*["']([^"']+)["']/g),
    ...text.matchAll(/\bimport\s*\(?\s*["']([^"']+)["']/g),
    ...text.matchAll(/\brequire\(\s*["']([^"']+)["']/g),
  ].map((m) => m[1]);
  return specs.map((spec) => {
    if (spec.startsWith("@/")) return spec.slice(2);
    if (spec.startsWith("."))
      return normalize(join(dirname(file), spec)).replaceAll("\\", "/");
    return `package:${spec}`;
  });
}

const APP = sourceFiles("app");
const COMPONENTS = sourceFiles("components");
const OWN_COMPONENTS = COMPONENTS.filter(
  (f) => !f.startsWith(join("components", "ui")),
);
const HOOKS = sourceFiles("hooks");
const LIB = sourceFiles("lib");
const STORE = sourceFiles("store");
const SERVICES = sourceFiles("services");

const importers = (files: string[], test: (target: string) => boolean) =>
  files.filter((f) => imports(f).some(test));
const using = (files: string[], pattern: RegExp) =>
  files.filter((f) => pattern.test(code(f)));

// ---------------------------------------------------------------- rules

add("rule", "R1", "One JSON per sheet in public/data/", () => {
  const problems: string[] = [];
  for (const file of ["quartos", "reservas"]) {
    const path = `public/data/${file}.json`;
    if (!exists(path)) problems.push(`${path} is missing`);
    else if (!Array.isArray(JSON.parse(read(path))))
      problems.push(`${path} is not a list`);
  }
  return problems;
});

add("rule", "R2", "Types use the exact JSON keys and value types", () => {
  const types = code("types/index.ts");
  const problems: string[] = [];
  for (const [name, file] of [
    ["Room", "quartos"],
    ["Booking", "reservas"],
  ]) {
    const body = types.match(
      new RegExp(`export interface ${name} \\{([\\s\\S]*?)\\n\\}`),
    )?.[1];
    if (!body) {
      problems.push(`no interface ${name} in types/index.ts`);
      continue;
    }
    const fields = new Map(
      [...body.matchAll(/^\s*(\w+)\??\s*:\s*([^;]+);/gm)].map((m) => [
        m[1],
        m[2].trim(),
      ]),
    );
    const rows: Record<string, unknown>[] = JSON.parse(
      read(`public/data/${file}.json`),
    );
    for (const [index, row] of rows.entries()) {
      const keys = Object.keys(row);
      const missing = [...fields.keys()].filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !fields.has(k));
      if (missing.length || extra.length) {
        problems.push(
          `${file}.json row ${index + 1}: missing ${missing.join(", ") || "none"}, not in ${name} ${extra.join(", ") || "none"}`,
        );
        break;
      }
      const wrong = keys.filter((k) => {
        const type = fields.get(k);
        return (
          (type === "number" || type === "string" || type === "boolean") &&
          typeof row[k] !== type
        );
      });
      if (wrong.length) {
        problems.push(
          `${file}.json row ${index + 1}: ${wrong.join(", ")} has the wrong type (a number in quotes?)`,
        );
        break;
      }
    }
  }
  return problems;
});

add("rule", "R3", "One fetch per sheet, only in services/", () => {
  const problems: string[] = [];
  const services = exists("services/data.ts") ? code("services/data.ts") : "";
  for (const [fn, file] of [
    ["fetchRooms", "quartos"],
    ["fetchBookings", "reservas"],
  ]) {
    if (
      !new RegExp(`export\\s+(const|async function|function)\\s+${fn}\\b`).test(
        services,
      )
    )
      problems.push(`services/data.ts does not export ${fn}`);
    if (!services.includes(`"${file}"`))
      problems.push(`services/data.ts does not read ${file}.json`);
  }
  for (const f of using(
    [...APP, ...COMPONENTS, ...HOOKS, ...LIB, ...STORE],
    /\bfetch\s*\(/,
  ))
    problems.push(`fetch in ${f}`);
  return problems;
});

add(
  "rule",
  "R4",
  "lib/ is pure: no fetch, store, React or today's date",
  () => {
    const forbidden = (t: string) =>
      /^(store|services|hooks|components|app)(\/|$)/.test(t) ||
      /^package:(react|react-dom|next|zustand)(\/|$)/.test(t);
    return [
      ...importers(LIB, forbidden).map(
        (f) => `${f} imports the store, React or a page`,
      ),
      ...using(LIB, /\bDate\.now\s*\(|\bnew Date\s*\(\s*\)/).map(
        (f) => `${f} uses today's date`,
      ),
    ];
  },
);

add("rule", "R5", "Dates are converted only in lib/", () =>
  using(
    [...APP, ...COMPONENTS, ...HOOKS, ...STORE, ...SERVICES],
    /\bnew Date\s*\(|\bDate\.parse\s*\(/,
  ).map((f) => `date conversion in ${f}`),
);

add(
  "rule",
  "R6",
  "Components get data by props: no store, services or data hooks",
  () => {
    const forbidden = (t: string) =>
      /^(store|services)(\/|$)/.test(t) ||
      /^package:zustand(\/|$)/.test(t) ||
      /^hooks\/use[A-Z]/.test(t) ||
      (/^lib\//.test(t) && !/^lib\/(utils|format)$/.test(t));
    return importers(COMPONENTS, forbidden).map(
      (f) => `${f} imports the store, services, a data hook or a lib/ function`,
    );
  },
);

add("rule", "R7", "The Zustand store is read only through hooks", () => {
  const problems: string[] = [];
  if (!STORE.some((f) => imports(f).includes("package:zustand")))
    problems.push("no store built with zustand in store/");
  for (const f of importers([...APP, ...COMPONENTS, ...LIB, ...SERVICES], (t) =>
    /^store(\/|$)/.test(t),
  ))
    problems.push(`${f} imports the store`);
  return problems;
});

add("rule", "R8", "No backend: no API routes or server actions", () => [
  ...APP.filter((f) => /(^|[\\/])route\.(ts|js)$/.test(f)).map(
    (f) => `route handler ${f}`,
  ),
  ...using([...APP, ...COMPONENTS, ...LIB], /["']use server["']/).map(
    (f) => `server action in ${f}`,
  ),
]);

add("rule", "R9", "useData returns the data, status, error and retry", () => {
  if (!exists("hooks/useData.ts")) return ["hooks/useData.ts is missing"];
  const hook = code("hooks/useData.ts");
  return ["rooms", "bookings", "status", "error", "retry"]
    .filter((k) => !new RegExp(`\\b${k}\\b`).test(hook))
    .map((k) => `useData does not return ${k}`);
});

// ---------------------------------------------------------------- deliverables

const PAGES = APP.filter((f) => /page\.(tsx|jsx)$/.test(f));
const uiImport = (name: string) => (t: string) =>
  t === `components/ui/${name}` ||
  (name === "chart" && t === "package:recharts");

add("deliverable", "D1", "A page reads the data through the hooks", () =>
  importers(PAGES, (t) => /^hooks\/use[A-Z]/.test(t)).length
    ? []
    : ["no page in app/ uses a hook from hooks/"],
);

add(
  "deliverable",
  "D2",
  "At least one way to see the information (chart, table or cards)",
  () =>
    importers(OWN_COMPONENTS, (t) =>
      ["chart", "table", "card"].some((n) => uiImport(n)(t)),
    ).length
      ? []
      : ["no component draws a chart, a table or cards"],
);

add("deliverable", "D3", "Charts drawn with Recharts", () =>
  importers(OWN_COMPONENTS, uiImport("chart")).length
    ? []
    : ["no component imports recharts or components/ui/chart"],
);

add("deliverable", "D4", "shadcn/ui components in the interface", () =>
  importers(
    [...PAGES, ...OWN_COMPONENTS].filter(
      (f) => !f.startsWith(join("components", "states")),
    ),
    (t) => t.startsWith("components/ui/"),
  ).length
    ? []
    : ["no page or component uses components/ui/"],
);

add(
  "deliverable",
  "D5",
  "Loading, error and empty states, with a retry button",
  () => {
    const all = [...APP, ...OWN_COMPONENTS].filter(
      (f) => !f.startsWith(join("components", "states")),
    );
    const problems = ["LoadingState", "ErrorState", "EmptyState"]
      .filter((name) => !using(all, new RegExp(`<${name}\\b`)).length)
      .map((name) => `${name} is not used`);
    const error = "components/states/error-state.tsx";
    if (!exists(error) || !/\bonRetry\b/.test(code(error)))
      problems.push("ErrorState has no onRetry");
    return problems;
  },
);

add("deliverable", "D6", "Email links to the guests who come back", () =>
  using([...APP, ...OWN_COMPONENTS], /mailto:/).length
    ? []
    : ["no mailto: link"],
);

add(
  "deliverable",
  "D7",
  "Every expected value in the golden tests is met",
  () => {
    const run = spawnSync("npx", ["tsx", "scripts/golden.test.ts"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const line = `${run.stdout}\n${run.stderr}`.match(
      /(\d+) of (\d+) checks pass/,
    );
    if (!line) return ["the golden tests did not finish"];
    return line[1] === line[2] ? [] : [`${line[1]} of ${line[2]} checks pass`];
  },
);

add(
  "deliverable",
  "D8",
  "The golden tests run inside npm run verificar",
  () => {
    const scripts = JSON.parse(read("package.json")).scripts ?? {};
    return /gabaritos/.test(scripts.verificar ?? "")
      ? []
      : ["verificar does not run gabaritos"];
  },
);

const heading = (file: string, pattern: RegExp) =>
  exists(file) &&
  read(file)
    .split("\n")
    .some((l) => /^#{1,4}\s/.test(l) && pattern.test(l));

add(
  "deliverable",
  "D9",
  "Data analysis: exploration, conclusions and indicators",
  () => {
    const file = "docs/ANALISE.md";
    if (!exists(file)) return [`${file} is missing`];
    return [
      ["exploration", /explora/i],
      ["conclusions", /conclus/i],
      ["indicators", /indicador|kpi/i],
    ]
      .filter(([, p]) => !heading(file, p as RegExp))
      .map(([name]) => `${file} has no ${name} section`);
  },
);

add("deliverable", "D10", "Persona documented", () =>
  ["README.md", "PRODUCT.md", "docs/ANALISE.md"].some((f) =>
    heading(f, /persona/i),
  )
    ? []
    : ["no Persona heading in README.md, PRODUCT.md or docs/ANALISE.md"],
);

add("deliverable", "D11", "KPI documented", () =>
  heading("docs/ANALISE.md", /\bkpi\b/i)
    ? []
    : ["no KPI heading in docs/ANALISE.md"],
);

add("deliverable", "D12", "Hypotheses registered with their results", () =>
  exists("HIPOTESES.md") && /resultado/i.test(read("HIPOTESES.md"))
    ? []
    : ["HIPOTESES.md has no results"],
);

add("deliverable", "D13", "Interface marked as Portuguese (html lang)", () =>
  exists("app/layout.tsx") &&
  /<html[^>]*\blang=["']pt/.test(code("app/layout.tsx"))
    ? []
    : ['app/layout.tsx has no <html lang="pt-PT">'],
);

// ---------------------------------------------------------------- recommended

add("recommended", "S1", "The brief's nine skills are installed", () => {
  const lock = exists("skills-lock.json")
    ? (JSON.parse(read("skills-lock.json")).skills ?? {})
    : {};
  const missing = [
    "recharts",
    "nextjs-zustand",
    "solar-icons",
    "nextjs-app-router-patterns",
    "impeccable",
    "ponytail",
    "design-system",
    "data-analysis",
    "exploratory-data-analysis",
  ].filter((s) => !(s in lock));
  return missing.length ? [`missing: ${missing.join(", ")}`] : [];
});

add("recommended", "S2", "Interface icons from Solar Icons", () =>
  importers([...APP, ...OWN_COMPONENTS], (t) =>
    t.startsWith("package:@solar-icons/"),
  ).length
    ? []
    : ["no component imports @solar-icons/react"],
);

add("recommended", "S3", "Rooms joined to bookings by key with a Map", () =>
  using(LIB, /\bnew Map\b/).length && using(LIB, /\broom_id\b/).length
    ? []
    : ["lib/ has no Map keyed by room_id"],
);

add("recommended", "S4", "Published app linked in the README", () =>
  /https:\/\/\S+\.vercel\.app/.test(read("README.md"))
    ? []
    : ["no vercel.app link in README.md"],
);

// ---------------------------------------------------------------- report

const TITLES: Record<Level, string> = {
  rule: "Rules: always true",
  deliverable: "Deliverables",
  recommended: "Recommended by the brief",
};
console.log("Requirements check: the brief and docs/SPEC.md");
for (const level of ["rule", "deliverable", "recommended"] as Level[]) {
  console.log(`\n${TITLES[level]}`);
  for (const r of results.filter((x) => x.level === level))
    console.log(
      `  ${r.ok ? "✓" : "✗"} ${r.id} ${r.name}${r.ok ? "" : ` — ${r.detail}`}`,
    );
}
console.log(
  [
    "\nCheck by hand before closing a stage:",
    "  · the page on a phone (390 px) and a computer (1280 px)",
    "  · contrast and keyboard focus (design skill audit)",
    "  · the 5-minute presentation and the slides",
  ].join("\n"),
);

const count = (level: Level) => {
  const all = results.filter((r) => r.level === level);
  return `${all.filter((r) => r.ok).length} of ${all.length}`;
};
console.log(
  `\nRules: ${count("rule")}. Deliverables: ${count("deliverable")}. Recommended: ${count("recommended")}.`,
);
const broken = results.filter(
  (r) => !r.ok && (r.level === "rule" || (FINAL && r.level === "deliverable")),
);
if (broken.length) process.exit(1);
