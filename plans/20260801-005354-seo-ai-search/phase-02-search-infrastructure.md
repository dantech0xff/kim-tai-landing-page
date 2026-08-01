---
phase: 2
title: "Search Infrastructure"
status: completed
effort: "0.5–1 ngày"
priority: P1
dependencies: [1]
---

# Phase 2: Search Infrastructure

## Overview

Thêm `robots.ts`, `sitemap.ts` và JSON-LD (Organization, WebSite, MobileApplication, BreadcrumbList). Dùng `canonicalOrigin`/`toCanonicalUrl` từ Phase 1 để mọi URL trong sitemap/schema là URL chính thức (Vercel), kể cả khi build mirror.

## Requirements

- Functional: `https://kimtai.dantech.academy/robots.txt` và `/sitemap.xml` hoạt động; JSON-LD parse hợp lệ trên mọi trang, đúng ngôn ngữ.
- Non-functional: tương thích `output: "export"`; không dữ liệu giả (không `aggregateRating`, không số liệu bịa); tuân thủ policy "không fake data" của repo.

## Architecture

**robots.ts** (`src/app/robots.ts`, `export const dynamic = "force-static"`): cho phép tất cả user-agent (đã chốt trong Validation Session 1 — tối đa hiện diện AI, kể cả bot training), `sitemap: toCanonicalUrl("/sitemap.xml")`. Lưu ý theo RFC 9309: robots.txt chỉ có nghĩa ở domain root → chỉ hiệu lực trên Vercel; bản trong export GitHub Pages nằm dưới basePath nên crawler bỏ qua (vô hại — mirror đã được bảo vệ bằng meta noindex từ Phase 1). Không dùng robots.txt để chặn crawl khi chưa phát hành: crawler phải đọc được trang mới thấy meta `noindex`.

**sitemap.ts** (`src/app/sitemap.ts`, `force-static`): 8 URL = 2 locale home + 6 trang pháp lý, build từ `locales` × `legalSlugs` import từ `@/lib/content` (DRY — không lặp danh sách route). Mỗi entry:

```ts
{
  url: toCanonicalUrl(`/${locale}/${slug ? slug + "/" : ""}`),
  lastModified: siteConfig.release.lastUpdated, // ISO date từ site.json, KHÔNG dùng new Date()
  alternates: { languages: {
    vi: toCanonicalUrl(`/vi/...`), en: toCanonicalUrl(`/en/...`),
    "x-default": toCanonicalUrl(`/vi/...`),
  }},
}
```

`lastModified` dùng `release.lastUpdated` cho CẢ 8 URL. Không dùng `document.version` — giá trị thật trong legal.*.json là `"1.0"` (số phiên bản, không phải ngày); nếu muốn lastModified per-document sau này, thêm field ISO `lastUpdatedDate` vào legal docs kèm check trong `validate-content.mjs` (ngoài scope phase này).

**JSON-LD** — component dùng chung `src/components/structured-data.tsx` (Server Component):

```tsx
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

Builder tập trung tại `src/lib/structured-data.ts` (nhận `locale`, đọc `siteConfig`):

- `Organization`: `name` = `brand.name` ("Kim Tài" — tách bạch thực thể nhà phát hành với sản phẩm; `operator.publicName` hiện trùng `brand.productName` nên không dùng), `url` = `canonicalOrigin`, `logo` = URL tuyệt đối icon 512, `sameAs: [operator.facebookUrl]`; bổ sung `legalName` khi `operator.configured` bật.
- `WebSite`: `name` = `brand.productName`, `url`, `inLanguage: ["vi", "en"]`. KHÔNG có `potentialAction`/SearchAction — site không có trang search.
- `MobileApplication` (chỉ landing page): `name` = `brand.productName`, `description` = metadata.description theo locale, `applicationCategory: "FinanceApplication"`, `operatingSystem` = `"Android"` (+`", iOS"` khi `downloads.ios.published`), `installUrl` = `getPublishedDownloadUrl("android")` (chỉ thêm khi khác null), `image` = URL icon, `inLanguage` = locale. `offers: { "@type": "Offer", "price": "0", "priceCurrency": "VND" }` — đã xác nhận app tải miễn phí, Premium là IAP (guidance Google cho app có IAP: dùng giá tải app cơ bản). KHÔNG có `aggregateRating` (chưa có dữ liệu thật). <!-- Updated: Validation Session 1 - thêm offers trung thực sau khi xác nhận mô hình giá -->
- `BreadcrumbList` (chỉ trang pháp lý): Home (`/${locale}/`) → tài liệu, tên theo locale.

Render: Organization + WebSite trong `src/app/[locale]/layout.tsx` (site không có root layout riêng — mỗi locale layout render `<html>`); MobileApplication trong landing page; BreadcrumbList trong legal page. Render cả khi chưa phát hành (vô hại dưới noindex, đơn giản hơn gating).

## Related Code Files

- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/components/structured-data.tsx`
- Create: `src/lib/structured-data.ts`
- Modify: `src/app/[locale]/layout.tsx` — render Organization + WebSite trong `<head>` hoặc đầu `<body>`.
- Modify: `src/app/[locale]/page.tsx` — render MobileApplication.
- Modify: `src/app/[locale]/[legal]/page.tsx` — render BreadcrumbList.

## Implementation Steps

1. Viết `src/lib/structured-data.ts` với các builder ở trên (typed, không any).
2. Viết `src/components/structured-data.tsx`.
3. Gắn schema vào layout / landing / legal page.
4. Viết `src/app/sitemap.ts` (routes từ `locales` × `legalSlugs`, lastModified từ nội dung).
5. Viết `src/app/robots.ts`.
6. Biến thể export (`GITHUB_PAGES=true`): xác nhận `out/robots.txt`, `out/sitemap.xml` tồn tại. Biến thể Vercel (không tạo `out/`): `npm run build && npm run start` rồi `curl localhost:3000/robots.txt` và `curl localhost:3000/sitemap.xml`. Mở sitemap kiểm tra 8 `<url>` + `xhtml:link` hreflang + x-default; canonical origin đúng.
7. Parse thử mọi block `application/ld+json` trong HTML xuất ra bằng `JSON.parse` (script nhanh, sẽ chính thức hoá ở Phase 4).

## Success Criteria

- [x] `robots.txt` allow-all + trỏ sitemap URL tuyệt đối trên canonical origin.
- [x] `sitemap.xml` đủ 8 URL, mỗi URL có alternates vi/en/x-default, trailing slash nhất quán, không URL github.io.
- [x] Mỗi trang có đúng bộ JSON-LD: layout (Organization, WebSite), landing (+MobileApplication có `offers.price: "0"`), legal (+BreadcrumbList); parse hợp lệ; không aggregateRating.
- [x] `typecheck`, `lint`, `build` hai biến thể + `validate:pages` xanh.

## Risk Assessment

- **Sitemap chứa URL noindex trước phát hành**: mâu thuẫn tín hiệu nhẹ, Google bỏ qua; chấp nhận để giữ code đơn giản (sitemap chỉ được submit sau phát hành — Phase 4).
- **Organization chưa có pháp nhân**: `name` dùng `brand.name` ("Kim Tài"), chưa có `legalName`/địa chỉ tới khi `operator.configured` bật — khớp trạng thái preview của trang pháp lý; bổ sung khi cấu hình pháp nhân.
- **MobileApplication thiếu `aggregateRating` → chưa đủ điều kiện rich result của Google** (Rich Results Test sẽ báo thiếu trường này; `offers` đã có sau Validation Session 1). Đây là chủ đích theo rule không fake data; mục tiêu schema là entity understanding cho AI engine, không phải rich result. Thêm `aggregateRating` chỉ khi có dữ liệu đánh giá thật từ store.
