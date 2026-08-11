import { canonicalOrigin, toCanonicalUrl } from "@/lib/base-path";
import {
  getLegalDocument,
  getPublishedDownloadUrl,
  getSiteCopy,
  siteConfig,
  type DownloadPlatform,
  type LegalSlug,
  type Locale,
} from "@/lib/content";

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs: string[];
  legalName?: string;
}

interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string[];
}

interface OfferSchema {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
}

interface MobileApplicationSchema {
  "@context": "https://schema.org";
  "@type": "MobileApplication";
  name: string;
  description: string;
  applicationCategory: "FinanceApplication";
  operatingSystem: string;
  image?: string;
  inLanguage: string;
  installUrl: string[];
  isAccessibleForFree: true;
  offers: OfferSchema;
  sameAs: string[];
  url: string;
}

interface FaqPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
}

interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

function findIcon512() {
  return siteConfig.icons.manifest.find((icon) => icon.sizes === "512x512");
}

// Thực thể nhà phát hành: brand.name ("Kim Tài") tách bạch với tên sản phẩm;
// chỉ bổ sung legalName khi pháp nhân đã được cấu hình thật.
export function buildOrganization(): OrganizationSchema {
  const icon = findIcon512();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brand.name,
    url: canonicalOrigin,
    ...(icon ? { logo: toCanonicalUrl(icon.src) } : {}),
    sameAs: [siteConfig.operator.facebookUrl],
    ...(siteConfig.operator.configured
      ? { legalName: siteConfig.operator.legalName }
      : {}),
  };
}

// Không có potentialAction/SearchAction — site không có trang tìm kiếm.
export function buildWebSite(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brand.productName,
    url: toCanonicalUrl("/"),
    inLanguage: ["vi", "en"],
  };
}

// Không có aggregateRating: chưa có dữ liệu đánh giá thật từ store.
// offers.price "0" phản ánh mô hình đã xác nhận: tải miễn phí, Premium là IAP.
export function buildMobileApplication(locale: Locale): MobileApplicationSchema {
  const icon = findIcon512();
  const downloadPlatforms: DownloadPlatform[] = ["ios", "android"];
  const installUrls = downloadPlatforms
    .map((platform) => getPublishedDownloadUrl(platform))
    .filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: siteConfig.brand.productName,
    description: getSiteCopy(locale).metadata.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: siteConfig.downloads.ios.published ? "Android, iOS" : "Android",
    ...(icon ? { image: toCanonicalUrl(icon.src) } : {}),
    inLanguage: locale,
    installUrl: installUrls,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    sameAs: installUrls,
    url: toCanonicalUrl(`/${locale}/`),
  };
}

// mainEntity sinh từ đúng mảng faq.items hiển thị trên trang — một nguồn dữ
// liệu cho cả UI và schema nên hai bên không bao giờ lệch nhau.
export function buildFaqPage(locale: Locale): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getSiteCopy(locale).faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildBreadcrumbList(
  locale: Locale,
  slug: LegalSlug,
): BreadcrumbListSchema {
  const { document } = getLegalDocument(locale, slug);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.brand.productName,
        item: toCanonicalUrl(`/${locale}/`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: document.shortTitle,
        item: toCanonicalUrl(`/${locale}/${slug}/`),
      },
    ],
  };
}
