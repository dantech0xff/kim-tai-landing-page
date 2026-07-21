---
title: Vietnam 2026 legal baseline for bilingual ToS / T&C / Privacy Policy
date: 2026-07-20
status: superseded
scope: Kim Tài - Tick Vàng Online landing page and future consumer app terms
---

# Vietnam 2026 Legal Baseline for Bilingual Terms and Privacy Policy

> **Superseded notice (21/07/2026):** This early research pass is retained only as an audit trail and must not be used as the 2026 release baseline. From 01/01/2026, the applicable personal-data baseline is Law 91/2025/QH15 and Decree 356/2025/NĐ-CP; Decree 13/2023/NĐ-CP expired when Decree 356 took effect. From 01/07/2026, Cybersecurity Law 116/2025/QH15 replaces the 2018 Cybersecurity Law and the 2015 Law on Cyberinformation Security. The implementation JSON uses the newer instruments. See `legal-draft-audit-20260721.md` for the final audit.

## Summary

Current Vietnam baseline for a consumer mobile app landing page is driven by five instruments:

1. `Luật Bảo vệ quyền lợi người tiêu dùng` `19/2023/QH15` effective `01/07/2024`.
2. `Nghị định 13/2023/NĐ-CP` on personal data protection effective `01/07/2023`.
3. `Luật Giao dịch điện tử` `20/2023/QH15` effective `01/07/2024`.
4. `Luật An ninh mạng` `24/2018/QH14` effective `01/01/2019` and `Nghị định 53/2022/NĐ-CP` effective `01/10/2022`.
5. `Nghị định 52/2013/NĐ-CP`, as amended by `Nghị định 85/2021/NĐ-CP`, plus `Thông tư 59/2015/TT-BCT` and `Thông tư 01/2022/TT-BCT` for mobile e-commerce/app disclosures.

Practical conclusion: do not hardcode any operator identity, contact, retention, recipients, hosting, or data-flow facts. The docs must stay configurable. The safest structure is Vietnamese-first bilingual pages, with separate Terms and Privacy Policy, explicit clickwrap acceptance, and a consumer-friendly ambiguity rule.

This is a research baseline, not legal certification.

## Method

- Primary sources favored: `vanban.chinhphu.vn`, `mps.gov.vn`, `moit.gov.vn`, `vbpl.moj.gov.vn`.
- Focus: current rules affecting consumer terms, privacy, e-contracts, and cyber posture.
- Excluded: sector-specific licensing, payment regulation, app-store policy, and tax/VAT rules.

## Ranked Recommendation

| Rank | Drafting model | Why |
|---|---|---|
| 1 | Vietnamese operative text + English translation below/alongside + explicit Vietnamese-controls clause | Best fit for Vietnam consumer law and easier to maintain. Reduces ambiguity and preserves one legal source of truth. |
| 2 | Separate Vietnamese Terms and English summary page | Lowest legal ambiguity, but weaker UX for bilingual users and more duplication. |
| 3 | Fully side-by-side bilingual master document with no control clause | Highest translation drift risk. Harder to maintain and easiest to conflict. |

Recommendation: use option 1.

## Key Findings

### 1. Consumer law controls public terms

`Luật Bảo vệ quyền lợi người tiêu dùng` `19/2023/QH15` is the main baseline for consumer-facing terms.

Key requirements from the law:

- Contract templates and general transaction conditions must follow civil law and related law.
- Any ambiguity is interpreted in the consumer’s favor.
- Certain clauses are prohibited, including clauses that:
  - limit or exclude the trader’s legal responsibility;
  - limit complaint or lawsuit rights;
  - let the trader unilaterally change the contract or terms without consumer protections;
  - let the trader treat consumer data collection/storage/use as a contract condition, unless another law requires it.
- The trader must give consumers reasonable time to review a standard-form contract or general conditions.
- Standard-form contracts and general transaction conditions must be public on the website/app before contract conclusion, deposit, or advance payment.
- For online transactions, the trader must let consumers access, download, store, and print invoices/documents.

Drafting impact:

- Use a separate Terms page, not just a marketing page footer.
- No hidden clauses, no unilateral-change clause without notice/termination rights, no forced data-consent bundling.
- Add refund, complaint, evidence, and document-access sections if the app ever supports ordering or payments.

Source:

- `Luật số 19/2023/QH15` official record: https://vanban.chinhphu.vn/?docid=208363&pageid=27160
- Full text PDF: https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/7/luat19_2023.pdf

### 2. Personal data policy needs explicit notice and consent design

`Nghị định 13/2023/NĐ-CP` is the current baseline for personal data protection.

Key requirements from the official MPS summary:

- Personal data includes information tied to an identified or identifiable person.
- Basic data and sensitive data are distinguished.
- Processing is generally controlled by consent.
- The decree also lists narrow cases where processing may happen without consent, such as emergencies, legal obligations, or competent-state-action cases.
- Sensitive data needs stricter handling.

Drafting impact:

- Privacy Policy must state:
  - controller identity;
  - categories of data;
  - purpose;
  - processing basis/consent status;
  - recipients or processors;
  - retention;
  - user rights and withdrawal path.
- Do not bundle privacy consent into the Terms acceptance checkbox.
- Keep consent text granular enough to separate account creation, analytics, marketing, and support.

Source:

- MPS official article on Decree 13/2023/NĐ-CP: https://mps.gov.vn/bai-viet/chinh-phu-ban-hanh-nghi-dinh-bao-ve-du-lieu-ca-nhan-d3-t982

### 3. Electronic transactions law validates e-docs and e-contracts

`Luật Giao dịch điện tử` `20/2023/QH15` is effective `01/07/2024`.

Baseline implication:

- Electronic records, acceptances, and contracts can be legally valid if structured correctly.
- For product design, that means clickwrap consent, timestamped acceptance, versioned terms, and audit logging are prudent.

Drafting impact:

- Say clearly when a tap, click, or OTP confirmation counts as acceptance.
- Keep version numbers and effective dates visible.
- Preserve transaction records and acceptance logs.

Source:

- `Luật số 20/2023/QH15` official record: https://vanban.chinhphu.vn/?classid=1&docid=208421&pageid=27160&typegroupid=3

### 4. E-commerce rules matter if the app enables ordering or sales

`Nghị định 52/2013/NĐ-CP` is the base e-commerce decree, amended by `Nghị định 85/2021/NĐ-CP` effective `01/01/2022`.
`Thông tư 59/2015/TT-BCT` governs mobile e-commerce apps, and `Thông tư 01/2022/TT-BCT` updated that framework.

Current official MOIT guidance says:

- If the app has online ordering, it must be notified to MOIT.
- Website/app terms and general conditions must be public.
- For online ordering, consumers must be able to read and separately agree to the general conditions before sending the offer.
- Merchant/product information must be more specific and less misleading.

Drafting impact:

- Treat `ordering enabled?` as a configurable product flag.
- If `yes`, add merchant disclosure, order flow, pricing, complaint, shipping, cancellation, and confirmation language.
- If `no`, keep the landing page clean and avoid promising transaction features the app does not actually have.

Sources:

- `Nghị định số 52/2013/NĐ-CP`: https://vanban.chinhphu.vn/default.aspx?docid=167457&pageid=27160
- `Nghị định số 85/2021/NĐ-CP`: https://vanban.chinhphu.vn/?docid=204191&pageid=27160
- `Thông tư số 59/2015/TT-BCT`: https://vanban.chinhphu.vn/default.aspx?docid=183832&pageid=27160
- `Thông tư số 01/2022/TT-BCT`: https://vanban.chinhphu.vn/?classid=1&docid=205210&orggroupid=4&pageid=27160
- MOIT summary article: https://vioit.moit.gov.vn/vn/tin-hoat-dong-nganh/cap-nhat-mot-so-chinh-sach-phap-luat-lien-quan-den-thuong-mai-dien-tu-4836.4056.html

### 5. Cybersecurity is mostly a control and scope question

`Luật An ninh mạng` `24/2018/QH14` and `Nghị định 53/2022/NĐ-CP` are the current baseline.

Practical reading for this project:

- A simple landing page does not automatically trigger the heaviest obligations.
- If the service stores user data, runs authentication, uses hosted user accounts, or operates at scale, the security posture must be documented and maintained.
- Data localization or local presence questions are fact-specific. Do not promise compliance without checking the real operating model.

Drafting impact:

- Add a security contact and incident-handling placeholder.
- Keep hosting location, processor, and subprocessors configurable.
- Avoid any claim that the app is “fully compliant” with cybersecurity law unless verified.

Sources:

- `Luật số 24/2018/QH14`: https://vanban.chinhphu.vn/?docid=206114&pageid=27160
- `Nghị định số 53/2022/NĐ-CP`: https://vanban.chinhphu.vn/?classid=1&docid=206381&pageid=27160&typegroupid=3
- MPS note on Decree 53 effective date and scope: https://mps.gov.vn/chinh-sach-phap-luat/bai-viet/tu-ngay-01102022-nghi-dinh-quy-dinh-chi-tiet-mot-so-dieu-cua-luat-an-ninh-mang-chinh-thuc-co-hieu-luc-thi-hanh-d1-t832

## Clause Recommendations

### Must-have clauses

- Parties / operator identity.
- Service description.
- Acceptance and effective date.
- User eligibility and permitted use.
- Fees, if any.
- Complaint and support path.
- Data protection notice.
- Electronic record / clickwrap acceptance.
- Governing language.
- Modification notice.
- Governing law and dispute venue.

### Bilingual drafting rules

- Make Vietnamese the operative version.
- Put English directly below or beside it as a translation.
- Add a simple clause: if translation and Vietnamese differ, the Vietnamese text controls.
- Do not translate legal terms loosely; keep names of laws, decrees, and rights in the official Vietnamese form where possible.
- For consumer-friendly interpretation, add that any ambiguity is resolved in the consumer’s favor.

### Privacy-specific drafting rules

- Keep privacy consent separate from Terms acceptance.
- Use granular toggles for marketing, analytics, and optional profile enrichment.
- Do not make marketing consent a condition to use the app unless law or product function truly requires it.
- Keep retention and deletion periods configurable.

## Configurable Fields

These fields must remain placeholders until the real operator/data-flow model is confirmed.

| Field group | Must stay configurable |
|---|---|
| Operator identity | legal entity name, trade name, registration number, address, phone, email, local representative |
| Product scope | landing page only, account registration, ordering, payments, subscriptions, rewards, support chat |
| Data collected | name, phone, email, device IDs, location, logs, KYC, marketing data, support tickets |
| Legal basis | consent, contract performance, legal obligation, legitimate interest if used in policy language |
| Recipients | cloud host, CRM, analytics, ad tech, support tools, payment processor, logistics, counsel |
| Retention | active account, backup, dispute hold, deletion schedule |
| Cross-border transfer | yes/no, destination countries, transfer mechanism, vendor list |
| Security | hosting provider, incident contact, encryption, access control, MFA, log retention |
| Transaction flow | order confirmation, refund, cancellation, warranty, chargeback, invoice access |
| Consumer ops | complaint channel, escalation SLA, response language, refund timeline |

## What is law-backed vs prudent language

### Law-backed

- Public and accessible general conditions before contract conclusion.
- Consumer-favorable interpretation.
- Ban on clauses that strip complaint rights or force data consent as a contract condition.
- Online access/download/print of transaction evidence.
- Separate personal data notice/consent logic.

### Prudent, not directly verified in this pass

- Vietnamese-controls clause for bilingual drafts.
- Version history and explicit clickwrap logging.
- Separate analytics and marketing consent toggles.
- Local incident contact and processor inventory.

## Limitations

- Did not verify sector-specific permits, payment regulation, tax invoicing, or app-store policy.
- Did not inspect the app’s actual data flows, hosting, or transaction design.
- No legal opinion or certification implied.

## Unresolved Questions

- Is the landing page informational only, or will it support account creation, ordering, or payment?
- What is the real Vietnamese legal entity, address, contact, and support channel?
- Will any personal data leave Vietnam, and which vendors process it?
- Does the app collect sensitive personal data or only basic profile/contact data?
