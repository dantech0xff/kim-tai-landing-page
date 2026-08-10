# Triển khai

Website được triển khai song song trên hai nền tảng:

- **Vercel** (chính, custom domain): <https://kimtai.dantech.academy>.
- **GitHub Pages** (bản mirror công khai): <https://dantech0xff.github.io/kim-tai-landing-page/>.

## Vercel

- Project: `dan-tech-projects/kim-tai-landing-page` (đã kết nối GitHub repo).
- URL production: <https://kimtai.dantech.academy> (alias mặc định: <https://kim-tai-landing-page.vercel.app>).
- Nhánh phát hành: `main` — mỗi lần push, Vercel tự build và deploy production; các nhánh khác tạo Preview Deployment.
- Deploy thủ công: `vercel --prod` (yêu cầu `vercel login` với tài khoản có quyền trên team `dan-tech-projects`).
- Build: Next.js mặc định (SSR + Image Optimization), không dùng `GITHUB_PAGES`, không có base path.

### Biến môi trường trên Vercel

| Biến | Môi trường | Giá trị | Mục đích |
| --- | --- | --- | --- |
| `SITE_ORIGIN` | Production | `https://kimtai.dantech.academy` | Đặt serving + canonical origin cho metadata; thiếu biến này canonical sẽ rơi về `http://localhost:3000`. |

**Quan trọng:** KHÔNG đặt `CANONICAL_ORIGIN` hoặc `NEXT_PUBLIC_CANONICAL_ORIGIN` trên Vercel. Hai biến này chỉ dành cho bản mirror; nếu đặt trên Vercel với giá trị lệch origin so với `SITE_ORIGIN`, bản production sẽ bị nhận nhầm là mirror và âm thầm phát `noindex` sau phát hành.

### Custom domain

- `kimtai.dantech.academy` đã được gắn vào project (`vercel domains add kimtai.dantech.academy kim-tai-landing-page`).
- DNS của `dantech.academy` nằm ở GoDaddy (`ns67/ns68.domaincontrol.com`), cần bản ghi:
  - `CNAME` | tên `kimtai` | giá trị `f5a7d0c84ba50517.vercel-dns-016.com.` (khuyến nghị, Vercel cấp riêng cho project), hoặc
  - `A` | tên `kimtai` | giá trị `76.76.21.21`.
- Kiểm tra sau khi trỏ DNS: `vercel domains verify kimtai.dantech.academy`. SSL do Vercel tự cấp sau khi DNS hợp lệ.

### Rollback trên Vercel

1. `vercel ls` để xem danh sách deployment, hoặc mở dashboard Vercel.
2. `vercel rollback <deployment-url>` để trỏ production về bản trước đó.
3. Hoặc revert commit trên `main`; Vercel tự deploy lại.

## GitHub Pages

- Nền tảng: GitHub Pages.
- Repository: <https://github.com/dantech0xff/kim-tai-landing-page>.
- URL: <https://dantech0xff.github.io/kim-tai-landing-page/>.
- Nhánh phát hành: `main`.
- Workflow: `.github/workflows/deploy-pages.yml`.
- Secrets: không yêu cầu.

URL gốc chuyển tương đối đến `/vi/`. Tiếng Anh nằm tại `/en/`; sáu trang pháp lý được xuất tĩnh dưới hai ngôn ngữ.

## Phát hành tự động

Push vào `main` sẽ chạy quy trình sau:

1. Cài dependencies bằng `npm ci` trên Node.js 22.
2. Build Next.js với `output: "export"` và base path lấy từ `GITHUB_REPOSITORY`.
3. Chạy `npm run validate:pages` để kiểm tra route, metadata, manifest, ảnh và asset.
4. Upload thư mục `out/` và triển khai qua GitHub Pages Actions.

Có thể chạy lại thủ công bằng nút **Run workflow** trong tab **Actions** của repository. Không commit thư mục `out/`; artifact được tạo mới trong CI.

## Kiểm tra local

Chế độ phát triển thông thường không dùng base path:

```bash
npm install
npm run dev
```

Mở <http://localhost:3000>; `/` chuyển đến `/vi`.

Để mô phỏng chính xác GitHub Pages:

```bash
GITHUB_PAGES=true \
GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page \
npm run build

GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page \
npm run validate:pages
```

Static export được tạo tại `out/` và được upload trực tiếp từ đó trong GitHub Actions. Khi tự phục vụ để mô phỏng production, cần mount hoặc sao chép nội dung `out/` vào đường dẫn web `/kim-tai-landing-page/` vì các URL đã mang base path này.

## Biến môi trường

| Biến | Nơi đặt | Mục đích |
| --- | --- | --- |
| `GITHUB_PAGES=true` | Workflow hoặc lệnh build local | Bật static export, trailing slash và ảnh không qua Image Optimization server. |
| `GITHUB_REPOSITORY` | GitHub tự cung cấp; đặt thủ công khi test local | Tạo đúng owner, repository và base path. |
| `CANONICAL_ORIGIN` | Tuỳ chọn khi build GitHub Pages | Ghi đè canonical origin của mirror; mặc định `https://kimtai.dantech.academy`. Không đặt trên Vercel. |

Không lưu token hoặc thông tin bí mật trong repository. Quyền deploy được giới hạn trong workflow bằng `pages: write` và `id-token: write`.

## Rollback

1. Revert commit gây lỗi trên `main` và push commit revert; workflow sẽ tự triển khai lại.
2. Hoặc mở lần chạy thành công trước đó trong **Actions** và chọn **Re-run all jobs** nếu mã nguồn của commit đó vẫn còn phù hợp.
3. Xác nhận lại URL gốc, `/vi/`, `/en/` và ít nhất một trang pháp lý sau rollback.

## Trước khi phát hành chính thức

Trang đang ở trạng thái preview công khai nên metadata vẫn đặt `noindex`. Các liên kết App Store và Google Play đã được xác minh, công bố và có thể dùng ngay; trạng thái nút tải không phụ thuộc vào cổng phát hành đầy đủ. Trước khi quảng bá hoặc bật lập chỉ mục, phải hoàn tất pháp nhân, email hỗ trợ và kiểm chứng luồng dữ liệu theo checklist trong `README.md`; sau đó đặt `operator.configured` và `release.ready` thành `true` trong `src/content/site.json`.

Custom domain `kimtai.dantech.academy` phục vụ qua Vercel; canonical origin của bản Vercel được điều khiển bằng biến `SITE_ORIGIN`. Bản GitHub Pages phục vụ dưới origin `github.io` với base path riêng và không cần file `CNAME`, nhưng luôn phát `noindex` (bất kể release gate) và canonical/hreflang trỏ về `https://kimtai.dantech.academy` để tránh duplicate content với bản chính.

## Runbook SEO sau khi phát hành

Thực hiện sau khi `release.ready` và `operator.configured` đều bật và bản Vercel đã deploy:

1. Xác minh site đã bỏ noindex: `curl -s https://kimtai.dantech.academy/vi/ | grep 'name="robots"'` không còn chứa `noindex`; đối chiếu thêm `curl -s https://kimtai.dantech.academy/vi/ | grep -E 'canonical|hreflang|og:|ld\+json'`.
2. Xác nhận `NEXT_PUBLIC_CANONICAL_ORIGIN`/`CANONICAL_ORIGIN` KHÔNG được đặt trên Vercel (xem cảnh báo ở mục biến môi trường Vercel).
3. Tạo property Google Search Console (Domain property cho `dantech.academy` hoặc URL-prefix `https://kimtai.dantech.academy`) và submit `sitemap.xml`; làm tương tự trên Bing Webmaster Tools — Bing là nguồn dữ liệu của ChatGPT Search và Copilot.
4. Chạy Rich Results Test trên URL live và kiểm tra JSON-LD bằng validator.schema.org. Chấp nhận cảnh báo thiếu `aggregateRating` — đây là chủ đích theo nguyên tắc không fake dữ liệu; chỉ thêm khi có đánh giá thật từ store.
5. Chạy Lighthouse tab SEO cho `/vi/` và `/en/`, mục tiêu ≥ 95; audit `is-crawlable` phải pass sau khi hết noindex.
6. Theo dõi coverage và query trong Search Console. Site chưa bật analytics (`productFacts.websiteAnalyticsEnabled=false`) nên chưa đo được lượt truy cập từ AI (referrer `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`); bật analytics là quyết định sản phẩm/pháp lý riêng, không thuộc phạm vi SEO.

Lưu ý: Vercel Preview Deployment tự phát header `X-Robots-Tag: noindex` — kiểm tra bằng `curl -sI <preview-url>` khi cần.
