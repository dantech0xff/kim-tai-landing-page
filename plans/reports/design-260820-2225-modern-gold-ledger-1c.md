# Áp thiết kế Modern Gold Ledger (hướng 1c) cho toàn project

Nguồn: Claude Design project `59ca72b7-ae9c-4f34-b24a-e6e331cb0372`
— `Kim Tai Website 1c Pages.dc.html` (pháp lý, bài kỹ thuật, 404) + khung `1c` trong `Kim Tai Website Redesign.dc.html` (landing).

## Hệ token

| Nhóm | Tối (mặc định) | Sáng |
| --- | --- | --- |
| Nền | `#0B0C0D` / `#101214` / `#16181B` | `#FFF8F1` / `#FFFFFF` / `#F8ECDF` |
| Chữ | `#F8EEE4` / `#D8B9A4` | `#33150F` / `#7A4A35` |
| Nhấn | vàng `#E9B84B` | đỏ son `#BE1620` |
| Nét kẻ | `rgba(233,184,75,.22/.14/.5)` | `#EBD9C6` / `#A3705A` |
| Con dấu | gradient `#8E1216 → #4E0509` | gradient `#D6201F → #9E0F16` |

Bo góc lệch: `--r-lg 20px 6px 20px 6px`, `--r-sm 6px 16px 6px 16px`, `--r-btn 8px 18px 8px 18px`, `--r-md 14px 4px 14px 4px`.
Chữ: chỉ Be Vietnam Pro (400/500/600/700). Bỏ Newsreader — gỡ luôn dependency `@fontsource-variable/newsreader`.

## Thay đổi theo trang

- **Header** — lưới đối xứng `1fr auto 1fr` từ 64rem, con dấu tròn + chữ hiệu giãn 0.34em ở giữa; dưới 64rem chuyển `auto 1fr` (dấu trái, điều khiển phải).
- **Hero** — căn giữa toàn bộ; eyebrow có nét kẻ hai bên; ba ảnh chụp ứng dụng chuyển vào **thẻ con dấu đỏ son** (khung chỉ vàng lồng trong, glyph 金), chú thích dùng `hero.floatingLabel/floatingValue`.
- **Tính năng** — bỏ bento; lưới 2 cột phân cách bằng nét kẻ, mỗi thẻ có con dấu tròn + số liệu. Bốn biểu đồ mô phỏng giữ nguyên dữ liệu JSON, chỉ đổi vỏ.
- **Nguyên tắc** — khối căn giữa + dải ba cột `01/02/03` viền tròn.
- **FAQ** — dải nền `--surface-raised`, danh sách nét kẻ. Giữ nguyên `<h3 class="faq-question">` / `<p class="faq-answer">` theo hợp đồng `validate:pages`.
- **Tải ứng dụng / CTA bài viết** — băng đỏ son, glyph 金, badge nguyên bản.
- **Footer** — căn giữa: con dấu, tóm tắt, hai nhóm liên kết trong khung nét kẻ, dòng cuối.
- **Pháp lý** — hero căn giữa + chip metadata, panel "Thông tin công khai" 2 cột, TOC 280px đánh số, mỗi mục có con dấu số. Số thứ tự trong tiêu đề JSON (`"1. Phạm vi…"`) được tách ra con dấu để không lặp số.
- **Bài kỹ thuật** — hero căn giữa, dải meta 3 cột, chip tag, figure pipeline nền đỏ son.
- **404** — nền tối, con dấu, hai nút vàng/viền.

## Chế độ tối là mặc định

Thiết kế chốt "chế độ tối mặc định". `src/lib/theme-script.ts` (mới, dùng chung cho layout ngôn ngữ và 404): chỉ giá trị `light` đã lưu mới đảo bảng màu; không còn đọc `prefers-color-scheme`. `theme-toggle.tsx` bỏ listener `matchMedia`.

## Lỗi thật đã tìm và sửa trong lúc kiểm

1. **Tràn ngang ở 320–390px** — `.eyebrow` dùng `white-space: nowrap` + nét kẻ flex, làm `body.scrollWidth` 442 > 390. Chuyển nét kẻ sang `::before/::after` dạng `inline-block`, khối tự xuống dòng.
2. **Vùng chạm < 44px** — nav/footer/toc link và nút EN/theme chỉ 16–40px. Nâng `min-height`/`min-width` lên 2.75rem.
3. **`mt-12` trên trang 404 không ăn** — reset `p { margin: 0 }` không nằm trong layer nên thắng utility của Tailwind (layer). Thay bằng class `.notfound-eyebrow`.

## Kiểm tra

| Lệnh | Kết quả |
| --- | --- |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run build` (kèm `validate:content`) | pass |
| `npm run validate:pages` (static export) | pass |
| `scripts/browser-smoke.mjs` | 187 pass / 0 fail |

`browser-smoke.mjs` được cập nhật theo thiết kế mới: bỏ kiểm tra "không có viền" (thiết kế mới dựng hoàn toàn trên nét kẻ), đổi `.hero-visual/.hero-grid/.hero-mini-card` sang `.hero-seal`, bỏ ràng buộc "hero vừa một khung nhìn", và đảo luồng theme sang tối-mặc-định.

## File

Mới: `src/lib/theme-script.ts`. Xoá: `src/components/orbit-motif.tsx`.
Sửa: `globals.css` (viết lại), `landing-page`, `site-header`, `site-footer`, `brand-mark`, `theme-toggle`, `legal-document-page`, `tech-blog-article`, `global-not-found`, `[locale]/layout`, `browser-smoke.mjs`, `README.md`, `package.json`.
Không đổi: `site.json`, `legal.*.json`, `blog.vi.json`, toàn bộ `src/lib` SEO/structured-data, `store-buttons`, `app-icon`, `app-screenshot`, `feature-simulations`.

## Câu hỏi còn treo

1. Chế độ tối mặc định ghi đè cả khi hệ điều hành đang để sáng — đúng theo văn bản thiết kế ("chế độ tối mặc định"), xác nhận giữ hay muốn quay lại theo hệ điều hành?
2. Khối "Premium · Ngũ Hành" (5 skin) trong thiết kế 1c chưa dựng: `refs/*-dark-overview.png` chỉ có trong design project, chưa có trong `public/`, và `site.json` chưa có nội dung tương ứng. Có bổ sung asset + nội dung song ngữ không?
3. Thiết kế 1c có dải số liệu 30/36/44/34 (nhà cung cấp, thị trường, liên kết nguồn, trích dẫn). Chưa dựng vì đây là số liệu thật cần nguồn xác minh, không nên bịa.

---

# Bổ sung (260820-2259): dựng nốt hai khối còn treo

Người dùng chốt: giữ chế độ tối mặc định; dựng khối Ngũ Hành và public asset; dựng dải số liệu và duyệt các con số theo thiết kế.

## Skin Ngũ Hành

- Tải 5 ảnh `refs/{kim,moc,thuy,hoa,tho}-dark-overview.png` từ design project (390×844 PNG) về `public/images/skins/kim-tai-skin-{id}.png`.
- `site.json` → `skins[]`: `{ id, src, width, height, accent }`. Màu nhấn lấy đúng thiết kế: Kim `#D8BC72`, Mộc `#6FD3A6`, Thuỷ `#6EC4E8`, Hoả `#FF8A50`, Thổ `#E0AC62`.
- `locales.*.premium`: eyebrow / title / description / `items[]` (`id`, `name`, `alt`). Nội dung ghép với asset qua `id` chung — `getSkinAsset()` trong `content.ts`.
- Section `#premium` nền `--surface-raised`, lưới 2 → 3 → 5 cột. Khung `--r-lg` bọc ảnh bo `--r-md`; nhãn dùng `--skin-accent` truyền từ dữ liệu.
- Ảnh crop `aspect-ratio: 390/400`, `object-position: top` — cắt ngay dưới thẻ tổng quan, đúng phần khác biệt giữa các skin, tránh cắt ngang dòng chữ (bản 390/620 đầu tiên cắt giữa chữ "Giao dịch gần đây").

## Dải số liệu nguồn giá

- `locales.*.stats`: `label` + 4 mục `{ value, label }` — 30 nhà cung cấp · 36 phạm vi thị trường · 44 liên kết nguồn · 34 trích dẫn đã soát. Người dùng duyệt số.
- Dựng bằng `<dl>` đúng thứ tự `dt → dd` trong DOM, đảo hiển thị bằng `flex-direction: column-reverse` để số nằm trên nhãn. Lưới 2×2 ở màn hẹp, 4 cột từ 48rem.

## Điều hướng

Thêm `navigation.premium` (VI "Ngũ Hành" / EN "Five Elements") vào nhánh phải header và nhóm Sản phẩm ở chân trang.

## Kiểm tra bổ sung trong `validate:content`

- Đúng 5 skin, `src` phải nằm dưới `/images/skins/` và **file phải tồn tại**, `width`/`height` nguyên, `accent` hex 6 ký tự.
- Mỗi locale: `stats` có nhãn + đúng 4 mục, `value` phải là số nguyên; `premium` mô tả đủ 5 skin, mỗi mục có `name` và `alt`; `navigation.premium` không rỗng.

## Kết quả kiểm

`typecheck` · `lint` · `build` (kèm `validate:content`) · `validate:pages` · `browser-smoke` **187 pass / 0 fail**.

## Câu hỏi còn treo

Không.


---

# Bổ sung 2 (260821-0010): thay ảnh ứng dụng bằng UI mới

Phản hồi: Hero vẫn dùng ảnh giao diện cũ (xanh lá) trong khi khối Ngũ Hành đã là UI mới — vênh rõ. Đây là thiếu sót ở lượt trước: tôi giữ ảnh cũ để không đụng content model, dù design project có sẵn ảnh UI mới.

## Nguồn ảnh

Đã so hai nguồn:

- `refs/modern-gold-dark-*.png` trong design project — đúng UI mới nhưng chỉ 390×844 và ở trạng thái rỗng ("Chưa tính").
- `public/iphone-1284x2778/*.png` (bộ ảnh App Store có sẵn trong repo) — 1284×2778, UI mới, **có số liệu thật**.

Chọn nguồn thứ hai. Cắt khung máy bằng ImageMagick, chuẩn hoá về 600×1400 (tỉ lệ 0.4286):

| Vai trò | Nguồn | Crop |
| --- | --- | --- |
| overview | `02-so-vang.png` | `600x1400+60+805` |
| market | `03-gia-9999.png` | `660x1540+620+840` |
| settings | `07-rieng-tu.png` | `583x1360+70+840` |

Vòng crop đầu cắt mất mép phải và tab bar; đã nới khung rồi kiểm lại bằng ảnh ghép.

## Đổi tên file

`app-{overview,market,settings}.png` → `kim-tai-app-{...}.png`, khớp quy ước `kim-tai-*` của repo (`kim-tai-skin-*`, `kim-tai-og-*`, `kim-tai-brand-mark`). Cập nhật `site.json` và danh sách asset cứng trong `validate-pages-export.mjs`.

Đổi tên cũng giải quyết một lỗi làm mất nhiều thời gian: **`_next/image` giữ cache theo TTL nên server local vẫn trả ảnh cũ dù file nguồn đã thay** — file tĩnh qua `curl` là ảnh mới nhưng trang render bản cũ. URL mới ⇒ cache key mới.

## Cập nhật kèm theo

- `site.json`: `screenshots.*.width/height` → 600×1400; alt của `settings` mô tả đúng màn hình mới (khoá sinh trắc, phong cách sổ vàng Ngũ Hành, ngôn ngữ, đơn vị).
- `globals.css`: `.hero-screen` `aspect-ratio` 1320/2868 → 600/1400.
- `scripts/generate-og-images.sh`: bảng màu OG còn là bộ cũ (`#102a24`/`#f6f1e8`/`#d6b668`) → đổi sang token Modern Gold (`#0b0c0d`/`#f8eee4`/`#e9b84b`) và dựng lại hai ảnh OG 1200×630.

## Kết quả kiểm

`typecheck` · `lint` · `build` (kèm `validate:content`) · `validate:pages` · `browser-smoke` **187 pass / 0 fail**.


---

# Bổ sung 3 (260821-0100): Hero bỏ ảnh chụp, dựng đúng thẻ sổ vàng của thiết kế

Yêu cầu: Hero không có screenshot, dựng đúng như khung 1c gốc trong Claude Design.

## Hero mới

Thay cụm ba ảnh bằng thẻ con dấu đúng thiết kế: glyph 金 → nhãn "Sổ vàng Kim Tài" → "Giá trị tạm tính" → số lớn `1.485.000.000đ` → dải ba cột (Tổng vốn · Khối lượng · Lãi tạm tính, cột cuối tô vàng) → chú thích "Minh hoạ mô phỏng · không phải giá thực".

Nội dung nằm ở `locales.*.hero.ledger` (`label`, `valueLabel`, `value`, `note`, `items[3]`), song ngữ. Dải ba cột dùng `<dl>` giữ đúng thứ tự `dt → dd`, đảo hiển thị bằng `column-reverse`; 1 cột ở màn hẹp, 3 cột từ 48rem.

## Hệ quả đã xử lý trọn

Bỏ ảnh khỏi Hero kéo theo cả chuỗi, vì dự án có quy ước "ảnh ứng dụng chỉ nằm ở Hero":

- `site.json`: xoá khối `screenshots` và `hero.galleryLabel` / `hero.screens`.
- Xoá `src/components/app-screenshot.tsx` và ba file `public/images/kim-tai-app-*.png` (nguồn gốc vẫn còn ở `public/iphone-1284x2778/`).
- `sitemap.ts`: ảnh của landing chuyển từ ba ảnh ứng dụng sang **năm ảnh skin Ngũ Hành** — đây mới là ảnh thật sự hiển thị trên trang.
- `validate-pages-export.mjs`: danh sách asset bắt buộc và kiểm tra `<image:loc>` bám theo `site.skins`.
- `validate-content.mjs`: bỏ kiểm tra nhãn ảnh Hero; thêm kiểm tra thẻ sổ vàng có đủ nhãn/giá trị/ghi chú/ba mục, **và ghi chú phải nêu rõ số liệu là mô phỏng**.
- `browser-smoke.mjs`: đổi từ "ba ảnh ứng dụng chỉ ở Hero" sang "năm skin chỉ ở khối Premium".

## Sửa lỗi trong lúc làm

Một bước chỉnh CSS bằng script cắt nhầm mốc và nhân đôi ~450 dòng (từ khối `.site-header` tới `.hero-seal`). Đã phát hiện qua `grep -c` selector và xoá đúng bản lặp; kiểm lại mỗi selector chỉ còn một lần.

## Kết quả kiểm

`typecheck` · `lint` · `build` (kèm `validate:content`) · `validate:pages` · `browser-smoke` **187 pass / 0 fail**.

## Câu hỏi còn treo

Số liệu trên thẻ Hero (1.485.000.000đ · 355.000.000đ · 25 Chỉ · +1.130.000.000đ) lấy nguyên từ thiết kế và được gắn nhãn mô phỏng. Nếu muốn đổi sang bộ số khác, sửa `locales.*.hero.ledger` là đủ.


---

# Bổ sung 4 (260821-0110): thẻ Ngũ Hành dựng bằng CSS thay cho ảnh

Yêu cầu: tự render thẻ hero Ngũ Hành thay vì dùng lại ảnh chụp.

## Cách dựng

Mỗi thẻ dựng lại đúng cấu trúc thẻ con dấu ở Hero (glyph 金 → "Giá trị tạm tính" → số lớn → hai dòng Tổng vốn / Khối lượng), **dùng chung `hero.ledger`** nên năm thẻ hiển thị y hệt một bộ số liệu — đúng câu tiêu đề "Năm phong cách sổ vàng, một bộ số liệu."

Chất liệu từng hành khai bằng biến CSS trên `.skin-card--{id}`: `--skin-bg` (gradient ba điểm dừng), `--skin-line`, `--skin-ink`, `--skin-muted`, `--skin-accent`, `--skin-glyph-ink`. Đây là quyết định thị giác thuần nên nằm ở CSS, không đưa vào JSON.

Nội dung mỗi hành đổi từ `alt` ảnh sang `description` lấy nguyên văn mô tả trong ứng dụng ("Ánh kim sáng rõ, tinh gọn, rành mạch từng dòng." …), song ngữ.

## Dọn theo

- Xoá `skins[]` khỏi `site.json`, xoá `SkinAsset` / `getSkinAsset` khỏi `content.ts`, xoá thư mục `public/images/skins/` (~940 KB).
- `sitemap.ts`: bỏ hẳn trường `images` — trang giới thiệu không còn ảnh nội dung nào.
- `validate-pages-export.mjs`: bỏ asset skin khỏi danh sách bắt buộc; đổi kiểm tra sitemap thành **không được có `<image:loc>` nào**.
- `validate-content.mjs`: bỏ kiểm tra asset skin; mỗi mục Ngũ Hành phải có `name` và `description`.
- `browser-smoke.mjs`: thay kiểm tra ảnh bằng hai kiểm tra mới — trang không có ảnh nội dung nào ngoài badge cửa hàng, và năm thẻ Ngũ Hành phải hiện đủ trong markup (tên + số liệu + biến thể).

## Chỉnh sau khi soi

- Chuỗi `1.485.000.000đ` sát viền trong ở thẻ hẹp → giảm cỡ chữ xuống `clamp(0.9375rem, 2.1vw, 1.125rem)`, tăng padding ngang.
- Lưới skin đổi thành 1 cột mặc định, 2 cột từ 30rem, 3 từ 48rem, 5 từ 64rem — dưới 30rem thẻ hai cột quá hẹp cho chuỗi số dài.

## Kết quả kiểm

`typecheck` · `lint` · `build` (kèm `validate:content`) · `validate:pages` · `browser-smoke` **193 pass / 0 fail**.
