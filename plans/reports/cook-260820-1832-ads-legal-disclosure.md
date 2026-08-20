# Cook Complete: Ads and advertising-ID legal disclosure

## Summary

| Metric | Result |
| --- | --- |
| Scope | Legal content update (VI + EN) for in-app advertising |
| Tracked files | 3 (`legal.vi.json`, `legal.en.json`, `site.json`) |
| New sections | 2 per locale (privacy §6, ToS §4) |
| New sources | 3 per locale |
| Gates | validate:content, typecheck, lint, build, validate:pages, browser-smoke — all pass |
| Code/logic changes | None |

## What changed

### Privacy Policy (v1.0 → v1.1)

- §2 data categories: website still ad-free; App shows ads. New data category: device advertising identifier (Android Advertising ID / iOS IDFA) plus minimum delivery data (IP, device type, OS, language, approximate region, impression/click events, anti-fraud signals).
- §3 purposes: ad delivery + measurement + fraud prevention; personalization only when the identifier is shared.
- §4 legal basis: personalized ads rest on consent; refusal/withdrawal at OS level; App stays fully functional; refusal never a condition for functions that do not need the data.
- **§6 new — in-app advertising and the advertising identifier**: Google AdMob named; portfolio data explicitly not used for ad targeting; personalized vs default non-personalized behavior; per-OS opt-out paths (Android Settings → Google → Ads; iOS Settings → Privacy & Security → Tracking); reset/delete caveat; no endorsement of ad content.
- §7 recipients: Google AdMob added as an ad-delivery recipient.
- §8 cross-border: ad delivery may process data on Google infrastructure outside Vietnam; recipient, purpose, and the operator's transfer-documentation duty (Law 91/2025/QH15, Decree 356/2025/ND-CP) stated. Non-ad flows still unconfirmed.
- §9 retention: ad identifier retained by the ad platform; user can reset/delete anytime.
- §11 children: ads not targeted at children; no knowing use of children's data for personalized ads.

### Terms of Service (v1.1 → v1.2)

- §3 service: App is free and ad-supported.
- **§4 new — in-app advertising**: AdMob; personalized when the identifier is shared, default non-personalized otherwise; refusal is not a condition of use; advertiser responsibility, not investment advice, direct advertiser relationship, ad-format changes notified under §8.
- §7 permitted use: new prohibition on interfering with, blocking, spoofing, or faking ad impressions/clicks.

### Terms and Conditions (v1.0 → v1.1)

- §1 scope: website shows no advertising; the App does, governed by ToS + Privacy Policy.

### site.json

- `productFacts.appAdvertisingEnabled: true`, `productFacts.appAdsPersonalizationRequiresConsent: true`.
- `release.lastUpdated`: 2026-08-08 → 2026-08-20.

### New legal sources (VI + EN)

| id | URL |
| --- | --- |
| `google-partner-sites` | https://policies.google.com/technologies/partner-sites |
| `google-advertising-id` | https://support.google.com/googleplay/answer/3405269 |
| `apple-tracking-choice` | https://support.apple.com/vi-vn/102420 (VI) · /en-us/102420 (EN) |

All three URLs verified live (HTTP 200) before being written.

## Verification

- `validate:content`: pass (only the pre-existing preview-mode warning).
- `typecheck`, `lint`: exit 0.
- `build`: 14 static pages.
- GitHub Pages export (`GITHUB_PAGES=true` build + `validate:pages`): pass for `/kim-tai-landing-page`.
- `browser-smoke` against `next start -p 3100`: 181/181 passed; server stopped, port freed.
- Rendered HTML checked: section renumbering correct in both locales, `#advertising` anchor + TOC link present, `{{supportContact}}` interpolated (no token leak), new sources rendered.

## Fixes made during implementation

Renderer emits all `paragraphs` before `items`. First draft put a closing paragraph after the "…in your device settings:" lead-in, which split the lead-in from its bullet list. Reordered both new sections so the lead-in is the last paragraph.

## Documentation impact

None required. `README.md` documents the legal-content file contract, which is unchanged; `docs/deployment.md` is unaffected. No public code contract touched.

## Known limitations

- Ad network identified as Google AdMob from `public/app-ads.txt` (`pub-2313206220567592`) and commit `b58fe19`. If any other network/mediation partner is live, §6/§7 need that name added.
- The claim "portfolio data is not used for ad targeting" reflects the documented local-first design; it must hold in the shipped app.
- Cross-border transfer documentation and the impact assessment for AdMob are an operator duty; the policy now states the duty but the filing itself is outside this repo.
- `operator.configured` is still `false`, so `{{privacyContact}}` renders as the pending placeholder and support falls back to the Facebook URL. Ad-consent requests need a real data-protection channel before release.

## Unresolved questions

1. Any ad network besides Google AdMob (mediation, house ads)?
2. Does the app show a consent/UMP dialog on first launch, or rely only on the OS-level ad-ID setting? §4 currently describes the OS-level path only.
3. Should the landing-page FAQ (VI/EN) also gain an "does the app show ads?" item? Left out to keep scope on legal docs.
4. Keep `release.effectiveDate` at 2026-07-21, or move it to 2026-08-20 for the new versions?
