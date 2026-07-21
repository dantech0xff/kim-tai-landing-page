import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brand.productName,
    short_name: siteConfig.brand.shortName,
    description: siteConfig.locales.vi.metadata.description,
    start_url: "/vi",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#102a24",
    icons: siteConfig.icons.manifest,
  };
}
