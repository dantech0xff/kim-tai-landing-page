# Concise blog rewrite: review and verification

Date: 2026-08-11  
Verdict: PASS  
Production: <https://kimtai.dantech.academy/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/>

## Requested behavior

| Contract | Result | Evidence |
| --- | --- | --- |
| Direct source → database → mobile flow | PASS | Four sections cover architecture, source adapter, normalization/database, and Flutter API/cache in order. |
| No incident storytelling | PASS | First section is “Toàn bộ luồng trong một phút”; production HTML does not contain the former `9999` incident heading. |
| Teaches implementation technique | PASS | Includes adapter and `PriceTick` contracts, integer unit table, quality predicate, latest-view SQL, Flutter query, validation, and fallback order. |
| Concise | PASS | Content validator counts 1,321 string words and a seven-minute estimate; article has exactly four sections and six pipeline steps. |
| Existing public contracts preserved | PASS | VI route is `200`; EN and unknown article routes are `404`; canonical, `TechArticle`, VI/x-default discovery, release gate, and Pages base path remain intact. |

## Automated gates

| Gate | Result |
| --- | --- |
| `npm run validate:content` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| GitHub Pages-mode `npm run build` | PASS |
| `npm run validate:pages` | PASS |
| `git diff --check` | PASS |

## Production browser checks

- Vercel deployment `dpl_944j7vrC5RFVPrxauvhqjavpUaCh` is `READY` and aliased to the custom domain.
- Desktop at 1440 px: one H1, four article sections, four desktop TOC links, no horizontal overflow.
- Mobile at 375 px: one H1, four article sections, mobile TOC opens with four links, `scrollWidth` equals `clientWidth` at 375 px.
- Browser console and page-error logs were empty in light and dark checks.
- Current screenshots: [desktop light](./blog-desktop-light.png), [mobile light](./blog-mobile-light.png), [desktop dark](./blog-desktop-dark.png), and [mobile dark](./blog-mobile-dark.png).

## Review

Pre-Landing Review: No issues found.

- Article strings render as React text nodes; no new raw-HTML or client script surface exists.
- No credential value, private key, token, or ignored environment file is present in the pending changes.
- The route, renderer, CSS, metadata, sitemap, and static-export behavior are unchanged by the concise content correction.
- Docs impact: stateful plan and release evidence only. Evergreen route and deployment commands did not change.

## Unresolved questions

None.
