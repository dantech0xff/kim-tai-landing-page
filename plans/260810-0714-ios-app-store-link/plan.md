---
title: "Enable verified iOS App Store link"
description: "Publish the verified Kim Tài iOS listing through the existing download configuration."
status: completed
priority: P2
effort: 30m
branch: main
tags: [ios, app-store, content-config]
created: 2026-08-10
---

# Enable verified iOS App Store link

## Outcome

Enable every existing iOS download CTA with the verified App Store listing while preserving preview/release state and all public contracts.

## Scope

Change only these `downloads.ios` fields in `src/content/site.json`:

- `appStoreId`: `"6798353852"`
- `directUrl`: `"https://apps.apple.com/vn/app/kim-t%C3%A0i-gi%C3%A1-v%C3%A0ng-online/id6798353852"`
- `published`: `true`

Update the localized `platforms` and `pricing` FAQ answers in VI/EN so visible content and FAQPage structured data identify both Google Play and the App Store.

Update the VI/EN download descriptions so they describe the verified App Store and Google Play links instead of incorrectly tying CTA activation to the full-site release gate.

Update `README.md` and `docs/deployment.md` so evergreen release guidance separates published store CTAs from the full-site preview/indexing gate.

Do not change Android configuration, `release.ready`, operator data, product naming, application logic, badges, or configuration shape.

## Phase

| Phase | Status | Progress |
| --- | --- | --- |
| [Configure and verify](phase-01-configure-and-verify.md) | Completed | 100% |

## Dependencies

- Apple listing verified live with HTTP 200 and no redirect on 2026-08-10.
- Canonical listing ID: `6798353852`.
- Existing URL validation, CTA rendering, and structured-data paths remain unchanged.

## Acceptance criteria

- Content validator accepts the iOS identity and URL.
- `getPublishedDownloadUrl("ios")` resolves to the verified URL.
- Hero and download-section iOS CTAs are active on `/vi/` and `/en/`.
- VI/EN platform and pricing FAQs consistently mention Google Play and the App Store in both visible content and FAQPage structured data.
- VI/EN download descriptions match the active verified store CTAs.
- Evergreen README/deployment guidance matches the independent CTA and preview/indexing gates.
- MobileApplication structured data reports iOS support automatically.
- `npm run validate:content`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- Review confirms no unrelated changes, regressions, or public-contract changes.
