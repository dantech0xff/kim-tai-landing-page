---
title: "Kim Tài technical blog: gold-price data pipeline"
status: completed
priority: P2
branch: main
tags: [blog, content, nextjs, seo]
created: 2026-08-11
---

# Kim Tài technical blog

## Outcome

Publish and deploy one concise Vietnamese technical article that teaches the complete Kim Tài data flow: fetch public source data, normalize and store it in PostgreSQL, then expose a safe read contract to Flutter.

## Constraints and non-goals

- Keep every price claim reference-only; do not imply provider endorsement, guaranteed accuracy, or investment advice.
- Treat the supplied text as the technical source and label implementation-specific details as a 10 August 2026 architecture snapshot.
- Keep the three-stage pipeline as the article spine. Do not lead with an incident, product history, or long operational narrative.
- Do not publish broken cross-repository links, sensitive or unreviewed crawler transport details, credentials, or an unsupported English translation. Reviewed scheduler and parser behavior is deliberately in scope for the technical explanation.
- Preserve existing locale, release-gate, legal, store, canonical-origin, and GitHub Pages contracts.
- Do not add a CMS, MDX dependency, blog index, analytics, commit, push, or PR. The user explicitly authorized a manual production deployment of the verified worktree.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | [Article content and reading experience](./phase-01-article-experience.md) | Completed |
| 2 | [Discovery, metadata, and machine-readable contracts](./phase-02-discovery-and-seo.md) | Completed |
| 3 | [Validation, documentation, and deployment](./phase-03-validation-and-docs.md) | Completed |

## Dependencies

- User-supplied source: `/Users/dan/.codex/attachments/a3fe8212-2267-4f0b-81fd-4fb889122b4c/pasted-text.txt`.
- Existing JSON-owned content, locale layout, metadata helpers, structured-data builders, sitemap, and static-export validators.
- Existing Newsreader + Be Vietnam Pro typography and Kim Tài light/dark theme tokens.

## Acceptance criteria

- `/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/` renders statically with one H1, four focused sections, a usable table of contents, code blocks, one normalization table, callouts, and an accessible responsive layout.
- The article follows one direct sequence: source adapter and server fetch, normalization and database write/read model, then Flutter REST read and cache fallback.
- A reader can learn the raw/normalized contracts, integer unit conversions, quality predicates, database identity, public-view boundary, and mobile validation flow without reading an incident story.
- Estimated reading time is no more than seven minutes and remains consistent with executable content validation.
- Header/footer expose the article without creating a missing English article URL; the article language switch falls back to `/en/`.
- Canonical, Open Graph/Twitter metadata, `TechArticle` and breadcrumb JSON-LD, sitemap, `llms.txt`, and GitHub Pages base-path behavior are correct.
- Content validation covers the article contract; static-export validation covers its artifact, metadata, schema, content, and sitemap entry.
- `npm run validate:content`, `npm run typecheck`, `npm run lint`, both production build modes, `npm run validate:pages`, focused browser checks, and `git diff --check` pass.
- Review finds no broken existing workflow, public-contract regression, unsupported claim, secret, or inaccessible interaction.
- The corrected article is deployed to the existing Vercel production project and the custom-domain route returns the new four-section content with no browser console error or horizontal overflow.

## Completion evidence

- The article now has four sections, six pipeline steps, 1,321 string words, and a seven-minute estimate. It starts with the complete flow and contains no former incident heading ([review and verification](./reports/reviewer-260811-1456-concise-blog-rewrite.md)).
- Content validation, typecheck, lint, both Next.js build modes, Pages export validation, and `git diff --check` passed. Production browser checks confirmed one H1, four sections, responsive TOCs, no 375 px overflow, and empty console/page-error logs ([review and verification](./reports/reviewer-260811-1456-concise-blog-rewrite.md)).
- Vercel production deployment `dpl_944j7vrC5RFVPrxauvhqjavpUaCh` is ready at the custom-domain article URL; VI returns `200`, while EN and unknown article routes return `404` ([deployment report](./reports/deployment-2026-08-11-blog.md)).
- Existing release gates still emit `noindex, nofollow`. No commit, push, PR, rollback, or indexing change was authorized or performed.

## Open questions

None. The single-article, Vietnamese-only scope and English-home fallback are deliberate YAGNI decisions.
