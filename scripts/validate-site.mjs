import { execFile } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siteRoot = path.join(repositoryRoot, "site");
const indexPath = path.join(siteRoot, "index.html");
const resumePath = path.join(siteRoot, "John Molina SWE resume.pdf");
const siteUrl = "https://freechie.github.io/";
const errors = [];
const retiredProfilePattern = new RegExp(["richtxt", "editor"].join(""), "i");

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
const readme = await readFile(path.join(repositoryRoot, "README.md"), "utf8");
const foundationCss = await readFile(
  path.join(siteRoot, "assets/css/foundation.css"),
  "utf8",
);
const componentsCss = await readFile(
  path.join(siteRoot, "assets/css/components.css"),
  "utf8",
);
const appearanceJs = await readFile(
  path.join(siteRoot, "assets/js/appearance.js"),
  "utf8",
);
const viewsJs = await readFile(
  path.join(siteRoot, "assets/js/views.js"),
  "utf8",
);
const sitemap = await readFile(path.join(siteRoot, "sitemap.xml"), "utf8");
const robots = await readFile(path.join(siteRoot, "robots.txt"), "utf8");

try {
  const [{ stdout: resumeText }, { stdout: resumeUrls }] = await Promise.all([
    execFileAsync("pdftotext", ["-layout", resumePath, "-"]),
    execFileAsync("pdfinfo", ["-url", resumePath]),
  ]);
  assert(
    !retiredProfilePattern.test(`${resumeText}\n${resumeUrls}`),
    "Resume still contains the retired profile",
  );
  for (const expectedProfile of [
    "github.com/freechie",
    "freechie.github.io",
  ]) {
    assert(
      resumeText.includes(expectedProfile) && resumeUrls.includes(expectedProfile),
      `Resume is missing updated text or link: ${expectedProfile}`,
    );
  }
} catch (error) {
  errors.push(`Could not inspect resume PDF: ${error.message}`);
}

const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
const seoTitle = titleMatch?.[1].trim() ?? "";
assert(seoTitle, "Missing SEO title");
assert(
  /John (?:R\.|Richard) Molina/.test(seoTitle),
  "SEO title is missing the name",
);
assert(
  seoTitle.includes("Software Engineer"),
  "SEO title is missing the professional role",
);
assert(collect(/<title\b/gi, html).length === 1, "Expected exactly one title");
assert(
  /<meta\s+name="description"\s+content="[^"]+"\s*\/>/i.test(html),
  "Missing meta description",
);
assert(
  /New York metropolitan area/i.test(html),
  "Site copy is missing the target market",
);
assert(/remote roles/i.test(html), "Site metadata is missing remote roles");
assert(
  !/New York metro area/i.test(`${html}\n${viewsJs}`),
  "Use New York metropolitan area instead of New York metro area",
);
assert(
  viewsJs.includes("const homeTitle = document.title;"),
  "Home navigation title must use the HTML title",
);
assert(!/mailto:/i.test(html), "Email address must not use a mailto link");
assert(
  collect(/class="contact-address"/gi, html).length === 2,
  "Expected the obfuscated email address in the profile and Contact view",
);
assert(
  collect(/jrm90 @ me dot com/gi, html).length === 2,
  "Expected two copies of the obfuscated email address",
);
assert(/<h1\b[^>]*>John R\. Molina<\/h1>/i.test(html), "Missing primary H1");
assert(collect(/<h1\b/gi, html).length === 1, "Expected exactly one H1");
assert(collect(/<main\b/gi, html).length === 1, "Expected exactly one main landmark");
assert(collect(/<nav\b/gi, html).length === 1, "Expected exactly one navigation landmark");
assert(
  html.includes('<header class="profile-header">'),
  "Missing persistent profile header",
);
assert(
  html.includes('<a href="#main" class="skip-link">'),
  "Missing skip link to main content",
);
assert(
  collect(/class="project"/gi, html).length === 3,
  "Expected exactly three selected projects",
);
assert(
  collect(/data-view-panel="[^"]+"/gi, html).length === 4,
  "Expected exactly four single-page views",
);
assert(html.includes('id="theme-toggle"'), "Missing theme control");
assert(
  foundationCss.includes(':root[data-theme="light"]'),
  "Missing light theme",
);
assert(
  foundationCss.includes("--background: #171717") &&
    foundationCss.includes("--background: #f6f6f3"),
  "Theme backgrounds must use the approved soft dark and light values",
);
assert(!componentsCss.includes("grayscale("), "Portrait must remain full color");
for (const discardedPattern of [
  'data-project-preview=',
  'data-project-visual=',
  'class="architecture-flow"',
  'class="project-number"',
  'class="eyebrow"',
]) {
  assert(
    !html.includes(discardedPattern),
    `Discarded portfolio pattern found: ${discardedPattern}`,
  );
}
assert(foundationCss.includes(":focus-visible"), "Missing keyboard focus styles");
assert(
  foundationCss.includes("@media (prefers-reduced-motion: reduce)"),
  "Missing reduced-motion support",
);
assert(
  appearanceJs.includes('localStorage.setItem(THEME_KEY, nextTheme)'),
  "Theme preference is not persisted",
);
for (const evidence of [
  "Wagtail 8.0",
  "29 tests",
  "14 interactive figures",
  "20 tests",
]) {
  assert(html.includes(evidence), `Missing project evidence: ${evidence}`);
}
for (const unsupportedClaim of ["Bloomberg", "SIPRI", "JUnit", "MySQL"]) {
  assert(
    !html.includes(unsupportedClaim),
    `Unsupported project claim found: ${unsupportedClaim}`,
  );
}
assert(!html.includes("skill-tag"), "Legacy skill pills are still present");
assert(!retiredProfilePattern.test(html), "Retired profile found in HTML");
assert(!readme.includes("/dsa"), "README still links to the missing DSA page");
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
    assert(person?.name === "John R. Molina", "JSON-LD has the wrong primary name");
    for (const alternateName of [
      "John Molina",
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

for (const imageTag of html.matchAll(/<img\b[^>]*>/gi)) {
  assert(/\balt="[^"]*"/i.test(imageTag[0]), "Image is missing alt text");
}

for (const anchor of collect(/href="#([^"]+)"/gi, html)) {
  assert(idSet.has(anchor), `Missing anchor target: #${anchor}`);
}

for (const match of html.matchAll(/<a\b([^>]*\btarget="_blank"[^>]*)>/gi)) {
  assert(
    /\brel="[^"]*noopener[^"]*"/i.test(match[1]),
    "External link opening a new tab is missing rel=noopener",
  );
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

const socialImageStats = await stat(path.join(siteRoot, "og-image.png"));
assert(socialImageStats.size <= 1_000_000, "og-image.png exceeds 1 MB");

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Site validation passed");
}
