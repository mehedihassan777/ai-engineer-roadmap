#!/usr/bin/env node
/**
 * Verifies every http(s) URL used by the roadmap content.
 *
 *   npm run check:links                              scan src/data
 *   node scripts/check-links.mjs src/data/weeks      scan a folder or file
 *   node scripts/check-links.mjs https://a.dev ...   check URLs directly
 *
 * Flags: --strict (treat bot-blocked sites as failures)  --concurrency=N
 *
 * Result classes
 *   ok       2xx after redirects
 *   moved    2xx, but the final URL differs from the one in the data (consider updating it)
 *   blocked  401/403/429/999 - usually bot protection; verify by hand, the link may be fine
 *   suspect  2xx but the page title looks like a 404 (soft 404)
 *   broken   404/410/5xx or a network error - fix or remove the url (UI then shows "verify link")
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const URL_PATTERN = /https?:\/\/[^\s'"`<>)\]}\\]+/g;
const MAX_BODY_BYTES = 256 * 1024;

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const concurrency = Number(args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 6);
const targets = args.filter((a) => !a.startsWith("--"));

async function listFiles(target) {
  const info = await stat(target);
  if (info.isFile()) return [target];
  const entries = await readdir(target, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(target, entry.name);
      if (entry.isDirectory()) return listFiles(full);
      return /\.(ts|tsx|mts|json)$/.test(entry.name) ? [full] : [];
    }),
  );
  return nested.flat();
}

async function collectUrls() {
  /** @type {Map<string, Set<string>>} url -> files that mention it */
  const found = new Map();
  const add = (url, source) => {
    if (!found.has(url)) found.set(url, new Set());
    found.get(url).add(source);
  };
  const inputs = targets.length > 0 ? targets : ["src/data"];
  for (const input of inputs) {
    if (/^https?:\/\//.test(input)) {
      add(input, "(command line)");
      continue;
    }
    for (const file of await listFiles(input)) {
      const text = await readFile(file, "utf8");
      for (const match of text.matchAll(URL_PATTERN)) {
        add(match[0].replace(/[.,;:]+$/, ""), file.replaceAll("\\", "/"));
      }
    }
  }
  return found;
}

async function readLimited(response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  while (received < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return text;
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].replace(/\s+/g, " ").trim()).slice(0, 100) : "";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkUrl(url) {
  let last = { status: 0, finalUrl: url, title: "", error: "" };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9",
        },
      });
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("html") ? await readLimited(response) : "";
      last = { status: response.status, finalUrl: response.url, title: extractTitle(body), error: "" };
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable) break;
    } catch (error) {
      last = { status: 0, finalUrl: url, title: "", error: error?.cause?.code ?? error?.name ?? String(error) };
    } finally {
      clearTimeout(timer);
    }
    if (attempt < 3) await sleep(800 * attempt);
  }
  return classify(url, last);
}

const normalise = (u) => u.replace(/\/+$/, "").replace(/#.*$/, "");

/** True when the final URL only adds a query string (e.g. Microsoft Learn's ?view=...) to the same path. */
function onlyAddsQuery(url, finalUrl) {
  try {
    const from = new URL(url);
    const to = new URL(finalUrl);
    return (
      from.search === "" &&
      from.origin === to.origin &&
      from.pathname.replace(/\/+$/, "") === to.pathname.replace(/\/+$/, "")
    );
  } catch {
    return false;
  }
}

function classify(url, { status, finalUrl, title, error }) {
  if (error) return { url, kind: "broken", detail: `network error: ${error}` };
  if ([401, 403, 429, 999].includes(status)) return { url, kind: "blocked", detail: `HTTP ${status}` };
  if (status >= 400) return { url, kind: "broken", detail: `HTTP ${status}` };
  if (/\b(404|not found|page not found)\b/i.test(title)) return { url, kind: "suspect", detail: `title: "${title}"` };
  if (normalise(finalUrl) !== normalise(url) && !onlyAddsQuery(url, finalUrl)) {
    return { url, kind: "moved", detail: `-> ${finalUrl}  "${title}"` };
  }
  return { url, kind: "ok", detail: `"${title}"` };
}

async function runPool(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

const found = await collectUrls();
const urls = [...found.keys()].sort();
console.log(`Checking ${urls.length} unique URL(s)...\n`);
const results = await runPool(urls, checkUrl, concurrency);

const order = ["broken", "suspect", "blocked", "moved", "ok"];
for (const kind of order) {
  const group = results.filter((r) => r.kind === kind);
  if (group.length === 0) continue;
  console.log(`== ${kind.toUpperCase()} (${group.length})`);
  for (const r of group) {
    const where = [...found.get(r.url)].join(", ");
    console.log(`  ${r.url}\n      ${r.detail}${kind === "ok" ? "" : `\n      used in: ${where}`}`);
  }
  console.log();
}

const counts = Object.fromEntries(order.map((k) => [k, results.filter((r) => r.kind === k).length]));
console.log(
  `Summary: ${counts.ok} ok, ${counts.moved} moved, ${counts.blocked} blocked (verify by hand), ` +
    `${counts.suspect} suspect, ${counts.broken} broken`,
);
const failed = counts.broken + counts.suspect + (strict ? counts.blocked : 0);
process.exit(failed > 0 ? 1 : 0);
