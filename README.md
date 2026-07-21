# Kim Tài — Tick Vàng Online

Website giới thiệu song ngữ cho ứng dụng Kim Tài, được xây bằng Next.js App Router và Tailwind CSS. Giao diện dùng bento grid không viền, hỗ trợ sáng/tối, tối ưu responsive và sử dụng ba ảnh chụp ứng dụng do dự án cung cấp.

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`; trang gốc chuyển đến `/vi`.

Các lệnh kiểm tra trước khi phát hành:

```bash
npm run validate:content
npm run typecheck
npm run lint
npm run build
npm run start
```

## GitHub Pages

Website được triển khai miễn phí tại:

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

Ảnh ứng dụng nằm trong `public/images/`; bộ nhận diện web nằm trong `public/icons/`. Đường dẫn, kích thước logo giao diện, favicon, Apple touch icon và PWA icon đều được khai báo tại `site.json`.

Hai ảnh nhận diện gốc được giữ tại `public/icons/kim-tai-brand-mark.png` (nền trong suốt, dùng trên giao diện) và `public/icons/kim-tai-app-icon.png` (nền tối, nguồn tạo các icon web chuẩn 32/180/192/512 px).

### Việc bắt buộc trước khi phát hành

1. Điền tên pháp lý, mã đăng ký, địa chỉ và email thật trong `operator`, sau đó đặt `operator.configured` thành `true`.
2. Thay `downloads.*.directUrl` bằng URL App Store/Google Play thật, đặt `published` thành `true` và đặt `release.ready` thành `true` khi ứng dụng đã được duyệt. Khi chưa có URL trực tiếp đã xác minh, nút tải được vô hiệu hoá để tránh dẫn tới ứng dụng giả mạo.
3. Đối chiếu các khẳng định trong `productFacts` và tài liệu quyền riêng tư với luồng dữ liệu thật của ứng dụng, SDK bên thứ ba, thời hạn lưu giữ, vị trí máy chủ và hoạt động chuyển dữ liệu ra nước ngoài.
4. Nhờ cố vấn pháp lý Việt Nam duyệt bản cuối theo đúng pháp nhân và mô hình vận hành thực tế.
5. Chạy lại toàn bộ lệnh kiểm tra ở trên. `validate:content` cố ý cảnh báo cho đến khi thông tin phát hành được hoàn tất; khi `release.ready` bật, thiếu pháp nhân hoặc link tải thật sẽ trở thành lỗi build.

GitHub Pages hiện có thể dùng làm bản xem trước công khai. Website vẫn phát `noindex` và vô hiệu hoá nút tải cho đến khi các điều kiện phát hành ở trên được hoàn tất.

## Ghi chú pháp lý

Nội dung hiện tại là bản nháp cấu hình theo khung pháp luật có hiệu lực trong năm 2026, gồm Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Nghị định 356/2025/NĐ-CP, Luật Bảo vệ quyền lợi người tiêu dùng 19/2023/QH15, Luật Giao dịch điện tử 20/2023/QH15 và Luật An ninh mạng 116/2025/QH15. Đây không phải ý kiến tư vấn pháp lý và chưa thể phát hành khi thông tin pháp nhân hoặc luồng dữ liệu thực tế còn trống.

## Kiến trúc ngắn

- Server Components cho nội dung và metadata; chỉ nút đổi giao diện là Client Component.
- Giao diện sáng/tối dùng class trên `<html>`, lưu lựa chọn trong `localStorage` và mặc định theo hệ điều hành.
- Font được đóng gói cục bộ qua Fontsource, không gọi CDN bên ngoài.
- Chế độ xem trước tự đặt `noindex`; chỉ bật lập chỉ mục khi cả `release.ready` và `operator.configured` hợp lệ.
- Không có dữ liệu mẫu giả về lượt tải, đánh giá, đối tác hoặc chứng nhận.
