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
  if (
    !copy?.ledgerVisual?.primaryPurity ||
    !copy?.ledgerVisual?.quantity ||
    !copy?.ledgerVisual?.secondaryPurity ||
    !copy?.ledgerVisual?.status
  ) {
    errors.push(`Locale ${locale} has incomplete ledger visual data.`);
  }
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

for (const [platform, download] of Object.entries(site.downloads ?? {})) {
  if (download.directUrl) {
    try {
      const url = new URL(download.directUrl);
      const expectedHost = allowedStoreHosts[platform];
      if (url.protocol !== "https:" || url.hostname !== expectedHost) {
        errors.push(`Download ${platform} must use a verified https://${expectedHost} URL.`);
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

if (site.operator?.configured || site.release?.ready) {
  for (const field of requiredOperatorFields) {
    if (!site.operator?.[field]?.trim()) {
      errors.push(`Configured operator is missing ${field}.`);
    }
  }
  if (site.operator?.legalName === "Đơn vị vận hành Kim Tài") {
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
