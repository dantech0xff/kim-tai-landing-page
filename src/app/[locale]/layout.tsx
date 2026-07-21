import "@fontsource-variable/newsreader/wght.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@/app/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { siteOrigin, withBasePath } from "@/lib/base-path";
import { getSiteCopy, isLocale, locales, siteConfig } from "@/lib/content";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('kim-tai-theme');
      if (saved !== 'dark' && saved !== 'light') saved = null;
      var dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    } catch (_) {}
  })();
`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const copy = getSiteCopy(locale);
  const isReleaseReady = siteConfig.release.ready && siteConfig.operator.configured;

  return {
    title: {
      default: copy.metadata.title,
      template: `%s · ${copy.metadata.title}`,
    },
    description: copy.metadata.description,
    applicationName: siteConfig.brand.productName,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: withBasePath(`/${locale}/`),
      languages: {
        vi: withBasePath("/vi/"),
        en: withBasePath("/en/"),
      },
    },
    icons: {
      icon: [
        {
          url: withBasePath(siteConfig.icons.favicon.src),
          sizes: siteConfig.icons.favicon.sizes,
          type: siteConfig.icons.favicon.type,
        },
      ],
      shortcut: [
        {
          url: withBasePath(siteConfig.icons.favicon.src),
          sizes: siteConfig.icons.favicon.sizes,
          type: siteConfig.icons.favicon.type,
        },
      ],
      apple: [
        {
          url: withBasePath(siteConfig.icons.appleTouch.src),
          sizes: siteConfig.icons.appleTouch.sizes,
          type: siteConfig.icons.appleTouch.type,
        },
      ],
    },
    openGraph: {
      title: copy.metadata.title,
      description: copy.metadata.description,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      siteName: siteConfig.brand.name,
      type: "website",
    },
    robots: {
      index: isReleaseReady,
      follow: isReleaseReady,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = getSiteCopy(locale);

  return (
    <html lang={copy.languageCode} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
