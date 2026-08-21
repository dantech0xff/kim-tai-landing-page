---
title: "Gỡ disclaimer 'tạm tính' và 'mô phỏng' khỏi landing page"
date: 2026-08-21
summary: "Thay disclaimer bằng tuyên bố cứng ở site.json VI+EN, xoá 3 khoá JSON kèm code/CSS/validator theo sau"
---

# Gỡ disclaimer 'tạm tính' và 'mô phỏng' khỏi landing page

## What happened

Yêu cầu: bỏ hết copy mang tính từ chối trách nhiệm dạng "Giá trị tạm tính" trên landing page, thay bằng tuyên bố cứng ("Kiểm đếm tài sản Vàng" / "Giá trị tài sản Vàng của bạn"); xoá hẳn các câu dạng "Minh hoạ mô phỏng · không phải giá thực".

Copy đổi trong `src/content/site.json` (cả `locales.vi` và `locales.en`):
- `hero.ledger.label`: Sổ vàng Kim Tài → Kiểm đếm tài sản Vàng (EN: Your gold assets, counted)
- `hero.ledger.valueLabel`: Giá trị tạm tính → Giá trị tài sản Vàng của bạn (EN: Your gold asset value)
- `hero.ledger.items[2].label`: Lãi tạm tính → Lợi nhuận (EN: Profit)
- `features[0].title`, `principles.points[1]`: bỏ "tạm tính"
- `featureVisuals.market.summary`: bỏ "theo nhịp mô phỏng"

Xoá 3 khoá JSON: `hero.ledger.note`, `featureVisuals.illustrationLabel`, `featureVisuals.market.note`.

Code theo sau việc xoá khoá:
- `src/components/feature-simulations.tsx` — bỏ prop `illustrationLabel` xuyên 4 component con, bỏ `<p class="simulation-kicker">` và `<p class="market-chart__note">`, rút `aria-label` (vẫn non-empty, giữ `role="img"`), gọn lại switch
- `src/components/landing-page.tsx` — bỏ `<p class="hero-seal__note">`
- `src/app/globals.css` — xoá `.hero-seal__note`, `.simulation-kicker`, `.market-chart__note`; bỏ `gap` đã thành vô hiệu trên `.feature-simulation` (giờ chỉ còn 1 con)
- `scripts/validate-content.mjs` — gỡ 3 rule, đáng chú ý là assertion `/mô phỏng|[Ss]imulated/` từng **bắt buộc** hero note phải tự nhận là mô phỏng
- `scripts/browser-smoke.mjs` — nhãn assertion "simulated visuals" đã lỗi thời
- `README.md` — câu "kèm dòng chú thích bắt buộc ghi rõ đây là minh hoạ" mô tả rule vừa gỡ, nên sai; cùng 2 câu khác về "biểu đồ mô phỏng"

Code review (`code-reviewer`) bắt được 2 lỗi copy EN do edit cơ học: `principles.points[1]` mất head noun "values" khiến "Keep buy, sell, and your gold asset value" hỏng parallelism (→ "Keep buy prices, sell prices, and…"), và `features[0].title` lặp "your … your" (→ bỏ 1). Reviewer cũng đo được `hero.ledger.valueLabel` dùng chung cho 6 chỗ render — thẻ Hero + 5 thẻ Ngũ Hành (`landing-page.tsx:150`) — nên chuỗi dài hơn wrap 2 dòng ở 1024–1270px và 480–767px.

Gates: `validate:content`, `typecheck`, `lint`, `build` xanh trước và sau khi sửa review.

## Decision

**Legal docs không đụng.** `legal.vi.json:95` / `legal.en.json:95` vẫn ghi "hiển thị giá trị tạm tính" / "display estimated values". Lý do người dùng đưa: điều khoản pháp lý chỉ nên nằm ở trang legal. Chấp nhận wording landing page lệch với ToS.

**Chấp nhận wrap 2 dòng ở 5 thẻ Ngũ Hành.** Không thêm khoá label riêng cho skin card (tránh scope thừa); thẻ vẫn thẳng hàng vì grid row stretch, chỉ đổi nhịp thị giác.

## Next steps

- Chưa commit tại thời điểm ghi journal.
- Hero hiện hiển thị số dựng sẵn (1.485.000.000đ) không còn chú thích minh hoạ — quy ước mockup marketing bình thường, nhưng đáng nhớ nếu sau này có rà soát quảng cáo.
- Rác tồn từ trước, ngoài phạm vi lần này: `ScreenshotKey` (`src/lib/content.ts:18`) export nhưng không ai dùng; `public/iphone-1284x2778/` không được tham chiếu — sót lại từ lần gỡ OrbitMotif.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
