// Screenshots of the page on a phone (390 px) and a computer (1280 px), full
// height, for the checks by hand. Uses the existing build: run `npm run build`
// first. Chrome comes from CHROME, or the usual macOS path.
// Run: npm run capturas  → .capturas/telemovel-390.png, .capturas/computador-1280.png
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
const PAGE = `http://localhost:${PORT}/`;
const OUT = join(ROOT, ".capturas");
const CHROME =
  process.env.CHROME ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SIZES = [
  { name: "telemovel-390", width: 390, height: 844, mobile: true },
  { name: "computador-1280", width: 1280, height: 800, mobile: false },
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
  private constructor(private ws: WebSocket) {
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
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
      (await fetch(PAGE)).ok ? true : undefined,
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

    for (const size of SIZES) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: size.width,
        height: size.height,
        deviceScaleFactor: 2,
        mobile: size.mobile,
      });
      await cdp.send("Page.navigate", { url: PAGE });
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
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: size.width, height, scale: 1 },
      });
      const file = join(OUT, `${size.name}.png`);
      writeFileSync(file, Buffer.from(shot.data, "base64"));
      const sideways =
        width > size.width
          ? `, ${width - size.width} px of sideways scroll`
          : "";
      console.log(
        `  ✓ ${size.width} px → .capturas/${size.name}.png (${height} px tall${sideways})`,
      );
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
