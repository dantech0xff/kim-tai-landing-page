import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@/app/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  isMirrorDeployment,
  siteOrigin,
  toCanonicalUrl,
  withBasePath,
} from "@/lib/base-path";
import { StructuredData } from "@/components/structured-data";
import { themeScript } from "@/lib/theme-script";
import { getSiteCopy, isLocale, locales, siteConfig } from "@/lib/content";
import { buildOpenGraph, buildTwitter } from "@/lib/seo-metadata";
import { buildOrganization, buildWebSite } from "@/lib/structured-data";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const copy = getSiteCopy(locale);
  const isReleaseReady = siteConfig.release.ready && siteConfig.operator.configured;
  const isIndexable = isReleaseReady && !isMirrorDeployment;

  return {
    title: {
      default: copy.metadata.title,
      template: `%s · ${copy.metadata.title}`,
    },
    description: copy.metadata.description,
    applicationName: siteConfig.brand.productName,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: toCanonicalUrl(`/${locale}/`),
      languages: {
        vi: toCanonicalUrl("/vi/"),
        en: toCanonicalUrl("/en/"),
        "x-default": toCanonicalUrl("/vi/"),
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
    openGraph: buildOpenGraph(locale, {
      url: toCanonicalUrl(`/${locale}/`),
      title: copy.metadata.title,
      description: copy.metadata.description,
    }),
    twitter: buildTwitter(locale, {
      title: copy.metadata.title,
      description: copy.metadata.description,
    }),
    robots: {
      index: isIndexable,
      follow: isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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
        <StructuredData data={buildOrganization()} />
        <StructuredData data={buildWebSite()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
