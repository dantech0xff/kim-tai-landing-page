import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@/app/globals.css";

import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { themeScript } from "@/lib/theme-script";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | Kim Tài",
  description:
    "Trang bạn đang tìm không tồn tại. Quay về Kim Tài bằng Tiếng Việt hoặc English.",
};

export default function GlobalNotFound() {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main className="notfound-page page-container">
          <div>
            <Link
              aria-label="Kim Tài — trang chủ"
              className="brand-link"
              href="/vi/"
            >
              <BrandMark />
            </Link>
            <p className="eyebrow notfound-eyebrow">404</p>
            <h1 className="notfound-title">Không tìm thấy trang.</h1>
            <p className="notfound-description">
              Đường dẫn này không tồn tại. Chọn ngôn ngữ để quay về trang giới thiệu Kim
              Tài. This page does not exist; choose a language to return home.
            </p>
            <nav
              aria-label="Chọn trang chủ / Choose a home page"
              className="notfound-actions"
            >
              <Link className="btn btn--primary" href="/vi/">
                Trang Tiếng Việt
              </Link>
              <Link className="btn btn--ghost" href="/en/">
                English home
              </Link>
            </nav>
          </div>
        </main>
      </body>
    </html>
  );
}
