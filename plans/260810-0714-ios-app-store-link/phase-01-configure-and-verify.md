# Phase 01 — Configure and verify

## Context links

- [Parent plan](plan.md)
- `README.md`
- `src/content/site.json`
- `src/lib/store-url.ts`
- `src/lib/content.ts`
- `src/components/store-buttons.tsx`
- `src/lib/structured-data.ts`
- `scripts/validate-content.mjs`
- `package.json`

## Overview

- Date: 2026-08-10
- Description: Publish the verified iOS listing through existing configuration.
- Priority: P2
- Implementation status: Completed
- Review status: Completed

## Key insights

- `getPublishedDownloadUrl` already verifies HTTPS, Apple host, numeric ID, and listing-path identity.
- `StoreButtons` uses that helper for both hero and download placements across VI/EN.
- Publishing iOS automatically changes MobileApplication `operatingSystem` to `"Android, iOS"`.
- Structured-data `installUrl` remains Android under the current contract; no logic change is in scope.
- `release.ready=false` preserves preview/noindex behavior and does not prevent an individually published CTA.

## Requirements

- Set `downloads.ios.appStoreId` to `"6798353852"`.
- Set `downloads.ios.directUrl` to the verified canonical URL.
- Set `downloads.ios.published` to `true`.
- Update the VI/EN `platforms` and `pricing` FAQ answers to mention both Google Play and the App Store.
- Update the VI/EN download descriptions to match the active verified store links.
- Update only the stale release-gate claims in `README.md` and `docs/deployment.md`.
- Preserve every other source field and file.

## Architecture

`site.json` → content validation and `siteConfig` → `getPublishedDownloadUrl("ios")` → existing VI/EN CTA anchors.

The same `published` flag flows into MobileApplication structured data, adding iOS to `operatingSystem`.

## Related code files

- Modify: `src/content/site.json`
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Verify only: `src/lib/store-url.ts`
- Verify only: `src/lib/content.ts`
- Verify only: `src/components/store-buttons.tsx`
- Verify only: `src/lib/structured-data.ts`
- Verify only: `scripts/validate-content.mjs`
- Verify only: `package.json`

## Implementation steps

1. Confirm the working tree remains clean before editing.
2. Update only the three specified `downloads.ios` values.
3. Update only the four approved localized FAQ answers for platform availability and pricing.
4. Update only the two approved localized download descriptions.
5. Update only the stale CTA/release-gate guidance in `README.md` and `docs/deployment.md`.
6. Review the diff to exclude Android configuration, release, operator, branding, logic, and schema changes.
7. Run `npm run validate:content`; preview-mode warnings remain expected while `release.ready` is false.
8. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
9. Smoke-check `/vi/` and `/en/`: both hero and download-section iOS badges render as active anchors with the exact verified URL.
10. Confirm the visible FAQs and FAQPage JSON-LD consistently mention both stores.
11. Confirm the download descriptions match the active verified store links.
12. Confirm MobileApplication JSON-LD reports `"Android, iOS"`.
13. Review the final diff and validation output for regressions or public-contract changes.

## Todo list

- [x] Update the three iOS configuration fields.
- [x] Update the four localized platform and pricing FAQ answers.
- [x] Update the two localized download descriptions.
- [x] Synchronize README and deployment release-gate guidance.
- [x] Confirm exact getter/CTA URL.
- [x] Confirm four active iOS CTA surfaces: two placements × two locales.
- [x] Confirm visible FAQ and FAQPage JSON-LD consistency.
- [x] Confirm visible download-description consistency.
- [x] Confirm structured-data operating-system update.
- [x] Pass all four quality commands.
- [x] Complete scoped code review.

## Success criteria

- Exact App Store URL returned and rendered without redirect substitution.
- iOS CTAs no longer use disabled/coming-soon markup.
- Android and preview/noindex behavior remain unchanged.
- All required checks pass.
- Final implementation diff contains only the intended `site.json`, `README.md`, and `docs/deployment.md` changes.

## Risk assessment

- Low: configuration-only change.
- Primary risk: URL/ID mismatch disables the CTA; existing validator and helper reject it.
- Scope-drift risk: accidentally enabling full release or changing identity; prevent with final diff review.

## Security considerations

- Retain HTTPS and exact `apps.apple.com` host enforcement.
- Retain identity binding between URL path and App Store ID.
- Add no credentials, tracking parameters, redirects, or unverified hosts.

## Next steps

After successful validation and review, hand off the scoped configuration and documentation changes. No commit, PR, release-readiness, or indexing work is included.
