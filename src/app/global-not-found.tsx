import "@fontsource-variable/newsreader/wght.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@/app/globals.css";

import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | Kim Tài",
  description:
    "Trang bạn đang tìm không tồn tại. Quay về Kim Tài bằng Tiếng Việt hoặc English.",
};

export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body>
        <main className="page-container flex min-h-screen items-center py-16">
          <div className="mx-auto w-full max-w-3xl text-center">
            <Link
              aria-label="Kim Tài — trang chủ"
              className="brand-link inline-flex"
              href="/vi/"
            >
              <BrandMark />
            </Link>
            <p className="eyebrow mt-12">404</p>
            <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
              Không tìm thấy trang.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
              Đường dẫn này không tồn tại. Chọn ngôn ngữ để quay về trang giới thiệu Kim
              Tài. This page does not exist; choose a language to return home.
            </p>
            <nav
              aria-label="Chọn trang chủ / Choose a home page"
              className="mt-10 flex flex-wrap justify-center gap-3"
            >
              <Link className="store-button min-w-48 justify-center" href="/vi/">
                Trang Tiếng Việt
              </Link>
              <Link className="store-button min-w-48 justify-center" href="/en/">
                English home
              </Link>
            </nav>
          </div>
        </main>
      </body>
    </html>
  );
}
