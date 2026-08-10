# Kim Tài — Tick Vàng Online

Website giới thiệu song ngữ cho ứng dụng Kim Tài, được xây bằng Next.js App Router và Tailwind CSS. Giao diện dùng bento grid không viền, hỗ trợ sáng/tối và tối ưu responsive. Ba ảnh chụp ứng dụng được gom thành một cụm màn hình trong Hero; các bento tính năng phía dưới dùng biểu đồ mô phỏng cấu hình bằng JSON.

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`; trang gốc chuyển đến `/vi/`.

Các lệnh kiểm tra trước khi phát hành:

```bash
npm run validate:content
npm run typecheck
npm run lint
npm run build
npm run start
```

## Triển khai

Bản production với custom domain chạy trên Vercel:

<https://kimtai.dantech.academy>

Mỗi lần push vào `main`, Vercel tự build và deploy (project `dan-tech-projects/kim-tai-landing-page`). Canonical origin đặt qua biến môi trường `SITE_ORIGIN` trên Vercel. Chi tiết trong [hướng dẫn triển khai](docs/deployment.md).

### GitHub Pages

Bản mirror tĩnh được triển khai miễn phí tại:

<https://dantech0xff.github.io/kim-tai-landing-page/>

Mỗi lần push vào nhánh `main`, workflow `Deploy to GitHub Pages` sẽ tự build static export, kiểm tra toàn bộ route và asset dưới subpath `/kim-tai-landing-page`, rồi phát hành lên GitHub Pages. Có thể chạy lại thủ công từ tab **Actions** trên GitHub.

Kiểm tra bản GitHub Pages ở máy local:

```bash
GITHUB_PAGES=true \
GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page \
npm run build

GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page \
npm run validate:pages
```

Xem [hướng dẫn triển khai](docs/deployment.md) để biết quy trình phát hành, rollback và các lưu ý trước khi bật lập chỉ mục.

## Tuyến trang

- `/vi` và `/en`: trang giới thiệu sản phẩm.
- `/{locale}/terms-of-service`: Điều khoản dịch vụ / Terms of Service.
- `/{locale}/terms-and-conditions`: Điều khoản và điều kiện / Terms and Conditions.
- `/{locale}/privacy-policy`: Chính sách quyền riêng tư / Privacy Policy.

Các trang ngôn ngữ và pháp lý đều được dựng tĩnh khi build.

## Cấu hình bằng JSON

| Tệp | Nội dung |
| --- | --- |
| `src/content/site.json` | Thương hiệu, đơn vị vận hành, liên kết tải, ảnh, tính năng và toàn bộ nội dung VI/EN |
| `src/content/legal.vi.json` | Ba tài liệu pháp lý tiếng Việt và nguồn luật chính thức |
| `src/content/legal.en.json` | Bản tiếng Anh tham khảo của ba tài liệu pháp lý |

Ảnh ứng dụng nằm trong `public/images/` và chỉ được hiển thị trong Hero. Dữ liệu cho bốn biểu đồ mô phỏng nằm ở `locales.*.featureVisuals` trong `site.json`; các số liệu này chỉ minh hoạ cách trình bày, không phải giá vàng hoặc dữ liệu thị trường thực. Bộ nhận diện web nằm trong `public/icons/`. Badge tải ứng dụng chính thức, bản địa hoá cho VI/EN, nằm trong `public/badges/`. Đường dẫn và kích thước của các asset đều được khai báo tại `site.json`.

Trong chế độ preview, `operator.publicName` và `operator.facebookUrl` là hai thông tin công khai được hiển thị trên các trang pháp lý; Facebook cũng được dùng làm kênh hỗ trợ tạm thời. Chúng không thay thế tên pháp lý, mã đăng ký, địa chỉ hoặc kênh bảo vệ dữ liệu cần có trước khi đặt `operator.configured` thành `true`.

Hai ảnh nhận diện gốc được giữ tại `public/icons/kim-tai-brand-mark.png` (nền trong suốt, dùng trên giao diện) và `public/icons/kim-tai-app-icon.png` (nền tối, nguồn tạo các icon web chuẩn 32/180/192/512 px).

Badge App Store lấy từ [Apple Marketing Tools](https://toolbox.marketingtools.apple.com/) và badge Google Play lấy từ [Google Play badge guidelines](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/). Artwork được dùng nguyên bản, không đổi màu hoặc dựng lại bằng CSS.

### Việc bắt buộc trước khi phát hành

1. Điền tên pháp lý, mã đăng ký, địa chỉ và email thật trong `operator`, sau đó đặt `operator.configured` thành `true`.
2. Liên kết trực tiếp cho App Store và Google Play hiện đã được xác minh và công bố. Nếu thông tin listing thay đổi, cập nhật đồng bộ định danh và URL tương ứng; nút tải chỉ hoạt động khi nền tảng đó có URL trực tiếp hợp lệ và `published` là `true`. `release.ready` là cổng phát hành riêng và chỉ được bật sau khi toàn bộ checklist hoàn tất.
3. Đối chiếu các khẳng định trong `productFacts` và tài liệu quyền riêng tư với luồng dữ liệu thật của ứng dụng, SDK bên thứ ba, thời hạn lưu giữ, vị trí máy chủ và hoạt động chuyển dữ liệu ra nước ngoài.
4. Nhờ cố vấn pháp lý Việt Nam duyệt bản cuối theo đúng pháp nhân và mô hình vận hành thực tế.
5. Chạy lại toàn bộ lệnh kiểm tra ở trên. `validate:content` cố ý cảnh báo cho đến khi thông tin phát hành được hoàn tất; khi `release.ready` bật, thiếu pháp nhân hoặc link tải thật sẽ trở thành lỗi build.
6. Sau khi deploy bản phát hành, thực hiện [runbook SEO sau phát hành](docs/deployment.md#runbook-seo-sau-khi-phát-hành): xác minh hết `noindex`, đăng ký Google Search Console + Bing Webmaster Tools, submit `sitemap.xml`, chạy lại Rich Results Test và Lighthouse SEO.

GitHub Pages hiện có thể dùng làm bản xem trước công khai. Bản mirror này luôn phát `noindex` (bất kể trạng thái phát hành) và canonical/hreflang trỏ về `https://kimtai.dantech.academy` để tránh duplicate content. Các nút tải đã xác minh hoạt động độc lập với trạng thái phát hành đầy đủ; bản Vercel chỉ bật lập chỉ mục khi cả `release.ready` và `operator.configured` đều là `true`.

## SEO & AI search

- Canonical origin duy nhất: `https://kimtai.dantech.academy` — mọi canonical/hreflang (kèm `x-default`), sitemap và JSON-LD đều trỏ về origin này, kể cả trên bản mirror GitHub Pages (mirror luôn `noindex`).
- URL dùng trailing slash thống nhất (`/vi/`, `/en/`, …) trên cả hai deployment.
- `robots.txt` cho phép mọi crawler (kể cả AI bot, đã chốt chủ đích) và trỏ tới `sitemap.xml` gồm 8 URL với hreflang alternates.
- JSON-LD: Organization + WebSite trên mọi trang, MobileApplication + FAQPage trên landing, BreadcrumbList trên trang pháp lý. Không có `aggregateRating` hay số liệu bịa; `offers.price: "0"` phản ánh mô hình tải miễn phí + Premium mua trong ứng dụng.
- Mục FAQ song ngữ hiển thị tĩnh trên landing và dùng chung dữ liệu với FAQPage schema (`locales.*.faq` trong `site.json`) nên UI và schema không thể lệch nhau.
- Ảnh OG/Twitter 1200×630 nằm tại `public/images/og/`, tái tạo bằng `scripts/generate-og-images.sh`.
- `public/llms.txt` tóm tắt site cho AI crawler theo llmstxt.org.
- `validate:content` và `validate:pages` bắt regression cho toàn bộ các bề mặt SEO trên.

## Ghi chú pháp lý

Nội dung hiện tại là bản nháp cấu hình theo khung pháp luật có hiệu lực trong năm 2026, gồm Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Nghị định 356/2025/NĐ-CP, Luật Bảo vệ quyền lợi người tiêu dùng 19/2023/QH15, Luật Giao dịch điện tử 20/2023/QH15 và Luật An ninh mạng 116/2025/QH15. Đây không phải ý kiến tư vấn pháp lý và chưa thể phát hành khi thông tin pháp nhân hoặc luồng dữ liệu thực tế còn trống.

## Kiến trúc ngắn

- Server Components cho nội dung và metadata; chỉ nút đổi giao diện là Client Component.
- Giao diện sáng/tối dùng class trên `<html>`, lưu lựa chọn trong `localStorage` và mặc định theo hệ điều hành.
- Font được đóng gói cục bộ qua Fontsource, không gọi CDN bên ngoài.
- Chế độ xem trước tự đặt `noindex`; chỉ bật lập chỉ mục khi cả `release.ready` và `operator.configured` hợp lệ.
- Không có dữ liệu mẫu giả về lượt tải, đánh giá, đối tác hoặc chứng nhận.
