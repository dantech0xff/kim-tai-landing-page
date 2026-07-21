import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, process.env.PAGES_OUTPUT_DIR ?? "out");
const site = JSON.parse(
  await readFile(path.join(root, "src/content/site.json"), "utf8"),
);
const [repositoryOwner = "", repositoryName = ""] =
  (process.env.GITHUB_REPOSITORY ?? "").split("/");

if (!repositoryOwner || !repositoryName) {
  throw new Error("GITHUB_REPOSITORY is required to validate the Pages base path.");
}

const basePath = repositoryName.endsWith(".github.io") ? "" : `/${repositoryName}`;
const siteOrigin = `https://${repositoryOwner.toLowerCase()}.github.io`;
const locales = ["vi", "en"];
const legalSlugs = ["terms-of-service", "terms-and-conditions", "privacy-policy"];
const routeDefinitions = locales.flatMap((locale) => [
  { file: `${locale}/index.html`, locale, slug: "" },
  ...legalSlugs.map((slug) => ({ file: `${locale}/${slug}/index.html`, locale, slug })),
]);
const routePath = (locale, slug = "") =>
  `${basePath}/${locale}/${slug ? `${slug}/` : ""}`;
const badgeFiles = Object.entries(site.downloads ?? {}).flatMap(
  ([platform, download]) =>
    Object.entries(download.badges ?? {}).map(([locale, badge]) => {
      const source = badge?.src;
      if (typeof source !== "string" || source.includes("\\")) {
        throw new Error(`Download ${platform} ${locale} has an invalid badge path.`);
      }

      const normalizedSource = path.posix.normalize(source);
      const relativeBadgePath = path.posix.relative("/badges", normalizedSource);
      if (
        normalizedSource !== source ||
        !source.startsWith("/badges/") ||
        !relativeBadgePath ||
        relativeBadgePath === ".." ||
        relativeBadgePath.startsWith("../") ||
        path.posix.isAbsolute(relativeBadgePath)
      ) {
        throw new Error(
          `Download ${platform} ${locale} badge must remain under /badges: ${String(source)}`,
        );
      }

      return path.posix.join("badges", relativeBadgePath);
    }),
);
const expectedFiles = [
  "index.html",
  "404.html",
  "manifest.webmanifest",
  ...routeDefinitions.map(({ file }) => file),
  "icons/kim-tai-favicon-32.png",
  "icons/kim-tai-apple-touch-icon.png",
  "icons/kim-tai-pwa-192.png",
  "icons/kim-tai-pwa-512.png",
  ...new Set(badgeFiles),
  "images/app-overview.png",
  "images/app-market.png",
  "images/app-settings.png",
];

await Promise.all(
  expectedFiles.map(async (file) => {
    try {
      await access(path.join(outputDirectory, file));
    } catch {
      throw new Error(`Missing Pages artifact: ${file}`);
    }
  }),
);

const redirectHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
if (!redirectHtml.includes('url=./vi/') || !redirectHtml.includes('href="./vi/"')) {
  throw new Error("Root artifact must redirect and link to the relative ./vi/ route.");
}

const manifest = JSON.parse(
  await readFile(path.join(outputDirectory, "manifest.webmanifest"), "utf8"),
);
if (manifest.start_url !== `${basePath}/vi/` || manifest.scope !== `${basePath}/`) {
  throw new Error("Manifest start_url or scope does not match the Pages base path.");
}
if (
  manifest.icons?.length !== 2 ||
  manifest.icons.some((icon) => !icon.src.startsWith(`${basePath}/icons/`))
) {
  throw new Error("Manifest icons do not use the Pages base path.");
}

for (const { file, locale, slug } of routeDefinitions) {
  const html = await readFile(path.join(outputDirectory, file), "utf8");
  const absoluteAssetPaths = Array.from(
    html.matchAll(/\s(?:href|src)="(\/[^"]+)"/g),
    (match) => match[1],
  );
  const invalidPaths = absoluteAssetPaths.filter(
    (assetPath) => basePath && !assetPath.startsWith(`${basePath}/`),
  );

  if (invalidPaths.length) {
    throw new Error(`${file} contains paths outside ${basePath}: ${invalidPaths.join(", ")}`);
  }
  if (!html.includes(`${basePath}/_next/`)) {
    throw new Error(`${file} does not reference Next.js assets through ${basePath}.`);
  }
  if (html.includes("/_next/image?")) {
    throw new Error(`${file} still depends on the unavailable Next.js image optimizer.`);
  }

  const expectedCanonical = `${siteOrigin}${routePath(locale, slug)}`;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"/>`)) {
    throw new Error(`${file} does not declare the expected canonical URL ${expectedCanonical}.`);
  }

  for (const alternateLocale of locales) {
    const expectedAlternate = `${siteOrigin}${routePath(alternateLocale, slug)}`;
    if (
      !html.includes(
        `<link rel="alternate" hrefLang="${alternateLocale}" href="${expectedAlternate}"/>`,
      )
    ) {
      throw new Error(
        `${file} does not declare the ${alternateLocale} alternate URL ${expectedAlternate}.`,
      );
    }
  }
}

console.log(`GitHub Pages export checks passed for ${basePath || "/"}.`);
