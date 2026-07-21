# Browser smoke — 2026-07-21

Status: PASS — 91 checks passed, 0 failed.

## Run

- Final rerun: 2026-07-21 02:10 +08.
- Command: `SMOKE_SCREENSHOT_DIR=<Codex visualization directory> node scripts/browser-smoke.mjs`.
- Exit: `0`.
- Browser: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, version 150.0.7871.127.
- Runtime: Node.js v22.21.0. No browser-test dependency used.
- Target: `http://127.0.0.1:3100`.
- CDP: dynamic loopback debugging port; viewport configured with `Emulation.setDeviceMetricsOverride`.
- Mobile: 390 × 844 CSS px, device scale factor 3, mobile mode, touch enabled with 5 touch points. Chrome reported both `documentElement.clientWidth` and `visualViewport.width` as 390.
- Desktop: 1440 × 1000 CSS px, device scale factor 1, desktop mode, touch disabled.

## Acceptance results

| Check | Result | Exact evidence |
| --- | --- | --- |
| VI and EN routes | PASS | `/vi` and `/en` main-document responses were HTTP 200. |
| Initial light state | PASS | No saved preference + emulated light produced no `.dark` class, `color-scheme: light`, `aria-pressed=false`; canvas contrast 13.54:1. |
| Initial dark state | PASS | No saved preference + emulated dark produced `.dark`, `color-scheme: dark`, `aria-pressed=true`; canvas contrast 16.46:1. |
| Toggle and persistence | PASS | Toggle stored `kim-tai-theme=dark`; reload under emulated light remained dark. Toggle stored `light`; reload under emulated dark remained light. |
| Locale switch | PASS | VI exposed `/en` + `hreflang=en`; EN exposed `/vi` + `hreflang=vi`. HTML languages were `vi-VN` and `en`. |
| 390 px viewport | PASS | Client/visual viewport 390, height 844, DPR 3, 5 touch points. |
| 1440 px viewport | PASS | Client/visual viewport 1440, height 1000, DPR 1, 0 touch points. |
| No horizontal overflow | PASS | Mobile client/body/root widths were all 390 with `attemptedScrollX=0`. Desktop client/body/root widths were all 1440 with `attemptedScrollX=0`. |
| H1 and landmarks | PASS | Each checked page had exactly one `h1`, `header`, `main`, and `footer`; at least one `nav`; main id was `main-content`. |
| Controls at least 44 × 44 | PASS | Zero undersized targets among 14 rendered mobile controls and 17 rendered desktop controls. |
| Accessible control names | PASS | All 14 mobile and 17 desktop rendered controls had an accessible text/label source. |
| Keyboard focus | PASS | First Tab focused `.skip-link` at `#main-content`; computed focus treatment was a solid 3 px outline plus a 7 px box-shadow halo, and the link moved into the viewport. |
| Dark gold surfaces | PASS | After a 600 ms theme settle and another 500 ms before capture, `.brand-glyph` and `.primary-button` were visible at opacity 1 with foreground `rgb(16, 42, 36)`. The glyph exposed two SVG paths with the same computed fill; the CTA exposed inner text `Tìm bản phát hành`. |
| Dark mint contrast | PASS | Mint card foreground `rgb(250, 242, 230)` on `rgb(18, 61, 53)` measured 10.84:1. |
| Unpublished store states | PASS | Both store surfaces on every checked page were noninteractive `div` elements with `aria-disabled=true`, no `href`, and `tabIndex=-1`. |
| Preview indexing | PASS | Robots metadata was `noindex, nofollow`. |
| Web manifest | PASS | `/manifest.webmanifest` returned HTTP 200 with the expected name, short name, `/vi` start URL, standalone display mode, colors, and SVG icon. |
| Three product screenshots rendered | PASS | Exactly three `.app-screenshot img` elements per page; every image was complete, had positive natural/rendered dimensions, and its optimized AVIF response was HTTP 200. |
| No visible structural borders | PASS | Computed border scan found zero rendered elements with nonzero, nontransparent structural borders. |
| Runtime and network health | PASS | No console warnings/errors, runtime exceptions, hydration errors, failed requests, or failing image responses. |

## Regression closure

- The former desktop 68 px horizontal scroll is gone: scroll width now equals client width at both emulated widths.
- The former 40 px-wide header brand, 20 px-high footer brand, and 35.19 px-high footer links no longer appear in the undersized-target scan.
- The initially blank foregrounds in an early dark screenshot were a capture timing artifact, not a product defect. DOM inspection showed correct foreground styles and content; the final capture after the explicit settle shows both the brand tick and primary CTA content.
- The production-only release safeguards also passed: inert unpublished-store states, preview `noindex`, and a valid manifest response.

## Screenshot evidence

All captures are real Chrome viewport screenshots created through `Page.captureScreenshot`.

- VI mobile light: `/Users/dan/.codex/visualizations/2026/07/20/019f806b-70fd-7b72-91e2-e8a0b11b2fc6/kim-tai-vi-mobile-light.png`; 1170 × 2532 px; 557,565 bytes; SHA-256 `a2477b99651be1eaf087006ed2dd6c5f766e6276b1cab8f506a5dad7c329e378`.
- VI mobile dark: `/Users/dan/.codex/visualizations/2026/07/20/019f806b-70fd-7b72-91e2-e8a0b11b2fc6/kim-tai-vi-mobile-dark.png`; 1170 × 2532 px; 603,351 bytes; SHA-256 `914e62b8866e7708e52d0567509f49134c6e0d2be7b4f137fa9ab1b9a866c6e7`.
- EN desktop light: `/Users/dan/.codex/visualizations/2026/07/20/019f806b-70fd-7b72-91e2-e8a0b11b2fc6/kim-tai-en-desktop-light.png`; 1440 × 1000 px; 273,657 bytes; SHA-256 `30697dbc7cdccab0a80cbbdfadd1cbbdd7550ced5919df43da857ca38f0d0157`.

## Reproduction

Keep the site running on port 3100, then run:

```bash
node scripts/browser-smoke.mjs
```

The portable default screenshot destination is the `kim-tai-browser-smoke` subdirectory of Node's `os.tmpdir()`; no user/session path is hardcoded in the runner. Optional overrides: `SMOKE_BASE_URL`, `CHROME_PATH`, and `SMOKE_SCREENSHOT_DIR`.

Unresolved questions: none.

Status: DONE

Summary: Dependency-free Chrome CDP regression and three refreshed screenshot artifacts completed; all 91 checks passed.

Concerns/Blockers: None.
