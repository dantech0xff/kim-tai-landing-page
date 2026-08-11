---
phase: 1
title: "Search content and entity consistency"
status: completed
---

# Phase 1: Search content and entity consistency

## Context

The iOS listing was published after the first SEO implementation. UI content was updated, but `public/llms.txt` still describes Android only and MobileApplication structured data exposes only the Google Play install URL.

## Files

- Modify `src/content/site.json`
- Modify `src/app/[locale]/layout.tsx`
- Modify `src/lib/structured-data.ts`
- Modify `public/llms.txt`
- Modify SEO validators that own these contracts

## Steps

1. Improve landing title/H1 wording with natural VI/EN product-category terms while preserving factual claims.
2. Add Googlebot large-image and unlimited snippet preview directives without changing indexability.
3. Model all published store listing URLs in MobileApplication structured data.
4. Reconcile `llms.txt` with current Android and iOS availability.

## Validation

- Verify title lengths, rendered H1 count, robots metadata, structured data values, and static AI-search copy.

## Risks and rollback

- Search-copy changes can affect conversion tone; keep the current benefit-led message and limit edits to title/H1 wording.
- Remove added schema properties if Rich Results validation rejects them; never add ratings without real visible evidence.
