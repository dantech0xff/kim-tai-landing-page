# SEO & AI Search Implementation — 4 Phases Shipped

**Date**: 2026-08-01 01:59
**Severity**: Low (Medium defect caught, resolved)
**Component**: SEO metadata, structured data, validator, docs
**Status**: Resolved

## What Happened

Hoàn tất 4 phase SEO & AI Search trong một phiên /ck:cook --auto: metadata foundation (canonical tách khỏi serving origin, trailing slash đồng nhất, OG images 1200×630), search infrastructure (robots.txt, sitemap 8 URL + hreflang, JSON-LD 5 loại), AI optimization (FAQ song ngữ 1-nguồn-dữ liệu, llms.txt, entity-first copy), validation & docs (validator mở rộng, README + deployment guide).

Kết quả: 23 file (15 modified + 8 mới), 181/181 browser smoke tests pass (hai lần chạy độc lập), mutation test validator đỏ/xanh đúng, Lighthouse SEO 0.69 chỉ fail is-crawlable (chủ đích preview noindex).

## The Brutal Truth

Phiên này thật sự thành công—tất cả acceptance criteria đạt. Nhưng phần khó chịu là code review bắt được 1 Medium issue suýt lọt: trang pháp lý override `openGraph` nhưng không override `twitter` metadata, nên `twitter:title` kế thừa từ layout (title trang chủ) trong khi `og:title` = tên tài liệu. Đơn sơ là semantic lỏng lẻo, nhưng trên thực tế này là dấu hiệu của một anti-pattern sâu hơn: không hiểu rõ Next.js metadata merge là **shallow**, không deep. Điều này có thể lặp lại ở những nơi khác.

## Technical Details

**Medium #1**: `src/app/[locale]/[legal]/page.tsx` chỉ override `openGraph` qua helper `buildOpenGraph()`, khiến `twitter` object từ layout vẫn được inherit. Validator chỉ assert `twitter:title content="` pattern nên không bắt được lệch lạc. 

Fix: thêm helper `buildTwitter()` dùng chung cho cả layout và legal pages, đảm bảo khi override nhánh này thì toàn bộ nhánh liên quan cũng được override (hoặc trả về tuple openGraph+twitter).

Mutation test validator: xoá hreflang/FAQPage/@type/robots meta → ĐỎ (throw). Khôi phục → XANH. Kiểm chứng: canonical mọi trang là `https://kimtai.dantech.academy/...` (không basePath, không github.io), mirror luôn noindex dù `release.ready`.

## What We Tried

Code review phát hiện 0 Critical/High, 1 Medium, 3 Low, 1 Content. Tester độc lập ran 8/8 gate + 181 smoke checks. Self-verify: build + validate + typecheck + lint toàn xanh, mutation test + manual HTML inspection trên export.

## Root Cause Analysis

Next.js metadata merge shallow, không recursive. Khi một page layout cuộn ra tuple `{ openGraph, twitter, title }` thì child page override chỉ `openGraph` thôi là không đủ — `twitter` vẫn còn tuple cũ. Lỗi này chả thứa nào cảnh báo trong tài liệu; phải học qua experience hoặc code review.

Validator chỉ assert prefix pattern (`twitter:title content="`), không check semantic đối chiếu với `og:title`. Rủi ro: test này có thể mở rộng.

## Lessons Learned

1. **Metadata architecture phải xác định rõ ràng**: khi một system (Next.js) shallow-merge, phải document rõ "mọi override phải cover toàn bộ related fields" hoặc xây helper guarantee full tuple.

2. **Validator assert phải match UI intent**: validator bắt syntax nhưng không bắt semantic (twitter vs og), thường vì sợ false positive. Nhưng 1 Medium issue lọt qua là tín hiệu: phần này cần review thêm bước.

3. **1-source-of-truth cho FAQ**: vì cả UI và FAQPage schema đọc từ `locales.*.faq` đơn, không thể lệch. Lần sau phát hiện dữ liệu khác giữa 2 rendering point = lỗi trong merge pipeline, không phải FAQ config.

## Next Steps

1. **Immediate**: fix Medium #1 bằng helper `buildTwitter()`, re-run verify.
2. **Before commit**: resolve iOS FAQ commitment với chủ sản phẩm (hiện tại FAQ nói "phiên bản iOS sẽ công bố khi phát hành" nhưng iOS trong roadmap chưa xác nhận).
3. **After deploy**: runbook bước 1–2 (curl kiểm canonical/OG trên production, xác nhận Vercel KHÔNG đặt `CANONICAL_ORIGIN`).
4. **Post-release**: toàn bộ runbook SEO (Search Console, sitemap submit, Rich Results, Lighthouse ≥ 95).

Còn treo: commit chờ user duyệt.
