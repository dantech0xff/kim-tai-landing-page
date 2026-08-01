---
phase: 4
title: "Validation and Docs"
status: completed
effort: "0.5 ngày"
priority: P2
dependencies: [1, 2, 3]
---

# Phase 4: Validation and Docs

## Overview

Chính thức hoá kiểm chứng SEO vào validator hiện có, chạy toàn bộ quality gates, kiểm tra thủ công bằng công cụ ngoài, và cập nhật tài liệu + runbook phát hành (Search Console, submit sitemap, theo dõi AI referral).

## Requirements

- Functional: validator bắt được regression cho canonical/hreflang/noindex/JSON-LD/OG/sitemap/robots/FAQ; docs phản ánh đúng hành vi mới.
- Non-functional: không nới lỏng test để "cho xanh"; docs ngắn gọn, cập nhật thay vì viết trùng.

## Architecture

Mở rộng validator theo pattern sẵn có (đọc HTML trong `out/`, assert chuỗi/parse):

**`scripts/validate-pages-export.mjs`** (chạy trên export GitHub Pages) thêm assert mỗi trang:
- meta robots chứa `noindex` (mirror luôn noindex — hành vi Phase 1).
- canonical + hreflang (vi/en/x-default) đúng origin `https://kimtai.dantech.academy`, có trailing slash, không chứa basePath.
- og:title/og:description/og:url/og:image + twitter card; file og image tồn tại trong `out/`.
- Mọi block `<script type="application/ld+json">`: `JSON.parse` thành công; đúng bộ `@type` theo route (layout: Organization + WebSite; landing: + MobileApplication + FAQPage; legal: + BreadcrumbList); không chứa key `aggregateRating`.
- `sitemap.xml` + `robots.txt` tồn tại trong `out/`; sitemap đủ 8 `<loc>` canonical-origin + `hreflang="x-default"`.
- Landing chứa section FAQ (id/heading) với ≥ 3 cặp hỏi-đáp trong HTML tĩnh.

**`scripts/validate-content.mjs`**: các check FAQ/ogImage đã thêm ở Phase 1/3 — rà lại đủ; thêm cảnh báo nếu `release.ready` bật mà thiếu og image hoặc faq.

## Related Code Files

- Modify: `scripts/validate-pages-export.mjs`
- Modify: `scripts/validate-content.mjs`
- Modify: `README.md` — mục SEO ngắn (robots/sitemap/JSON-LD/FAQ/OG, canonical origin, mirror noindex); cập nhật "Việc bắt buộc trước khi phát hành" thêm bước SEO.
- Modify: `docs/deployment.md` — ghi chú `NEXT_PUBLIC_CANONICAL_ORIGIN` cho mirror, xác nhận `SITE_ORIGIN` trên Vercel, mục "Sau khi phát hành" (runbook dưới).

## Implementation Steps

1. Mở rộng hai validator như trên; chạy build hai biến thể để xác nhận validator xanh và thử phá (mutation nhanh: xoá 1 hreflang → validator phải đỏ).
2. Chạy đủ: `npm run validate:content`, `typecheck`, `lint`, `build`, `start` + `scripts/browser-smoke.mjs`, build GitHub Pages + `validate:pages`.
3. Kiểm tra thủ công (ghi kết quả vào `reports/` của plan):
   - `curl -s https://kimtai.dantech.academy/vi/ | grep -E 'canonical|hreflang|ld\+json|og:'` sau khi deploy — canonical/OG đúng.
   - `curl -sI` một Vercel preview → có `X-Robots-Tag: noindex` (hành vi mặc định Vercel cho preview).
   - JSON-LD: `validator.schema.org` không lỗi cú pháp/kiểu. Google Rich Results Test chỉ để đối chiếu — CHẤP NHẬN cảnh báo thiếu `aggregateRating` (chủ đích, `offers` đã có sau Validation Session 1 — xem risk Phase 2); không nhắm rich-result eligibility. <!-- Updated: Validation Session 1 - offers được thêm, chỉ còn aggregateRating bỏ chủ đích -->
   - Lighthouse tab SEO cho `/vi/` và `/en/`: mọi audit pass TRỪ `is-crawlable` (fail là đúng khi còn noindex); ghi lại điểm số. Mục tiêu ≥ 95 thuộc runbook sau phát hành.
4. Cập nhật README + docs/deployment.md (đọc bản hiện có trước, sửa tối thiểu).
5. Viết **runbook sau phát hành** vào docs/deployment.md (thực hiện khi `release.ready` + `operator.configured` bật và deploy):
   - Xác minh site đã bỏ noindex (`curl` kiểm tra meta robots).
   - Tạo property Google Search Console (Domain property cho `dantech.academy` hoặc URL-prefix `https://kimtai.dantech.academy`), submit `sitemap.xml`; tương tự Bing Webmaster Tools (nguồn của ChatGPT Search/Copilot).
   - Chạy lại Rich Results Test trên URL live; Lighthouse SEO mục tiêu ≥ 95 (hết noindex).
   - Xác nhận `NEXT_PUBLIC_CANONICAL_ORIGIN` KHÔNG được đặt trên Vercel (nếu đặt lệch origin, prod bị coi là mirror → noindex âm thầm).
   - Theo dõi: Search Console coverage + query; AI referral qua referrer (`chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`) nếu bật analytics sau này — hiện `productFacts.websiteAnalyticsEnabled=false`, chỉ ghi nhận là hạn chế đo lường, KHÔNG tự ý thêm analytics (quyết định sản phẩm/pháp lý riêng).

## Success Criteria

- [x] Validator mở rộng: xanh trên build hợp lệ, đỏ khi mutation thử (xoá hreflang/JSON-LD).
- [x] Toàn bộ quality gates xanh trên cả hai biến thể build.
- [x] Kết quả kiểm tra thủ công lưu tại `plans/20260801-005354-seo-ai-search/reports/verification-*.md`.
- [x] README + docs/deployment.md cập nhật, ngày/links/claims khớp thay đổi thật.
- [x] Runbook sau phát hành nằm trong docs/deployment.md, tham chiếu từ checklist README.

## Risk Assessment

- **Validator quá gắn với chuỗi HTML cụ thể**: theo pattern repo sẵn có; khi Next đổi cách render sẽ sửa validator, chấp nhận.
- **Không có analytics → không đo được AI referral**: ghi nhận hạn chế trong docs; việc bật analytics là quyết định riêng (privacy/pháp lý), ngoài scope plan này.
- **Search Console cần quyền DNS/tài khoản**: bước sau phát hành, thuộc runbook chứ không chặn code.
