import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentPage } from "@/components/legal-document-page";
import { StructuredData } from "@/components/structured-data";
import { toCanonicalUrl } from "@/lib/base-path";
import {
  getLegalDocument,
  isLegalSlug,
  isLocale,
  legalSlugs,
} from "@/lib/content";
import { buildOpenGraph, buildTwitter } from "@/lib/seo-metadata";
import { buildBreadcrumbList } from "@/lib/structured-data";

interface LegalPageProps {
  params: Promise<{ locale: string; legal: string }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return legalSlugs.map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale, legal } = await params;
  if (!isLocale(locale) || !isLegalSlug(legal)) return {};

  const { document } = getLegalDocument(locale, legal);
  const canonicalUrl = toCanonicalUrl(`/${locale}/${legal}/`);
  return {
    title: document.shortTitle,
    description: document.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: toCanonicalUrl(`/vi/${legal}/`),
        en: toCanonicalUrl(`/en/${legal}/`),
        "x-default": toCanonicalUrl(`/vi/${legal}/`),
      },
    },
    openGraph: buildOpenGraph(locale, {
      url: canonicalUrl,
      title: document.shortTitle,
      description: document.description,
    }),
    twitter: buildTwitter(locale, {
      title: document.shortTitle,
      description: document.description,
    }),
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale, legal } = await params;
  if (!isLocale(locale) || !isLegalSlug(legal)) notFound();

  return (
    <>
      <StructuredData data={buildBreadcrumbList(locale, legal)} />
      <LegalDocumentPage locale={locale} slug={legal} />
    </>
  );
}
