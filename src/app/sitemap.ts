import type { MetadataRoute } from "next";

import { toCanonicalUrl } from "@/lib/base-path";
import { legalSlugs, locales, siteConfig } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = siteConfig.release.lastUpdated;
  const routeSuffixes = ["", ...legalSlugs.map((slug) => `${slug}/`)];
  const appScreenshotUrls = Object.values(siteConfig.screenshots).map((screenshot) =>
    toCanonicalUrl(screenshot.src),
  );

  return routeSuffixes.flatMap((suffix) =>
    locales.map((locale) => ({
      url: toCanonicalUrl(`/${locale}/${suffix}`),
      lastModified,
      ...(suffix === "" ? { images: appScreenshotUrls } : {}),
      alternates: {
        languages: {
          vi: toCanonicalUrl(`/vi/${suffix}`),
          en: toCanonicalUrl(`/en/${suffix}`),
          "x-default": toCanonicalUrl(`/vi/${suffix}`),
        },
      },
    })),
  );
}
