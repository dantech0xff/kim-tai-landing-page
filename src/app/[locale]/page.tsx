import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { StructuredData } from "@/components/structured-data";
import { isLocale } from "@/lib/content";
import { buildMobileApplication } from "@/lib/structured-data";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-static";

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <StructuredData data={buildMobileApplication(locale)} />
      <LandingPage locale={locale} />
    </>
  );
}

