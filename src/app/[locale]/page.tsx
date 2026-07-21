import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { isLocale } from "@/lib/content";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-static";

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <LandingPage locale={locale} />;
}

