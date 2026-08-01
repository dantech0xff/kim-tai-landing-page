# Code Review — SEO & AI Search Implementation

Reviewer: code-reviewer · Ngày: 2026-08-01
Phạm vi: 15 file modified + 8 file/thư mục untracked (ngoài plans/). Không sửa file, không build (theo constraint).

## Kết quả checks

- `npm run typecheck`: PASS (0 lỗi)
- `npm run lint`: PASS (0 lỗi)
- `npm run validate:content`: PASS (2 WARN chủ đích: ios disabled, preview noindex)
- `node --check` cho 3 script validator: PASS — cấu trúc vòng lặp `validate-pages-export.mjs` đúng, khối operator-details (`if (slug)`, dòng 236-264) vẫn nằm trong vòng lặp route, mọi check cũ (basePath assets, `_next`, image optimizer, manifest, redirect gốc) còn nguyên hiệu lực.

## Đánh giá tổng quan

Triển khai bám sát plan, đúng pattern repo (Server Components, JSON config-driven, validator assert chuỗi HTML). Không phát hiện lỗi Critical/High. Không fake data trong JSON-LD. Release gate và các touchpoint business logic không bị regression.

## Critical

Không có.

## High

Không có.

## Medium

1. **Trang pháp lý kế thừa twitter:title/description của trang chủ** — `src/app/[locale]/[legal]/page.tsx:33-46` chỉ override `openGraph` (qua `buildOpenGraph`), không override `twitter`. Next kế thừa `twitter` từ layout (`src/app/[locale]/layout.tsx:96-101`) → trên `/vi/terms-of-service/`: `og:title` = tên tài liệu nhưng `twitter:title` = title trang chủ. Không phá vỡ gì (ảnh/card vẫn đúng) nhưng lệch metadata; validator chỉ check prefix `twitter:title content="` nên không bắt được. Đề xuất: thêm `twitter` override trong `generateMetadata` của legal page (hoặc mở rộng helper trong `seo-metadata.ts` trả về cả cặp openGraph+twitter).

## Low

2. **`generate-og-images.sh:21` leak temp file** — `"$(mktemp -t kim-tai-og-icon).png"`: `mktemp` đã tạo file (không đuôi .png), icon ghi vào path khác (.png); trap chỉ xoá bản .png → mỗi lần chạy để lại 1 file rỗng trong TMPDIR. Script cũng chỉ chạy trên macOS (font Arial hardcode) — đã ghi chú trong header, chấp nhận được cho script one-off.
3. **`scripts/browser-smoke.mjs:56-57`** — `localePath` và `metadataLocalePath` giờ giống hệt nhau sau khi đồng nhất trailing slash. Nên gộp một helper để tránh phân kỳ về sau.
4. **Validator FAQ chỉ assert câu hỏi, không assert câu trả lời trong HTML** — `scripts/validate-pages-export.mjs:227-233`. Rủi ro thực tế ≈ 0 vì UI và FAQPage schema cùng đọc `locales.*.faq` (một nguồn), nhưng nếu muốn kín hoàn toàn có thể thêm check `faq-answer`.
5. **FAQ "platforms" cam kết tương lai về iOS** — `site.json` (vi: "phiên bản iOS sẽ được công bố khi phát hành"; en tương tự). Config có sẵn mục `downloads.ios` (published:false) nên có cơ sở, nhưng đây là lời hứa sản phẩm public — xác nhận với chủ sản phẩm rằng iOS chắc chắn nằm trong roadmap trước khi phát hành.

## Informational / Đã xác minh không phải lỗi

- **isMirrorDeployment (trọng tâm rủi ro #1)**: đúng cho mọi tổ hợp hợp lệ. Vercel prod (SITE_ORIGIN đặt, CANONICAL_ORIGIN không đặt) → not mirror; GH Pages (siteOrigin github.io, canonical mặc định kimtai.dantech.academy) → mirror; local dev → not mirror nhưng release gate vẫn giữ noindex. So sánh qua `new URL().origin` (`src/lib/base-path.ts:12-13`) chuẩn hoá trailing slash/hoa-thường. Env malformed → throw lúc build (fail-fast, chấp nhận). Rủi ro còn lại duy nhất là ops: đặt nhầm `NEXT_PUBLIC_CANONICAL_ORIGIN` trên Vercel → prod âm thầm noindex — đã có cảnh báo đậm trong `docs/deployment.md` + bước 2 runbook; không thể guard trong repo vì validate:pages chỉ chạy trên CI GitHub Pages.
- **XSS (trọng tâm #5)**: `structured-data.tsx:7` escape `<` → `<`, chặn `</script>` breakout. Nguồn dữ liệu đều là JSON trong repo.
- **JSON-LD (trọng tâm #2)**: đúng schema.org. MobileApplication chỉ chứa dữ liệu thật: `installUrl` qua `getPublishedDownloadUrl` (đã verify Play URL), `operatingSystem` theo `ios.published`, `offers.price "0"` VND khớp quyết định Validation Session 1, không aggregateRating. FAQPage sinh từ đúng mảng `faq.items` của UI (structured-data.ts:124-134) → khớp 1:1 by construction. BreadcrumbList item URL tuyệt đối, trailing slash. Lưu ý nhỏ: `Organization.url`/`WebSite.url` trỏ gốc domain (redirect về /vi/) — đây là entity URL, thực hành chuẩn, không vi phạm tiêu chí "canonical không trỏ redirect".
- **FAQ vs productFacts (trọng tâm #3)**: data-storage khớp `holdingsStoredOnDevice:true` + giữ hedge "theo mô tả hiện tại của sản phẩm"; sell-or-advise khớp trustNote; price-source giữ "giá tham khảo, không phải báo giá cam kết"; pricing khớp quyết định free + Premium IAP. Giọng điệu pháp lý nhất quán vi/en.
- **buildOpenGraph (trọng tâm #4)**: legal page giữ đủ images/locale/siteName/type qua helper; ảnh dùng path tương đối `withBasePath` + `metadataBase` → resolve đúng trên cả hai deployment (khớp assert `expectedOgImage` trong validator).
- **Trailing slash**: `<Link>` được Next normalize theo `trailingSlash:true` (đã chứng minh bởi hành vi export GH Pages trước đây mà browser-smoke từng assert), nên `getLegalPath` trả `/vi/terms-of-service` không tạo redirect hop trong HTML render.
- **Sitemap/robots**: 8 URL (2 locale × 4 route), hreflang + x-default, `lastModified` từ `release.lastUpdated` (string — hợp lệ với MetadataRoute). `dynamic = "force-static"` đủ cho output export. robots.txt mirror nằm dưới basePath — vô hiệu theo RFC 9309, comment đã ghi rõ, vô hại. Lưu ý vận hành: `release.lastUpdated` là ngày tĩnh, cần nhớ cập nhật khi thay nội dung.
- **CI plumbing**: workflow không đặt `CANONICAL_ORIGIN` → build (next.config fallback) và validate (validate-pages fallback) cùng mặc định `https://kimtai.dantech.academy` — nhất quán.
- **Regression touchpoints (check b)**: release gate Vercel còn nguyên (`layout.tsx:49-50`); `getPublishedDownloadUrl`, `store-buttons.tsx`, `legal-document-page.tsx`, `manifest.ts`, theme script không đổi.
- **OG images**: cả hai file đúng 1200×630 (sips verified).

## Acceptance criteria (check a)

| Tiêu chí | Trạng thái |
|---|---|
| Canonical/hreflang tuyệt đối + x-default, trailing slash đồng nhất, không trỏ redirect | Đạt (layout + legal page + sitemap đều qua `toCanonicalUrl` với `/…/`) |
| Mirror luôn noindex + canonical về kimtai.dantech.academy | Đạt (isIndexable && !isMirrorDeployment; validator dòng 166 enforce) |
| robots.txt + sitemap.xml, 8 URL hreflang | Đạt |
| JSON-LD hợp lệ, không fake data | Đạt (validator chặn aggregateRating) |
| FAQ UI ↔ schema 1:1, khớp productFacts | Đạt (cùng nguồn dữ liệu) |
| OG/Twitter 1200×630 hai locale | Đạt (trừ lệch twitter:title trên legal — Medium #1) |
| validate/typecheck/lint xanh | Đạt (build + validate:pages do tester khác chạy, ngoài phạm vi review này theo constraint) |
| README + docs cập nhật | Đạt (runbook sau phát hành + cảnh báo CANONICAL_ORIGIN) |

## Hành động đề xuất (ưu tiên)

1. (Medium) Thêm `twitter` override cho legal page metadata để card khớp `og:title`.
2. (Low) Gộp `localePath`/`metadataLocalePath` trong browser-smoke.
3. (Low) Sửa mktemp leak trong generate-og-images.sh nếu còn tái chạy script.
4. (Content) Xác nhận cam kết iOS trong FAQ "platforms" với chủ sản phẩm trước release.

## Unresolved questions

- Không có câu hỏi chặn. Duy nhất mục content #5 (cam kết iOS) cần chủ sản phẩm xác nhận.
