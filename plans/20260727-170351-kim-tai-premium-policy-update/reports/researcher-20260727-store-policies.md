---
title: Store policy research for Kim Tài Premium
date: 2026-07-27
status: complete
sources: 6
---

# Store Policy Research: Kim Tài Premium

## Scope
Research current official Apple App Store and Google Play docs needed to draft Premium terms for:
monthly/yearly auto-renewing subscriptions, lifetime one-time purchase, auto-renew flow,
cancel/manage flow, store-set pricing, refunds, restore purchases, and purchase identity.

## Source Quality
- High: official Apple Developer / Apple Support docs.
- High: official Google Play Help / Play Console / Android Developers docs.
- No secondary sources used.

## Verified Facts
- Apple auto-renewable subscriptions renew until the user cancels. Apple says pricing is set per storefront/region and customer price is based on the configured price tier. URLs:
  - https://developer.apple.com/app-store/subscriptions/
  - https://developer.apple.com/help/app-store-connect/reference/pricing-and-availability/in-app-purchase-and-subscriptions-pricing-and-availability
- Apple cancellation is managed by the user in Apple Account / Settings / App Store flow, not by Kim Tài. Refunds are requested through Apple’s reportaproblem flow; eligibility varies by region.
  - https://support.apple.com/en-us/118428?device-type=android
  - https://support.apple.com/en-lamr/118223
- Apple restore flow exists for non-consumables and auto-renewable subscriptions. Apple recommends a Restore Purchases UI and says the app receipt is the persistent record for auto-renewables.
  - https://developer.apple.com/documentation/StoreKit/offering-completing-and-restoring-in-app-purchases
  - https://developer.apple.com/documentation/storekit/persisting-a-purchase
- Apple purchase identity is tied to the user’s Apple Account / storefront country-region. Purchases can appear missing if the user is signed into a different Apple Account.
  - https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-availability-for-in-app-purchases/
  - https://support.apple.com/en-us/108105
- Google Play subscriptions are indefinite-term recurring purchases billed at the start of each cycle according to the subscription terms. Users must be signed into the Google Account that has the subscription.
  - https://support.google.com/googleplay/answer/7018481/cancel-pause-or-change-a-subscription-on-google-play-android?co=GENIE.Platform%3DAndroid&hl=en-GB
  - https://support.google.com/googleplay/answer/9818348?hl=En
- Google Play pricing must match the user-facing Play billing interface. Google Play refund policy: usually no refunds for most purchases; within 48 hours users may request through Google Play, after that contact the developer.
  - https://support.google.com/googleplay/android-developer/answer/9858738?hl=en
  - https://support.google.com/googleplay/answer/15574908?hl=en

## Drafting Recommendations
- Use these product names in VI:
  - `Gói Premium tháng`
  - `Gói Premium năm`
  - `Mua trọn đời`
- Use these product names in EN:
  - `Monthly Premium subscription`
  - `Yearly Premium subscription`
  - `Lifetime one-time purchase`
- For subscriptions, say: “auto-renews until canceled” / “tự động gia hạn cho đến khi hủy”.
- For lifetime, say: “one-time purchase for permanent access to the purchased entitlement, unless the entitlement is removed by law, app removal, or account/platform changes outside Kim Tài’s control.” Do not promise unqualified permanence.
- For refunds, say store purchases are handled by the relevant store’s refund process and applicable law. Do not promise Kim Tài can refund App Store or Google Play charges directly.
- For restore access, say users can restore or recover entitlements by signing into the same Apple Account or Google Account used for purchase, then using the store/app recovery flow.

## Platform Differences / Uncertainties
- Apple has explicit restore-purchases guidance; Google Play docs I found emphasize account-based management and resubscribe/switch-account behavior, not a universal store-level “Restore Purchases” flow.
- Apple pricing is strongly storefront/region-based. Google docs reviewed require app pricing to match the Play billing interface; exact tax display wording may vary by region and product config.
- Google Play supports recurring subscriptions and prepaid plans. If Kim Tài only wants monthly/yearly auto-renewing plans, keep prepaid language out of the policy unless the product truly offers it.
- I found no official source that says a store account is a Kim Tài account. The policy should keep Apple Account / Google Account separate from any Kim Tài account language.

## Suggested Policy Phrasing
- VI: “Bạn mua Premium qua App Store hoặc Google Play. Giá, thuế và đơn vị tiền tệ được hiển thị và tính bởi cửa hàng tại thời điểm mua.”
- EN: “You purchase Premium through the App Store or Google Play. The store shows and charges the price, taxes, and currency applicable at the time of purchase.”
- VI: “Giao dịch được gắn với Apple Account hoặc Google Account mà bạn dùng để mua.”
- EN: “Purchases are associated with the Apple Account or Google Account used to complete the purchase.”

## Recommendation
1. Use store-neutral Premium terms in the legal copy, then add platform-specific subclauses for Apple and Google.
2. Treat monthly/yearly as auto-renewing subscriptions only.
3. Treat lifetime as a non-consumable one-time purchase, not a subscription.
4. Add a short restore/recover section that names the correct store account and avoids promising identical behavior across platforms.

## Unresolved Questions
- Whether Kim Tài will offer the same Premium entitlement on both stores, or different entitlement SKUs per platform.
- Whether the app will have its own account system; if yes, the policy needs one sentence separating store identity from Kim Tài identity.
