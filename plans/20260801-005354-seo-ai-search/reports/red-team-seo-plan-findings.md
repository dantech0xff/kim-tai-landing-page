# Red-Team Findings — SEO & AI Search Plan (20260801-005354)

Method: all claims verified against source, an actual GitHub Pages export build (`out/`), a `tsc` type probe against installed `next@16.2.10`, a React 19 render test, and nextjs.org docs (v16.2.12). Findings that did not survive verification are excluded (see "Checked and fine").

## Findings

### 1. BLOCKER — `trailingSlash: true` on Vercel breaks `scripts/browser-smoke.mjs`; no phase updates it
- Plan: `phase-01-metadata-foundation.md` §Implementation Steps step 1 + §Related Code Files (browser-smoke absent); `phase-04-validation-and-docs.md` step 2 explicitly runs `start` + `scripts/browser-smoke.mjs`.
- Evidence: `scripts/browser-smoke.mjs:56` — `localePath(locale)` yields `/vi` (no trailing slash) when `SMOKE_BASE_PATH` is empty (the Vercel/`next start` mode). Dependent assertions that will go red once Vercel serves `/vi/`:
  - `browser-smoke.mjs:1070-1074` — default-locale redirect expects final `location.pathname === "/vi"`.
  - `browser-smoke.mjs:725` — `route pathname` check per page.
  - `browser-smoke.mjs:727` — `locale switch href` expects `/en`; verified in the export build that with `trailingSlash: true` next/link renders internal anchors WITH trailing slash (`out/vi/index.html` anchors: `/kim-tai-landing-page/en/`, `/kim-tai-landing-page/vi/privacy-policy/`), so rendered href will be `/en/`.
  - `browser-smoke.mjs:863-872` — document response looked up by pathname `/vi` will be the 308, failing `document HTTP 200`.
- Impact: Phase 4 quality gate is guaranteed red; the break is latent from Phase 1 onward. No phase lists `scripts/browser-smoke.mjs` under Related Code Files.
- Fix: add `scripts/browser-smoke.mjs` to Phase 1 Related Code Files; make `localePath` emit trailing slash unconditionally (align with `metadataLocalePath`) in the same commit as the `next.config.ts` change.

### 2. MAJOR — Keeping `redirects()` destination `/vi` creates a redirect chain after `trailingSlash: true`
- Plan: `phase-01-metadata-foundation.md:57` — "thêm `trailingSlash: true` vào nhánh Vercel (giữ nguyên `redirects` `/` → `/vi`)".
- Evidence: `next.config.ts:34-42` — destination is `/vi` (no slash). With `trailingSlash: true`, Next 308-redirects `/vi` → `/vi/`, so root becomes `/` →307→ `/vi` →308→ `/vi/`. Contradicts the plan's own goal (plan.md acceptance: "canonical không trỏ vào URL redirect" / clean crawl paths).
- Fix: change destination to `/vi/` in the same Phase 1 step. Keep `permanent: false` (deliberate pre-release choice).

### 3. MAJOR — Phase 1 legal-page `openGraph` wipes inherited og:image/og:locale/og:siteName (Next shallow merge)
- Plan: `phase-01-metadata-foundation.md:64` (step 4) adds to `src/app/[locale]/[legal]/page.tsx`: `openGraph: { url, title, description }` — no `images`.
- Evidence: Next docs (generate-metadata §Merging, v16.2.12): "nested fields such as `openGraph` ... defined in an earlier segment are **overwritten** by the last segment to define them" — page-level `openGraph` replaces the layout's entirely. Layout is where images/locale/siteName are added (`phase-01:62`; current layout openGraph at `src/app/[locale]/layout.tsx:81-87`).
- Impact: legal pages lose og:image/og:locale/og:siteName/og:type → Phase 1 Success Criterion "Mọi trang có og:title/description/url/image" fails, and the Phase 4 validator assert (phase-04:28, og:image on every page) goes red on 6 of 8 pages.
- Fix: shared OG builder (Next docs' shared-metadata pattern): legal page spreads `images`, `locale`, `siteName`, `type` plus per-page url/title/description. (`twitter` is safe — legal page does not define it, so it inherits.)

### 4. MAJOR — False data claim: `document.version` is "1.0", not an ISO date; sitemap `lastModified` primary source is dead code
- Plan: `phase-02-search-infrastructure.md:38` — "Trang pháp lý dùng `document.version` (ISO date trong legal.*.json) làm `lastModified` nếu hợp lệ".
- Evidence: verified `src/content/legal.vi.json` and `legal.en.json`: all six `documents.*.version === "1.0"`. Interface `src/lib/content.ts:41` types it as plain `string`. The "nếu hợp lệ" guard will always fail → fallback `release.lastUpdated` always used; the conditional is permanently-dead code and the plan's stated behavior (per-document lastModified) never happens.
- Fix: drop the `document.version` branch and use `siteConfig.release.lastUpdated` for all 8 URLs, or add a real `lastUpdatedDate` ISO field to legal documents (and validate it in `validate-content.mjs`).

### 5. MAJOR — Internal contradiction: MobileApplication without `offers`/`aggregateRating` (Phase 2) vs "Rich Results Test — không lỗi" (Phase 4)
- Plan: `phase-02-search-infrastructure.md:59` — "KHÔNG có `offers` ... và KHÔNG có `aggregateRating`" (correct per no-fake-data rule); `phase-02:95` and `phase-04-validation-and-docs.md:49` — "JSON-LD qua Google Rich Results Test ... — không lỗi".
- Evidence: Google's Software App structured data (SoftwareApplication/MobileApplication) requires `offers.price` and `aggregateRating`/`review` for rich-result eligibility; Rich Results Test reports missing required fields as errors on the detected item. With both omitted, the "không lỗi" criterion is unachievable for this schema.
- Fix: either (a) after resolving plan Open question 3, add a truthful `offers` with the download price (Google's guidance for apps with IAP: use the base-app price, i.e. 0 for free download) — `aggregateRating` still stays out until real data exists, so amend the criterion to "no errors other than documented missing aggregateRating"; or (b) amend Phase 4 criterion to "JSON parses + validator.schema.org clean; Google rich-result eligibility explicitly not targeted". Do not resolve by inventing rating data.

### 6. MINOR — `env` clobber trap in `next.config.ts` GitHub Pages branch
- Plan: `phase-01-metadata-foundation.md:46,57` — "đặt `NEXT_PUBLIC_CANONICAL_ORIGIN` trong `env` của nhánh GitHub Pages".
- Evidence: `next.config.ts:12-17,19-28` — the GH Pages branch is `{ ...sharedConfig, ... }`; adding a sibling `env:` key after the spread replaces `sharedConfig.env` entirely, silently dropping `NEXT_PUBLIC_BASE_PATH`/`NEXT_PUBLIC_SITE_ORIGIN` → basePath helpers break and `validate:pages` fails for non-obvious reasons.
- Fix: spec the exact shape in the phase file: `env: { ...sharedConfig.env, NEXT_PUBLIC_CANONICAL_ORIGIN: ... }`.

### 7. MINOR — `isMirrorDeployment` strict string compare can silently keep Vercel prod `noindex` after release
- Plan: `phase-01-metadata-foundation.md:31-33` — `isMirrorDeployment = canonicalOrigin !== siteOrigin`.
- Evidence: any future setting of `NEXT_PUBLIC_CANONICAL_ORIGIN` on Vercel (a var Phase 4 documents in `docs/deployment.md`) with a trailing slash or case difference vs `SITE_ORIGIN` makes the comparison true → `robots.index` stays false on production with release flags on. Failure is silent (no build error).
- Fix: compare `new URL(x).origin` values; state in docs that the var must remain unset on Vercel. The Phase 4 runbook's post-deploy `curl` noindex check partially mitigates — keep it.

### 8. MINOR — Docs contradict shipped behavior between Phase 1 and Phase 4
- Plan: doc updates deferred to `phase-04-validation-and-docs.md:39-40`; Phases 1-3 each ship to `main`, which auto-deploys both targets.
- Evidence: `docs/deployment.md:101` — "Bản GitHub Pages vẫn dùng origin `github.io`" becomes false at Phase 1; `README.md:88` — mirror noindex described as gate-dependent becomes false at Phase 1 (mirror = always noindex). Interim state violates the repo's own doc-accuracy rule ("dates, links, and claims match the actual change").
- Fix: move the two-line corrections of `docs/deployment.md` §GitHub Pages/§Trước khi phát hành and `README.md:88` into Phase 1; keep the full SEO section + runbook in Phase 4.

### 9. MINOR — Lighthouse SEO "mục tiêu ≥ 95" unreachable pre-release
- Plan: `phase-04-validation-and-docs.md:50`.
- Evidence: with `noindex` (release gate off), Lighthouse's `is-crawlable` audit fails, capping the SEO category far below 95. The phase acknowledges the deduction yet keeps ≥95 as the target — self-contradictory success criterion an executor cannot satisfy honestly.
- Fix: criterion "all SEO audits pass except is-crawlable (expected while noindex); record score"; move the ≥95 target into the post-release runbook.

### 10. MINOR — FAQ draft #4 asserts app behavior no repo fact can verify
- Plan: `phase-03-ai-search-optimization.md:28` — "Giá ... luôn kèm nguồn và thời điểm cập nhật".
- Evidence: `site.json` `productFacts` has no field about price sourcing/timestamps (only `holdingsStoredOnDevice`, `websiteAnalyticsEnabled`, etc.). Phase 3's own mitigation ("đối chiếu `productFacts`") cannot cover this sentence; "luôn" is an absolute claim about the app UI.
- Fix: verify against the actual app before release, or soften ("kèm nguồn tham khảo"), or add a `productFacts` flag so the parity validator has something to check.

### 11. MINOR — Organization.name = `operator.publicName` conflates publisher and product entities
- Plan: `phase-02-search-infrastructure.md:57,59`.
- Evidence: `site.json` `operator.publicName` = "Kim Tài - Tick Vàng Online" = `brand.productName`; MobileApplication.name will be identical to Organization.name, while `brand.name` ("Kim Tài") is already the og siteName (`layout.tsx:85`). Not a legal problem (README:74 establishes publicName as the public identity; schema.org does not require legalName), but identical names weaken the entity separation the GEO phase relies on.
- Fix: use `brand.name` for Organization.name; add `legalName` when `operator.configured` flips.

### 12. MINOR — Phase 2 step 6 verifies `out/robots.txt` "on both variants"; only the export variant produces `out/`
- Plan: `phase-02-search-infrastructure.md:81`.
- Evidence: `next.config.ts:19-28` — `output: "export"` only in the GH Pages branch; the Vercel-variant build emits `.next/`, no `out/`. As written, the step cannot verify the deployment that actually serves robots/sitemap at domain root.
- Fix: export variant → check `out/robots.txt` + `out/sitemap.xml`; Vercel variant → `next start` + `curl localhost/robots.txt /sitemap.xml`.

## Checked and fine (verified, excluded as findings)
- `app/robots.ts`/`app/sitemap.ts` + `force-static` work under `output: "export"` on Next 16.2.10/`--webpack`: same metadata-route pipeline as existing `src/app/manifest.ts`, which emits `out/manifest.webmanifest` (empirical build).
- `x-default` key: compiles in both `Metadata.alternates.languages` and `MetadataRoute.Sitemap[].alternates.languages`, string `lastModified`, `openGraph.alternateLocale` — tsc probe against installed next types passed.
- Validator string style survives: actual export renders `<link rel="alternate" hrefLang="vi" .../>` (camelCase, self-closing) — matches `validate-pages-export.mjs:124-139` pattern and Phase 1's plan to keep it.
- Internal links do NOT need manual trailing-slash edits: next/link normalizes rendered hrefs when `trailingSlash: true` (verified in export HTML).
- metadataBase vs absolute canonical described correctly: "If a metadata field provides an absolute URL, metadataBase will be ignored" (Next docs) — Phase 1's split (og:image relative→serving origin, canonical absolute→canonical origin) is sound.
- Mirror-noindex breaks no existing un-updated assertion: `validate-pages-export.mjs` has no robots-meta assert today; manifest/asset/operator checks are untouched by the metadata changes; the asset-path regex (line 106) only matches hrefs starting with `/`, so absolute `https://` canonical/hreflang URLs are invisible to it.
- Release-gate: on Vercel with the var unset, `canonicalOrigin === siteOrigin` → `isMirrorDeployment=false` → index follows the existing gate (finding 7 covers the only silent-noindex path).
- Sitemap math consistent: 8 URLs (2 home + 6 legal) across plan.md, phase-02, phase-04; x-default → `/vi/` consistent across all five files; OG image filenames consistent.
- `public/index.html` root redirect + `validate:pages` root/manifest asserts unaffected (mirror already trailing-slash; manifest `start_url` already `/vi/`).

## Note
Verification required running the GH Pages variant build; `out/` and `.next/` were regenerated locally (gitignored artifacts, no source changes).
