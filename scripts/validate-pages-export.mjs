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
// Mirror GitHub Pages luôn canonical chéo về origin chính thức trên Vercel.
const canonicalOrigin =
  process.env.CANONICAL_ORIGIN ?? "https://kimtai.dantech.academy";
const locales = ["vi", "en"];
const legalSlugs = ["terms-of-service", "terms-and-conditions", "privacy-policy"];
const routeDefinitions = locales.flatMap((locale) => [
  { file: `${locale}/index.html`, locale, slug: "" },
  ...legalSlugs.map((slug) => ({ file: `${locale}/${slug}/index.html`, locale, slug })),
]);
const canonicalPath = (locale, slug = "") =>
  `/${locale}/${slug ? `${slug}/` : ""}`;
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
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
const ogImageFiles = locales.map((locale) => {
  const source = site.locales?.[locale]?.metadata?.ogImage?.src;
  if (typeof source !== "string" || !source.startsWith("/images/og/")) {
    throw new Error(`Locale ${locale} must declare an Open Graph image under /images/og/.`);
  }
  return source.slice(1);
});
const expectedFiles = [
  "index.html",
  "404.html",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  ...routeDefinitions.map(({ file }) => file),
  "icons/kim-tai-favicon-32.png",
  "icons/kim-tai-apple-touch-icon.png",
  "icons/kim-tai-pwa-192.png",
  "icons/kim-tai-pwa-512.png",
  ...new Set(badgeFiles),
  ...new Set(ogImageFiles),
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

  const expectedCanonical = `${canonicalOrigin}${canonicalPath(locale, slug)}`;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"/>`)) {
    throw new Error(`${file} does not declare the expected canonical URL ${expectedCanonical}.`);
  }

  for (const alternateLocale of locales) {
    const expectedAlternate = `${canonicalOrigin}${canonicalPath(alternateLocale, slug)}`;
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

  const expectedDefaultAlternate = `${canonicalOrigin}${canonicalPath("vi", slug)}`;
  if (
    !html.includes(
      `<link rel="alternate" hrefLang="x-default" href="${expectedDefaultAlternate}"/>`,
    )
  ) {
    throw new Error(
      `${file} does not declare the x-default alternate URL ${expectedDefaultAlternate}.`,
    );
  }

  if (!html.includes('<meta name="robots" content="noindex')) {
    throw new Error(`${file} must stay noindex on the GitHub Pages mirror.`);
  }

  const ogImage = site.locales[locale].metadata.ogImage;
  const expectedOgImage = `${siteOrigin}${basePath}${ogImage.src}`;
  const socialMetaChecks = [
    [`<meta property="og:url" content="${expectedCanonical}"/>`, "og:url"],
    [`<meta property="og:image" content="${expectedOgImage}"/>`, "og:image"],
    ['<meta property="og:title" content="', "og:title"],
    ['<meta property="og:description" content="', "og:description"],
    ['<meta name="twitter:card" content="summary_large_image"/>', "twitter:card"],
    ['<meta name="twitter:title" content="', "twitter:title"],
  ];
  for (const [needle, label] of socialMetaChecks) {
    if (!html.includes(needle)) {
      throw new Error(`${file} is missing the expected ${label} metadata.`);
    }
  }

  const structuredDataBlocks = Array.from(
    html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
    (match) => match[1],
  );
  const structuredDataTypes = structuredDataBlocks.map((block) => {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      throw new Error(`${file} contains JSON-LD that does not parse.`);
    }
    if (JSON.stringify(parsed).includes('"aggregateRating"')) {
      throw new Error(`${file} must not fabricate aggregateRating structured data.`);
    }
    return parsed["@type"];
  });
  const expectedStructuredDataTypes = slug
    ? ["Organization", "WebSite", "BreadcrumbList"]
    : ["Organization", "WebSite", "MobileApplication", "FAQPage"];
  if (
    structuredDataTypes.length !== expectedStructuredDataTypes.length ||
    !expectedStructuredDataTypes.every((type) => structuredDataTypes.includes(type))
  ) {
    throw new Error(
      `${file} declares JSON-LD types [${structuredDataTypes.join(", ")}] instead of [${expectedStructuredDataTypes.join(", ")}].`,
    );
  }

  if (!slug) {
    const faqCopy = site.locales[locale].faq;
    const questionMatches = Array.from(
      html.matchAll(/<h3 class="faq-question">/g),
    );
    if (
      !html.includes('id="faq"') ||
      !html.includes(`id="faq-title">${escapeHtml(faqCopy.title)}</h2>`) ||
      questionMatches.length < 3 ||
      questionMatches.length !== faqCopy.items.length
    ) {
      throw new Error(`${file} must render the full FAQ section in static HTML.`);
    }
    for (const item of faqCopy.items) {
      if (
        !html.includes(`<h3 class="faq-question">${escapeHtml(item.question)}</h3>`) ||
        !html.includes(`<p class="faq-answer">${escapeHtml(item.answer)}</p>`)
      ) {
        throw new Error(`${file} is missing the FAQ entry: ${item.question}`);
      }
    }
  }

  if (slug) {
    const operatorCopy = site.locales?.[locale]?.legalUi?.operatorDetails;
    const operatorSection = html.match(
      /<section class="operator-details"[\s\S]*?<\/section>/,
    )?.[0];
    const facebookLink = operatorSection?.match(/<a\s+([^>]*)>([\s\S]*?)<\/a>/);
    const linkAttributes = new Map(
      Array.from(facebookLink?.[1].matchAll(/([A-Za-z:-]+)="([^"]*)"/g) ?? []).map(
        ([, name, value]) => [name, value],
      ),
    );
    const relTokens = new Set(linkAttributes.get("rel")?.split(/\s+/) ?? []);
    if (
      !operatorSection ||
      !operatorSection.includes(
        `<h2 id="operator-details-title">${escapeHtml(operatorCopy.publicHeading)}</h2>`,
      ) ||
      !operatorSection.includes(
        `<dt>${escapeHtml(operatorCopy.publicName)}</dt><dd>${escapeHtml(site.operator.publicName)}</dd>`,
      ) ||
      !operatorSection.includes(`<dt>${escapeHtml(operatorCopy.facebook)}</dt>`) ||
      !facebookLink?.[2].startsWith(`${escapeHtml(operatorCopy.facebookCta)}<svg`) ||
      linkAttributes.get("href") !== escapeHtml(site.operator.facebookUrl) ||
      linkAttributes.get("target") !== "_blank" ||
      !relTokens.has("noreferrer")
    ) {
      throw new Error(`${file} does not render the configured public operator contact.`);
    }
  }
}

const sitemapXml = await readFile(path.join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapLocations = Array.from(
  sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
  (match) => match[1],
);
const expectedSitemapLocations = routeDefinitions.map(
  ({ locale, slug }) => `${canonicalOrigin}${canonicalPath(locale, slug)}`,
);
if (
  sitemapLocations.length !== expectedSitemapLocations.length ||
  !expectedSitemapLocations.every((url) => sitemapLocations.includes(url))
) {
  throw new Error(
    `sitemap.xml must list exactly the ${expectedSitemapLocations.length} canonical URLs.`,
  );
}
if (sitemapLocations.some((url) => !url.startsWith(`${canonicalOrigin}/`))) {
  throw new Error("sitemap.xml must only contain canonical-origin URLs.");
}
if (!sitemapXml.includes('hreflang="x-default"')) {
  throw new Error("sitemap.xml must declare x-default hreflang alternates.");
}

const robotsTxt = await readFile(path.join(outputDirectory, "robots.txt"), "utf8");
if (
  !/User-Agent:\s*\*/i.test(robotsTxt) ||
  !/Allow:\s*\//i.test(robotsTxt) ||
  !robotsTxt.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)
) {
  throw new Error(
    "robots.txt must allow all crawlers and point to the canonical sitemap URL.",
  );
}

console.log(`GitHub Pages export checks passed for ${basePath || "/"}.`);
