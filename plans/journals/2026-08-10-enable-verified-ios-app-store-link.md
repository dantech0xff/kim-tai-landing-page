---
title: Enable verified iOS App Store link
date: 2026-08-10
summary: Published verified iOS CTAs and synchronized user-facing release guidance
---

# Enable verified iOS App Store link

## What happened

Enabled the verified iOS App Store identity and URL in `src/content/site.json`. Review first caught stale VI/EN FAQ copy; a later docs audit caught stale VI/EN download descriptions that incorrectly tied CTA activation to the full release gate. The user approved both corrections. Final tracked functional/docs scope: `src/content/site.json`, `README.md`, and `docs/deployment.md`; plan and PM report were synchronized under `plans/`.

## Decision

Keep published store CTAs independent from `release.ready` and `operator.configured`. Preserve the preview/noindex gate, Android configuration, application logic, and public contracts. Documentation impact minor. AgentWiki publish skipped.

## Verification

Final review found no actionable issues. `git diff --check`, `validate:content`, `typecheck`, `lint`, and `build` all exited 0; build produced 13 static pages. Browser smoke passed 181/181, including rendered revised descriptions, 4 exact iOS anchors, synchronized FAQ/FAQPage JSON-LD, `Android, iOS`, and preview `noindex`. Server PID 14717 was stopped and port 3000 was free.

## Next steps

Root/user decides whether to commit the 3 tracked functional/docs files plus plan, report, and journal artifacts. No commit, PR, push, or release action performed.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
