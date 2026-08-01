---
phase: 1
title: "Metadata Foundation"
status: completed
effort: "0.5–1 ngày"
priority: P1
dependencies: []
---

# Phase 1: Metadata Foundation

## Overview

Sửa nền tảng canonical/hreflang trước khi xây thêm: đồng nhất trailing slash giữa hai deployment, chuyển canonical/hreflang sang URL tuyệt đối kèm `x-default`, ép bản mirror GitHub Pages luôn `noindex` + canonical chéo về Vercel, và bổ sung OG/Twitter metadata với ảnh 1200×630. Cập nhật validator cùng commit để CI không đỏ.

## Requirements

- Functional: canonical trên Vercel không trỏ vào URL bị 308 redirect; mirror không bao giờ được index; OG/Twitter đầy đủ cho mọi trang.
- Non-functional: không đổi hành vi release gate hiện có; build hai biến thể (Vercel + `GITHUB_PAGES=true`) đều xanh.

## Architecture

**Vấn đề gốc 1 — trailing slash lệch:** Vercel không bật `trailingSlash` nên URL thật là `/vi`, nhưng canonical đang là `/vi/` (URL này bị 308 về `/vi`). GitHub Pages bật `trailingSlash: true`. Giải pháp: bật `trailingSlash: true` cho cả nhánh Vercel trong `next.config.ts` — hai deployment cùng dạng URL `/vi/`, canonical khớp URL thật. An toàn vì site đang preview/noindex, chưa có backlink cần bảo toàn.

**Vấn đề gốc 2 — mirror duplicate content:** hiện GH Pages tự canonical về `github.io`; khi `release.ready` bật, mirror sẽ được index song song bản chính. Giải pháp (khuyến nghị Google cho mirror, xem report technical-seo mục 6): mirror luôn `noindex` bất kể gate + canonical/hreflang chéo về origin chính.

**Khái niệm mới — canonical origin tách khỏi serving origin:**

```ts
// src/lib/base-path.ts (mở rộng)
export const canonicalOrigin =
  process.env.NEXT_PUBLIC_CANONICAL_ORIGIN ?? siteOrigin;
// So sánh origin đã chuẩn hoá — tránh trailing slash/hoa-thường làm prod kẹt noindex
export const isMirrorDeployment =
  new URL(canonicalOrigin).origin !== new URL(siteOrigin).origin;
// URL canonical KHÔNG mang basePath (URL Vercel không có basePath)
export function toCanonicalUrl(pathname: string) {
  return new URL(pathname, canonicalOrigin).toString();
}
```

`next.config.ts` nhánh GitHub Pages đặt `NEXT_PUBLIC_CANONICAL_ORIGIN` = `process.env.CANONICAL_ORIGIN ?? "https://kimtai.dantech.academy"`. Nhánh Vercel không đặt (canonical = serving origin). `metadataBase` giữ nguyên `siteOrigin` để og:image resolve theo origin đang phục vụ (mirror tự phục vụ ảnh của nó); canonical/hreflang truyền URL tuyệt đối từ `toCanonicalUrl` nên không bị `metadataBase` ghi đè.

**Robots trên mirror:** `index: isReleaseReady && !isMirrorDeployment`.

## Related Code Files

- Modify: `next.config.ts` — thêm `trailingSlash: true` vào nhánh Vercel; đổi `redirects` destination `/` → `/vi/` (tránh chuỗi 307→308, giữ `permanent: false`); nhánh GitHub Pages thêm biến theo dạng `env: { ...sharedConfig.env, NEXT_PUBLIC_CANONICAL_ORIGIN: ... }` (bắt buộc spread — ghi `env:` mới sau spread `...sharedConfig` sẽ làm rơi `NEXT_PUBLIC_BASE_PATH`/`NEXT_PUBLIC_SITE_ORIGIN`).
- Modify: `src/lib/base-path.ts` — thêm `canonicalOrigin`, `isMirrorDeployment`, `toCanonicalUrl`.
- Create: `src/lib/seo-metadata.ts` — helper `buildOpenGraph(locale, { url, title, description })` trả về object openGraph ĐẦY ĐỦ (images, locale, siteName, type) dùng chung cho layout và trang pháp lý. Lý do: Next merge metadata theo kiểu shallow — `openGraph` khai báo ở page THAY THẾ HOÀN TOÀN bản của layout, nên page nào tự khai openGraph phải khai lại images/locale/siteName/type.
- Modify: `scripts/browser-smoke.mjs` — `localePath()` hiện trả `/vi` (không slash) khi không có base path; sau khi bật `trailingSlash: true` các assert route-pathname, default-redirect (`/vi`), locale-switch href (`/en`) và document-200 sẽ đỏ. Sửa `localePath` phát trailing slash vô điều kiện (đồng bộ với `metadataLocalePath`), cùng commit với thay đổi `next.config.ts`.
- Modify: `src/app/[locale]/layout.tsx` — canonical/hreflang tuyệt đối + `x-default` → `/vi/`; robots tính thêm `!isMirrorDeployment`; `openGraph` qua `buildOpenGraph` (url, images, alternateLocale, siteName, type); thêm block `twitter` (card `summary_large_image`).
- Modify: `src/app/[locale]/[legal]/page.tsx` — canonical/hreflang tuyệt đối + `x-default`; `openGraph` qua `buildOpenGraph` với url/title/description per-page (giữ đủ images/locale/siteName/type).
- Modify: `src/content/site.json` — thêm `locales.{vi,en}.metadata.ogImage` `{src, width: 1200, height: 630, alt}`.
- Create: `public/images/og/kim-tai-og-vi.png`, `public/images/og/kim-tai-og-en.png` (1200×630, dựng từ `public/icons/kim-tai-app-icon.png` + tagline, nền màu thương hiệu `#102a24`/`#f6f1e8`; script ImageMagick hoặc thiết kế tay — artwork badge không được chỉnh sửa, brand mark thì được dùng nguyên bản đặt trên nền).
- Modify: `scripts/validate-pages-export.mjs` — canonical/hreflang expect origin `https://kimtai.dantech.academy` (không còn `github.io`, không mang basePath); assert `<meta name="robots" content="noindex` trên MỌI trang; assert `x-default`; assert og:image + twitter meta.
- Modify: `scripts/validate-content.mjs` — kiểm tra `metadata.ogImage` trỏ tới file tồn tại trong `public/`.
- Modify: `docs/deployment.md` + `README.md` — sửa NGAY trong phase này hai khẳng định sẽ sai sau thay đổi: "Bản GitHub Pages vẫn dùng origin `github.io`" (deployment.md) và mô tả mirror noindex phụ thuộc release gate (README) → mirror luôn noindex, canonical về Vercel. Phần SEO đầy đủ + runbook vẫn thuộc Phase 4.

## Implementation Steps

1. `next.config.ts`: thêm `trailingSlash: true` vào nhánh Vercel; đổi `redirects` destination thành `/vi/` (giữ `permanent: false`). Nhánh GitHub Pages: `env: { ...sharedConfig.env, NEXT_PUBLIC_CANONICAL_ORIGIN: process.env.CANONICAL_ORIGIN ?? "https://kimtai.dantech.academy" }`. Cùng commit: sửa `localePath()` trong `scripts/browser-smoke.mjs` phát trailing slash.
2. `src/lib/base-path.ts`: thêm `canonicalOrigin`, `isMirrorDeployment`, `toCanonicalUrl` như phác thảo trên.
3. `src/app/[locale]/layout.tsx`:
   - `alternates.canonical = toCanonicalUrl(`/${locale}/`)`; `languages = { vi: toCanonicalUrl("/vi/"), en: toCanonicalUrl("/en/"), "x-default": toCanonicalUrl("/vi/") }`.
   - `robots.index = isReleaseReady && !isMirrorDeployment` (follow tương tự).
   - `openGraph` qua `buildOpenGraph(locale, { url: toCanonicalUrl(`/${locale}/`), title, description })` — helper gói sẵn `images: [{ url: withBasePath(ogImage.src), width, height, alt }]`, `alternateLocale: locale === "vi" ? "en_US" : "vi_VN"`, `siteName`, `type: "website"`.
   - `twitter: { card: "summary_large_image", title, description, images: [withBasePath(ogImage.src)] }`.
4. `src/app/[locale]/[legal]/page.tsx`: chuyển canonical + languages sang `toCanonicalUrl(`/${locale}/${legal}/`)` + `x-default` → bản vi; `openGraph` dùng `buildOpenGraph(locale, { url, title: document.shortTitle, description: document.description })` để giữ đủ images/locale/siteName/type (KHÔNG khai openGraph rút gọn — bị shallow-merge nuốt của layout). `twitter` không khai ở page → kế thừa layout, an toàn.
5. Dựng 2 ảnh OG 1200×630, khai báo trong `site.json`.
6. Cập nhật 2 script validate theo Related Code Files (cùng commit với bước 1–4).
7. Sửa hai khẳng định lỗi thời trong `docs/deployment.md` + `README.md` (xem Related Code Files).
8. Chạy: `npm run validate:content && npm run typecheck && npm run lint && npm run build`, rồi `npm run start` + `node scripts/browser-smoke.mjs`, rồi build + validate biến thể GitHub Pages theo lệnh trong README.
9. Kiểm tra thủ công đầu ra export: canonical mọi trang = `https://kimtai.dantech.academy/...`, có `x-default`, mọi trang mirror có `noindex`.

## Success Criteria

- [x] `trailingSlash: true` trên cả hai biến thể; canonical khớp chính xác URL thật (không redirect).
- [x] Mọi trang xuất ra có canonical + hreflang (vi, en, x-default) tuyệt đối trỏ về `kimtai.dantech.academy`.
- [x] Bản export GitHub Pages: 100% trang có `noindex` bất kể `release.ready`.
- [x] Mọi trang có og:title/description/url/image (1200×630) + twitter card.
- [x] `scripts/browser-smoke.mjs` xanh với URL dạng `/vi/` trên `next start`.
- [x] Toàn bộ lệnh kiểm tra và cả hai validator xanh.

## Risk Assessment

- **Đổi URL Vercel `/vi` → `/vi/`**: 308 redirect tự động từ dạng cũ; site chưa index nên không mất ranking. Rollback: bỏ `trailingSlash` khỏi nhánh Vercel.
- **`validate:pages` phụ thuộc dạng chuỗi HTML do Next render** (`<link rel="alternate" hrefLang=...>`): Next đổi cách render sẽ làm validator gãy — chấp nhận, validator vốn theo phong cách này.
- **Quên đặt `SITE_ORIGIN` trên Vercel**: canonical rơi về localhost — đã có sẵn rủi ro này; Phase 4 thêm mục kiểm tra trong docs.
- **Đặt nhầm `NEXT_PUBLIC_CANONICAL_ORIGIN` trên Vercel**: nếu giá trị lệch origin với `SITE_ORIGIN`, prod bị coi là mirror → noindex âm thầm sau phát hành. Mitigation: so sánh origin chuẩn hoá (trên), docs ghi rõ biến này KHÔNG đặt trên Vercel, runbook Phase 4 có bước `curl` kiểm noindex sau deploy.
