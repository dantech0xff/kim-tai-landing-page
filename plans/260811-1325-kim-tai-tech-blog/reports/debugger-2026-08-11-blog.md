# Blog route/static boundary debugging audit

> Route findings remain historical evidence, but article counts below describe the superseded long-form copy. Current content and production evidence is in [reviewer-260811-1456-concise-blog-rewrite.md](./reviewer-260811-1456-concise-blog-rewrite.md).

## Executive summary

- **Earlier issue:** supported VI path absent from the concrete prerender set while the child route had `dynamicParams = false`; Next therefore followed its no-fallback path.
- **Fix status:** verified. The child now emits the full `{ locale: "vi", slug }` tuple. Current root production server serves the article as a cached prerender; current Pages output contains its exact VI artifact.
- **Unsupported paths:** unsupported EN, unknown slug, unknown locale, and `/vi/blog/` all return the intended custom 404.
- **SEO/base path:** article canonical and hreflang expose VI plus `x-default` only. Root and Pages language controls fall back to the EN home. Pages links/assets carry `/kim-tai-landing-page`; canonical URLs do not.
- **Defects:** none verified in the audited boundaries.

## Scope and constraints

- Read source, current `out/` export, installed Next.js 16.2.10 runtime, and existing server at `http://127.0.0.1:3000`.
- Did not build, mutate implementation/config/docs, inspect blocked `.next` files, or start/stop any process.
- Historical broken output no longer available, so no red-state replay. Root-cause chain corroborated by the supplied earlier symptom, current source, installed runtime branch, and current green server/export evidence.

## Root cause and fix verification

1. The blog route rejects runtime expansion with `dynamicParams = false` at `src/app/[locale]/blog/[slug]/page.tsx:27`.
2. Next 16.2.10 treats an unprerendered dynamic path with no fallback as an internal no-fallback condition: `node_modules/next/dist/build/templates/app-page.js:663-673` throws `NoFallbackError` when fallback mode is `NOT_FOUND`.
3. The earlier incomplete child parameters therefore left the concrete supported VI path outside the prerender set, producing the generic dynamic-route/no-fallback behavior and VI 404.
4. Current `generateStaticParams()` returns the complete supported pair at `src/app/[locale]/blog/[slug]/page.tsx:29-31`:

   ```ts
   return blogSlugs.map((slug) => ({ locale: "vi", slug }));
   ```

5. Fresh runtime evidence for `/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/`:
   - HTTP `200`
   - `x-nextjs-cache: HIT`
   - `x-nextjs-prerender: 1`
   - `Cache-Control: s-maxage=31536000`
6. Fresh export evidence:
   - `out/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/index.html` exists.
   - `out/en/blog/toi-lay-gia-vang-online-nhu-the-nao/index.html` absent.
   - `GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page npm run validate:pages` exited 0: `GitHub Pages export checks passed for /kim-tai-landing-page.`

## Route probes

| Probe | Result | Assessment |
| --- | --- | --- |
| `/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/` | `200`, prerender cache hit | Supported VI correct |
| Same path without trailing slash | `308` to trailing-slash URL | Matches `next.config.ts:42` |
| `/en/blog/toi-lay-gia-vang-online-nhu-the-nao/` | `404`, custom bilingual page | Unsupported EN correct |
| `/vi/blog/unknown-slug/` | `404`, same custom page | Unknown slug correct |
| `/fr/blog/toi-lay-gia-vang-online-nhu-the-nao/` | `404`, same custom page | Unknown locale correct |
| `/vi/blog/` | `404`, same custom page | No unintended blog index |
| `/en/` | `200` | Article language fallback target valid |
| `/kim-tai-landing-page/vi/blog/.../` on root-mode server | `404` | Expected: this server was built without Pages base path |

The three invalid dynamic combinations returned byte-identical 404 bodies (same SHA-256), with HTTP 404, `robots=noindex`, and links to `/vi/` and `/en/`. No `NoFallbackError` or internal-error text appeared in the response.

## Language, canonical, and hreflang

- Article validation is pair-based at `src/lib/content.ts:181-187`: only locale `vi` plus a supported slug resolves.
- Article metadata at `src/app/[locale]/blog/[slug]/page.tsx:33-60` emits:
  - canonical VI article URL;
  - `vi` and `x-default` alternates only;
  - no nonexistent EN alternate.
- Live root HTML contained:
  - canonical `http://localhost:3000/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/` (expected local default from `src/lib/base-path.ts:4` and `next.config.ts:10`);
  - VI and `x-default` hreflang only;
  - language link `/en/`, no `/en/blog/...` link.
- Article explicitly supplies the fallback through `<SiteHeader languageHref="/en/" ...>` at `src/components/tech-blog-article.tsx:139`. `SiteHeader` uses that override at `src/components/site-header.tsx:18-26,63-69`.
- Sitemap isolates the article from the bilingual route expansion at `src/app/sitemap.ts:36-49`, so it has VI and `x-default` only.

## Base-path boundary

- Pages configuration derives `/kim-tai-landing-page` and injects it as both Next `basePath` and `NEXT_PUBLIC_BASE_PATH` at `next.config.ts:3-7,17,22-36`.
- Internal `Link` URLs are authored root-relative and Next prefixes them. Static metadata assets use `withBasePath()` from `src/lib/base-path.ts:20-24`.
- Current Pages article HTML verified:
  - links and `_next` assets start with `/kim-tai-landing-page/`;
  - language fallback is `/kim-tai-landing-page/en/` and its `out/en/index.html` target exists;
  - canonical/hreflang remain `https://kimtai.dantech.academy/vi/blog/.../` with no mirror base path;
  - Open Graph image uses the active mirror origin plus base path;
  - sitemap lists the canonical VI article once, with VI and `x-default`, no EN article URL.
- The static validator enforces these assumptions at `scripts/validate-pages-export.mjs:20-29,54-64,135-147,187-250,357-445` and passed against the current export.

## `NoFallbackError` assessment

**Observation, not defect:** any server log for this exception on intentional misses is a Next internal routing diagnostic/sentinel, not evidence of a user-facing failure.

- Next defines the message as `Internal: NoFallbackError` in `node_modules/next/dist/shared/lib/no-fallback-error.external.js:11-15`.
- The App Router deliberately throws it for an ungenerated `dynamicParams = false` path at `node_modules/next/dist/build/templates/app-page.js:663-673` and excludes it from request-error reporting at `:1318-1322`.
- The router catches it and advances to the next handler at `node_modules/next/dist/server/lib/router-server.js:262-272`.
- Empirical result: intentional misses return a normal custom `404`, never `500`, and do not expose the exception in headers/body.

No application change justified. Reclassify only if monitoring demonstrably pages on these handled events, response status becomes 5xx, or exception text leaks to clients; none observed here.

## Verified defects

None.

## Unresolved questions

None.
