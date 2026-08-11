---
phase: 3
title: "Validation, documentation, and deployment"
status: completed
---

# Phase 03: Validation, documentation, and deployment

## Context

- `scripts/validate-content.mjs`
- `scripts/validate-pages-export.mjs`
- `scripts/browser-smoke.mjs`
- `README.md`
- `docs/deployment.md`

## Requirements

- Keep executable validation aligned with the concise four-section article contract.
- Verify the existing routes and release gates remain intact.
- Update only evergreen documentation affected by the new public route and content source.

## Files

- Modify `scripts/validate-content.mjs` and `scripts/validate-pages-export.mjs`.
- Modify `scripts/browser-smoke.mjs` only if needed for repeatable blog viewport checks.
- Modify `README.md` and `docs/deployment.md`.
- Update this plan after fresh verification and review.

## Implementation

1. Validate blog slug, locale, dates, metadata lengths, tags, concise section count, pipeline, unique section IDs, supported block shapes, non-empty code/table/list data, and `llms.txt` discovery.
2. Validate the Pages article artifact, canonical/alternates, social metadata, JSON-LD types, visible content markers, sitemap count, and base-path safety. Assert `out/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/index.html` exists, no corresponding `out/en/blog/...` artifact or sitemap/hreflang exists, and the rendered language switch targets `${basePath}/en/`.
3. Run focused content/type/lint checks, then Vercel and Pages builds, export validation, and browser checks at 375 px and desktop.
4. Review the pending diff for spec compliance, secrets, route regressions, and unsupported claims; fix only evidence-backed issues.
5. Reconcile this stateful plan and deployment report with fresh evidence. Evergreen README and deployment docs change only if their route or command contract changed.
6. Deploy the verified worktree to the existing Vercel production project and repeat HTTP plus browser checks on the custom-domain article URL.

## Validation

```bash
npm run validate:content
npm run typecheck
npm run lint
npm run build
GITHUB_PAGES=true GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page npm run build
GITHUB_REPOSITORY=dantech0xff/kim-tai-landing-page npm run validate:pages
git diff --check
```

Browser evidence must cover the article at 375 px and desktop, absence of overflow, exactly four article sections, required static text/schema, and zero console/page errors.

## Completion evidence

- Content validation, typecheck, lint, Vercel build, Pages build, Pages validation, and `git diff --check` passed.
- Vercel deployment `dpl_944j7vrC5RFVPrxauvhqjavpUaCh` is ready and aliased to the custom domain. Production HTTP and browser checks passed for the four-section article.
- Evidence: [review and verification](./reports/reviewer-260811-1456-concise-blog-rewrite.md) and [deployment report](./reports/deployment-2026-08-11-blog.md).

## Risks and rollback

- Static-export validation now classifies landing, legal, and article routes; future public route kinds must extend that model without weakening exact checks.
- Do not start duplicate long-running servers; reuse or stop only a process started by this task.
- If browser automation is unavailable, record the limitation and rely on production HTML plus screenshots; do not claim visual verification.
