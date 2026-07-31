# RevenueCat privacy research for Kim Tài
Date: 2026-07-27

## Scope
Official sources only: RevenueCat docs/privacy policy plus Apple and Google billing docs.
Goal: truthfully describe anonymous vs custom App User IDs, purchase-validation data, and retention caveats for the Privacy Policy.

## Verified facts
- RevenueCat generates a random anonymous App User ID by default when no App User ID is passed to the SDK; it is cached on device, a reinstall clears it, and a new anonymous ID is created. Anonymous IDs do not share subscription status across apps/platforms. Source: [RevenueCat Identifying Customers](https://www.revenuecat.com/docs/customers/identifying-customers)
- If you have your own user IDs, RevenueCat recommends passing them at configuration or later via `logIn()`. If you do not have your own IDs, you should not pass any value at configuration and let RevenueCat use anonymous IDs. Source: [RevenueCat Identifying Customers](https://www.revenuecat.com/docs/customers/identifying-customers)
- RevenueCat says a customer can be referenced by multiple App User IDs/aliases, and `logOut()` creates a new anonymous App User ID. Source: [RevenueCat Identifying Customers](https://www.revenuecat.com/docs/customers/identifying-customers)
- RevenueCat’s privacy policy says end-user transaction info may include the Apple receipt file and Google purchase token; optional end-user info may include the app’s user ID and extra metadata. Source: [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy-policy)
- RevenueCat’s privacy policy says end-user info is processed for customers as a processor, and personal info is retained pursuant to its retention policy and as necessary for legal obligations, disputes, and agreements. No fixed public retention period is stated in the cited docs. Source: [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy-policy)
- RevenueCat’s Apple privacy guidance says apps using RevenueCat must disclose `Purchases`; if a custom app user ID is used, disclose `User ID`; if an IDFA-based integration is used, disclose `Device ID`. Source: [RevenueCat Apple App Privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy)
- Apple says an App Store transaction represents an in-app purchase, and the receipt is a signed receipt with transaction information. Source: [Apple transaction docs](https://developer.apple.com/documentation/storekit/transaction), [Apple receipt validation docs](https://developer.apple.com/documentation/AppStoreReceipts/validating-receipts-on-the-device)
- Google says a successful purchase generates a purchase token, and the app should send that token to a secure backend for verification; Google also recommends using the purchase token as the database key because it is globally unique. Source: [Google Play Billing integrate](https://developer.android.com/google/play/billing/integrate.html), [Google fraud/security guidance](https://developer.android.com/google/play/billing/security)

## Inference for policy wording
- I found no official RevenueCat doc saying the Kim Tài IAP flow receives card number, CVV, or bank-account details from the app. The documented RevenueCat inputs are receipts/purchase tokens, optional user ID, and related metadata. So the policy should not claim Kim Tài processes payment instrument details in the IAP path unless a separate checkout flow exists.
- If Kim Tài uses only anonymous RevenueCat IDs, the policy should say RevenueCat creates its own anonymous identifier. Do not describe this as a Kim Tài account ID.
- If Kim Tài later adds a custom login-based ID, the policy must switch to explicit `User ID` language and App Store privacy disclosure must include `Identifiers`.

## Recommended VI wording
> Khi bạn mua gói trả phí trong ứng dụng, giao dịch được xử lý bởi Apple App Store hoặc Google Play. Kim Tài sử dụng RevenueCat để xác minh trạng thái mua và khôi phục quyền truy cập; dữ liệu liên quan có thể gồm biên lai Apple, purchase token của Google Play, trạng thái giao dịch và, nếu bạn đăng nhập hoặc chúng tôi cấu hình định danh riêng, App User ID của bạn. Nếu chúng tôi không cấu hình App User ID riêng, RevenueCat sẽ tự tạo một mã định danh ẩn danh cho thiết bị theo cơ chế của họ.

> Chúng tôi không dựa vào hoặc lưu giữ thông tin thẻ thanh toán trong luồng mua trong ứng dụng; việc thanh toán do Apple App Store hoặc Google Play xử lý theo chính sách của họ.

## Recommended EN wording
> When you purchase an in-app premium plan, the transaction is processed by the Apple App Store or Google Play. Kim Tài uses RevenueCat to verify purchase status and restore access; related data may include the Apple receipt, the Google Play purchase token, transaction status, and, if you sign in or we configure a custom identifier, your App User ID. If we do not configure a custom App User ID, RevenueCat creates its own anonymous device-based identifier.

> We do not rely on or store card-payment details in the in-app purchase flow; payment is handled by Apple App Store or Google Play under their own policies.

## Drafting cautions
- Keep the wording at “may include” level for receipts/tokens/user IDs.
- Do not invent a retention period for RevenueCat; only say “as necessary” unless the app’s own storage policy is confirmed.
- If web checkout or direct card billing is added later, this section must be rewritten.
- For Apple App Privacy, disclose `Purchases`; disclose `User ID` only if a custom App User ID is actually used.
