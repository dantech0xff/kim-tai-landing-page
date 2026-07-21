import type { MetadataRoute } from "next";

import { withBasePath } from "@/lib/base-path";
import { siteConfig } from "@/lib/content";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brand.productName,
    short_name: siteConfig.brand.shortName,
    description: siteConfig.locales.vi.metadata.description,
    start_url: withBasePath("/vi/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#102a24",
    icons: siteConfig.icons.manifest.map((icon) => ({
      ...icon,
      src: withBasePath(icon.src),
    })),
  };
}
