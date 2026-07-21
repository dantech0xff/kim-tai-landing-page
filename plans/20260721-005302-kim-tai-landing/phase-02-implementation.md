# Phase 02 — Next.js implementation

Status: Completed

## Requirements

- Next.js App Router, TypeScript, Tailwind CSS.
- Static-first rendering with small client islands for theme and locale.
- JSON-owned localized content and legal documents.
- No visible borders; surfaces separate through tone, spacing, and shadow.

## Files

- Create application configuration and source files at the project root.
- Create optimized public assets under `public/`.

## Steps

1. Scaffold the app and install pinned dependencies.
2. Add content schemas and JSON configuration.
3. Build shared navigation, theme/locale controls, bento sections, download CTAs, and legal routes.
4. Add metadata, manifest, accessibility, and responsive behavior.

## Validation

- Both locales and both themes work without reload errors.
- Every screenshot is rendered with declared dimensions and descriptive alt text.
- Store CTA behavior reflects configured URLs and never uses fabricated links.

## Risks and rollback

- If package versions conflict with the runtime, pin the latest compatible stable versions verified from official package metadata.

## Result

- Static VI/EN landing and six bilingual legal routes implemented with exact-pinned Next.js/Tailwind dependencies.
- Theme, manifest, metadata, responsive bento layout, verified-only store states, and JSON configuration implemented.
- Release validator runs before every production build and preview metadata remains `noindex`.
