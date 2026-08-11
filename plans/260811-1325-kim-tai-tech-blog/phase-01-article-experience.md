---
phase: 1
title: "Article content and reading experience"
status: completed
---

# Phase 01: Article content and reading experience

## Context

- Source article: `/Users/dan/.codex/attachments/a3fe8212-2267-4f0b-81fd-4fb889122b4c/pasted-text.txt`
- Existing long-form precedent: `src/components/legal-document-page.tsx`
- Existing design contract: `plans/20260721-005302-kim-tai-landing/reports/design-direction.md`

## Requirements

- Rewrite rather than transplant the supplied prose.
- Lead with the complete three-stage data flow: source, normalized database record, mobile read contract.
- Keep the article short and instructional. Omit incident storytelling, world-gold details, rollout history, provider counts, and extended operations material.
- Use JSON-owned content and a typed renderer so long-form copy stays separate from layout code.
- Keep visible copy free of unsupported claims, broken source links, fake live state, and provider-partnership implications.
- Use the existing brand palette/type and a single pipeline-spine motif; preserve responsive, dark-mode, reduced-motion, and keyboard behavior.

## Files

- Create `src/content/blog.vi.json`.
- Create `src/components/tech-blog-article.tsx`.
- Create `src/app/[locale]/blog/[slug]/page.tsx`.
- Modify `src/lib/content.ts` and `src/app/globals.css`.

## Implementation

1. Keep the supported slug, dates, metadata, hero, table of contents, and typed rich-block renderer.
2. In the child route, emit the complete supported `{ locale: "vi", slug }` tuple from `generateStaticParams` and set `dynamicParams = false`. Validate that pair again in metadata and page rendering, calling `notFound()` for every unsupported combination.
3. Author four focused Vietnamese sections: architecture overview, server fetch and adapter, normalization/database/public view, and Flutter API/cache flow.
4. Render semantic HTML with accessible labels, scrollable code/table surfaces, inline-code support, and no client-side article runtime.
5. Add editorial hero, sticky table of contents, readable prose measure, pipeline visual, callouts, and responsive rules using existing tokens.

## Validation

- Static route generation emits exactly the supported Vietnamese slug; English and unknown locale/slug pairs return 404 and have no generated artifact.
- One H1, exactly four article sections, sequential headings, unique section IDs, no horizontal page overflow at 375 px, and readable dark/light contrast.
- No visible em dash, banned marketing phrase, invented metric, secret, or broken relative source link in new article copy.

## Completion evidence

- The published source contains exactly four sections in the requested order and a seven-minute estimate. The opening section is “Toàn bộ luồng trong một phút”; the prior incident narrative is absent.
- Desktop and mobile screenshots confirm the existing editorial design remains readable in light and dark modes with the shorter content. At 375 px, the page has no horizontal overflow and the mobile TOC exposes four links.
- Evidence: [review and verification](./reports/reviewer-260811-1456-concise-blog-rewrite.md) and [production deployment](./reports/deployment-2026-08-11-blog.md).

## Risks and rollback

- Long JSON content can drift from its renderer; content validation in Phase 03 owns the schema boundary.
- If static generation changes in a future Next.js release, keep the explicit full tuple and re-verify both Vercel and Pages artifacts before changing route shape.
- Rollback is removal of the route/content/component/CSS slice; existing landing/legal routes remain unchanged.
