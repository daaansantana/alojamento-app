// Screenshots of the four screens on a phone (390 px) and a computer
// (1280 px), full height, for the checks by hand. Uses the existing build: run
// `npm run build` first. Chrome comes from CHROME, or the usual macOS path.
// Run: npm run capturas  → .capturas/<screen>-390.png and .capturas/<screen>-1280.png
// It also lists the browser console's errors and warnings on each screen.
import { type ChildProcess, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const PORT = 3100;
const DEBUG_PORT = 9223;
const SITE = `http://localhost:${PORT}`;
const SCREENS = [
  { name: "inicio", path: "/" },
  { name: "hospedes", path: "/hospedes" },
  { name: "precos", path: "/precos" },
  { name: "ano", path: "/ano" },
];
const OUT = join(ROOT, ".capturas");
const CHROME =
  process.env.CHROME ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SIZES = [
  { width: 390, height: 844, mobile: true },
  { width: 1280, height: 800, mobile: false },
];

// With --alinhamento: no screenshots; the layout rules from DESIGN.md are
// measured on every page at these widths, and any break fails the run.
const ALIGN = process.argv.includes("--alinhamento");
const ALIGN_SIZES = [
  { width: 390, height: 844, mobile: true },
  { width: 1024, height: 800, mobile: false },
  { width: 1280, height: 800, mobile: false },
  { width: 1440, height: 900, mobile: false },
  { width: 1920, height: 1080, mobile: false },
];

// Runs in the page. Returns the gaps, in px, that the rules check.
const MEASURE = `(() => {
  const box = (e) => e.getBoundingClientRect();
  const size = (e) => parseFloat(getComputedStyle(e).fontSize);
  const hasText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const firstTextLeft = (e) => {
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.textContent.trim() ? 1 : 3 });
    const node = walker.nextNode();
    if (!node) return null;
    const range = document.createRange(); range.selectNodeContents(node);
    return range.getBoundingClientRect().left;
  };
  const h1 = document.querySelector("main h1");
  const logo = document.querySelector("header a");
  const out = { scroll: document.documentElement.scrollWidth - innerWidth };
  if (h1 && logo) out.left = Math.round(Math.abs(box(h1).left - box(logo).left));
  const grid = document.querySelector('[data-layout="colunas"]');
  if (grid && getComputedStyle(grid).gridTemplateColumns.split(" ").length > 1) {
    const [main, side] = [...grid.children];
    const top = (col) => box(col.firstElementChild || col).top;
    out.tops = Math.round(Math.abs(top(main) - top(side)));
    let biggest = 0;
    for (const e of side.querySelectorAll("*")) if (hasText(e)) biggest = Math.max(biggest, size(e));
    out.side = Math.round(biggest - size(h1));
    const cards = [...side.querySelectorAll("*")].filter((e) => {
      const s = getComputedStyle(e);
      const framed = s.borderTopWidth !== "0px" || s.backgroundColor !== "rgba(0, 0, 0, 0)";
      return framed && parseFloat(s.paddingLeft) >= 16 && box(e).width > 200 && !e.parentElement.closest("details");
    }).filter((e, i, all) => !all.some((o) => o !== e && o.contains(e)));
    const lefts = cards.map(firstTextLeft).filter((x) => x !== null);
    out.cards = lefts.length > 1 ? Math.round(Math.max(...lefts) - Math.min(...lefts)) : 0;
  }
  return JSON.stringify(out);
})()`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor<T>(
  what: string,
  probe: () => Promise<T | undefined>,
  timeoutMs = 30_000,
): Promise<T> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const value = await probe();
      if (value !== undefined) return value;
    } catch {
      // not ready yet
    }
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${what}`);
}

// A minimal Chrome DevTools Protocol client over the built-in WebSocket.
class Cdp {
  private next = 1;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  // biome-ignore lint/suspicious/noExplicitAny: CDP events are untyped JSON
  onEvent: (method: string, params: any) => void = () => {};
  private constructor(private ws: WebSocket) {
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.method) this.onEvent(msg.method, msg.params);
      const waiting = this.pending.get(msg.id);
      if (!waiting) return;
      this.pending.delete(msg.id);
      if (msg.error) waiting.reject(new Error(msg.error.message));
      else waiting.resolve(msg.result);
    });
  }
  static open(url: string): Promise<Cdp> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener("open", () => resolve(new Cdp(ws)));
      ws.addEventListener("error", () => reject(new Error("no CDP socket")));
    });
  }
  // biome-ignore lint/suspicious/noExplicitAny: CDP results are untyped JSON
  send(method: string, params: object = {}): Promise<any> {
    const id = this.next++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) =>
      this.pending.set(id, { resolve, reject }),
    );
  }
  close() {
    this.ws.close();
  }
}

function stop(child: ChildProcess | undefined) {
  if (child && child.exitCode === null) child.kill("SIGTERM");
}

async function main() {
  if (!existsSync(join(ROOT, ".next", "BUILD_ID")))
    throw new Error("no build in .next/: run npm run build first");
  if (!existsSync(CHROME)) throw new Error(`no Chrome at ${CHROME}`);
  mkdirSync(OUT, { recursive: true });

  const server = spawn(
    join(ROOT, "node_modules", ".bin", "next"),
    ["start", "-p", String(PORT)],
    { cwd: ROOT, stdio: "ignore" },
  );
  const profile = mkdtempSync(join(tmpdir(), "capturas-"));
  let chrome: ChildProcess | undefined;
  try {
    await waitFor("the server", async () =>
      (await fetch(SITE)).ok ? true : undefined,
    );

    chrome = spawn(
      CHROME,
      [
        "--headless=new",
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--hide-scrollbars",
        "about:blank",
      ],
      { stdio: "ignore" },
    );
    const target = await waitFor("Chrome", async () => {
      const list = await (
        await fetch(`http://localhost:${DEBUG_PORT}/json/list`)
      ).json();
      return list.find((t: { type: string }) => t.type === "page");
    });
    const cdp = await Cdp.open(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    const problems: string[] = [];
    cdp.onEvent = (method, params) => {
      if (method === "Runtime.exceptionThrown")
        problems.push(
          params.exceptionDetails.exception?.description ??
            params.exceptionDetails.text,
        );
      if (
        method === "Runtime.consoleAPICalled" &&
        (params.type === "error" || params.type === "warning")
      )
        problems.push(
          params.args
            .map((a: { value?: unknown; description?: string }) =>
              String(a.value ?? a.description),
            )
            .join(" "),
        );
      if (method === "Log.entryAdded" && params.entry.level === "error")
        problems.push(params.entry.text);
    };

    if (ALIGN) {
      const failures = await checkAlignment(cdp);
      cdp.close();
      if (failures > 0) {
        console.log(`  ${failures} rule(s) broken`);
        process.exitCode = 1;
      } else console.log("  every rule holds on every page and width");
      return;
    }

    for (const size of SIZES)
      for (const screen of SCREENS) {
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: size.width,
          height: size.height,
          deviceScaleFactor: 2,
          mobile: size.mobile,
        });
        await cdp.send("Page.navigate", { url: SITE + screen.path });
        // The page is ready when the data has loaded: the title or the error.
        await waitFor("the page", async () => {
          const { result } = await cdp.send("Runtime.evaluate", {
            expression:
              "document.readyState === 'complete' && !!document.querySelector('h1, [role=alert]')",
            returnByValue: true,
          });
          return result.value === true ? true : undefined;
        });
        await sleep(300);
        const { result } = await cdp.send("Runtime.evaluate", {
          expression:
            "JSON.stringify([document.documentElement.scrollWidth, document.documentElement.scrollHeight])",
          returnByValue: true,
        });
        const [width, height] = JSON.parse(result.value) as [number, number];
        // Grow the viewport to the whole page, so the fixed bar sits at its foot.
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: size.width,
          height,
          deviceScaleFactor: 2,
          mobile: size.mobile,
        });
        await sleep(300);
        const shot = await cdp.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: size.width, height, scale: 1 },
        });
        const name = `${screen.name}-${size.width}.png`;
        const file = join(OUT, name);
        writeFileSync(file, Buffer.from(shot.data, "base64"));
        const sideways =
          width > size.width
            ? `, ${width - size.width} px of sideways scroll`
            : "";
        console.log(
          `  ✓ ${screen.path} at ${size.width} px → .capturas/${name} (${height} px tall${sideways})`,
        );
        for (const problem of problems.splice(0))
          console.log(`    console: ${problem.slice(0, 300)}`);
      }
    cdp.close();
  } finally {
    stop(chrome);
    stop(server);
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
  }
}

async function openPage(
  cdp: Cdp,
  size: { width: number; height: number; mobile: boolean },
  path: string,
) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: 1,
    mobile: size.mobile,
  });
  await cdp.send("Page.navigate", { url: SITE + path });
  await waitFor("the page", async () => {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression:
        "document.readyState === 'complete' && !!document.querySelector('h1, [role=alert]')",
      returnByValue: true,
    });
    return result.value === true ? true : undefined;
  });
  await sleep(300);
}

/** Measures every page at every width; prints a table and counts what fails. */
async function checkAlignment(cdp: Cdp): Promise<number> {
  const RULES: {
    key: "left" | "tops" | "side" | "cards" | "scroll";
    name: string;
    ok: (v: number) => boolean;
    desktop: boolean;
  }[] = [
    {
      key: "left",
      name: "title starts under the logo (±1 px)",
      ok: (v) => v <= 1,
      desktop: true,
    },
    {
      key: "tops",
      name: "both columns start together (±2 px)",
      ok: (v) => v <= 2,
      desktop: true,
    },
    {
      key: "side",
      name: "no side text larger than the title",
      ok: (v) => v <= 0,
      desktop: true,
    },
    {
      key: "cards",
      name: "side cards' text starts at the same x (±1 px)",
      ok: (v) => v <= 1,
      desktop: true,
    },
    {
      key: "scroll",
      name: "no sideways scroll",
      ok: (v) => v <= 0,
      desktop: false,
    },
  ];
  let failures = 0;
  for (const size of ALIGN_SIZES)
    for (const screen of SCREENS) {
      await openPage(cdp, size, screen.path);
      const { result } = await cdp.send("Runtime.evaluate", {
        expression: MEASURE,
        returnByValue: true,
      });
      const measured = JSON.parse(result.value) as Partial<
        Record<(typeof RULES)[number]["key"], number>
      >;
      for (const rule of RULES) {
        if (rule.desktop && size.mobile) continue;
        const value = measured[rule.key];
        if (value === undefined) continue;
        const pass = rule.ok(value);
        if (!pass) failures += 1;
        console.log(
          `  ${pass ? "✓" : "✗"} ${screen.path.padEnd(10)} ${String(size.width).padStart(4)} px  ${rule.name}: ${value} px`,
        );
      }
    }
  return failures;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
