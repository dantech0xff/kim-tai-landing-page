import type { MetadataRoute } from "next";

import { toCanonicalUrl } from "@/lib/base-path";

export const dynamic = "force-static";

// Cho phép mọi crawler (kể cả AI bot) đọc trang; release gate dùng meta noindex
// nên crawler phải truy cập được trang mới thấy tín hiệu đó. robots.txt chỉ có
// hiệu lực ở domain root (RFC 9309) — bản nằm dưới basePath của mirror vô hại.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: toCanonicalUrl("/sitemap.xml"),
  };
}
