---
title: Audit of Kim Tài bilingual legal drafts against Vietnam law as at 21 July 2026
date: 2026-07-21
timestamp: 2026-07-21T01:33:37+08:00
status: done-with-concerns
scope: src/content/legal.vi.json, src/content/legal.en.json, and supporting site configuration
---

# Audit of the Kim Tài Bilingual Legal Drafts

## Summary

The bilingual structure is sound and the corrected 2026 statute metadata is materially accurate. The drafts correctly separate Terms acceptance from personal-data consent, preserve mandatory consumer rights, use a consumer-favorable interpretation safeguard, and avoid asserting that cross-border transfers are absent.

The files are not ready to publish as final legal notices. Operator identity and contacts are unset; actual data categories, processors, retention periods, transfer destinations, and security measures are not verified. One consent-basis sentence is broader than the enumerated statutory exceptions. Consumer-contract copy/termination mechanics are also missing. Publish only as a visibly marked internal/pre-release draft until the blockers below are resolved.

This is a drafting audit, not a legal opinion or certification.

> **Implementation note:** The paired drafting corrections in Findings 3–7 were applied after this audit, including Article 19 wording, accepted-Terms copy/termination protections, bilingual consumer-favorable language, canonical source metadata, and the rights summary. The release gate now requires complete operator and verified direct-store fields and applies `noindex` in preview. Findings 1–2 remain external launch blockers until the real operator and data-flow facts are supplied and verified.

## Contents

- [Audit scope and method](#audit-scope-and-method)
- [Corrected July 2026 baseline](#corrected-july-2026-baseline)
- [Release decision](#release-decision)
- [Findings requiring changes](#findings-requiring-changes)
- [Verified drafting passes](#verified-drafting-passes)
- [Required pre-release evidence](#required-pre-release-evidence)
- [Official sources](#official-sources)
- [Unresolved questions](#unresolved-questions)

## Audit Scope and Method

- Drafts reviewed: `src/content/legal.vi.json`, `src/content/legal.en.json`.
- Configuration reviewed: `src/content/site.json`.
- Rendering check limited to placeholder behavior in `src/lib/content.ts` and the preview warning in `src/components/legal-document-page.tsx`; no implementation edit.
- Prior baseline reviewed: `plans/20260721-005302-kim-tai-landing/reports/legal-research-2026-vietnam.md`.
- Primary sources: Government legal-document portal, official PDFs, Government policy portal.
- Recency cutoff: 21 July 2026.
- Excluded: sector licensing, tax, payment services, app-store contractual rules, and a factual security/data-flow assessment.

The Vietnamese and English JSON files have matching document slugs, versions, source IDs, section IDs, and paragraph/item counts. No structural translation drift found.

## Corrected July 2026 Baseline

| Instrument | Verified status at 21 July 2026 | Draft status |
|---|---|---|
| Law on Personal Data Protection `91/2025/QH15` | Effective `01/01/2026` | Correct at `legal.vi.json:5-7` and `legal.en.json:5-7` |
| Decree `356/2025/ND-CP` | Effective `01/01/2026`; Decree `13/2023/ND-CP` ceased to have effect from that date | Correct in substance at both files `:11-13`; exact repeal wording recommended |
| Law on Protection of Consumers' Rights `19/2023/QH15` | Effective `01/07/2024`; current consolidated record `47/VBHN-VPQH` issued `17/03/2026` | Correct underlying-law citation at both files `:17-19`; add consolidated record for current reading |
| Law on Electronic Transactions `20/2023/QH15` | Effective `01/07/2024` | Date correct; source URL at both files `:24` is broken |
| Cybersecurity Law `116/2025/QH15` | Effective `01/07/2026`; the 2015 network-information-security law and 2018 cybersecurity law ceased to have effect from that date | Correct in substance at both files `:29-31`; cite prior law numbers for precision |

The global policy date in `src/content/site.json:8-11` is `21/07/2026`, after all instruments above took effect. Treat it as the documents' publication/effective date, not the statutes' effective date.

The prior report is superseded on personal-data and cybersecurity law. Its lines `15`, `17`, `72`, and the cybersecurity section still describe Decree `13/2023` and the 2018 Cybersecurity Law as current. Do not use those statements for July 2026 drafting.

## Release Decision

| Area | Decision | Reason |
|---|---|---|
| Internal/pre-release display | Acceptable with existing warning | `operator.configured` is false and the UI identifies the text as configurable |
| Final public Terms | Blocked | Operator/contact disclosure incomplete; standard-form copy and termination mechanics incomplete |
| Final public Privacy Policy | Blocked | Controller, actual processing, recipients, retention, transfers, and security controls unresolved |
| Bilingual consistency | Pass | Same structure and substantive allocation in both languages |
| Clickwrap/privacy separation | Drafting pass; implementation unverified | Clauses clearly separate the two actions, but no consent/acceptance flow was audited |

## Findings Requiring Changes

### 1. Blocker: the operator and mandatory contact details are not actually disclosed

Evidence:

- `src/content/site.json:13-19`: `configured` is false; legal name is generic; registration number, address, support email, and privacy email are empty.
- `src/content/legal.vi.json:47`, `:226`, `:244`, `:356` and matching English lines promise that details will be completed later.
- Only `{{operatorLegalName}}` and `{{privacyContact}}` are interpolated. There are no displayed placeholders for registration number, registered address, or phone.
- The configured `legalName` is non-empty generic text, so it renders as if it were the provider name instead of triggering the more explicit pending fallback.

Risk:

- A final consumer standard-form contract needs the parties' identifying/contact information. Article 23(3)(a) of Law `19/2023/QH15` includes name, address, phone number, and other contact methods.
- A final privacy notice cannot identify its controller as merely “intended” or tell users that identity/contact details will be supplied later.
- The visible warning is not a release gate; the legal pages can still render incomplete content.

Suggested Vietnamese replacement for the first provider/controller paragraphs after real values exist:

> Điều khoản này điều chỉnh việc sử dụng {{appName}} do {{operatorLegalName}} cung cấp. Mã số đăng ký: {{operatorRegistrationNumber}}. Địa chỉ đăng ký: {{operatorRegisteredAddress}}. Điện thoại: {{operatorPhone}}. Kênh hỗ trợ: {{supportContact}}.

> Bên kiểm soát dữ liệu đối với các hoạt động được mô tả trong Chính sách này là {{operatorLegalName}}, mã số đăng ký {{operatorRegistrationNumber}}, địa chỉ {{operatorRegisteredAddress}}. Yêu cầu về dữ liệu cá nhân được gửi tới {{privacyContact}}.

Suggested English replacement:

> These Terms govern use of {{appName}}, provided by {{operatorLegalName}}. Registration number: {{operatorRegistrationNumber}}. Registered address: {{operatorRegisteredAddress}}. Telephone: {{operatorPhone}}. Support channel: {{supportContact}}.

> The data controller for the processing described in this Policy is {{operatorLegalName}}, registration number {{operatorRegistrationNumber}}, registered at {{operatorRegisteredAddress}}. Personal-data requests may be sent to {{privacyContact}}.

Action: add real values and render them. Keep `release.ready` and `operator.configured` false until all required values are both populated and visible.

### 2. Blocker: the Privacy Policy describes an unfinished data inventory

Exact passages:

- `src/content/legal.vi.json:257`: technical data “có thể gồm ... tuỳ cách triển khai thực tế”; English `:257`: “potentially including ... depending on the actual implementation.”
- Both files `:299`: actual hosting, support, price, analytics, notification, and processor list “must be disclosed before release.”
- Both files `:307`: cross-border status is not confirmed.
- Both files `:316-317`: support/log retention is “as needed”; exact periods remain to be filled.
- Both files `:347`: present-tense security-control claims have not been substantiated by the supplied configuration or an implementation audit.

Risk:

- Consumer-law information rules require the collection purpose, scope, storage period, and protection rules to be public before or at collection. A final notice cannot use “may,” “depending on implementation,” or “to be filled” for processing that actually occurs.
- A policy must reflect real controller/processor roles. Local processing can still be personal-data processing even when the operator does not receive a copy; `:289` correctly avoids saying otherwise, but the actual role still needs assessment.
- Claiming access controls, log management, or an incident procedure without evidence is a factual representation, not a harmless placeholder.

Required drafting pattern after inventory, using actual facts only:

| Required fact | Vietnamese template | English template |
|---|---|---|
| Technical collection | `Khi [sự kiện], [hệ thống] thu thập [trường dữ liệu] để [mục đích].` | `When [event] occurs, [system] collects [fields] for [purpose].` |
| Recipient/processor | `[Tên bên nhận], tại [quốc gia], nhận [dữ liệu] với vai trò [vai trò] để [mục đích].` | `[Recipient], in [country], receives [data] as [role] for [purpose].` |
| Retention | `[Nhóm dữ liệu] được giữ trong [thời hạn] kể từ [mốc], sau đó [xoá/huỷ/ẩn danh], trừ [nghĩa vụ lưu giữ cụ thể].` | `[Data category] is kept for [period] from [trigger], then [erased/destroyed/anonymized], except for [specific legal hold].` |
| Security | `Chúng tôi đã triển khai [biện pháp đã kiểm chứng].` | `We have implemented [verified measures].` |

Do not list an unverified vendor, country, retention period, or security control merely to complete the template.

### 3. High: the alternative processing-basis sentence is too broad

Exact passage:

- `src/content/legal.vi.json:281`: “thực hiện yêu cầu của bạn ... hoặc bảo vệ quyền, lợi ích hợp pháp trong phạm vi luật định.”
- `src/content/legal.en.json:281`: “fulfilling your request ... or protecting lawful rights and interests within statutory limits.”

Risk: Law `91/2025/QH15` Article 19 enumerates cases that do not require consent. It includes performance of the data subject's agreement and specified urgent/state/legal cases; it does not create an open-ended GDPR-style “legitimate interests” basis. “Fulfilling your request” and “lawful rights and interests” can be read more broadly than the statutory cases.

Suggested Vietnamese replacement:

> Ngoài trường hợp dựa trên sự đồng ý, chúng tôi chỉ xử lý dữ liệu không cần sự đồng ý khi một trường hợp cụ thể tại Điều 19 Luật 91/2025/QH15 hoặc quy định pháp luật liên quan thực sự áp dụng, chẳng hạn khi cần để thực hiện thỏa thuận với bạn hoặc thực hiện nghĩa vụ pháp luật. Đơn vị vận hành phải xác định và lưu hồ sơ căn cứ cụ thể; “quyền, lợi ích hợp pháp” không tạo ra căn cứ xử lý độc lập ngoài trường hợp luật định.

Suggested English replacement:

> Where processing is not based on consent, we process data without consent only when a specific case under Article 19 of Law 91/2025/QH15 or another applicable rule actually applies, for example when necessary to perform an agreement with you or comply with a legal duty. The operator must identify and document the specific case; “lawful rights and interests” is not a standalone processing basis outside the statutory cases.

### 4. High: consumer standard-form copy and termination protections are incomplete

Existing strengths:

- Both files `:56-57` require clear presentation, reasonable review/retention opportunity, and affirmative acceptance.
- Both files `:104-105` require notice/new acceptance for material changes and preserve mandatory rights.
- Both files `:121-122` preserve non-excludable liability and complaint/court rights.

Gaps:

- No promise to retain the accepted standard-form contract or provide a copy on request. Article 26(2) of Law `19/2023/QH15` requires retention for the contract term and a copy within seven working days after the consumer's request.
- The update clause does not expressly give the user a right to terminate/reject a unilateral change. Article 25 bars unilateral changes to general conditions without a consumer termination right.
- The support channel needed to exercise these rights is blank.

Suggested Vietnamese addition:

> Đơn vị vận hành lưu giữ phiên bản Điều khoản đã được bạn chấp nhận trong thời hạn Điều khoản có hiệu lực và cung cấp bản sao trong 07 ngày làm việc kể từ khi nhận yêu cầu hợp lệ, theo pháp luật áp dụng. Thời điểm, phiên bản và phương thức chấp nhận có thể được ghi nhận để chứng minh giao kết.

> Bạn có thể chấm dứt sử dụng và gỡ Ứng dụng bất cứ lúc nào. Thay đổi điều kiện giao dịch chung không ràng buộc bạn nếu chưa được thông báo hoặc chấp nhận theo pháp luật; nếu không đồng ý, bạn có quyền chấm dứt mà không làm mất quyền đã phát sinh.

Suggested English addition:

> The operator retains the version of the Terms you accepted for the period in which they remain effective and, as required by applicable law, provides a copy within seven working days after receiving a valid request. The time, version, and method of acceptance may be recorded as evidence of formation.

> You may stop using and uninstall the App at any time. A change to general transaction conditions does not bind you unless it has been notified or accepted as required by law; if you disagree, you may terminate without losing rights already accrued.

Implementation dependency: decide how a local-first app records acceptance and responds to copy requests without collecting unnecessary personal data.

### 5. Medium: the language-control clauses should state the consumer-favorable bilingual rule directly

Exact passages:

- Terms of Service: `src/content/legal.vi.json:131` and `src/content/legal.en.json:131`.
- Website conditions: `src/content/legal.vi.json:226` and `src/content/legal.en.json:226`.
- Privacy Policy: no equivalent bilingual-conflict clause.

Risk: Article 23(2) of Law `19/2023/QH15` says that where Vietnamese and foreign-language consumer contract versions differ, the version more favorable to the consumer is preferred. The existing “Vietnamese controls, subject to law” caveat is defensible, but indirect.

Suggested Vietnamese replacement:

> Bản tiếng Việt được dùng để giải thích và áp dụng tài liệu này. Tuy nhiên, nếu bản tiếng Việt và bản tiếng Anh khác nhau và pháp luật yêu cầu ưu tiên nội dung có lợi hơn cho người tiêu dùng, nội dung có lợi hơn được áp dụng.

Suggested English replacement:

> The Vietnamese version is used to interpret and apply this document. However, if the Vietnamese and English versions differ and applicable law requires the version more favorable to the consumer to prevail, the more favorable wording applies.

Add the same rule to the Privacy Policy to manage translation drift, while preserving mandatory data-subject protections.

### 6. Medium: correct one broken official source URL and tighten repeal notes

Exact passage:

- `src/content/legal.vi.json:24` and `src/content/legal.en.json:24` use a Government portal URL that currently returns a `500` page.

Replace with:

`https://vanban.chinhphu.vn/?classid=1&docid=208421&orggroupid=1&pageid=27160`

Preferred Vietnamese source notes:

> Nghị định 356/2025/NĐ-CP có hiệu lực từ 01/01/2026; từ ngày này Nghị định 13/2023/NĐ-CP hết hiệu lực.

> Luật An ninh mạng 116/2025/QH15 có hiệu lực từ 01/07/2026; từ ngày này Luật An toàn thông tin mạng 86/2015/QH13 và Luật An ninh mạng 24/2018/QH14 hết hiệu lực.

Preferred English source notes:

> Decree 356/2025/ND-CP is effective from 1 January 2026; Decree 13/2023/ND-CP ceased to have effect on that date.

> Cybersecurity Law 116/2025/QH15 is effective from 1 July 2026; Law 86/2015/QH13 on network information security and Cybersecurity Law 24/2018/QH14 ceased to have effect on that date.

This wording avoids implying that every subordinate instrument issued under the prior laws automatically disappeared.

### 7. Low: align the final data-subject-rights bullet more closely with statutory language

Both files `:325-331` give a qualified, broadly accurate rights summary. The final bullet describes asking others for protection but omits self-protection.

Suggested Vietnamese wording:

> Tự bảo vệ dữ liệu cá nhân của mình; yêu cầu cơ quan, tổ chức, cá nhân có liên quan áp dụng biện pháp bảo vệ theo pháp luật.

Suggested English wording:

> Protect your personal data and ask competent authorities, organizations, or relevant persons to apply protective measures as provided by law.

Keep the introductory qualification “within the scope and procedures provided by law”; not every right is unconditional in every case.

## Verified Drafting Passes

### Clickwrap and privacy consent

Pass at drafting level:

- Terms `:48` and `:57` say accepting Terms is not personal-data consent.
- Privacy Policy `:280` separates personal-data consent from Terms acceptance and optional marketing.
- This structure also respects Article 25(14) of the consumer law, which prohibits making data collection/storage/use consent a contract condition except where law provides otherwise.

Operational condition: use distinct controls and records. A link to the Privacy Policy alone is notice, not consent. Any consent must be specific to the actual purposes and capable of being refused/withdrawn as law permits.

### Consumer rights and liability

Pass with the copy/termination gap noted above:

- Reasonable review and retention opportunity: `:56`.
- No exclusion of mandatory liability or complaint/court rights: `:122`.
- Consumer-favorable ambiguity rule: `:122` and language clause `:131`.
- Good-faith complaint process does not block authorities/courts: `:130`.
- Website conditions preserve accurate-information, complaint, action, compensation rights: `:217`.
- No retroactive reduction of accrued rights: `:209`.

### Product-scope claims

Pass against supplied configuration:

- Website-only facts at both legal files `:150` match `src/content/site.json:23-26`: no website analytics, advertising, accounts, ordering, or payments.
- On-device portfolio claim at Terms `:83` and Privacy `:256`, `:289` matches `src/content/site.json:22`.
- Price/reference/no-investment-advice clauses are narrow and do not purport to eliminate mandatory liability.

Re-audit if accounts, cloud sync, remote backup, analytics, advertising, orders, payments, subscriptions, or user-to-user functions are added.

### Cross-border wording

Conditional pass as an internal draft:

- `:307` does not falsely claim there is no transfer; it says the status is unconfirmed.
- It identifies destination, recipient, purpose, safeguards, and impact documentation as preconditions.
- “Where applicable” avoids inventing a filing duty before facts/exemptions are known.

Final-release condition: verify hosting, APIs, support tools, app-store/referrer behavior, remote access, push-notification services, and every other processor. Then replace the uncertainty with an affirmative disclosure or a verified no-transfer statement. Complete the Law `91/2025/QH15` / Decree `356/2025/ND-CP` dossier, update, notification, and other duties that actually apply.

### Effective dates and replacement language

Pass in substance:

- Law `91/2025/QH15`: `01/01/2026`.
- Decree `356/2025/ND-CP`: `01/01/2026`, replacing/causing Decree `13/2023/ND-CP` to cease effect.
- Cybersecurity Law `116/2025/QH15`: `01/07/2026`, replacing/causing the 2015 and 2018 laws to cease effect.
- Policy effective date `21/07/2026` is chronologically valid.

Use the exact cease-to-have-effect notes in Finding 6 for legal precision.

### Security and incident wording

The incident sentence at `:348` is conservative: it promises notification only when an incident is legally reportable and uses the legally required timing/form rather than inventing one universal deadline. The Cybersecurity Law date is correct.

Before release, validate the present-tense security controls at `:347`. Separately ensure the incident runbook accounts for the consumer-law 24-hour authority notice when an information-system attack creates a consumer-information security risk, plus any personal-data/cybersecurity notification duty that applies to the actual event.

## Required Pre-Release Evidence

1. Real operator legal name, registration number, registered address, telephone, support contact, and privacy contact.
2. Data map for website and app: collection event, fields, source, on-device/remote processing, purpose, legal case, controller/processor, recipient, location, retention trigger, deletion method.
3. Vendor/processor register and contracts, including price feeds, hosting, support, push notifications, app stores, analytics, crash reporting, and backups actually used.
4. Cross-border determination and any required impact dossier, update, notification, or exemption record under Law `91/2025/QH15` and Decree `356/2025/ND-CP`.
5. Purpose-specific consent screens and withdrawal path separate from Terms clickwrap; evidence/version logging proportionate to the local-first design.
6. Accepted-Terms copy/retention mechanism and a support workflow capable of the seven-working-day response where applicable.
7. Verified security controls and incident-notification runbook. Remove any control from the Policy that is not implemented.
8. Final Vietnamese/English legal comparison after every factual field is populated.
9. Product/legal approval confirming that website ordering/payment remains disabled; otherwise perform a fresh e-commerce/transaction audit.

## Official Sources

- [Law on Personal Data Protection 91/2025/QH15 official record](https://vanban.chinhphu.vn/?classid=1&docid=214590&orggroupid=1&pageid=27160)
- [Law 91/2025/QH15 official PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/91qh.signed.pdf)
- [Decree 356/2025/ND-CP official record](https://vanban.chinhphu.vn/?classid=1&docid=216387&pageid=27160)
- [Decree 356/2025/ND-CP official PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf)
- [Official Government summary of Article 19 consent exceptions](https://xaydungchinhsach.chinhphu.vn/cac-truong-hop-xu-ly-du-lieu-ca-nhan-khong-can-su-dong-y-cua-chu-the-du-lieu-119250725163811636.htm)
- [Law on Protection of Consumers' Rights 19/2023/QH15 official record](https://vanban.chinhphu.vn/?classid=1&docid=208363&orggroupid=1&pageid=27160)
- [Law 19/2023/QH15 official PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/7/luat19_2023.pdf)
- [2026 consolidated consumer-law official record 47/VBHN-VPQH](https://vanban.chinhphu.vn/?classid=0&docid=217232&pageid=27160)
- [Law on Electronic Transactions 20/2023/QH15 official record](https://vanban.chinhphu.vn/?classid=1&docid=208421&orggroupid=1&pageid=27160)
- [Law 20/2023/QH15 official PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/8/luat20-2023-qh15..pdf)
- [Cybersecurity Law 116/2025/QH15 official record](https://vanban.chinhphu.vn/?classid=1&docid=216499&orggroupid=1&pageid=27160)
- [Official Government overview of Cybersecurity Law 116/2025/QH15](https://xaydungchinhsach.chinhphu.vn/nhung-noi-dung-moi-trong-luat-an-ninh-mang-so-116-2025-qh15-119260629145615168.htm)

## Unresolved Questions

- What is the operator's exact legal identity, registration number, address, telephone, and monitored support/privacy contact?
- Does the released app send price requests directly to third parties or through operator-controlled infrastructure, and what identifiers/logs result?
- Which vendors, countries, remote-access locations, and backup locations process personal data?
- What exact retention/deletion schedule applies to support data, server logs, security logs, backups, and acceptance/consent evidence?
- Which stated security controls are already implemented and auditable?
- Is Terms acceptance stored only on-device or also server-side, and how will a user request a copy?
- Can children use the app in practice, and if so what age/representative-consent flow applies?
- Will website/app scope remain free of accounts, cloud sync, analytics, advertising, orders, and payments at launch?
- Does gold-portfolio data remain entirely local, and does the actual processing make the operator a controller for any on-device operation?

Status: DONE_WITH_CONCERNS

Summary: Audit complete. Core bilingual/legal structure passes; seven drafting issues and final-publication blockers documented with paired replacement language.

Concerns/Blockers: Do not publish as final legal notices until operator identity/contact, actual processing, processors, retention, cross-border status, and security controls are verified and rendered.
