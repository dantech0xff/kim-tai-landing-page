# Final code review: Vietnamese technical blog

> Superseded on 11 August 2026 by the concise four-section rewrite. This report reviews the earlier long-form article; current evidence is in [reviewer-260811-1456-concise-blog-rewrite.md](./reviewer-260811-1456-concise-blog-rewrite.md).

Date: 2026-08-11  
Verdict: PASS  
Findings: none

## Scope and evidence

- Reviewed the accepted plan and all three phase files before quality review.
- Reviewed current article content, route, renderer, navigation, metadata/schema, sitemap, CSS, validators, README, deployment guide, `llms.txt`, and the supplied architecture source.
- Used existing fresh evidence: content/type/lint pass; Vercel and Pages builds pass; Pages export validation pass; VI HTTP 200; EN/unknown HTTP 404; desktop/mobile browser checks with no overflow, console errors, or page errors.
- Fresh read-only `git diff --check` passed. No build or server operation was run in this review, per assignment constraints.

## Stage 1: specification compliance

Status: PASS

| Contract | Result | Evidence |
| --- | --- | --- |
| Exact static VI route | PASS | `src/app/[locale]/blog/[slug]/page.tsx:26-31` forces static rendering, disables dynamic params, and emits the full `{ locale: "vi", slug }` tuple. Runtime/export evidence confirms VI 200/prerender and the exact VI artifact. |
| VI-only; unsupported combinations fail | PASS | `src/lib/content.ts:181-187` accepts only VI plus the supported slug; `page.tsx:63-66` calls `notFound()`. EN, unknown slug/locale, and `/vi/blog/` return 404; no EN artifact exists. |
| Required long-form subject matter | PASS | The 12 sections in `src/content/blog.vi.json:41-470` cover the `9999` incident, server pipeline, identity contract, fetching/parsing, normalization, quality gate, public read models, Flutter validation/cache, world-gold boundary, operations/tests, and explicit non-goals. |
| Reading experience | PASS | `src/components/tech-blog-article.tsx:29-140,142-249` renders TOCs, rich blocks, callouts, code, named data tables, semantic sections, pipeline, disclaimer, and CTA. Browser evidence confirms one H1, 12 sections, usable desktop/mobile TOCs, three named tables, and 12 row headers. |
| Header/footer discovery and EN fallback | PASS | VI-only navigation is implemented at `src/components/site-header.tsx:39-60` and `site-footer.tsx:36-53`; the article explicitly targets `/en/` at `tech-blog-article.tsx:148`. Pages evidence confirms base-path-prefixed `/en/`, never an EN article URL. |
| Metadata and machine-readable discovery | PASS | Article canonical/VI/x-default, OG/Twitter metadata are at `page.tsx:33-60`; `BreadcrumbList` and `TechArticle` at `src/lib/structured-data.ts:201-260`; isolated VI sitemap entry at `src/app/sitemap.ts:36-50`; canonical discovery entry at `public/llms.txt:12-14`. |
| Base-path and release-gate preservation | PASS | Internal links remain Next `Link` paths; social assets use `withBasePath`; canonical/schema URLs stay on the canonical origin. Existing locale-layout robots logic is inherited. Pages validation and debugger evidence confirm assets/links use the mirror base path while canonical URLs do not. |
| Executable validation and evergreen docs | PASS | `scripts/validate-content.mjs:219-408` covers the JSON article contract and `llms.txt`; `scripts/validate-pages-export.mjs:29-64,135-166,187-250,357-462` covers the artifact, EN absence, metadata, schema, shell/content markers, sitemap, and base path. README and `docs/deployment.md:47-55` document the public route and VI-only export contract. |
| Quality gates | PASS | Recorded evidence confirms content/type/lint, both production build modes, Pages validation, HTTP/browser checks, and zero console/page errors. Fresh `git diff --check` also passed. |

### Constraints and deliberate non-goals

- Reference-only language and the 10 August 2026 architecture snapshot are explicit at `src/content/blog.vi.json:37-40`; provider stability/redistribution caveats appear at `:208-215`.
- Reviewed scheduler/parser behavior remains technical explanation only. The article contains no credentials, key values, private endpoints, or decoding material; claims trace to the supplied source.
- No CMS, MDX dependency, blog index, English article/translation, analytics, deployment workflow, commit, or PR was added. The diff contains no package or workflow change.
- No broken cross-repository source link is rendered. The JSON renderer exposes no article-authored URL surface.

## Stage 2: quality, security, accessibility, regression

Status: PASS

- **Correctness/static generation:** the earlier incomplete-prerender defect is resolved by the full child tuple at `page.tsx:29-31`. `dynamicParams = false`, pair validation, observed prerender headers, exact VI artifact, and verified 404s form a consistent boundary.
- **Metadata/schema:** visible and machine-readable title, description, dates, tags, sections, canonical URL, and VI-only alternates derive from the same JSON article. No aggregate rating, nonexistent EN alternate, or provider endorsement is emitted.
- **Base-path safety:** root-relative Next links and `withBasePath` cover active-deployment links/assets; canonical helpers keep canonical/schema/sitemap URLs off the mirror subpath. Pages export validation passed.
- **Rendering/XSS:** article strings are emitted as React text nodes; there is no article `dangerouslySetInnerHTML`. JSON-LD serialization escapes `<` in `src/components/structured-data.tsx:1-9`, blocking `</script>` termination.
- **Accessibility/semantics:** current source has an explicit skip link, one H1, labeled article/landmarks/callouts, keyboard TOCs, focusable overflow surfaces, figures/captions, column headers, and first-column `scope="row"` headers (`tech-blog-article.tsx:100-137`). Final browser evidence confirms the article label, named tables, row headers, visible focus ring, and no 375 px overflow.
- **CSS regression:** new rules are scoped to `.article-*` except the deliberate shared display-font selector. Responsive breakpoints, bounded overflow, sticky TOC, dark tokens, and the existing reduced-motion override remain coherent. Light/dark desktop/mobile screenshots and browser checks show no verified regression.
- **Validator robustness:** content validation rejects malformed blocks, duplicate section IDs, invalid tables/lists/code/callouts, date/reading-time drift, em dashes, unresolved relative links, and missing `llms.txt` discovery. Export validation checks exact artifacts, EN absence, base-path leakage, article metadata/schema, rendered section markers, and exact sitemap alternates/count.
- **Secrets and claims:** pattern review found only generic names such as “cron secret”, “service-role key”, and “publishable key”, never values. Operational numbers and parser behavior are present in the supplied architecture source; sensitive relative links and decoding specifics were omitted from publication.
- **Tests/docs:** recorded automated and browser evidence covers the affected public contracts. README and deployment claims match current route/export behavior.

## Findings

No Critical, High, Medium, or Low findings. No evidence-backed change is required before handoff.

## Unresolved questions

None.
