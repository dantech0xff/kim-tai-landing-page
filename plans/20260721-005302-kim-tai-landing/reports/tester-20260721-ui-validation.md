# Kim Tài UI Validation Report

Status: partial pass

## Test Results Overview

- `npm run validate:content`: pass.
- `npm run lint`: pass.
- `npm run build`: pass.
- `npm run typecheck`: pass on the second run after `npm run build`; the first pre-build run failed because `.next/types` had not been generated yet.
- Local HTTP smoke test against the running Next server: 8/8 localized routes returned `200`.
- Build output confirmed static generation for `/[locale]` and `/[locale]/[legal]`, total 10 prerendered pages.

## Coverage Metrics

- No code coverage report is configured in this repo, so line/branch/function coverage percentages were not available.
- Practical route coverage from the smoke test: `/vi`, `/en`, `/vi/terms-of-service`, `/vi/terms-and-conditions`, `/vi/privacy-policy`, `/en/terms-of-service`, `/en/terms-and-conditions`, `/en/privacy-policy`.

## Browser / Runtime Findings

- Live browser automation was blocked by the sandbox. Playwright Chromium failed to launch with `bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer... Permission denied (1100)`.
- Non-escalated loopback requests were also blocked by the sandbox with `connect EPERM 127.0.0.1:3000`.
- Because of that, these acceptance checks were not directly executed in a real browser here: theme toggle persistence, locale-preserving switches, focus and keyboard flow, reduced-motion behavior, console/runtime error observation, and 320/375/768/1024/1440 responsive inspection in-browser.

## Evidence From Source Review

- Theme persistence logic is present in `src/components/theme-toggle.tsx` via `localStorage`, the `dark` class toggle, and the custom theme-change event.
- Locale-preserving navigation is present in `src/components/site-header.tsx` through `alternateLocale` plus `routeSuffix`.
- Legal pages are wired in `src/components/legal-document-page.tsx` with the locale header, back link, table of contents, and external source links.
- The three screenshot assets are wired through `src/components/app-screenshot.tsx`.
- Reduced-motion support is implemented in `src/app/globals.css` with a `prefers-reduced-motion: reduce` block.

## Route Smoke Details

- `/vi` returned title `Kim Tài - Tick Vàng Online | Sổ vàng trong túi bạn` and exposed 3 `<img>` tags in the HTML.
- `/en` returned title `Kim Tài - Tick Vàng Online | Your gold book, in your pocket` and exposed 3 `<img>` tags in the HTML.
- All six legal routes returned `200` and rendered localized titles.
- Homepage HTML included the App Store and Google Play fallback links plus the three screenshot sources.

## Failed Tests / Issues

- `npm run typecheck` first pass failed because generated Next type files were missing: `.next/types/app/[locale]/[legal]/page.ts`, `.next/types/app/[locale]/page.ts`, `.next/types/cache-life.d.ts`, and `.next/types/validator.ts`. This was resolved by running `npm run build` first, then rerunning typecheck.
- Browser automation remains the main unresolved validation gap in this environment.

## Performance Metrics

- `next build --webpack` compiled successfully in about 1.5s, ran TypeScript in about 1.3s, and generated static pages in about 0.4s.
- `validate:content` and `lint` both completed quickly with no errors.

## Critical Issues

- No product code defect was confirmed in this run.
- Release-readiness warnings still exist in content validation: iOS and Android download links still use the official store-search fallback, and operator identity/contact fields are not release-ready.

## Recommendations

- Rerun the browser acceptance checks in a less restricted environment or CI job with working headless browser support.
- Keep the build-before-typecheck order in mind unless the repo’s Next type generation flow is changed.
- Replace store-search fallbacks with direct release URLs once the app IDs are available.
- Fill operator identity/contact fields before marking the legal content release-ready.

## Next Steps

1. Re-run live browser checks outside this sandbox.
2. Confirm theme toggle persistence, locale switching, and keyboard flow in a real browser.
3. Update download URLs and operator fields when release data is finalized.

Unresolved questions: none beyond the browser-tooling sandbox restriction.
