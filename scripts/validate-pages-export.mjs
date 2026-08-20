import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputDirectory = path.join(root, process.env.PAGES_OUTPUT_DIR ?? "out");
const site = JSON.parse(
  await readFile(path.join(root, "src/content/site.json"), "utf8"),
);
const blog = JSON.parse(
  await readFile(path.join(root, "src/content/blog.vi.json"), "utf8"),
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
const canonicalPath = (locale, slug = "") =>
  `/${locale}/${slug ? `${slug}/` : ""}`;
const articlePath = `/vi/blog/${blog.slug}/`;
const localizedRouteDefinitions = locales.flatMap((locale) => [
  {
    file: `${locale}/index.html`,
    locale,
    kind: "landing",
    pathname: canonicalPath(locale),
    alternates: {
      vi: canonicalPath("vi"),
      en: canonicalPath("en"),
      "x-default": canonicalPath("vi"),
    },
  },
  ...legalSlugs.map((slug) => ({
    file: `${locale}/${slug}/index.html`,
    locale,
    kind: "legal",
    pathname: canonicalPath(locale, slug),
    alternates: {
      vi: canonicalPath("vi", slug),
      en: canonicalPath("en", slug),
      "x-default": canonicalPath("vi", slug),
    },
  })),
]);
const articleRouteDefinition = {
  file: `vi/blog/${blog.slug}/index.html`,
  locale: "vi",
  kind: "article",
  pathname: articlePath,
  alternates: { vi: articlePath, "x-default": articlePath },
};
const routeDefinitions = [
  ...localizedRouteDefinitions,
  articleRouteDefinition,
];
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

const unsupportedEnglishArticle = path.join(
  outputDirectory,
  `en/blog/${blog.slug}/index.html`,
);
let unsupportedEnglishArticleExists = true;
try {
  await access(unsupportedEnglishArticle);
} catch {
  unsupportedEnglishArticleExists = false;
}
if (unsupportedEnglishArticleExists) {
  throw new Error("The Vietnamese-only article must not emit an English artifact.");
}

const redirectHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
if (!redirectHtml.includes('url=./vi/') || !redirectHtml.includes('href="./vi/"')) {
  throw new Error("Root artifact must redirect and link to the relative ./vi/ route.");
}

const notFoundHtml = await readFile(path.join(outputDirectory, "404.html"), "utf8");
if (
  !notFoundHtml.includes("Không tìm thấy trang") ||
  !notFoundHtml.includes('<meta name="robots" content="noindex"') ||
  !notFoundHtml.includes(`href="${basePath}/vi/"`) ||
  !notFoundHtml.includes(`href="${basePath}/en/"`)
) {
  throw new Error("The custom 404 must stay noindex and link to both localized home pages.");
}

const llmsText = await readFile(path.join(outputDirectory, "llms.txt"), "utf8");
if (!llmsText.includes(`${canonicalOrigin}${articlePath}`)) {
  throw new Error("llms.txt must expose the canonical technical article URL.");
}
for (const [platform, download] of Object.entries(site.downloads ?? {})) {
  if (download.published && !llmsText.includes(download.directUrl)) {
    throw new Error(`llms.txt must expose the published ${platform} store listing.`);
  }
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

for (const { file, locale, kind, pathname, alternates } of routeDefinitions) {
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

  const expectedCanonical = `${canonicalOrigin}${pathname}`;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"/>`)) {
    throw new Error(`${file} does not declare the expected canonical URL ${expectedCanonical}.`);
  }

  for (const [alternateLocale, alternatePath] of Object.entries(alternates)) {
    const expectedAlternate = `${canonicalOrigin}${alternatePath}`;
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
  if (kind === "article" && /<link rel="alternate" hrefLang="en"/.test(html)) {
    throw new Error(`${file} must not advertise a nonexistent English alternate.`);
  }

  if (!html.includes('<meta name="robots" content="noindex')) {
    throw new Error(`${file} must stay noindex on the GitHub Pages mirror.`);
  }
  if (
    !/<meta name="googlebot" content="[^"]*max-image-preview:large[^"]*"\/>/.test(html)
  ) {
    throw new Error(`${file} must allow large Google image previews.`);
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
  const structuredData = structuredDataBlocks.map((block) => {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      throw new Error(`${file} contains JSON-LD that does not parse.`);
    }
    if (JSON.stringify(parsed).includes('"aggregateRating"')) {
      throw new Error(`${file} must not fabricate aggregateRating structured data.`);
    }
    return parsed;
  });
  const structuredDataTypes = structuredData.map((data) => data["@type"]);
  const expectedStructuredDataTypes = {
    landing: ["Organization", "WebSite", "MobileApplication", "FAQPage"],
    legal: ["Organization", "WebSite", "BreadcrumbList"],
    article: ["Organization", "WebSite", "BreadcrumbList", "TechArticle"],
  }[kind];
  if (
    structuredDataTypes.length !== expectedStructuredDataTypes.length ||
    !expectedStructuredDataTypes.every((type) => structuredDataTypes.includes(type))
  ) {
    throw new Error(
      `${file} declares JSON-LD types [${structuredDataTypes.join(", ")}] instead of [${expectedStructuredDataTypes.join(", ")}].`,
    );
  }

  if (kind === "landing") {
    const mobileApplication = structuredData.find(
      (data) => data["@type"] === "MobileApplication",
    );
    const expectedInstallUrls = Object.values(site.downloads)
      .filter((download) => download.published)
      .map((download) => new URL(download.directUrl).toString());
    if (
      mobileApplication?.url !== expectedCanonical ||
      mobileApplication?.isAccessibleForFree !== true ||
      !Array.isArray(mobileApplication?.installUrl) ||
      mobileApplication.installUrl.length !== expectedInstallUrls.length ||
      !expectedInstallUrls.every((url) => mobileApplication.installUrl.includes(url)) ||
      !Array.isArray(mobileApplication?.sameAs) ||
      !expectedInstallUrls.every((url) => mobileApplication.sameAs.includes(url))
    ) {
      throw new Error(
        `${file} MobileApplication schema must expose every published store listing.`,
      );
    }

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

  if (kind === "legal") {
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

  if (kind === "article") {
    const techArticle = structuredData.find((data) => data["@type"] === "TechArticle");
    const articleH1Count = Array.from(html.matchAll(/<h1(?:\s[^>]*)?>/g)).length;
    const articleSectionCount = Array.from(
      html.matchAll(/<section class="article-section" id="/g),
    ).length;
    if (
      techArticle?.url !== expectedCanonical ||
      techArticle?.mainEntityOfPage !== expectedCanonical ||
      techArticle?.headline !== blog.title ||
      techArticle?.description !== blog.description ||
      techArticle?.datePublished !== blog.publishedAt ||
      techArticle?.dateModified !== blog.updatedAt ||
      techArticle?.inLanguage !== "vi-VN" ||
      techArticle?.isAccessibleForFree !== true ||
      !Array.isArray(techArticle?.keywords) ||
      techArticle.keywords.length !== blog.tags.length ||
      !blog.tags.every((tag) => techArticle.keywords.includes(tag)) ||
      !Array.isArray(techArticle?.articleSection) ||
      techArticle.articleSection.length !== blog.sections.length
    ) {
      throw new Error(`${file} TechArticle schema does not match the article source.`);
    }
    if (
      !html.includes(`<meta property="og:type" content="article"/>`) ||
      !html.includes(
        `<meta property="article:published_time" content="${blog.publishedAt}"/>`,
      ) ||
      !html.includes(
        `<meta property="article:modified_time" content="${blog.updatedAt}"/>`,
      )
    ) {
      throw new Error(`${file} is missing article-specific Open Graph metadata.`);
    }
    if (
      !html.includes(
        `<h1 class="article-title" id="article-title">${escapeHtml(blog.title)}</h1>`,
      ) ||
      articleH1Count !== 1 ||
      articleSectionCount !== blog.sections.length ||
      !html.includes(`href="${basePath}/en/"`)
    ) {
      throw new Error(`${file} does not render the expected article shell.`);
    }
    for (const section of blog.sections) {
      if (
        !html.includes(`<section class="article-section" id="${section.id}">`) ||
        !html.includes(`<h2>${escapeHtml(section.title)}</h2>`)
      ) {
        throw new Error(`${file} is missing article section ${section.id}.`);
      }
    }
  }
}

const sitemapXml = await readFile(path.join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapLocations = Array.from(
  sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
  (match) => match[1],
);
const expectedSitemapLocations = routeDefinitions.map(
  ({ pathname }) => `${canonicalOrigin}${pathname}`,
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
const articleSitemapUrl = `${canonicalOrigin}${articlePath}`;
const articleSitemapEntry = sitemapXml.match(
  new RegExp(
    `<url>\\s*<loc>${escapeRegExp(articleSitemapUrl)}</loc>[\\s\\S]*?</url>`,
  ),
)?.[0];
const articleSitemapLanguages = Array.from(
  articleSitemapEntry?.matchAll(/hreflang="([^"]+)"/g) ?? [],
  (match) => match[1],
);
if (
  !articleSitemapEntry ||
  articleSitemapLanguages.length !== 2 ||
  !articleSitemapLanguages.includes("vi") ||
  !articleSitemapLanguages.includes("x-default") ||
  !articleSitemapEntry.includes(
    `hreflang="vi" href="${articleSitemapUrl}"`,
  ) ||
  !articleSitemapEntry.includes(
    `hreflang="x-default" href="${articleSitemapUrl}"`,
  ) ||
  !articleSitemapEntry.includes(`<lastmod>${blog.updatedAt}</lastmod>`)
) {
  throw new Error(
    "sitemap.xml must list the dated Vietnamese article with only vi and x-default alternates.",
  );
}
if (sitemapXml.includes(`${canonicalOrigin}/en/blog/${blog.slug}/`)) {
  throw new Error("sitemap.xml must not list a nonexistent English article URL.");
}

const sitemapImageLocations = Array.from(
  sitemapXml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g),
  (match) => match[1],
);
if (sitemapImageLocations.length !== 0) {
  throw new Error("sitemap.xml must not list images: the landing page renders no content images.");
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
