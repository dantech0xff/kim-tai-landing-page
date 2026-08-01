# Verification — SEO & AI Search Quality Gates

Ngày: 2026-08-01 · Môi trường: local (macOS, Node 22, Chrome headless), chưa deploy

## Quality gates

| Gate | Kết quả |
| --- | --- |
| `npm run validate:content` | PASS (2 WARN chủ đích: iOS chưa published, preview mode) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` (Vercel variant) | PASS — 11 trang SSG + robots.txt + sitemap.xml |
| `next start` + `scripts/browser-smoke.mjs` | PASS — 181/181 checks, URL dạng `/vi/` |
| `GITHUB_PAGES=true` build + `npm run validate:pages` | PASS |

## Mutation test validator (validate-pages-export.mjs)

| Mutation trên out/vi/index.html | Kết quả |
| --- | --- |
| Xoá `<link hrefLang="x-default">` | Validator ĐỎ (throw) ✓ |
| Đổi `@type: FAQPage` → `FAQPageX` | Validator ĐỎ ✓ |
| Xoá `<meta name="robots" content="noindex, nofollow">` | Validator ĐỎ ✓ |
| Khôi phục file gốc | Validator XANH ✓ |

## Kiểm tra thủ công trên export

- Canonical mọi trang: `https://kimtai.dantech.academy/...`, trailing slash, không basePath, không github.io.
- Hreflang vi/en + `x-default` (→ bản vi) trên cả 8 trang.
- Mirror GitHub Pages: 100% trang `noindex, nofollow` dù `release.ready` tắt hay bật (robots meta tính thêm `isMirrorDeployment`).
- og:url = canonical; og:image = origin đang phục vụ (mirror tự phục vụ ảnh của nó qua `metadataBase`); twitter card `summary_large_image`.
- JSON-LD parse hợp lệ từng block: layout = Organization + WebSite; landing += MobileApplication (offers price "0" VND, installUrl Google Play đã xác minh) + FAQPage (6 câu = đúng dữ liệu UI); legal += BreadcrumbList. Không có `aggregateRating` (chủ đích).
- `robots.txt`: allow-all + `Sitemap: https://kimtai.dantech.academy/sitemap.xml`.
- `sitemap.xml`: đủ 8 `<loc>` canonical-origin, mỗi URL có `xhtml:link` vi/en/x-default, `lastmod` từ `release.lastUpdated` (không dùng `new Date()`).
- FAQ hiển thị tĩnh trong HTML (6 cặp hỏi–đáp, heading h2→h3 tuần tự); kiểm tra trực quan light/dark khớp hệ bento.
- `llms.txt` xuất hiện trong export.

## Lighthouse SEO (local, preview/noindex)

| Trang | Điểm | Audit fail |
| --- | --- | --- |
| `/vi/` | 0.69 | chỉ `is-crawlable` (đúng chủ đích khi còn noindex) |
| `/en/` | 0.69 | chỉ `is-crawlable` |

Mọi audit SEO khác pass. Mục tiêu ≥ 95 sau khi bỏ noindex thuộc runbook sau phát hành (docs/deployment.md).

## Các kiểm tra hoãn sang sau deploy (runbook)

- `curl https://kimtai.dantech.academy/vi/` đối chiếu canonical/OG: bản production hiện tại vẫn là code cũ (thay đổi chưa commit/push) nên kiểm tra này chỉ có nghĩa sau deploy — đã đưa vào bước 1 của runbook.
- `curl -sI` Vercel preview kiểm `X-Robots-Tag: noindex`: cần preview deployment mới — ghi chú trong runbook.
- validator.schema.org / Rich Results Test trên URL live: bước 4 của runbook; chấp nhận cảnh báo thiếu `aggregateRating`.

## Ghi chú

- `validate-content.mjs` coi thiếu ogImage/FAQ là **lỗi** vô điều kiện (chặt hơn yêu cầu "cảnh báo khi release.ready" trong phase 4 — chủ đích, vì hai bề mặt này đã thành phần cố định của trang).
- Ảnh OG tái tạo được bằng `scripts/generate-og-images.sh` (ImageMagick + font hệ thống, brand palette `#102a24`/`#f6f1e8`/`#d6b668`).
