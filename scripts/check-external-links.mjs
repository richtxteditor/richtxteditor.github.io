import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const html = await readFile(path.join(repositoryRoot, "site/index.html"), "utf8");
const urls = Array.from(
  new Set(
    Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi), (match) =>
      match[1].replaceAll("&amp;", "&"),
    ).filter((url) => /^https:\/\//i.test(url)),
  ),
).sort();

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
    headers: { "user-agent": "freechie.github.io link checker" },
  });
  await response.body?.cancel();
  return response.status;
}

async function check(url) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      let status = await request(url, "HEAD");
      if (status === 405 || status === 501) status = await request(url, "GET");

      if (status !== 404 && (status < 500 || status === 999)) {
        return { url, status };
      }

      lastError = new Error(`HTTP ${status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`${url}: ${lastError?.message ?? "unreachable"}`);
}

const results = await Promise.allSettled(urls.map(check));
const failures = results.filter((result) => result.status === "rejected");

for (const result of results) {
  if (result.status === "fulfilled") {
    console.log(`OK ${result.value.status} ${result.value.url}`);
  } else {
    console.error(`FAIL ${result.reason.message}`);
  }
}

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(`Checked ${urls.length} external links`);
}
