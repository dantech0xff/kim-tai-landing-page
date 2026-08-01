---
phase: 3
title: "AI Search Optimization"
status: completed
effort: "0.5–1 ngày"
priority: P2
dependencies: [2]
---

# Phase 3: AI Search Optimization

## Overview

Tối ưu cho AI answer engines (GEO): thêm mục FAQ hiển thị trên landing page + FAQPage JSON-LD, tinh chỉnh copy theo hướng entity-first/answer-first, và llms.txt. Cơ sở: report GEO — cấu trúc heading tuần tự + câu trả lời trực tiếp 40–60 từ + gọi tên thực thể cho ~2.8x khả năng được trích dẫn; FAQPage schema vẫn được Perplexity/ChatGPT/Gemini dùng dù Google đã bỏ rich result (05/2026).

## Requirements

- Functional: FAQ song ngữ hiển thị trên trang, khớp 1:1 với FAQPage schema; mọi câu trả lời đúng sự thật, khớp `productFacts` và tài liệu pháp lý.
- Non-functional: giữ giọng điệu hiện có (trung thực, không mời gọi đầu tư); không thêm số liệu bịa; UI khớp hệ bento hiện tại.

## Architecture

**Dữ liệu FAQ** trong `site.json` (`locales.{vi,en}.faq`): `{ eyebrow, title, items: [{ id, question, answer }] }`, 5–6 mục, vi/en cùng bộ `id`. Nháp nội dung (chỉnh sửa khi thực thi, đối chiếu `productFacts`):

1. *Kim Tài là gì?* — "Kim Tài là ứng dụng sổ vàng cá nhân: ghi lại vàng bạn đang giữ, theo dõi giá tham khảo từ các nhà cung cấp và xem biến động giá trị danh mục ngay trên thiết bị." (answer-first, ~40 từ)
2. *Kim Tài có bán vàng hay tư vấn đầu tư không?* — "Không. Kim Tài là công cụ theo dõi: không bán vàng, không định giá giao dịch thay bạn và không đưa khuyến nghị đầu tư."
3. *Dữ liệu vàng của tôi lưu ở đâu?* — "Dữ liệu sở hữu được lưu trên thiết bị của bạn." (khớp `productFacts.holdingsStoredOnDevice`)
4. *Giá vàng trong Kim Tài lấy từ đâu?* — "Giá là giá tham khảo theo từng nhà cung cấp, kèm nguồn tham khảo; không phải giá giao dịch cam kết." (KHÔNG dùng từ tuyệt đối "luôn"/"thời điểm cập nhật" trừ khi đối chiếu được với app thật — `productFacts` hiện không có field nào xác nhận hành vi này; `principles.points` chỉ nói "khi có dữ liệu giá".)
5. *Kim Tài chạy trên nền tảng nào?* — "Android qua Google Play; bản iOS sẽ công bố khi phát hành." (điều kiện hoá theo `downloads.*.published` lúc thực thi)
6. *Kim Tài có miễn phí không?* — "Kim Tài tải miễn phí trên Google Play; một số tính năng nâng cao thuộc gói Premium mua trong ứng dụng." (Đã xác nhận mô hình giá trong Validation Session 1; vẫn đối chiếu câu chữ với màn hình mua hàng thật của app trước khi phát hành.) <!-- Updated: Validation Session 1 - xác nhận tải miễn phí + Premium IAP -->

**UI**: section FAQ mới trong `landing-page.tsx` (trước download section), `<section aria-labelledby="faq-title">`, h2 + danh sách `<details>/<summary>` hoặc heading h3 + `<p>` (chọn heading h3 tĩnh — nội dung luôn hiển thị trong HTML, không phụ thuộc tương tác, tốt hơn cho crawler lẫn accessibility; giữ phong cách bento card). Câu hỏi là heading dạng câu hỏi (question-style headings — tín hiệu GEO).

**FAQPage JSON-LD**: builder `buildFaqPage(locale)` trong `src/lib/structured-data.ts`, `mainEntity` sinh từ đúng mảng `faq.items` (một nguồn dữ liệu cho cả UI và schema → không bao giờ lệch).

**Tinh chỉnh copy (chỉ `site.json`, không đổi component)**:
- `metadata.description` vi: "Kim Tài là ứng dụng sổ vàng cá nhân: ghi lại vàng đang giữ, theo dõi giá vàng tham khảo và xem biến động danh mục ngay trên thiết bị của bạn." (entity-first, chứa cụm khoá "giá vàng", "sổ vàng"); en tương ứng "Kim Tài is a personal gold book app: ...".
- `hero.description`, `features[].description`: mở đầu bằng "Kim Tài ..." thay đại từ/danh từ chung ở nơi tự nhiên; không nhồi từ khoá, giữ độ dài tương đương.
- Danh sách field chỉnh sửa cụ thể chốt lúc thực thi; nguyên tắc: mỗi câu có thể được trích dẫn độc lập phải tự chứa tên "Kim Tài".

**llms.txt (đã chốt thêm — Validation Session 1)**: `public/llms.txt` theo dạng llmstxt.org: H1 + blockquote tóm tắt song ngữ + danh sách link (trang vi/en, 3 trang pháp lý vi) với URL tuyệt đối canonical. Ghi rõ trong file: nội dung tham khảo, không phải tư vấn đầu tư. ROI thấp (AI crawler lớn chưa tiêu thụ) — kỳ vọng đúng mức.

## Related Code Files

- Modify: `src/content/site.json` — thêm `locales.{vi,en}.faq`; tinh chỉnh `metadata.description`, `hero.description`, `features[].description`; thêm nav item FAQ nếu cần.
- Modify: `src/components/landing-page.tsx` — section FAQ + render FAQPage schema.
- Modify: `src/lib/content.ts` — type cho `faq`.
- Modify: `src/lib/structured-data.ts` — `buildFaqPage`.
- Modify: `src/app/globals.css` — style FAQ card theo hệ bento (nếu cần class mới).
- Create: `public/llms.txt`.
- Modify: `scripts/validate-content.mjs` — yêu cầu `faq.items` ≥ 3 và cùng bộ `id` giữa vi/en; câu hỏi kết thúc bằng "?".

## Implementation Steps

1. Soạn nội dung FAQ vi/en (nháp ở trên), đối chiếu từng câu với `productFacts` + legal docs; câu 6 giữ theo mô hình giá đã xác nhận (miễn phí + Premium IAP).
2. Thêm `faq` vào `site.json` + type vào `content.ts`.
3. Dựng section FAQ trong `landing-page.tsx` (semantic, đúng hệ thống design hiện có, responsive + dark mode).
4. Thêm `buildFaqPage` và render schema cùng section.
5. Tinh chỉnh copy entity-first trong `site.json` theo nguyên tắc trên (diff nhỏ, đọc lại toàn bộ câu sau sửa).
6. Thêm `public/llms.txt`.
7. Mở rộng `validate-content.mjs` cho FAQ; chạy toàn bộ lệnh kiểm tra + build hai biến thể.

## Success Criteria

- [x] FAQ hiển thị đầy đủ trong HTML tĩnh (không cần JS/tương tác để thấy nội dung), song ngữ, đạt chuẩn accessibility (heading tuần tự, landmark đúng).
- [x] FAQPage JSON-LD sinh từ cùng dữ liệu với UI; parse hợp lệ.
- [x] Copy sau chỉnh: mô tả metadata + hero mở đầu bằng thực thể "Kim Tài"; không câu nào mâu thuẫn `productFacts`/legal.
- [x] `validate:content` bắt lỗi khi FAQ lệch vi/en.
- [x] Toàn bộ lệnh kiểm tra xanh.

## Risk Assessment

- **FAQ sai sự thật về sản phẩm** (nghiêm trọng nhất — trang này nhấn mạnh trung thực pháp lý): mọi câu phải đối chiếu `productFacts` + legal docs; câu 6 về giá đã được xác nhận ở mức mô hình (miễn phí + Premium IAP) nhưng câu chữ cụ thể vẫn cần khớp app thật; câu 4 về nguồn giá phải tránh khẳng định tuyệt đối chưa kiểm chứng. Mitigation: validator parity + review thủ công từng câu.
- **Nhồi từ khoá làm hỏng giọng thương hiệu**: giới hạn ở entity-naming và answer-first, không thêm cụm khoá gượng ép.
- **llms.txt ROI thấp**: đã ghi nhận trong nghiên cứu và chấp nhận khi chốt thêm (Validation Session 1); chi phí gần 0, không tạo kỳ vọng.
