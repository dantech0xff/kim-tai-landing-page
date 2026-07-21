# Triển khai GitHub Pages

## Môi trường production

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

Không lưu token hoặc thông tin bí mật trong repository. Quyền deploy được giới hạn trong workflow bằng `pages: write` và `id-token: write`.

## Rollback

1. Revert commit gây lỗi trên `main` và push commit revert; workflow sẽ tự triển khai lại.
2. Hoặc mở lần chạy thành công trước đó trong **Actions** và chọn **Re-run all jobs** nếu mã nguồn của commit đó vẫn còn phù hợp.
3. Xác nhận lại URL gốc, `/vi/`, `/en/` và ít nhất một trang pháp lý sau rollback.

## Trước khi phát hành chính thức

Trang đang ở trạng thái preview công khai: metadata vẫn đặt `noindex`, và nút tải vẫn bị vô hiệu hoá. Trước khi quảng bá hoặc bật lập chỉ mục, phải hoàn tất pháp nhân, email hỗ trợ, liên kết App Store/Google Play và kiểm chứng luồng dữ liệu theo checklist trong `README.md`; sau đó đặt `operator.configured` và `release.ready` thành `true` trong `src/content/site.json`.

Chưa cấu hình custom domain. Nếu thêm domain, cập nhật canonical origin, DNS, file `CNAME` và chạy lại kiểm tra production trước khi chuyển traffic.
