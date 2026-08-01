import legalEnJson from "@/content/legal.en.json";
import legalViJson from "@/content/legal.vi.json";
import siteJson from "@/content/site.json";
import { isVerifiedStoreUrl } from "@/lib/store-url";

export const locales = ["vi", "en"] as const;
export const legalSlugs = [
  "terms-of-service",
  "terms-and-conditions",
  "privacy-policy",
] as const;

export type Locale = (typeof locales)[number];
export type LegalSlug = (typeof legalSlugs)[number];
export type ScreenshotKey = "overview" | "settings" | "market";
export type FeatureIcon = "ledger" | "trend" | "device" | "sliders";
export type FeatureId = "portfolio" | "market" | "local-first" | "personalize";

export interface LocalizedFeature {
  id: FeatureId;
  icon: FeatureIcon;
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
  tone: "forest" | "gold" | "mint" | "coral";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  items: string[];
}

export interface LegalDocument {
  slug: LegalSlug;
  shortTitle: string;
  title: string;
  description: string;
  version: string;
  sourceIds: string[];
  sections: LegalSection[];
}

interface LegalSource {
  id: string;
  title: string;
  url: string;
  note: string;
}

interface LegalCollection {
  sources: LegalSource[];
  documents: Record<LegalSlug, LegalDocument>;
}

export const siteConfig = siteJson;

export type DownloadPlatform = keyof typeof siteConfig.downloads;

export function getPublishedDownloadUrl(
  platform: DownloadPlatform,
): string | null {
  const download = siteConfig.downloads[platform];
  if (!download.published || !download.directUrl) return null;

  const expectedIdentity =
    platform === "ios"
      ? siteConfig.downloads.ios.appStoreId
      : siteConfig.downloads.android.packageName;

  if (!isVerifiedStoreUrl(platform, download.directUrl, expectedIdentity)) {
    return null;
  }

  return new URL(download.directUrl).toString();
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isLegalSlug(value: string): value is LegalSlug {
  return legalSlugs.includes(value as LegalSlug);
}

export function getSiteCopy(locale: Locale) {
  return siteConfig.locales[locale];
}

export function getLegalCollection(locale: Locale): LegalCollection {
  return (locale === "vi" ? legalViJson : legalEnJson) as LegalCollection;
}

export function getLegalDocument(locale: Locale, slug: LegalSlug) {
  const collection = getLegalCollection(locale);
  const document = collection.documents[slug];
  const sources = collection.sources.filter((source) =>
    document.sourceIds.includes(source.id),
  );

  return { document, sources };
}

export function getLegalPath(locale: Locale, slug: LegalSlug) {
  return `/${locale}/${slug}`;
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "vi" ? "en" : "vi";
}

export function interpolateLegalText(locale: Locale, text: string) {
  const pending = {
    legalName:
      locale === "vi"
        ? "đơn vị vận hành đang chờ cấu hình pháp lý"
        : "the operator pending legal configuration",
    registrationNumber:
      locale === "vi" ? "sẽ công bố trước khi phát hành" : "to be published before release",
    registeredAddress:
      locale === "vi" ? "sẽ công bố trước khi phát hành" : "to be published before release",
    phone:
      locale === "vi" ? "sẽ công bố trước khi phát hành" : "to be published before release",
    support:
      locale === "vi" ? "kênh hỗ trợ sẽ được công bố trước khi phát hành" : "the support channel to be published before release",
  };
  const privacyFallback =
    locale === "vi"
      ? "kênh bảo vệ dữ liệu sẽ được công bố trước khi phát hành"
      : "the data-protection channel to be published before release";
  const configured = siteConfig.operator.configured;
  const configuredValue = (value: string, fallback: string) =>
    configured && value.trim() ? value : fallback;
  const publicSupportContact =
    siteConfig.operator.facebookUrl.trim() || pending.support;

  const replacements: Record<string, string> = {
    "{{appName}}": siteConfig.brand.productName,
    "{{operatorLegalName}}": configuredValue(
      siteConfig.operator.legalName,
      pending.legalName,
    ),
    "{{operatorRegistrationNumber}}": configuredValue(
      siteConfig.operator.registrationNumber,
      pending.registrationNumber,
    ),
    "{{operatorRegisteredAddress}}": configuredValue(
      siteConfig.operator.registeredAddress,
      pending.registeredAddress,
    ),
    "{{operatorPhone}}": configuredValue(siteConfig.operator.phone, pending.phone),
    "{{supportContact}}": configuredValue(
      siteConfig.operator.supportEmail,
      publicSupportContact,
    ),
    "{{privacyContact}}":
      configuredValue(siteConfig.operator.privacyEmail, privacyFallback),
  };

  return Object.entries(replacements).reduce(
    (result, [token, replacement]) => result.replaceAll(token, replacement),
    text,
  );
}

export function formatLegalDate(locale: Locale, isoDate: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${isoDate}T00:00:00+07:00`));
}
