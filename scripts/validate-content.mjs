import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));

const [site, legalVi, legalEn] = await Promise.all([
  readJson("src/content/site.json"),
  readJson("src/content/legal.vi.json"),
  readJson("src/content/legal.en.json"),
]);

const expectedLocales = ["vi", "en"];
const expectedLegalSlugs = [
  "terms-of-service",
  "terms-and-conditions",
  "privacy-policy",
];

const errors = [];
const warnings = [];
const expectedFeatureIds = ["portfolio", "market", "local-first", "personalize"];
const faqIdsByLocale = {};
const isPercentageSeries = (values, minimumLength = 3) =>
  Array.isArray(values) &&
  values.length >= minimumLength &&
  values.every(
    (value) => Number.isFinite(value) && value >= 0 && value <= 100,
  );

if (!site.brand?.name || !site.brand?.productName || !site.brand?.tagline) {
  errors.push("Brand name, product name, and tagline are required.");
}

const iconRecords = [
  ["brand mark", site.icons?.brandMark],
  ["favicon", site.icons?.favicon],
  ["Apple touch icon", site.icons?.appleTouch],
  ...(site.icons?.manifest ?? []).map((icon, index) => [
    `manifest icon ${index + 1}`,
    icon,
  ]),
];

if (!site.icons?.brandMark?.width || !site.icons?.brandMark?.height) {
  errors.push("Brand mark width and height are required.");
}
if (site.icons?.manifest?.length !== 2) {
  errors.push("Exactly two PWA manifest icons are required.");
}

for (const [label, icon] of iconRecords) {
  if (!icon?.src?.startsWith("/icons/") || !icon.src.endsWith(".png")) {
    errors.push(`${label} must reference a PNG under /icons/.`);
    continue;
  }

  try {
    await access(path.join(root, "public", icon.src.slice(1)));
  } catch {
    errors.push(`${label} file does not exist: ${icon.src}`);
  }
}

for (const locale of expectedLocales) {
  const copy = site.locales?.[locale];
  if (!copy) errors.push(`Missing locale: ${locale}`);
  if (copy?.features?.length !== 4) {
    errors.push(`Locale ${locale} must define exactly four feature records.`);
  }
  const featureIds = copy?.features?.map((feature) => feature.id) ?? [];
  if (
    featureIds.length !== expectedFeatureIds.length ||
    !expectedFeatureIds.every((featureId) => featureIds.includes(featureId))
  ) {
    errors.push(`Locale ${locale} must define the expected four feature IDs.`);
  }
  if (copy?.features?.some((feature) => "image" in feature)) {
    errors.push(`Locale ${locale} feature records must not place screenshots below the Hero.`);
  }
  if (
    !copy?.hero?.galleryLabel ||
    !copy?.hero?.screens?.overview ||
    !copy?.hero?.screens?.market ||
    !copy?.hero?.screens?.settings
  ) {
    errors.push(`Locale ${locale} has incomplete Hero screenshot labels.`);
  }

  const ogImage = copy?.metadata?.ogImage;
  if (
    !ogImage?.src?.startsWith("/images/og/") ||
    !ogImage.src.endsWith(".png") ||
    ogImage.width !== 1200 ||
    ogImage.height !== 630 ||
    !ogImage.alt?.trim()
  ) {
    errors.push(
      `Locale ${locale} must declare a 1200×630 PNG Open Graph image under /images/og/ with alt text.`,
    );
  } else {
    try {
      await access(path.join(root, "public", ogImage.src.slice(1)));
    } catch {
      errors.push(`Locale ${locale} Open Graph image does not exist: ${ogImage.src}`);
    }
  }

  const faq = copy?.faq;
  if (!faq?.eyebrow?.trim() || !faq?.title?.trim()) {
    errors.push(`Locale ${locale} FAQ requires an eyebrow and a title.`);
  }
  if (!Array.isArray(faq?.items) || faq.items.length < 3) {
    errors.push(`Locale ${locale} FAQ must define at least three items.`);
  } else {
    for (const item of faq.items) {
      if (!item?.id?.trim() || !item?.question?.trim() || !item?.answer?.trim()) {
        errors.push(`Locale ${locale} FAQ items require id, question, and answer.`);
        break;
      }
    }
    for (const item of faq.items) {
      if (item?.question?.trim() && !item.question.trim().endsWith("?")) {
        errors.push(`Locale ${locale} FAQ question must end with "?": ${item.id}`);
      }
    }
    const ids = faq.items.map((item) => item?.id);
    if (new Set(ids).size !== ids.length) {
      errors.push(`Locale ${locale} FAQ item IDs must be unique.`);
    }
    faqIdsByLocale[locale] = ids;
  }

  const publicOperatorLabels = copy?.legalUi?.operatorDetails;
  for (const field of ["publicHeading", "publicName", "facebook", "facebookCta"]) {
    if (!publicOperatorLabels?.[field]?.trim()) {
      errors.push(`Locale ${locale} is missing operatorDetails.${field}.`);
    }
  }

  const visuals = copy?.featureVisuals;
  if (!visuals?.illustrationLabel) {
    errors.push(`Locale ${locale} is missing the simulated-illustration label.`);
  }
  if (
    !visuals?.portfolio?.title ||
    !visuals?.portfolio?.primaryPurity ||
    !visuals?.portfolio?.quantity ||
    !visuals?.portfolio?.secondaryPurity ||
    !visuals?.portfolio?.status ||
    !isPercentageSeries(visuals?.portfolio?.bars, 4) ||
    visuals.portfolio.bars.length !== 4
  ) {
    errors.push(`Locale ${locale} has incomplete portfolio simulation data.`);
  }
  if (
    !visuals?.market?.title ||
    !visuals?.market?.primary ||
    !visuals?.market?.secondary ||
    !visuals?.market?.summary ||
    !visuals?.market?.note ||
    !isPercentageSeries(visuals?.market?.primarySeries, 4) ||
    !isPercentageSeries(visuals?.market?.secondarySeries, 4) ||
    visuals.market.primarySeries.length !== visuals.market.secondarySeries.length
  ) {
    errors.push(`Locale ${locale} has incomplete market simulation data.`);
  }
  if (
    !visuals?.local?.title ||
    !visuals?.local?.status ||
    visuals?.local?.steps?.length !== 3 ||
    visuals.local.steps.some((step) => !step?.trim())
  ) {
    errors.push(`Locale ${locale} has incomplete local-flow simulation data.`);
  }
  if (
    !visuals?.personalize?.title ||
    visuals?.personalize?.rows?.length !== 3 ||
    visuals.personalize.rows.some(
      (row) =>
        !row?.label?.trim() ||
        !row?.value?.trim() ||
        !Number.isFinite(row.position) ||
        row.position < 0 ||
        row.position > 100,
    )
  ) {
    errors.push(`Locale ${locale} has incomplete personalization simulation data.`);
  }
}

if (
  faqIdsByLocale.vi &&
  faqIdsByLocale.en &&
  (faqIdsByLocale.vi.length !== faqIdsByLocale.en.length ||
    faqIdsByLocale.vi.some((id, index) => faqIdsByLocale.en[index] !== id))
) {
  errors.push("FAQ items must use the same IDs in the same order across vi/en.");
}

for (const [locale, legal] of [
  ["vi", legalVi],
  ["en", legalEn],
]) {
  for (const slug of expectedLegalSlugs) {
    const document = legal.documents?.[slug];
    if (!document) errors.push(`Missing ${locale} legal document: ${slug}`);
    if (!document?.sections?.length) {
      errors.push(`Legal document ${locale}/${slug} has no sections.`);
    }
    for (const sourceId of document?.sourceIds ?? []) {
      if (!legal.sources.some((source) => source.id === sourceId)) {
        errors.push(`Unknown legal source ${sourceId} in ${locale}/${slug}.`);
      }
    }
  }
}

const allowedStoreHosts = {
  ios: "apps.apple.com",
  android: "play.google.com",
};
const expectedBadgeExtensions = {
  ios: ".svg",
  android: ".png",
};
const storeIdentityRules = {
  ios: {
    field: "appStoreId",
    label: "App Store ID",
    matchesListing: (url, identity) =>
      url.pathname.endsWith(`/id${identity}`) ||
      url.pathname.endsWith(`/id${identity}/`),
    valid: (identity) =>
      typeof identity === "string" && /^\d+$/.test(identity),
  },
  android: {
    field: "packageName",
    label: "Android package name",
    matchesListing: (url, identity) => {
      const listingPath =
        url.pathname === "/store/apps/details" ||
        url.pathname === "/store/apps/details/";
      const listingIds = url.searchParams.getAll("id");
      return listingPath && listingIds.length === 1 && listingIds[0] === identity;
    },
    valid: (identity) =>
      typeof identity === "string" &&
      /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(identity),
  },
};

for (const [platform, download] of Object.entries(site.downloads ?? {})) {
  if (!allowedStoreHosts[platform]) {
    errors.push(`Unsupported download platform: ${platform}.`);
    continue;
  }

  for (const locale of expectedLocales) {
    const badge = download.badges?.[locale];
    if (!badge) {
      errors.push(`Download ${platform} is missing its ${locale} store badge.`);
      continue;
    }
    if (
      !badge.src?.startsWith("/badges/") ||
      path.extname(badge.src).toLowerCase() !== expectedBadgeExtensions[platform]
    ) {
      errors.push(
        `Download ${platform} ${locale} badge must reference an official ${expectedBadgeExtensions[platform]} asset under /badges/.`,
      );
    }
    if (
      !Number.isFinite(badge.width) ||
      badge.width <= 0 ||
      !Number.isFinite(badge.height) ||
      badge.height <= 0
    ) {
      errors.push(`Download ${platform} ${locale} badge requires positive dimensions.`);
    }
    if (badge.src?.startsWith("/badges/")) {
      try {
        await access(path.join(root, "public", badge.src.slice(1)));
      } catch {
        errors.push(`Download ${platform} ${locale} badge does not exist: ${badge.src}`);
      }
    }
  }

  const identityRule = storeIdentityRules[platform];
  const identity = download[identityRule.field];
  const hasIdentity =
    identity !== undefined && identity !== null && identity !== "";
  const hasValidIdentity = identityRule.valid(identity);

  if (hasIdentity && !hasValidIdentity) {
    errors.push(`Download ${platform} has an invalid ${identityRule.label}.`);
  }
  if ((download.directUrl || download.published) && !hasIdentity) {
    errors.push(
      `Download ${platform} requires ${identityRule.field} when a direct URL is configured or published.`,
    );
  }

  if (download.directUrl) {
    try {
      const url = new URL(download.directUrl);
      const expectedHost = allowedStoreHosts[platform];
      const hasVerifiedOrigin =
        url.protocol === "https:" &&
        url.hostname === expectedHost &&
        !url.port &&
        !url.username &&
        !url.password;
      if (!hasVerifiedOrigin) {
        errors.push(`Download ${platform} must use a verified https://${expectedHost} URL.`);
      } else if (
        hasValidIdentity &&
        !identityRule.matchesListing(url, identity)
      ) {
        errors.push(
          `Download ${platform} direct URL must match its ${identityRule.field} listing exactly.`,
        );
      }
    } catch {
      errors.push(`Download ${platform} has an invalid direct URL.`);
    }
  }

  if (download.published && !download.directUrl) {
    errors.push(`Published download ${platform} requires a direct store URL.`);
  }
  if (!download.published) {
    warnings.push(`${platform} download stays disabled until a direct release URL is verified.`);
  }
  if (site.release?.ready && !download.published) {
    errors.push(`Release-ready content requires a published ${platform} download.`);
  }
}

const requiredOperatorFields = [
  "legalName",
  "registrationNumber",
  "registeredAddress",
  "phone",
  "supportEmail",
  "privacyEmail",
];

if (!site.operator?.publicName?.trim()) {
  errors.push("A public operator identity is required.");
}

const rawFacebookUrl = site.operator?.facebookUrl;
const facebookUrl = rawFacebookUrl?.trim();
if (!facebookUrl) {
  errors.push("A public Facebook contact URL is required.");
} else {
  try {
    const url = new URL(facebookUrl);
    if (
      url.protocol !== "https:" ||
      !["facebook.com", "www.facebook.com"].includes(url.hostname.toLowerCase()) ||
      url.username ||
      url.password ||
      url.port
    ) {
      errors.push(
        "Operator facebookUrl must be an HTTPS facebook.com URL without credentials or a custom port.",
      );
    } else if (rawFacebookUrl !== url.href) {
      errors.push("Operator facebookUrl must use its normalized absolute URL form.");
    }
  } catch {
    errors.push("Operator facebookUrl must be a valid absolute URL.");
  }
}

if (site.operator?.configured || site.release?.ready) {
  for (const field of requiredOperatorFields) {
    if (!site.operator?.[field]?.trim()) {
      errors.push(`Configured operator is missing ${field}.`);
    }
  }
  if (site.operator?.legalName?.trim() === "Đơn vị vận hành Kim Tài") {
    errors.push("Replace the generic operator legal name before release.");
  }
}

for (const field of ["supportEmail", "privacyEmail"]) {
  const value = site.operator?.[field]?.trim();
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push(`Operator ${field} must be a valid email address.`);
  }
}

if (site.release?.ready && !site.operator?.configured) {
  errors.push("A release-ready site requires operator.configured=true.");
}

if (!site.release?.ready || !site.operator?.configured) {
  warnings.push("Preview mode is active; search indexing remains disabled.");
}

const supportedTokens = new Set([
  "{{appName}}",
  "{{operatorLegalName}}",
  "{{operatorRegistrationNumber}}",
  "{{operatorRegisteredAddress}}",
  "{{operatorPhone}}",
  "{{supportContact}}",
  "{{privacyContact}}",
]);

for (const [locale, legal] of [["vi", legalVi], ["en", legalEn]]) {
  const tokens = JSON.stringify(legal).match(/\{\{[A-Za-z]+\}\}/g) ?? [];
  for (const token of tokens) {
    if (!supportedTokens.has(token)) {
      errors.push(`Unsupported legal token ${token} in ${locale}.`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Content schema checks passed.");
}

if (warnings.length) {
  console.warn(warnings.map((warning) => `WARN: ${warning}`).join("\n"));
}
