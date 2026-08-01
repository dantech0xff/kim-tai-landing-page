# Kiểm tra tính nhất quán tài liệu - SEO & AI Search

Ngày: 2026-08-01  
Phạm vi: README.md, docs/deployment.md vs code implementation

## Tóm tắt

Kiểm tra được 19 khẳng định chính trong tài liệu. Kết quả: **18 khớp đúng**, **1 sai lệch nhỏ** (đã sửa).

## Chi tiết kiểm chứng

| Khẳng định | File | Vị trí | Mã code | Kết quả |
|-----------|------|--------|---------|---------|
| Trailing slash trên cả Vercel và GitHub Pages | README.md | Line 94 | next.config.ts:32, 39 | ✓ Khớp |
| Redirect / → /vi/ | next.config.ts | Line 44 | next.config.ts:44 | ✓ Khớp |
| 8 URL trong sitemap (2 locales × 4 routes) | README.md | Line 95 | sitemap.ts:12-23 | ✓ Khớp |
| robots.txt cho phép mọi crawler | README.md | Line 95 | robots.ts:12 | ✓ Khớp |
| Sitemap trỏ canonical origin | robots.ts | Line 13 | robots.ts:13 | ✓ Khớp |
| OG/Twitter 1200×630 tại `/images/og/` | README.md | Line 98 | site.json:124,325 | ✓ Khớp (kích thước: 1200×630) |
| llms.txt tóm tắt site cho AI | README.md | Line 99 | public/llms.txt | ✓ Tồn tại |
| scripts/generate-og-images.sh tái tạo OG | README.md | Line 98 | scripts/generate-og-images.sh | ✓ Tồn tại |
| Organization + WebSite trên mọi trang | README.md | Line 96 | structured-data.ts:75-99, layout.tsx:117-118 | ✓ Khớp |
| MobileApplication + FAQPage trên landing | README.md | Line 96 | validate-pages-export.mjs:202-212 | ✓ Khớp |
| BreadcrumbList trên legal pages | README.md | Line 96 | validate-pages-export.mjs:202-212 | ✓ Khớp |
| FAQ từ duy nhất một nguồn (site.json) | README.md | Line 97 | site.json:242-276, structured-data.ts:124-133 | ✓ Khớp |
| Không có `aggregateRating` giả | README.md | Line 96 | structured-data.ts:102, validate-pages-export.mjs:197 | ✓ Khớp (chủ ý) |
| offers.price: "0" phản ánh mô hình IAP | README.md | Line 96 | structured-data.ts:117 | ✓ Khớp (price: "0") |
| GitHub Pages luôn `noindex` | README.md | Line 89 | layout.tsx:49-50, base-path.ts:12-13 | ✓ Khớp (isMirrorDeployment = true) |
| Canonical/hreflang trên mirror trỏ Vercel | README.md | Line 89 | next.config.ts:24-25, base-path.ts:8-9 | ✓ Khớp |
| x-default hreflang = /vi/ | sitemap.ts | Line 20 | sitemap.ts:20 | ✓ Khớp |
| Anchor link runbook SEO | README.md | Line 87 | docs/deployment.md:106 | ✓ Khớp (heading tồn tại) |

## Sai lệch tìm thấy

### 1. README.md line 14 - Trailing slash thiếu (sửa được)

**Khẳng định:** "Mở `http://localhost:3000`; trang gốc chuyển đến `/vi`."

**Thực tế:** next.config.ts line 43-46 điều hướng `/` → `/vi/` (CÓ trailing slash)

**Tác động:** Nhỏ - chỉ là trình bày, behavior thực tế là `/vi/`

**Sửa:** Đổi `/vi` thành `/vi/` để nhất quán với cấu hình trailing slash

## Kết luận

- Tài liệu phản ánh chính xác hành vi code hiện tại.
- Tất cả khẳng định SEO/canonical/mirror logic được xác minh và đúng.
- Một sai lệch trình bày nhỏ đã sửa (trailing slash).
- Các claim về release gate, noindex logic, JSON-LD structure, validation script đều chính xác.

Status: DONE
