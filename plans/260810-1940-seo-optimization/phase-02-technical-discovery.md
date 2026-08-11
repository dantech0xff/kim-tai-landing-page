---
phase: 2
title: "Technical discovery and 404 UX"
status: completed
---

# Phase 2: Technical discovery and 404 UX

## Context

The sitemap lists all canonical pages but not the original app screenshots. Unmatched production routes return the framework-default 404 with `noindex` but no branded recovery links.

## Files

- Modify `src/app/sitemap.ts`
- Create `src/app/global-not-found.tsx`
- Modify `next.config.ts`
- Modify `scripts/validate-pages-export.mjs`

## Steps

1. Add original app screenshot URLs to only the localized landing sitemap entries.
2. Enable Next.js global 404 handling for the top-level dynamic locale layout.
3. Add a lightweight bilingual branded 404 with base-path-safe links to `/vi/` and `/en/`.
4. Extend static-export validation for image sitemap entries and the custom 404 contract.

## Validation

- Verify sitemap image namespace/URLs, 404 HTTP status, `noindex`, localized recovery links, and both Vercel/GitHub Pages builds.

## Risks and rollback

- `globalNotFound` is experimental in Next.js 16; both build modes must pass. Roll back the flag and component together if either target fails.
