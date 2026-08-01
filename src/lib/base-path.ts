const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath = configuredBasePath.replace(/\/+$/, "");
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";

// Origin chính thức cho canonical/hreflang/sitemap; mirror (GitHub Pages) đặt
// NEXT_PUBLIC_CANONICAL_ORIGIN để trỏ chéo về bản Vercel.
export const canonicalOrigin =
  process.env.NEXT_PUBLIC_CANONICAL_ORIGIN ?? siteOrigin;

// So sánh origin đã chuẩn hoá — tránh trailing slash/hoa-thường làm prod kẹt noindex.
export const isMirrorDeployment =
  new URL(canonicalOrigin).origin !== new URL(siteOrigin).origin;

// URL canonical không mang basePath: bản chính trên Vercel phục vụ tại gốc domain.
export function toCanonicalUrl(pathname: string) {
  return new URL(pathname, canonicalOrigin).toString();
}

export function withBasePath(pathname: string) {
  if (!pathname.startsWith("/") || !basePath) return pathname;
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return pathname;
  return `${basePath}${pathname}`;
}
