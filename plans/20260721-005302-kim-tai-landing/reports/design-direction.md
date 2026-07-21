# Design direction — Kim Tài · Tick Vàng Online

Date: 2026-07-21  
Scope: direction only; no implementation changes

## Decision

Build a quiet, editorial **personal gold ledger** site, not a fintech dashboard or trading page. Use the supplied app screens as the product proof inside a warm, asymmetric bento composition. Keep the app's mineral green, ivory, mint, blush, gold, oversized serif titles, rounded surfaces, and “ring + diamond” geometry. Remove the app's frequent outline treatment from the website: hierarchy comes from filled tonal surfaces, negative space, scale, and restrained shadow. No persistent visible borders anywhere.

Design dials: variance 8/10; motion 4/10; density 5/10.

## Subject, audience, single page job

- **Subject:** a personal record for gold already owned, with estimated portfolio context, reference price views, and personal display settings.
- **Primary audience:** Vietnamese adults who hold physical gold and want a legible personal record; financially aware, privacy-conscious, often checking prices on a phone.
- **Secondary audience:** overseas Vietnamese and English readers evaluating the app.
- **Single page job:** make the app's role understandable and tangible from real screens, set correct expectations, then route an informed visitor to a verified store listing when one exists.
- **Not the job:** promise returns, enable web trading, imply custody, present investment advice, or manufacture trust through ratings/testimonials.

Recommended hero message:

> **Nhìn rõ phần vàng bạn đang giữ.**  
> Ghi lại số vàng, xem giá tham khảo và chọn cách hiển thị phù hợp với bạn.

English:

> **See the gold you hold, clearly.**  
> Record your holdings, review reference prices, and choose how the app displays them.

Primary launch-state action: **Xem giao diện / See the app**, scrolling to the product proof. Replace with a store action only after the destination is verified. If no verified destination exists, show **Sắp ra mắt / Coming soon** as plain status, not a dead link or fake store badge.

## What the screenshots establish

| Reference | Visible product evidence | Website use |
| --- | --- | --- |
| Overview | Estimated portfolio value/profit, capital and holding amount, a price-reference panel, recent activity, hide-value control, local-device note | Hero proof; focus on ownership clarity, not performance claims |
| Market | Search, purity/region filters, provider groups, timestamps, products, buy/sell columns | Wide product crop; call it reference pricing, never “live trading” |
| Settings | Reminder, Vietnamese/English, Lượng/Chỉ, preferred price source, system/light/dark appearance, tactile feedback | Small stacked proof for personalization and bilingual support |

Source visual DNA:

- Near-black pine canvas with nested dark-green surfaces.
- Warm ivory titles; uppercase blush eyebrows.
- Mint for buy/positive values; blush for sell values. Text labels must carry the meaning too.
- Editorial serif display paired with a sturdy sans UI face.
- Large, soft corner radii and dense but calm numeric hierarchy.
- Cropped circular geometry, short ticks, and a central lozenge/diamond.
- Native app uses many gold/gray outlines. Website translation removes them entirely.

## Signature motif — “Vòng Chỉ”

Use one memorable motif: an oversized, partially cropped orbit of **ten filled ticks** around a softly faceted gold lozenge. It joins the app's existing circular/diamond background language with the product's Chỉ/Lượng setting and the ritual of counting owned gold.

- Construct as accessible decorative SVG/CSS: filled shapes only, no stroked rings or seal-like border.
- Let it sit behind the hero screen and reappear once, much smaller, near the final action.
- Keep opacity low enough that text contrast is unaffected.
- It is not a hallmark, certificate, government seal, or provider mark. Never add official-looking words or serial numbers.
- Spend the visual risk here; keep all supporting components disciplined.

## Color system

Dark mode is source-native. Light mode is a warm paper/sage translation, not an inversion. Use semantic tokens; never hardcode color per component. No pure black, pure white, purple/blue tech gradient, neon glow, or gradient headline.

### Light theme

| Token | Hex | Role |
| --- | --- | --- |
| `canvas-parchment` | `#F6F1E8` | Page canvas |
| `surface-ivory` | `#FFFCF6` | Primary raised surface |
| `surface-sage` | `#E7EEE8` | Secondary surface |
| `surface-gold-mist` | `#F1E7CD` | Gold-context surface, sparingly |
| `ink-forest` | `#102A24` | Strong text and dark filled controls |
| `ink-muted` | `#52635D` | Supporting copy |
| `accent-antique-gold` | `#806018` | Gold text/icons on light surfaces |
| `accent-mint` | `#167568` | Buy/positive accent with label |
| `accent-rose` | `#A83E58` | Sell/contrast accent with label |
| `focus-amber` | `#A56700` | Keyboard focus halo |

Key checked pairs: forest/parchment 13.54:1; muted/parchment 5.65:1; gold/ivory 5.69:1; mint/ivory 5.43:1; rose/ivory 5.87:1.

### Dark theme

| Token | Hex | Role |
| --- | --- | --- |
| `canvas-deep-pine` | `#061814` | Page canvas; sampled from source |
| `surface-pine` | `#0F221D` | Primary surface; sampled from source |
| `surface-raised-pine` | `#17332B` | Raised/interactive surface |
| `surface-olive` | `#2B2B1D` | Selected/gold-context surface |
| `ink-warm-ivory` | `#FAF2E6` | Strong text; source-derived |
| `ink-muted-stone` | `#C9C1B4` | Supporting copy |
| `accent-soft-gold` | `#D6B668` | Gold action and motif |
| `accent-mint` | `#7BD5C4` | Buy/positive accent with label |
| `accent-rose` | `#FF9EAF` | Sell/contrast accent with label |
| `focus-sun` | `#FFD37A` | Keyboard focus halo |

Key checked pairs on `surface-pine`: ivory 14.90+:1; muted 9.29:1; gold 8.49:1; mint 9.60:1; rose 8.49:1. Dark primary action can use soft gold with deep-pine text (9.36:1).

### Surface rules: zero visible borders

- All structural `border`, separator, and divider treatments: none.
- Separate adjacent objects with at least one of: 6–12% tonal shift, 12–24 px gap, different radius, or a low-alpha pine-tinted shadow.
- Do not reproduce screenshot outlines as web-card styling. Borders visible *inside the supplied raster screenshot* remain source content; add no device/frame outline around them.
- Secondary buttons are filled tonal surfaces or plain text links, never outline buttons.
- Keyboard focus remains mandatory: use a 3 px outer color halo plus a 2 px canvas-colored gap. This is a transient interaction state, not a persistent component border.
- Optional 1–2% monochrome grain may prevent large flat surfaces feeling synthetic; never place grain over screenshot details or body text.

## Typography

Use only two families, both with Vietnamese subsets:

- **Display:** `Gelasio`, 500/600/700. Warm, editorial serif close to the screenshots without default luxury-site theatricality.
- **Body/UI/data:** `Be Vietnam Pro`, 400/500/600/700. Built for Vietnamese diacritics; clear for bilingual controls and dense figures.
- Fallbacks: `Gelasio, "Noto Serif", serif`; `"Be Vietnam Pro", "Noto Sans", sans-serif`.
- Load only used weights through `next/font`; `display: swap`; self-hosted build output. Test ă, â, đ, ê, ô, ơ, ư plus stacked tone marks.
- Data: `font-variant-numeric: tabular-nums lining-nums`; locale-format all values. Do not fake changing or “live” numbers on the page.

Suggested scale:

| Role | Size | Line-height | Notes |
| --- | --- | --- | --- |
| Hero | `clamp(3rem, 7.2vw, 7rem)` | 0.92–0.98 | Gelasio 600; left-aligned; 8–11 words max |
| Section | `clamp(2.25rem, 4.5vw, 4.75rem)` | 1.00 | Gelasio 600 |
| Card title | `clamp(1.45rem, 2.2vw, 2rem)` | 1.15 | Mix serif/sans by content |
| Body lead | `clamp(1.0625rem, 1.4vw, 1.25rem)` | 1.60 | 45–68 character measure |
| Body | `1rem` minimum | 1.60 | Never below 16 px |
| Label/action | `0.9375–1rem` | 1.25 | Be Vietnam Pro 600 |

Use sentence case. Uppercase only the short product eyebrows already present in the source. Balance headings and pretty-wrap body; do not hardcode `<br>` because Vietnamese and English wrap differently.

## Page composition

### Content sequence

1. **Compact header:** wordmark, in-page links, language control, theme control. One primary action only when store URL is verified.
2. **Hero bento:** left thesis/copy; right overview-screen proof; two unequal support cells below the copy.
3. **Product proof bento:** a wide market crop, a tall settings crop, and one plain-language ownership-note cell.
4. **Expectation strip:** reference-data and privacy wording that has passed legal/engineering review. No logos framed as partners.
5. **Final action:** verified store destination or honest coming-soon state; lean footer with operator/legal links once supplied.

Do not add generic “features,” “metrics,” “trusted by,” testimonial, ratings, pricing, FAQ, or equal three-card sections unless real content later justifies them.

### Responsive bento map

Cell names:

- `A` hero thesis
- `B` overview screenshot window
- `C` ownership-record explanation
- `D` reference-price caveat
- `E` market screenshot window
- `F` settings screenshot window
- `G` bilingual/theme explanation
- `H` expectation/disclosure surface
- `I` final action

| Viewport | Grid | Map and order |
| --- | --- | --- |
| `320–767` | 1 column; 16 px gutter; 12 px gap | `A → B → C → E → D → F → G → H → I`. Every cell auto-height. Screenshot windows use fixed aspect ratios and crops; no horizontal rail. |
| `768–1023` | 6 columns; 24 px gutter; 16 px gap | Hero: `A 4c × 2r`, `B 2c × 3r`, then `C 2c`, `D 2c` under A. Proof: `E 4c × 2r`, `F 2c × 2r`, `G 2c` beneath F. `H 2c`, `I 4c`. |
| `1024–1439` | 12 columns; 40 px gutter; 20 px gap | Hero: `A 7c × 2r`, `B 5c × 3r`; `C 4c`, `D 3c` under A. Proof: `E 7c × 2r`; `F 5c × 2r`; `G 4c` nested below/adjacent to F; `H 5c`, `I 7c`. |
| `1440+` | Same 12 columns in 1320 px max container; 56 px outer gutter | Preserve spans; increase negative space and cell padding, not column count. Hero screenshot may break 32 px outside the grid toward the right edge, never causing overflow. |

Implementation note: use CSS Grid template areas per breakpoint. Avoid JS measurements, masonry libraries, equalized card heights, and overlap that changes DOM reading order. DOM order follows the mobile sequence.

### Geometry

- Outer hero/product surfaces: 32 px mobile, 40 px desktop.
- Inner screenshot masks: 22 px mobile, 28 px desktop.
- Compact controls: 14–18 px or true capsule only when the control is semantically segmented.
- Padding: 20/24 px mobile; 28/36 px tablet; 40/56 px desktop.
- Section spacing: 80 px mobile; 120 px tablet; 160 px desktop.
- Avoid universal radius. Large surfaces should feel softer than nested controls.

## Screenshot presentation

- Use the three supplied PNGs only; do not redraw UI, invent states, or swap in generic device mockups.
- **Hero:** one tall, borderless rounded window from the Overview reference. Crop around “Tài sản vàng” and the portfolio block; preserve enough app chrome once to signal a real product.
- **Market:** use a landscape crop emphasizing search/filter context and the Mua/Bán columns. Caption **Giá tham khảo theo nguồn / Reference prices by source**. Never call it a trading screen or real-time feed.
- **Settings:** use a narrow vertical crop around language, unit, and appearance controls. This becomes the smaller, taller counterweight to Market.
- No three phones in a row. No tilted 3D phone, glass frame, mock hardware buttons, reflection, or autoplay carousel.
- Do not add a stroke around screenshot masks. Use source-sized rounded clipping, tonal pedestal, and a soft tinted shadow.
- Keep screenshot colors unchanged in both themes. In light mode, house them inside deep-pine cells so the dark UI feels intentional.
- Use explicit intrinsic dimensions. Hero image gets priority/fetch priority; lower images lazy-load. Provide responsive `sizes` and AVIF/WebP derivatives while retaining PNG fallbacks where text sharpness requires it.
- Suggested alt text, localized and concise: “Màn hình tổng quan Kim Tài hiển thị giá trị ước tính, số vàng đang giữ và giá tham khảo.” Decorative duplicate crops use empty alt.
- Labels/captions outside the image explain any key detail; do not depend on tiny raster text for comprehension.

## Language and theme behavior

- Route-level locales preferred: `/vi` and `/en`, with correct `<html lang>` and localized metadata. Do not choose language by IP.
- Show one language at a time; dual-language paragraphs would overload the bento. Header control: `VI` / `EN`, with accessible expanded labels.
- Allow at least 35% text expansion. No fixed copy heights or truncation on headings/actions.
- Theme default follows the system; explicit choice persists. Use a server-readable cookie or a pre-paint theme script to prevent flash/hydration mismatch.
- Controls: at least 44 × 44 px, filled selected state plus check/text (not color alone), meaningful `aria-label`, keyboard operable.
- Light and dark assets remain identical; only page tokens change.

## Motion

One motion idea only: the `Vòng Chỉ` ticks reveal in a quick accumulating sequence while the hero screenshot fades/settles 12 px into place.

- `motion-fast`: 140 ms; control feedback.
- `motion-base`: 220 ms; theme/control transitions.
- `motion-reveal`: 360 ms; hero entry; 35–45 ms tick stagger.
- Animate transform and opacity only. No `transition: all`, scroll-jacking, autoplay counters, parallax, perpetual rotation, or layout animation.
- Hover-capable devices: screenshot cells lift at most 2 px and deepen tonal shadow; hover reveals no essential content.
- `prefers-reduced-motion: reduce`: no stagger or translation; show motif and screenshots immediately; theme changes become instant.
- All animation interruptible. Page usable before motion completes.

## Accessibility and inclusive UX

- WCAG 2.1 AA minimum; the listed text pairs pass 4.5:1. Re-test implementation, including disabled/hover/focus states.
- Semantic `header`, `nav`, `main`, `section`, and `footer`; one H1; sequential headings; skip link.
- Visible keyboard focus via tokenized halo. Never remove outline without equivalent focus-visible treatment.
- Touch targets at least 44 × 44 px with 8 px separation. No hover-only action.
- Mint/rose always paired with **Mua/Buy** and **Bán/Sell**, directional icons, or other text. Color never carries meaning alone.
- Screen-reader reading order follows the mobile content order even when the desktop grid is asymmetric.
- Decorative motif and grain are `aria-hidden`; screenshots receive localized alt once, duplicates empty alt.
- Numbers, currency, dates, and times use `Intl.NumberFormat` / `Intl.DateTimeFormat`; preserve tabular figures. Do not hardcode separators from the screenshots into live HTML.
- Support browser zoom to 200%, reflow at 320 CSS px, no horizontal page scroll, no text rendered below 16 px for body/input.
- Theme toggle announces current state; language navigation has an unambiguous current-page state.

## Claim and trust guardrails

Allowed as screenshot-grounded descriptions, still confirm against the shipping build:

- Record/display personal gold holdings.
- Show estimated value/profit as estimates.
- Show reference buy/sell prices by source/region with visible timestamps.
- Offer Vietnamese/English, Lượng/Chỉ, reminder, preferred source, and appearance settings.

Require verification before publishing:

- “Data stays on this device” or any privacy/security promise. The screenshot contains this notice, but engineering and privacy policy must confirm actual data flows.
- Store availability, operator/publisher identity, support contact, price-source rights, update frequency, reminder behavior, and exact theme support.

Never claim or visually imply:

- Users can buy, sell, transfer, redeem, or custody gold through Kim Tài.
- Guaranteed accuracy, real-time prices, returns, savings, wealth growth, or risk reduction.
- Financial/investment advice, regulatory approval, certification, insurance, or partnership/endorsement by a displayed price provider.
- Customer count, rating, award, testimonial, security badge, or market statistic without verifiable evidence.

Persistent disclosure near market imagery: **Giá chỉ mang tính tham khảo; kiểm tra trực tiếp với đơn vị cung cấp trước khi quyết định. / Prices are for reference; confirm directly with the provider before making a decision.** Final legal wording must come from the legal baseline.

## Anti-pattern gate

Reject a build if it contains any of the following:

- AI-purple/blue gradient, gradient headline, neon glow, or pure black canvas.
- Generic centered SaaS hero or equal three-card feature row.
- Visible card, button, header, input, screenshot-frame, or section borders.
- Default shadcn visual styling, generic icon metaphors, or mixed icon families.
- Fake app-store badge/link, rating, testimonial, user count, award, partner logo wall, or unsupported numeric claim.
- Three equal phone mockups, auto carousel, stock team photo, generic gold-bar stock image, or 3D coin render.
- Copy such as “seamless,” “revolutionary,” “unlock wealth,” “next-gen,” or “invest smarter.”

## Validation checklist

- Check 320, 375, 768, 1024, 1440, and 1920 px; portrait and landscape mobile.
- Screenshot comparison in both themes; no persistent visible borders.
- Keyboard-only pass; focus halo visible on every control.
- VoiceOver/NVDA order matches mobile order; localized alt and control names.
- 200% zoom and long Vietnamese/English strings; no crop or horizontal scroll.
- Reduced-motion pass; no content depends on animation.
- Contrast pass for every semantic pair and interaction state.
- Network pass: reserved image space; hero optimized; below-fold media lazy.
- Content pass against claim guardrails and verified operator/store/legal data.

## Unresolved questions

- Official wordmark/logo and permission to modify or recreate it?
- Verified App Store/Google Play URLs and publisher identity?
- Shipped data-storage behavior, price-source permissions/update cadence, and final legal disclosure?
- Are all settings visible in the supplied screen available in the release build?

Status: DONE  
Summary: Production-ready visual direction translates the app's forest/ivory editorial identity into a borderless asymmetric bento website, with bilingual typography, tested theme tokens, responsive maps, screenshot treatment, and claim guardrails.  
Concerns/Blockers: Store links, publisher identity, data-flow claims, and price-source/legal wording require verification before launch.
