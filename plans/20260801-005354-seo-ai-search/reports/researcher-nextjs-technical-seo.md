# Next.js 15 App Router Technical SEO Research Report
**Kim Tài Landing Page Deployment: Vercel + GitHub Pages Mirror**  
Generated: 2026-08-01

---

## 1. sitemap.ts & robots.ts Behavior with `output: "export"` + basePath

### Research Findings

**File Generation & Location:**
- Both `app/sitemap.ts` and `app/robots.ts` are special Route Handlers cached by default unless using request-time APIs [next.js/docs/app/api-reference/file-conventions/metadata/robots].
- With `output: "export"` (static export), these files are pre-rendered at build time and output as static files.
- `sitemap.ts` generates `/.../sitemap.xml` at build output root; `robots.ts` generates `/robots.txt` at build output root [next.js/docs/app/api-reference/file-conventions/metadata/sitemap].
- **With basePath set**: Files output to the static export directory but URLs in generated files must be absolute (e.g., `https://domain.com/kim-tai-landing-page/vi/`) to be meaningful since they're served at domain root only.

**Dynamic Config Requirement:**
- `export const dynamic = "force-static"` is NOT required explicitly for sitemap.ts or robots.ts with output export; they default to static generation for backward compatibility.
- If your sitemap or robots function calls non-static data at build time, explicitly export `dynamic = "force-static"` to catch this at build time rather than risk runtime errors [next.js/docs/app/guides/caching-without-cache-components#dynamic].

**basePath Caveat – Critical for This Setup:**
- **robots.txt must live at domain root** (`/.../robots.txt`). RFC 9309 (official standard) specifies this; crawlers ignore robots.txt at any other path [RFC 9309: Robots Exclusion Protocol].
- GitHub Pages build outputs files to root of `gh-pages` branch; if `basePath = "/kim-tai-landing-page"`, your generated robots.txt lands at `https://dantech0xff.github.io/robots.txt` **not** `https://dantech0xff.github.io/kim-tai-landing-page/robots.txt`.
- **Implication: robots.txt is only meaningful on Vercel production** (`https://kimtai.dantech.academy/robots.txt`). On GitHub Pages mirror, the robots.txt is ignored by crawlers. Set `Disallow: /` via meta robots in HTML on the GitHub Pages build if mirroring must be invisible to SEO.
- sitemap.txt can live at any path and be referenced in robots.txt with absolute URL; however, for maximum crawl budget efficiency, put it at root too [next.js/docs/app/api-reference/file-conventions/metadata/sitemap].

**Verdict for Kim Tài:**  
sitemap.ts and robots.ts will static-generate correctly with output export on both deployments. On Vercel, robots.txt at domain root controls crawl behavior correctly. On GitHub Pages, robots.txt generated at root is ignored by RFC 9309 spec; mitigate via robots meta in HTML. No explicit `dynamic = "force-static"` needed if sitemap/robots code is fully static.

---

## 2. Localized Sitemap with hreflang Alternates

### Research Findings

**Single Sitemap vs. Per-Locale:**
- For an 8-page site (bilingual: 2 locales × 3 legal pages + 2 homepage variants), **one unified sitemap with alternates is preferred** [next.js/docs/app/api-reference/file-conventions/metadata/sitemap].
- Next.js supports `alternates.languages` in sitemap entries, rendering as `<xhtml:link rel="alternate" hreflang="..." />` tags within each `<url>` entry.
- Benefits: single crawl target, reciprocal hreflang links baked in, less overhead than multiple sitemaps.

**Correct Sitemap Structure with Alternates:**

```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['vi', 'en'];
  const paths = ['/legal/privacy', '/legal/terms', '/legal/cookies'];
  const entries: MetadataRoute.Sitemap = [];

  locales.forEach(locale => {
    paths.forEach(path => {
      entries.push({
        url: `${siteOrigin}/${locale}${path}/`,
        lastModified: new Date(),
        alternates: {
          languages: {
            vi: `${siteOrigin}/vi${path}/`,
            en: `${siteOrigin}/en${path}/`,
            'x-default': `${siteOrigin}/en${path}/`, // Required fallback
          },
        },
      });
    });
  });
  return entries;
}
```

**x-default Inclusion:**
- Google's hreflang spec requires `x-default` for language selector / unspecified user fallback [developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages].
- In Next.js sitemap, use `'x-default': 'https://...'` key in the languages object.
- Typical pattern: set x-default to the primary locale URL (e.g., English) or a language-neutral selector.

**Output Format:**
```xml
<url>
  <loc>https://kimtai.dantech.academy/vi/legal/privacy/</loc>
  <xhtml:link rel="alternate" hreflang="vi" href="https://kimtai.dantech.academy/vi/legal/privacy/"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://kimtai.dantech.academy/en/legal/privacy/"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://kimtai.dantech.academy/en/legal/privacy/"/>
</url>
```

**Verdict for Kim Tài:**  
One unified sitemap with alternates.languages (including x-default) is the right choice. Ensures reciprocal hreflang, reduces crawler overhead, matches Next.js best practice for <8-page multilingual sites.

---

## 3. hreflang via generateMetadata + metadataBase + Trailing Slash Pitfalls

### Research Findings

**Correct Pattern with metadataBase:**

```typescript
// src/app/[locale]/layout.tsx (your current setup)
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    metadataBase: new URL(siteOrigin), // Resolves relative URLs to absolute
    alternates: {
      canonical: withBasePath(`/${locale}/`), // Relative OK if metadataBase set
      languages: {
        vi: withBasePath("/vi/"),
        en: withBasePath("/en/"),
        'x-default': withBasePath("/en/"), // Required
      },
    },
  };
}
```

**How It Works:**
- `metadataBase` is the origin used to resolve relative URLs in canonical, og:url, og:image, etc.
- When `metadataBase` is set, Next.js automatically converts relative alternates (e.g., `/vi/`) to absolute (e.g., `https://kimtai.dantech.academy/vi/`).
- **Relative vs. absolute: both work**, but absolute is unambiguous and preferred for SEO crawlers [developers.google.com/search/docs/crawling-indexing/canonicalization].

**Trailing Slash Pitfall – CRITICAL:**
- **Issue**: Next.js 14+ automatically strips trailing slashes from canonical/og:url metadata fields even if you provide them, **unless your next.config explicitly sets `trailingSlash: true`** [github.com/vercel/next.js/discussions/54070].
- **Your setup**: Vercel has no trailingSlash setting (defaults false), GitHub Pages has `trailingSlash: true`. This creates divergence.
- **Mismatch consequence**: If Vercel generates canonical without trailing slash (`/vi/legal/privacy`) but GitHub Pages HTML has trailing slash, and a user lands on the trailing-slash version, crawlers see two different canonicals → confusion → potential duplicate content signal or lost hreflang reciprocity.
- **Vercel's 308 redirect trap**: If `trailingSlash: false` is active and a request comes in with a trailing slash, Next.js issues a 308 redirect to remove it—wastes crawl budget, confuses Google's link flow [github.com/vercel/next.js/issues/15391].

**Recommendation to Avoid Mismatch:**
1. **Vercel side**: Decide trailing-slash strategy consistently. For this site (REST-like design), **trailing slashes are idiomatic** (`/vi/`, `/legal/privacy/`). Add `trailingSlash: true` to Vercel's next.config.
2. **Manually hardcode in generateMetadata** to ensure both deployments emit the same canonical:
   ```typescript
   canonical: withBasePath(`/${locale}/legal/${legalSlug}/`), // Always include trailing slash
   ```
3. **GitHub Pages already has `trailingSlash: true`**; ensure it's retained.
4. **Test**: curl both domains, verify canonical URLs match and include trailing slash consistently.

**Verdict for Kim Tài:**  
Manually append trailing slashes in generateMetadata() alternates to match your GitHub Pages config. Add `trailingSlash: true` to Vercel config. Test both deployments emit identical canonical/hreflang URLs. Current setup (your generateMetadata) already uses withBasePath which is correct; ensure all URLs end with `/` for consistency across deployments.

---

## 4. JSON-LD in App Router Server Components

### Research Findings

**Recommended Pattern – Server Component with dangerouslySetInnerHTML:**

```typescript
// Example: app/[locale]/legal/[slug]/schema.tsx (Server Component)
import type { ReactNode } from 'react';

export function BreadcrumbSchema({
  items, // [{ name: "Home", url: "..." }, { name: "Legal", url: "..." }, { name: "Privacy" }]
}: {
  items: Array<{ name: string; url?: string }>;
}): ReactNode {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'), // Escape < chars
      }}
    />
  );
}
```

**Key Patterns:**
- Use **Server Component by default**; renders `<script>` tag on server, no client JS overhead.
- **dangerouslySetInnerHTML + JSON.stringify()** is the canonical way; React normally escapes JSON, so you must bypass it.
- **Character escaping**: Next.js docs recommend `.replace(/</g, '\\u003c')` for `<` chars (common in URLs, dates). For robustness with untrusted data, use a library like `serialize-javascript` [medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router].
- **Placement**: Anywhere in a Server Component—root layout, page component, or dedicated schema component. Root layout for global Organization/WebSite; page-level for BreadcrumbList, specific schemas.

**Schema.org Shapes for Your Site:**

**Organization (sitewide, root layout):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kim Tài App", // From siteConfig.brand.productName
  "url": "https://kimtai.dantech.academy",
  "description": "...",
  "inLanguage": ["vi", "en"]
}
```

**WebSite (sitewide, root layout):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Kim Tài",
  "url": "https://kimtai.dantech.academy",
  "inLanguage": "en", // Set per-locale in layout
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://kimtai.dantech.academy/search?q={search_term_string}"
    }
  }
}
```

**SoftwareApplication (if describing your app—your site is a landing page, so optional):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kim Tài",
  "operatingSystem": "Android, iOS",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "@type": "Offer",
    "price": "0" // Free tier; omit or set per-tier
  },
  "aggregateRating": "OMIT if no real user ratings" // CRITICAL: don't fake data
}
```

**BreadcrumbList (page-level, legal pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kimtai.dantech.academy/en/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Privacy Policy",
      "item": "https://kimtai.dantech.academy/en/legal/privacy/"
    }
  ]
}
```

**Bilingual Handling:**
- Render Organization/WebSite with `"inLanguage": ["vi", "en"]` at root to apply globally.
- For page-level schemas (BreadcrumbList), create locale-aware instances in each `[locale]` layout:
  ```typescript
  const schema = {
    ...baseSchema,
    inLanguage: locale === 'vi' ? 'vi' : 'en',
    name: locale === 'vi' ? 'Trang Chính Sách' : 'Privacy Policy',
  };
  ```
- Ensure all URLs in JSON-LD use absolute URLs with correct language prefix (`/vi/...` or `/en/...`).

**Verdict for Kim Tài:**  
Render Organization & WebSite schemas in root layout via Server Component with dangerouslySetInnerHTML + JSON.stringify + `<` escaping. Add BreadcrumbList per-locale in `[locale]/legal/[slug]` pages. Omit aggregateRating unless real ratings exist. Set inLanguage per-locale.

---

## 5. Open Graph / Twitter Card Images: Static vs. ImageResponse with `output: "export"`

### Research Findings

**Options Overview:**

| Approach | File Type | Works with `output: "export"` | Pros | Cons |
|----------|-----------|-------------------------------|------|------|
| Static `/public` file | `.png`, `.jpg` | ✅ Yes | No build overhead; fast | Same image all pages; no dynamic content |
| `opengraph-image.tsx` (static) | `.tsx` + ImageResponse | ✅ Yes (if fully static) | Per-route/locale OG images | Build step required; bundle size limit 500KB |
| `opengraph-image.tsx` (dynamic) | `.tsx` fetching at request time | ❌ No | Fetches data per-request | Requires server runtime; static export doesn't allow |

**Static ImageResponse with output: "export":**
- If your `opengraph-image.tsx` does **not** call async functions or fetch data at request time, it's statically generated at build time—works with `output: "export"` [nextjs.org/docs/app/api-reference/functions/image-response].
- Static constraints: no database queries, no API calls, no `next/headers` use.
- Example: template-based OG image with hardcoded text and SVG layout.

**Recommended Setup for Kim Tài:**

**Option A: Static image files (simplest)**
```
public/
  og-image.png (1200x630, default fallback)
  og-image-vi.png (Vietnamese variant)
  og-image-en.png (English variant)
```
Configure in `generateMetadata`:
```typescript
openGraph: {
  images: [
    {
      url: locale === 'vi' 
        ? withBasePath('/og-image-vi.png')
        : withBasePath('/og-image-en.png'),
      width: 1200,
      height: 630,
      alt: copy.metadata.title,
    },
  ],
},
```

**Option B: Static ImageResponse (per-locale or per-page)**
```typescript
// app/[locale]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const alt = 'Kim Tài';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', background: '#fff', width: '100%', height: '100%' }}>
      {/* Hardcoded layout + tailored per-locale in i18n system */}
    </div>,
    size
  );
}
```

**ImageResponse Bundle Size:**
- Default limit: 500KB. If exceeding, reduce custom fonts, embedded images, or complexity [nextjs.org/docs/app/api-reference/functions/image-response].
- With `output: "export"`, the ImageResponse is executed at build time and output as static PNG; no server overhead.

**Per-Locale OG Image Consideration:**
- If you want locale-specific OG images (e.g., Vietnamese copy on vi version), place locale-specific opengraph-image files in `app/[locale]/opengraph-image.tsx`.
- Alternatively, use generateMetadata to reference locale-specific static images in `/public`.
- For legal pages, use generateMetadata in each page.tsx to override OG image per-page/per-locale.

**Verdict for Kim Tài:**  
Start with static PNG files in `/public` (og-image-vi.png, og-image-en.png, 1200x630). Reference locale-specific variants in generateMetadata. If later needing dynamic text (e.g., page title in OG image), migrate to static ImageResponse in `app/[locale]/opengraph-image.tsx`. Both approaches work with output export without server overhead.

---

## 6. Dual-Deployment Duplicate Content: Mirroring Vercel to GitHub Pages

### Research Findings

**Google's Stance:**
- Google does **not penalize** duplicate content across domains if canonicalization is correctly configured [developers.google.com/search/docs/crawling-indexing/canonicalization; searchenginejournal.com/google-says-it-can-handle-multiple-urls].
- Google picks one canonical URL as the "primary" version and consolidates signals; others rank lower but don't trigger a penalty.
- **But**: Crawl budget is wasted if Google crawls both; crawlers don't know which is the "real" one without explicit signals.

**Best Practices for Public Mirrors (2026):**

**Strategy A: robots meta + canonical (recommended for public mirrors):**
1. Add `<meta name="robots" content="noindex, follow" />` to GitHub Pages build globally (root index.html + all generated pages).
2. Add canonical pointing to Vercel production in GitHub Pages-built pages:
   ```html
   <link rel="canonical" href="https://kimtai.dantech.academy/en/legal/privacy/" />
   ```
3. **Result**: Google crawls GitHub Pages, sees noindex, removes from index, and prefers Vercel canonical. GitHub Pages remains discoverable for reference but doesn't compete in SERPs.
4. **Note**: Your current setup already has noindex in GitHub Pages root index.html; extend to all pages.

**Strategy B: noindex only (simpler, less belt-and-braces):**
1. Add robots noindex meta to all GitHub Pages pages.
2. **Relies on Google**: Google will eventually de-index GitHub Pages even without canonical; typically takes 1–2 recrawl cycles.
3. **Less robust**: If canonical is misconfigured or missing on some pages, Google may index GitHub Pages by accident.

**Strategy C: Cross-domain canonical + conditional noindex (complex, rarely needed):**
- Use canonical to Vercel + robots follow to allow backlink flows.
- Only noindex staging/preview URLs, not public mirrors.
- Use case: SEO credit flows to Vercel, GitHub Pages stays visible in crawl reports but not in SERPs.

**Recommendation: A + B (Combined):**
- Set robots noindex on GitHub Pages globally (env-based in next.config or middleware).
- Also set cross-domain canonical in generateMetadata pointing to Vercel domain.
- Rationale: belt-and-braces; if one fails, the other catches it. No performance cost.

**Implementation (env-based):**
```typescript
// src/app/[locale]/layout.tsx
const isCanonicalDomain = process.env.NEXT_PUBLIC_SITE_ORIGIN?.includes('kimtai.dantech.academy');

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  return {
    robots: {
      index: isCanonicalDomain && isReleaseReady, // Only index Vercel production
      follow: true,
    },
    // If on GitHub Pages, also add canonical to Vercel
    ...(isCanonicalDomain
      ? { alternates: { canonical: withBasePath(`/${locale}/`) } }
      : {
          alternates: {
            canonical: new URL(`/${locale}/`, 'https://kimtai.dantech.academy').href,
          },
        }),
  };
}
```

**Verdict for Kim Tài:**  
Set robots noindex on GitHub Pages build (extend current root noindex to all pages via middleware/generateMetadata). Add explicit cross-domain canonical in generateMetadata pointing to Vercel when running on GitHub Pages. This ensures Google indexes only Vercel, not the mirror, without relying on crawlers to eventually figure it out. Minimal setup; no performance cost.

---

## 7. Vercel-Specific: X-Robots-Tag Headers & Preview Deployments

### Research Findings

**Default Vercel Behavior:**
- **Preview deployments** (PR, branch deployments, `.vercel.app` alias): Vercel automatically injects `X-Robots-Tag: noindex` HTTP header to prevent indexing [vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines].
- **Production deployments** (custom domain, main branch): No automatic noindex; robot meta in HTML controls indexing.
- **Custom domain on preview branch**: Caveat—if you assign a custom domain to a non-production branch, Vercel **does NOT** automatically add noindex. You must manually configure it.

**Setting X-Robots-Tag via next.config:**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)', // All routes
        headers: [
          {
            key: 'X-Robots-Tag',
            value: process.env.ROBOTS_HEADER ?? 'index, follow',
          },
        ],
      },
    ];
  },
};
```

Set environment variable:
- **Vercel production**: `ROBOTS_HEADER=index, follow` (or omit, allow indexing)
- **Vercel preview**: `ROBOTS_HEADER=noindex, follow` (crawlers permitted, indexing blocked)
- **Local dev**: unset (default permits indexing for testing, but you likely have robots.txt denying `/`)

**Belt-and-Braces Approach:**
- Use both **X-Robots-Tag HTTP header** (Vercel header config) and **robots meta in HTML** (generateMetadata).
- Rationale: HTTP headers are more reliable (crawlers check headers before HTML), but HTML meta is fallback if header fails or is stripped by proxies.

**Preview Deployment Risk:**
- If preview branch uses a **custom domain** (e.g., `preview.kimtai.dantech.academy`), Vercel does NOT inject noindex automatically.
- **Risk**: Preview accessible via custom domain gets indexed, competing with production.
- **Mitigation**: Explicitly set `ROBOTS_HEADER=noindex, follow` for preview environments in Vercel project settings.

**Vercel Alias (.vercel.app) Handling:**
- Production deployments have a `.vercel.app` alias (e.g., `kim-tai-landing-page-git-main-dantech0xff.vercel.app`).
- Vercel's platform does **not** automatically noindex `.vercel.app` aliases. This is by design—the alias is a valid deployment URL.
- **If concerned**: Set robots noindex for `.vercel.app` domain in X-Robots-Tag config or robots.ts conditional:
  ```typescript
  // app/robots.ts
  const isVercelAlias = process.env.VERCEL_URL?.endsWith('.vercel.app');
  
  export default function robots(): MetadataRoute.Robots {
    return {
      rules: {
        userAgent: '*',
        allow: isVercelAlias ? '' : '/',
        disallow: isVercelAlias ? '/' : '',
      },
      sitemap: 'https://kimtai.dantech.academy/sitemap.xml',
    };
  }
  ```
- **In practice**: Production custom domain is your primary; `.vercel.app` is ignored as long as no backlinks point to it and robots.txt disallows crawl.

**Current Setup Recommendation:**
1. Keep robots.ts and generateMetadata robots setting as-is (index based on release flag).
2. Add X-Robots-Tag header in next.config for belt-and-braces.
3. Ensure preview deployments in Vercel project settings have noindex header set explicitly.
4. Test: `curl -I https://your-preview.vercel.app` → check `X-Robots-Tag` header.

**Verdict for Kim Tài:**  
Your current generateMetadata robots control is sufficient for production (Vercel custom domain). Add `X-Robots-Tag` header in next.config as secondary signal. In Vercel project settings, ensure preview environments have `ROBOTS_HEADER=noindex, follow` to prevent custom preview domains from being indexed. Monitor `.vercel.app` alias; if backlinks appear, add conditional noindex in robots.ts.

---

## Summary Table: Verdicts & Implementation Priority

| Question | Verdict | Priority | Risk Level |
|----------|---------|----------|-----------|
| 1. sitemap.ts + robots.ts + basePath | Both static-generate correctly; robots.txt ignored on GitHub Pages by spec. Use robots meta in HTML as fallback. | Low | Low |
| 2. Localized sitemap + hreflang | One unified sitemap with alternates.languages + x-default; 8-page site suits this. | High | Medium |
| 3. hreflang via generateMetadata | Manually append trailing slashes; add `trailingSlash: true` to Vercel config to match GitHub Pages. Test both deployments. | High | High—trailing slash mismatch breaks hreflang reciprocity |
| 4. JSON-LD in App Router | Server Components + dangerouslySetInnerHTML + `.replace(/</g, '\\u003c')`. BreadcrumbList page-level, Organization/WebSite root-level. | Medium | Low—non-critical for indexing but improves SERP display |
| 5. OG images + output export | Static PNG files in `/public` (fastest, works with export). Migrate to static ImageResponse later if dynamic text needed. | Medium | Low |
| 6. Dual-deployment duplicate content | robots noindex on GitHub Pages (extend current root meta to all pages) + cross-domain canonical to Vercel in generateMetadata. | High | Medium—mirrors compete if not de-indexed |
| 7. Vercel X-Robots-Tag headers | Add header config in next.config for belt-and-braces. Set noindex explicitly for preview deployments in project settings. | Low | Low—fallback to generateMetadata robots if header fails |

---

## Unresolved Questions / Notes

1. **Sitemap inclusion of non-`/en` and `/vi` pages?** The spec mentions 8 pages: 2 locales × 3 legal + 2 homepages. Are homepages at `/` (redirects to `/vi/`) and `/vi/`, `/en/` (real pages)? If redirect at `/`, exclude from sitemap.
2. **Organization schema frequency?** Should it be in root layout (once per load) or per-page? Root layout is standard; no performance risk from duplication.
3. **GitHub Pages noindex meta tag scope?** Should middleware apply, or per-page in generateMetadata? Current approach (release flag in site.json) is good; extend to include GitHub Pages check.
4. **basePath + OpenGraph image URLs?** If using static images in `/public`, Next.js should serve them without basePath prefixing in public/ paths. Confirm by testing build output.
5. **Canonicalization vs. robots interaction?** If page has robots noindex AND canonical to another URL, does Google follow canonical? Google treats noindex as "remove from index" regardless of canonical; canonical is advisory, not directive.

---

## Citation Index

- [RFC 9309: Robots Exclusion Protocol](https://datatracker.ietf.org/doc/html/rfc9309)
- [Next.js robots.ts Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js sitemap.ts Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js ImageResponse Documentation](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Google Search Central: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google Search Central: hreflang & x-default](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Vercel: Preview Deployments and Indexing](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines)
- [GitHub Issue: Trailing Slash Mismatch (vercel/next.js#15391)](https://github.com/vercel/next.js/issues/15391)
- [Medium: JSON-LD in Next.js 15 App Router](https://medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router-product-blog-and-breadcrumb-schemas-f752b7422c4f)
- [Medium: How to Add JSON-LD Schema in Next.js](https://alamin-dev.medium.com/how-to-add-json-ld-schema-in-next-js-in-5-minutes-33b9e239f6fa)
- [Search Engine Journal: Duplicate Content Handling](https://www.searchenginejournal.com/google-says-it-can-handle-multiple-urls-to-the-same-content/571424/)
