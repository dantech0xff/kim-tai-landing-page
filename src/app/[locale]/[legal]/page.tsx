import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentPage } from "@/components/legal-document-page";
import {
  getLegalDocument,
  isLegalSlug,
  isLocale,
  legalSlugs,
} from "@/lib/content";

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
  return {
    title: document.shortTitle,
    description: document.description,
    alternates: {
      canonical: `/${locale}/${legal}`,
      languages: {
        vi: `/vi/${legal}`,
        en: `/en/${legal}`,
      },
    },
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale, legal } = await params;
  if (!isLocale(locale) || !isLegalSlug(legal)) notFound();

  return <LegalDocumentPage locale={locale} slug={legal} />;
}

