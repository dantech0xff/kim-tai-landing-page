# Kim Tài landing page

Status: Complete — release-gated preview

## Phases

- [x] [Phase 01 — Product, design, and legal baseline](./phase-01-baseline.md)
- [x] [Phase 02 — Next.js implementation](./phase-02-implementation.md)
- [x] [Phase 03 — Validation and review](./phase-03-validation.md)

## Dependencies

- Three supplied mobile-app screenshots
- Current Vietnam legal sources for privacy, electronic transactions, cybersecurity, and consumer protection
- Node.js package installation

## Acceptance criteria

- Responsive Next.js + Tailwind CSS landing page using all three supplied screenshots
- Functional system-aware dark/light mode with manual toggle
- Functional Vietnamese/English localization
- Terms of Service, Terms and Conditions, and Privacy Policy available in both languages
- Feature introduction and configurable App Store/Google Play calls to action
- Asymmetric bento layout with rounded surfaces and no visible borders
- User-facing content, links, legal text, and feature data sourced from JSON
- Lint, typecheck/build, and focused UI checks pass

## Completion evidence

- Content validation, TypeScript, ESLint, and the production build pass.
- Chrome/CDP smoke suite passes 91/91 at real 390 px mobile and 1440 px desktop metrics.
- All eight localized content/legal routes return successfully; the manifest is generated.
- Preview mode is intentionally `noindex`; release mode is blocked until verified operator and direct-store fields are configured.
