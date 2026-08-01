---
title: "Kim Tai SEO va AI Search Optimization"
description: "Tối ưu SEO cho cả Google Search truyền thống và AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews): sửa canonical/hreflang, thêm robots/sitemap/JSON-LD/OG image, FAQ + nội dung dễ trích dẫn, mở rộng validator và tài liệu."
status: completed
priority: P2
branch: "main"
tags: [seo, geo, ai-search, nextjs]
blockedBy: []
blocks: []
created: "2026-07-31T17:53:55.113Z"
createdBy: "ck:plan"
source: skill
---

# Kim Tài — SEO & AI Search Optimization

## Overview

Trang landing Kim Tài (Next.js 16 App Router, song ngữ vi/en, SSG hoàn toàn) đã có nền tốt: metadata + canonical + hreflang vi/en, semantic HTML chuẩn, server-rendered (AI crawler đọc được không cần JS), release-gate `noindex` hoạt động đúng.

Plan này bổ sung phần còn thiếu cho cả hai kênh:

- **Search truyền thống**: sửa lỗi canonical trỏ vào URL redirect (trailing slash lệch giữa Vercel và GitHub Pages), loại bỏ rủi ro duplicate content từ bản mirror GitHub Pages, thêm `robots.ts`, `sitemap.ts` (hreflang + x-default), OG/Twitter image.
- **AI search (GEO)**: JSON-LD (Organization, WebSite, MobileApplication, BreadcrumbList, FAQPage), mục FAQ hiển thị trên trang, tinh chỉnh copy theo hướng entity-first/answer-first (bằng chứng ~2.8x tăng khả năng được AI trích dẫn), llms.txt (ROI thấp nhưng chi phí ~0 — đã chốt thêm qua validation).

Mọi thay đổi tôn trọng release gate hiện có: site vẫn `noindex` cho đến khi `release.ready && operator.configured`. Hạ tầng SEO được chuẩn bị sẵn để "bật" ngay khi phát hành. Nghiên cứu nền tảng: `reports/researcher-geo-ai-search.md` và `reports/researcher-nextjs-technical-seo.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Metadata Foundation](./phase-01-metadata-foundation.md) | Completed |
| 2 | [Search Infrastructure](./phase-02-search-infrastructure.md) | Completed |
| 3 | [AI Search Optimization](./phase-03-ai-search-optimization.md) | Completed |
| 4 | [Validation and Docs](./phase-04-validation-and-docs.md) | Completed |

Phụ thuộc tuần tự: Phase 2 cần helper canonical của Phase 1; Phase 3 cần component JSON-LD của Phase 2; Phase 4 kiểm chứng toàn bộ.

## Dependencies

- Không phụ thuộc plan khác (2 plan cũ trong `./plans/` đã hoàn thành/chỉ chứa research).
- `scripts/validate-pages-export.mjs` phải được cập nhật cùng commit với thay đổi canonical (giữ CI GitHub Pages xanh).
- OG image 1200×630: dựng từ brand assets có sẵn (`public/icons/`) trừ khi có thiết kế riêng.

## Acceptance criteria

- Canonical/hreflang tuyệt đối, kèm `x-default`, đồng nhất trailing slash trên cả hai deployment; canonical không trỏ vào URL redirect.
- Bản mirror GitHub Pages luôn `noindex` (bất kể release gate) và canonical trỏ về `https://kimtai.dantech.academy`.
- `robots.txt` + `sitemap.xml` phát hành đúng trên Vercel; sitemap chứa 8 URL với hreflang alternates.
- JSON-LD hợp lệ (parse được, đúng @type, không có dữ liệu giả như aggregateRating) trên mọi trang.
- Mục FAQ hiển thị trên landing page khớp 1:1 với FAQPage schema, nội dung khớp `productFacts`.
- OG/Twitter metadata + ảnh 1200×630 cho cả hai locale.
- `validate:content`, `typecheck`, `lint`, `build` (cả hai biến thể), `validate:pages` đều xanh; validator mở rộng bắt được regression SEO.
- README + docs/deployment.md cập nhật checklist SEO trước/sau phát hành.

## Open questions

Không còn — cả 4 câu hỏi mở đã được chốt trong Validation Session 1 (xem Validation Log).

## Validation Log

### Session 1 — 2026-08-01

**Verification Results**
- Claims checked: ~40 (red-team empirical: build export, tsc probe next@16.2.10, render test) + 10 fact-check bổ sung (localePath/metadataLocalePath trong browser-smoke.mjs, brand.name, release.lastUpdated, icon 512, facebookUrl, android.published, legal document.version="1.0", getPublishedDownloadUrl, deploy-pages.yml)
- Verified: tất cả | Failed: 0 | Unverified: 0
- Tier: Standard (4 phases) — kết hợp bằng chứng red-team tại `reports/red-team-seo-plan-findings.md`

**Quyết định phỏng vấn (đã lan truyền xuống phase files):**

| # | Câu hỏi | Quyết định |
|---|---------|-----------|
| 1 | Chính sách AI crawler trong robots.txt | **Cho phép tất cả** (kể cả bot training) — giữ thiết kế mặc định Phase 2 |
| 2 | Mô hình giá app | **Tải miễn phí + Premium IAP** → thêm `offers.price: "0"` trung thực vào MobileApplication (Phase 2); giữ câu FAQ về giá (Phase 3) |
| 3 | Nguồn OG image | **Dựng từ brand assets** bằng script (Phase 1) |
| 4 | llms.txt | **Thêm** — không còn là bước tùy chọn (Phase 3) |

### Implementation — 2026-08-01 (/ck:cook --auto)

Cả 4 phase triển khai tuần tự trong một phiên; mọi quality gate xanh trên 2 biến thể build (chi tiết: `reports/verification-seo-quality-gates.md`, `reports/tester-seo-gates-rerun.md`). Code review 0 Critical/High; Medium duy nhất (twitter metadata trang pháp lý kế thừa title trang chủ) đã sửa bằng helper `buildTwitter` dùng chung layout/legal (`reports/code-review-seo-implementation.md`). Câu FAQ về iOS cần chủ sản phẩm xác nhận roadmap trước khi bật `release.ready`.

### Whole-Plan Consistency Sweep — Session 1

Đã rà lại `plan.md` + 4 phase sau khi lan truyền quyết định: hết tham chiếu "tùy chọn" cho llms.txt, hết "KHÔNG có offers", robots policy trỏ về Validation Session 1 thay vì open question. Không còn mâu thuẫn chưa xử lý. Kèm sweep trước đó sau red-team (12 findings hợp nhất, xem `reports/red-team-seo-plan-findings.md`).
