import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const root = new URL("../", import.meta.url).pathname;
const build = join(root, ".next");

const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const readJson = (file) => JSON.parse(readFileSync(join(build, file), "utf8"));

const localesSource = readFileSync(join(root, "src/shared/i18n/locales.ts"), "utf8");
const locales = [...(localesSource.match(/LOCALES = \[([^\]]+)\]/u)?.[1] ?? "").matchAll(/"([a-z]{2})"/gu)].map(
  (match) => match[1],
);
expect(locales.length > 0, "the list of languages could not be read from src/shared/i18n/locales.ts");

const routes = Object.keys(readJson("prerender-manifest.json").routes);
for (const route of [
  ...locales.flatMap((locale) => [`/${locale}`, `/${locale}/compare`]),
  "/_not-found",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/icon.svg",
  "/apple-icon",
]) {
  expect(routes.includes(route), `${route} was not prerendered`);
}

const headers = new Set(
  readJson("routes-manifest.json")
    .headers.filter((entry) => entry.source === "/:path*")
    .flatMap((entry) => entry.headers.map((header) => header.key)),
);
for (const header of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
]) {
  expect(headers.has(header), `the ${header} header is missing`);
}

const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const assets = walk(join(build, "static"))
  .filter((file) => /\.(js|css)$/u.test(file))
  .map((file) => {
    const content = readFileSync(file);
    return { name: relative(build, file), size: content.length, gzip: gzipSync(content).length };
  })
  .toSorted((a, b) => b.gzip - a.gzip);

const sum = (kind) =>
  assets.filter((asset) => asset.name.endsWith(kind)).reduce((total, asset) => total + asset.gzip, 0);

const lines = [
  "### 📦 Build output",
  "",
  `${routes.length} prerendered routes, ${locales.length} languages.`,
  "",
  "| File | Size | Gzip |",
  "| --- | ---: | ---: |",
  ...assets
    .slice(0, 10)
    .map((asset) => `| \`${asset.name}\` | ${formatSize(asset.size)} | ${formatSize(asset.gzip)} |`),
  `| **JavaScript, ${assets.filter((asset) => asset.name.endsWith(".js")).length} files** | | **${formatSize(sum(".js"))}** |`,
  `| **CSS, ${assets.filter((asset) => asset.name.endsWith(".css")).length} files** | | **${formatSize(sum(".css"))}** |`,
  "",
  failures.length === 0
    ? "✅ Every language, the 404 page, the sitemap, robots rules, icons and the security headers are in place."
    : failures.map((failure) => `❌ ${failure}`).join("\n"),
];

process.stdout.write(`${lines.join("\n")}\n`);
if (failures.length > 0) process.exitCode = 1;
