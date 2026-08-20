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

- §3 service: App is free to download and ad-supported.
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

## Round 2 — decisions applied

Answers received after the first round; all four applied in the same files.

| Question | Decision | Change |
| --- | --- | --- |
| Other ad networks? | AdMob only | No change needed; §6/§7 already name AdMob alone |
| ATT prompt shown? | Yes | New paragraph in privacy §6; sentence added to ToS §4 |
| FAQ item on ads? | Yes | New `advertising` FAQ item (VI + EN), 7th position, flows into FAQPage JSON-LD |
| `release.effectiveDate` | Move to new version | 2026-07-21 → 2026-08-20 |

Wording correction found while adding the FAQ: the `pricing` FAQ states Kim Tài has a Premium in-app purchase. The first round said the App "được cung cấp miễn phí" / "is free to use", which contradicts it. Changed to "tải miễn phí" / "free to download" in privacy §6 and ToS §3.

New FAQ item:

- VI — "Kim Tài có hiển thị quảng cáo không?" → có, qua Google AdMob; cho phép ad ID thì cá nhân hoá, từ chối thì quảng cáo mặc định không cá nhân hoá.
- EN — "Does Kim Tài show ads?" → same content.

## Known limitations

- Ad network identified as Google AdMob from `public/app-ads.txt` (`pub-2313206220567592`) and commit `b58fe19`; confirmed by the user as the only network.
- The claim "portfolio data is not used for ad targeting" reflects the documented local-first design; it must hold in the shipped app.
- Cross-border transfer documentation and the impact assessment for AdMob are an operator duty; the policy now states the duty but the filing itself is outside this repo.
- `operator.configured` is still `false`, so `{{privacyContact}}` renders as the pending placeholder and support falls back to the Facebook URL. Ad-consent requests need a real data-protection channel before release.
- Android has no equivalent in-app consent prompt documented; §6 describes only the OS-level ad-ID setting there.

## Verification (round 2)

- `validate:content`, `typecheck`, `lint`, `build`: exit 0; 14 static pages.
- GitHub Pages export + `validate:pages`: pass.
- `browser-smoke`: 181/181; server stopped, port 3100 freed.
- Rendered HTML checked: ATT paragraph sits between the personalization paragraph and the ad-content paragraph; legal meta shows "Cập nhật lần cuối: 20 tháng 8, 2026 · Có hiệu lực từ: 20 tháng 8, 2026 · v1.1"; new FAQ item present in both the visible FAQ section and the FAQPage JSON-LD (7 questions) for VI and EN.

## Round 3 — Premium removes ads

User confirmed: buying Premium removes advertising, alongside other Premium features. Stated in three places, ads-scope only.

- Privacy §6 ¶1: buying the in-app Premium plan removes ads; the App then stops delivering ads and stops using the advertising identifier for that purpose.
- ToS §4 ¶1: the in-app Premium plan removes advertising.
- FAQ `advertising` answer (VI + EN): Premium removes ads. Flows into FAQPage JSON-LD.
- `productFacts.appPremiumRemovesAds: true`.

Deliberately not written: pricing, renewal, refunds, store-billing roles, or the list of other Premium features. Those need the purchases pass below, not a sentence bolted onto the ads section.

Gates re-run: `validate:content`, `typecheck`, `lint`, `build` exit 0; Pages export + `validate:pages` pass; browser smoke 181/181, port 3100 freed. Rendered HTML confirms all three statements in VI and EN.

## Unresolved questions

1. Premium is advertised in the FAQ and now referenced in the legal docs, but **no document covers purchases themselves** — pricing, subscription vs one-time, renewal, cancellation, refunds, restore-purchase, and the store's role as merchant. Needs its own pass. Verified research is already sitting in `plans/20260727-170351-kim-tai-premium-policy-update/reports/` (RevenueCat identifiers, Apple receipts, Google purchase tokens, store policies) from 2026-07-27, never executed.
2. Is RevenueCat actually in the shipped app? The privacy policy still lists no purchase-related recipient or data category. If it is, §2/§7 need the purchase-validation data and RevenueCat as a recipient.
