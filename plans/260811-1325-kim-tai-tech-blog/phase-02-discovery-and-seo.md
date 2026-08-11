---
phase: 2
title: "Discovery, metadata, and machine-readable contracts"
status: completed
---

# Phase 02: Discovery, metadata, and machine-readable contracts

## Context

- Metadata helpers: `src/lib/seo-metadata.ts`
- Structured-data builders: `src/lib/structured-data.ts`
- Sitemap owner: `src/app/sitemap.ts`
- Discovery surfaces: `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `public/llms.txt`

## Requirements

- Make the Vietnamese article discoverable without creating or advertising an English translation.
- Keep canonical URLs on the production origin and assets on the active deployment/base path.
- Inherit the existing release/mirror `noindex` gate.
- Represent article facts exactly from the JSON content source.

## Files

- Modify `src/content/site.json` for localized navigation labels only if required.
- Modify `src/components/site-header.tsx` and `src/components/site-footer.tsx`.
- Modify `src/lib/seo-metadata.ts`, `src/lib/structured-data.ts`, and `src/app/sitemap.ts`.
- Modify `public/llms.txt`.

## Implementation

1. Add a Vietnamese-only article link to desktop navigation and footer product links. Give `SiteHeader` an explicit internal language-target override so the article switch resolves to `/en/` through Next's active base path instead of synthesizing an English article URL.
2. Give the article an absolute child title, description, canonical, VI/x-default alternates, article Open Graph metadata, and matching Twitter metadata.
3. Add `TechArticle` and two-level breadcrumb JSON-LD using the brand Organization as author/publisher.
4. Add one Vietnamese sitemap entry with article dates and no nonexistent English alternate.
5. Add the canonical article URL to `llms.txt`.

## Validation

- No `/en/blog/...` route or hreflang is emitted.
- The article language control links to the base-path-aware English home, never to `/en/blog/...`.
- Navigation works under both root and GitHub Pages base paths.
- JSON-LD parses, contains no rating, and matches visible title/description/dates.
- Existing landing and legal metadata/schema remain unchanged.

## Completion evidence

- Root and Pages evidence confirmed the VI-only canonical/sitemap/schema contract, VI plus `x-default` alternates, base-path-aware `/en/` fallback, and no English article artifact or URL ([route audit](./reports/debugger-2026-08-11-blog.md)).
- Final review found no metadata, schema, discovery, base-path, release-gate, or existing-route regression ([final review](./reports/reviewer-2026-08-11-blog.md)).

## Risks and rollback

- Metadata objects merge shallowly; article Open Graph and Twitter must be emitted together.
- A generic sitemap suffix would create an invalid English route; keep the article entry separate.
- Rollback removes only article discovery/schema/sitemap additions.
