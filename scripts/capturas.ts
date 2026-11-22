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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
