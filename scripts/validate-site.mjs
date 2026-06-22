import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siteRoot = path.join(repositoryRoot, "site");
const indexPath = path.join(siteRoot, "index.html");
const siteUrl = "https://freechie.github.io/";
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function collect(pattern, value) {
  return Array.from(value.matchAll(pattern), (match) => match[1]);
}

function localPath(reference, sourceDirectory = siteRoot) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference) return null;
  if (/^(?:[a-z]+:|#|\/\/)/i.test(cleanReference)) return null;

  const decoded = decodeURIComponent(cleanReference);
  const resolved = decoded.startsWith("/")
    ? path.resolve(siteRoot, `.${decoded}`)
    : path.resolve(sourceDirectory, decoded);

  assert(
    resolved === siteRoot || resolved.startsWith(`${siteRoot}${path.sep}`),
    `Reference escapes the site directory: ${reference}`,
  );
  return resolved;
}

async function assertFileExists(reference, sourceDirectory) {
  const resolved = localPath(reference, sourceDirectory);
  if (!resolved) return;
  try {
    await access(resolved);
  } catch (_error) {
    errors.push(`Missing local asset: ${reference}`);
  }
}

const html = await readFile(indexPath, "utf8");
const sitemap = await readFile(path.join(siteRoot, "sitemap.xml"), "utf8");
const robots = await readFile(path.join(siteRoot, "robots.txt"), "utf8");

assert(
  html.includes("<title>John Molina | Software Engineer in New Jersey</title>"),
  "Missing SEO title",
);
assert(
  /<meta\s+name="description"\s+content="[^"]+"\s*\/>/i.test(html),
  "Missing meta description",
);
assert(/<h1\b[^>]*>John R\. Molina<\/h1>/i.test(html), "Missing primary H1");
for (const name of [
  "John R. Molina",
  "John Molina",
  "Richie Molina",
  "Richard Molina",
]) {
  assert(html.includes(name), `Missing identity name: ${name}`);
}
assert(
  /<meta\s+name="robots"\s+content="[^"]*index, follow[^"]*"/i.test(html),
  "Missing index/follow robots directive",
);

const canonical = html.match(
  /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/i,
)?.[1];
const sitemapLocation = sitemap.match(/<loc>([^<]+)<\/loc>/i)?.[1];
assert(Boolean(canonical), "Missing canonical URL");
assert(Boolean(sitemapLocation), "Missing sitemap URL");
assert(canonical === siteUrl, `Canonical URL must be ${siteUrl}`);
assert(canonical === sitemapLocation, "Canonical URL and sitemap URL differ");
assert(
  robots.includes(`Sitemap: ${siteUrl}sitemap.xml`),
  "robots.txt does not advertise the sitemap",
);

const jsonLdBlocks = collect(
  /<script\s+type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/gi,
  html,
);
assert(jsonLdBlocks.length === 1, "Expected exactly one JSON-LD block");
for (const block of jsonLdBlocks) {
  try {
    const structuredData = JSON.parse(block);
    const types = new Set(
      (structuredData["@graph"] ?? []).map((entry) => entry["@type"]),
    );
    for (const type of ["WebSite", "ProfilePage", "Person"]) {
      assert(types.has(type), `JSON-LD graph is missing ${type}`);
    }
    const person = structuredData["@graph"]?.find(
      (entry) => entry["@type"] === "Person",
    );
    assert(person?.name === "John Molina", "JSON-LD has the wrong primary name");
    for (const alternateName of [
      "John R. Molina",
      "Richie Molina",
      "Richard Molina",
    ]) {
      assert(
        person?.alternateName?.includes(alternateName),
        `JSON-LD is missing alternate name: ${alternateName}`,
      );
    }
  } catch (error) {
    errors.push(`Invalid JSON-LD: ${error.message}`);
  }
}

const ids = collect(/\sid="([^"]+)"/gi, html);
const idSet = new Set(ids);
assert(ids.length === idSet.size, "Duplicate HTML IDs found");

for (const anchor of collect(/href="#([^"]+)"/gi, html)) {
  assert(idSet.has(anchor), `Missing anchor target: #${anchor}`);
}

for (const references of collect(
  /\saria-(?:labelledby|describedby)="([^"]+)"/gi,
  html,
)) {
  for (const reference of references.split(/\s+/)) {
    assert(idSet.has(reference), `Missing ARIA reference: ${reference}`);
  }
}

const htmlAssets = [
  ...collect(/\s(?:href|src)="([^"]+)"/gi, html),
  ...collect(/\ssrcset="([\s\S]*?)"/gi, html).flatMap((srcset) =>
    srcset.split(",").map((candidate) => candidate.trim().split(/\s+/, 1)[0]),
  ),
];
await Promise.all(htmlAssets.map((asset) => assertFileExists(asset)));

const scripts = collect(/<script\s+type="module"\s+src="([^"]+)"/gi, html);
for (const script of scripts) {
  const scriptPath = localPath(script);
  if (!scriptPath) continue;
  const source = await readFile(scriptPath, "utf8");
  const imports = collect(/from\s+["']([^"']+)["']/g, source);
  await Promise.all(
    imports.map((reference) =>
      assertFileExists(reference, path.dirname(scriptPath)),
    ),
  );
}

const heroImages = [
  "assets/images/john-molina-192.webp",
  "assets/images/john-molina-560.webp",
];
for (const image of heroImages) {
  const imageStats = await stat(path.join(siteRoot, image));
  assert(imageStats.size <= 150_000, `${image} exceeds 150 KB`);
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Site validation passed");
}
