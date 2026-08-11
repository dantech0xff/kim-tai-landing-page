import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { TechBlogArticle } from "@/components/tech-blog-article";
import { canonicalOrigin, toCanonicalUrl } from "@/lib/base-path";
import {
  blogSlugs,
  getBlogArticle,
  getBlogPath,
  siteConfig,
} from "@/lib/content";
import {
  buildArticleOpenGraph,
  buildTwitter,
} from "@/lib/seo-metadata";
import {
  buildBlogBreadcrumbList,
  buildTechArticle,
} from "@/lib/structured-data";

interface BlogPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return blogSlugs.map((slug) => ({ locale: "vi", slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getBlogArticle(locale, slug);
  if (!article) return {};

  const canonicalUrl = toCanonicalUrl(`${getBlogPath(article.slug)}/`);

  return {
    title: { absolute: article.seoTitle },
    description: article.description,
    keywords: article.tags,
    authors: [{ name: siteConfig.brand.name, url: canonicalOrigin }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: canonicalUrl,
        "x-default": canonicalUrl,
      },
    },
    openGraph: buildArticleOpenGraph("vi", {
      article,
      url: canonicalUrl,
    }),
    twitter: buildTwitter("vi", {
      title: article.seoTitle,
      description: article.description,
    }),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale, slug } = await params;
  const article = getBlogArticle(locale, slug);
  if (!article) notFound();

  return (
    <>
      <StructuredData data={buildBlogBreadcrumbList(article)} />
      <StructuredData data={buildTechArticle(article)} />
      <TechBlogArticle article={article} />
    </>
  );
}
