# Production deployment: concise Vietnamese technical blog

Date: 2026-08-11  
Platform: Vercel production  
Result: Ready and aliased

## Deployment

- Command: `vercel deploy --prod --yes`
- Project: `dan-tech-projects/kim-tai-landing-page`
- Deployment ID: `dpl_944j7vrC5RFVPrxauvhqjavpUaCh`
- Deployment URL: <https://kim-tai-landing-page-8i7vq3rpa-dan-tech-projects.vercel.app>
- Custom domain: <https://kimtai.dantech.academy>
- Article: <https://kimtai.dantech.academy/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/>

This deployment replaces the superseded 12-section, 16-minute article with the user-requested four-section, seven-minute data-pipeline explanation.

## Production verification

- Deployment status `READY`; custom-domain alias applied.
- Vietnamese article returns `200`; English equivalent and unknown slug return `404`.
- Production renders one H1 and exactly four article sections. The first section is “Toàn bộ luồng trong một phút”; the former incident heading is absent.
- Canonical and metadata alternates expose only `vi` and `x-default`; `TechArticle` JSON-LD is present.
- Desktop and 375 px browser checks passed with no horizontal overflow, console error, or page error.
- Production currently emits `noindex, nofollow` because the existing legal/release gate remains incomplete. The page is publicly testable; indexing was not enabled by this deployment.

## Source and rollback

This deployment was created from the verified local worktree. The changes remain uncommitted and unpushed, so a later Git-integrated deployment from the current `main` branch could supersede it.

Rollback target if required:

```bash
vercel rollback kim-tai-landing-page-lc6ecm881-dan-tech-projects.vercel.app
```

The rollback target is the previous long-form deployment. No rollback, commit, push, or pull request was performed.

## Unresolved questions

None.
