---
title: "SEO optimization follow-up"
status: completed
priority: P1
branch: "main"
tags: [seo, nextjs, structured-data, performance]
---

# Kim Tài SEO optimization follow-up

## Outcome

Improve search clarity and crawl surfaces without weakening the release gate or inventing product, rating, keyword-volume, or legal data.

## Constraints and non-goals

- Keep Vercel preview and GitHub Pages mirror `noindex` behavior unchanged.
- Preserve canonical origin, trailing slashes, VI/EN hreflang, store URLs, and existing public routes.
- Do not enable indexing, analytics, deploy, commit, or create a PR.
- Do not claim keyword volume, Search Console performance, or PageSpeed scores without access to those data sources.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | [Search content and entity consistency](./phase-01-search-content-and-entities.md) | Completed |
| 2 | [Technical discovery and 404 UX](./phase-02-technical-discovery.md) | Completed |
| 3 | [Validation and documentation](./phase-03-validation-and-docs.md) | Completed |

## Acceptance criteria

- VI/EN landing titles and H1 copy describe the product with relevant, natural search terms.
- `llms.txt` and MobileApplication structured data represent both published stores.
- Search metadata permits large image previews while preserving current index/follow gates.
- Landing entries in `sitemap.xml` expose the original app screenshots for image discovery.
- Unmatched routes return a useful branded 404 with links back to VI/EN and remain `noindex`.
- Validators cover the new SEO contracts.
- `validate:content`, typecheck, lint, production build, GitHub Pages export validation, and browser smoke checks pass.

## Dependencies

- Indexing remains blocked until the product owner supplies verified operator/legal details and explicitly marks the release ready.
- PageSpeed Insights and ReviewWeb/GSC data are unavailable in this session; implementation relies on code, live HTTP evidence, official documentation, and local browser verification.

## Completion evidence

- Content validation, typecheck, lint, Vercel production build, GitHub Pages export/build validation, and `git diff --check` passed.
- Browser smoke verification passed 181 checks with no console, hydration, or failed-network errors.
- Local production HTTP checks confirmed branded `404` responses, `noindex`, bilingual recovery links, both store URLs in MobileApplication schema, and six localized image-sitemap entries.
- Review found no blocking correctness, security, scope, or documentation issue. The only warning is the intentional release-gate `noindex` state.
