---
title: Disclose in-app advertising and the advertising identifier
date: 2026-08-20
summary: Added ad and ad-ID disclosure to the VI/EN privacy policy, terms of service, and website conditions
---

# Disclose in-app advertising and the advertising identifier

## What happened

Kim Tài now ships with ads. The legal set still described an ad-free product, so all three documents needed a truthful rewrite in both locales.

Scouting first: `src/content/legal.{vi,en}.json` hold the documents, `legal-document-page.tsx` renders them, `interpolateLegalText` fills operator tokens, and `validate-content.mjs` guards the token allowlist and source-id references. `public/app-ads.txt` plus commit `b58fe19` identified the network as Google AdMob (`pub-2313206220567592`).

Applied the change through a one-shot Node script with exact-string anchors so a moved paragraph fails loudly instead of silently patching the wrong place. Added a new advertising section to the privacy policy (§6) and the terms of service (§4), renumbered the following section titles, amended data categories, purposes, consent basis, recipients, cross-border, retention, and children, and added the website-vs-app ad distinction to the website conditions.

Three external references were added as legal sources. Each URL was checked live before being written; two candidate Google help URLs 404'd on the first guess and were replaced with verified ones.

## Decision

Name Google AdMob explicitly rather than hiding behind "a third-party advertising platform". A named recipient is what the cross-border and recipients sections need to be useful, and the publisher ID is already public in `app-ads.txt`.

Stated cross-border transfer as real for ad delivery instead of keeping the old "not confirmed" wording. AdMob processing on Google infrastructure outside Vietnam is a transfer; pretending otherwise would have been the easy and wrong edit.

Kept the change to content and one fact flag. No component, schema, or public contract touched.

## Trouble

The first build rendered the new privacy section with the closing paragraph wedged between the "…in your device settings:" lead-in and its bullet list. The renderer emits every paragraph before any item, so a lead-in only works as the last paragraph. Caught it by parsing the built HTML rather than trusting the JSON. Reordered both new sections.

A second, smaller slip: writing the JSON back through `JSON.stringify` reflowed unrelated numeric arrays in `site.json` into 112 lines of diff noise. Reverted and patched that file surgically instead.

## Verification

`validate:content`, `typecheck`, `lint`, `build` all exit 0; build produced 14 static pages. GitHub Pages export build plus `validate:pages` passed for `/kim-tai-landing-page`. Browser smoke passed 181/181 against `next start -p 3100`; server stopped and port freed afterwards. Rendered HTML confirmed section renumbering in both locales, the `#advertising` anchor and its TOC entry, interpolated support contact with no leaked `{{ }}` tokens, and the new source links.

## Next steps

Four open questions live in `plans/reports/cook-260820-1832-ads-legal-disclosure.md`: other ad networks, whether a UMP consent dialog exists alongside the OS-level setting, whether the landing FAQ should mention ads, and whether `release.effectiveDate` should move. Nothing committed.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
