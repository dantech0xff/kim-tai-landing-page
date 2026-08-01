import type { Metadata } from "next";

import { withBasePath } from "@/lib/base-path";
import { getSiteCopy, siteConfig, type Locale } from "@/lib/content";

interface OpenGraphInput {
  url: string;
  title: string;
  description: string;
}

interface TwitterInput {
  title: string;
  description: string;
}

// Next merge metadata theo kiểu shallow: `openGraph` khai báo ở page thay thế
// hoàn toàn bản của layout, nên mọi nơi khai openGraph phải đi qua helper này
// để giữ đủ images/locale/siteName/type.
export function buildOpenGraph(
  locale: Locale,
  { url, title, description }: OpenGraphInput,
): NonNullable<Metadata["openGraph"]> {
  const { ogImage } = getSiteCopy(locale).metadata;

  return {
    title,
    description,
    url,
    siteName: siteConfig.brand.name,
    locale: locale === "vi" ? "vi_VN" : "en_US",
    alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
    type: "website",
    images: [
      {
        url: withBasePath(ogImage.src),
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt,
      },
    ],
  };
}

// Twitter metadata cũng bị shallow merge như openGraph: page nào override
// openGraph thì phải override twitter cùng nhịp để title/description khớp nhau.
export function buildTwitter(
  locale: Locale,
  { title, description }: TwitterInput,
): NonNullable<Metadata["twitter"]> {
  const { ogImage } = getSiteCopy(locale).metadata;

  return {
    card: "summary_large_image",
    title,
    description,
    images: [withBasePath(ogImage.src)],
  };
}
