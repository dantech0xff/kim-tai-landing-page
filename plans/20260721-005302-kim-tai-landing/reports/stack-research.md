# Stack Research: Minimal Next.js + Tailwind Scaffold

Date: 2026-07-20
Scope: static-first landing site, App Router, TypeScript, Tailwind CSS, JSON-owned content, static legal routes.

## Local runtime

- Node.js: `v22.21.0`
- npm: `10.9.4`
- Repo state: no `package.json` yet, no root `README.md` found, no app scaffold present.

## Verdict

Use a minimal Next App Router scaffold with exact stable pins, not canary/range drift. The cleanest path is:

1. `create-next-app` with the default Next starter options for App Router + TypeScript + Tailwind + ESLint.
2. Keep the app static by default.
3. Use a tiny client island only for theme and locale toggles.
4. Store localized page/legal copy in JSON and import it into Server Components.

This fits the current runtime. Next.js docs require Node `20.9+`; Node `22.21.0` is safely above that. [Next installation docs](https://nextjs.org/docs/app/getting-started/installation)

## Recommended package set

Pin these current stable versions:

- `next@16.2.10`  
- `react@19.2.7`
- `react-dom@19.2.7`
- `tailwindcss@4.3.3`
- `@tailwindcss/postcss@4.3.3`
- `postcss@8.5.20`
- `typescript@7.0.2` or the latest stable TypeScript that passes `next build` in this repo

Why this set:

- `next@16.2.10` is the current npm latest stable tag for Next.js. [npm](https://www.npmjs.com/package/next?activeTab=versions)
- `react@19.2.7` and `react-dom@19.2.7` are the current stable tags. [react](https://www.npmjs.com/package/react) [react-dom](https://www.npmjs.com/package/react-dom)
- Tailwind CSS v4.3.3 is current stable. Tailwind v4 is CSS-first and uses `@import "tailwindcss";` plus the PostCSS plugin. [tailwindcss](https://www.npmjs.com/package/tailwindcss?activeTab=versions) [Tailwind PostCSS install](https://tailwindcss.com/docs/installation/using-postcss) [Tailwind v4.3](https://tailwindcss.com/blog/tailwindcss-v4-3)
- The Tailwind docs explicitly say the PostCSS route is the seamless integration path for Next.js. [Tailwind PostCSS install](https://tailwindcss.com/docs/installation/using-postcss)

## Minimal scaffold shape

Use the default App Router root with no extra architecture:

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `app/(legal)/privacy/page.tsx`
- `app/(legal)/terms/page.tsx`
- `app/(legal)/cookies/page.tsx` if needed
- `content/*.json` for localized text/data
- `public/*` for static assets

Relevant Next.js facts:

- `page.tsx` makes a route publicly accessible.
- Pages are Server Components by default.
- `layout.tsx` defines the root `<html>` and `<body>`.
- Route groups let you organize segments without affecting URLs.
- File-based metadata and manifest files are first-class.

Sources: [page](https://nextjs.org/docs/app/api-reference/file-conventions/page) [layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout) [route groups / file conventions](https://nextjs.org/docs/app/api-reference/file-conventions) [metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) [manifest](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)

## Minimal scripts

Keep scripts small:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  }
}
```

This matches Next's documented build flow and keeps CI honest on type safety. [Next installation docs](https://nextjs.org/docs/app/getting-started/installation) [Next TypeScript docs](https://nextjs.org/docs/app/api-reference/config/typescript)

## Tailwind config

For Tailwind v4, avoid the old v3 mental model. Do this instead:

```mjs
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

```css
/* app/globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

This gives a class-driven dark mode variant while keeping the site static-first. Tailwind v4 docs also note that v4 is zero-runtime and that CSS-first theme variables are preferred. [Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode) [Tailwind theme variables](https://tailwindcss.com/docs/theme)

## Dark mode approach

Recommended: class-based `dark` mode on `<html>`, toggled by a tiny client island or an inline bootstrap script that reads `localStorage`.

Why this is the best fit:

- Works with Tailwind's documented `dark` variant override.
- Keeps the rest of the tree server-rendered.
- Avoids making the whole app client-side just for theme state.

Alternative: `data-theme="dark"` on `<html>`. Same model, slightly clearer semantics, but class-based is simpler for Tailwind utility usage. [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode)

## JSON import behavior

Use JSON as the source of truth for content and locale data, but keep the import semantics explicit:

- In normal App Router components, JSON imports are fine when TypeScript is configured with `resolveJsonModule`.
- Next's TypeScript setup automatically generates `next-env.d.ts` and recommended TS config when you scaffold or run `next dev`/`next build`.
- If you switch a file to Node's native `nodenext` resolver context, TypeScript 5.8+ expects JSON import attributes: `with { type: "json" }`.

Practical recommendation:

- Keep app code on the standard Next build pipeline.
- Use default JSON imports in UI/server code.
- Only use `with { type: "json" }` in `next.config.ts` or other Node-native ESM contexts if the resolver requires it.

Sources: [Next TypeScript docs](https://nextjs.org/docs/app/api-reference/config/typescript) [TypeScript resolveJsonModule](https://www.typescriptlang.org/tsconfig/resolveJsonModule.html) [TypeScript 5.8 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)

## Static legal routes

Make legal pages plain App Router pages:

- `app/(legal)/privacy/page.tsx`
- `app/(legal)/terms/page.tsx`
- `app/(legal)/cookies/page.tsx` if required

Keep them static by default:

- no `cookies()`
- no `headers()`
- no `searchParams`
- no data fetches that opt into dynamic rendering

If you want a hard guardrail, add:

```ts
export const dynamic = 'force-static'
```

Next documents `force-static` as the route-segment option that enforces static rendering. [Route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) [page docs](https://nextjs.org/docs/app/api-reference/file-conventions/page)

## Likely pitfalls

- Do not install canary Next/Tailwind for a new static landing page.
- Do not keep Tailwind v3 habits: no `tailwind.config.js`-first setup, no `@tailwind base/components/utilities`, no `autoprefixer`/`postcss-import` unless another tool needs them. Tailwind v4 moved the plugin to `@tailwindcss/postcss`. [Tailwind upgrade guide](https://tailwindcss.com/docs/upgrade-guide?from=20423&from_column=20423)
- Do not use `useSearchParams`, `cookies()`, or `headers()` in pages that must stay static.
- Do not make the whole layout a client component just for theme switching.
- Do not assume older browser support beyond Tailwind v4's tested baseline; v4 targets modern browsers. [Tailwind compatibility](https://tailwindcss.com/docs/compatibility)

## Ranked recommendation

1. Exact-pinned stable scaffold with current releases above. Best fit for a new landing page: lowest drift, easiest rollback, least surprise.
2. `create-next-app` defaults plus lockfile-only pinning. Acceptable, but less explicit than exact pins.
3. Any canary or preview stack. Not appropriate here.

## Sources used

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js page file convention](https://nextjs.org/docs/app/api-reference/file-conventions/page)
- [Next.js layout file convention](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Next.js TypeScript config](https://nextjs.org/docs/app/api-reference/config/typescript)
- [Next.js route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Tailwind CSS PostCSS install](https://tailwindcss.com/docs/installation/using-postcss)
- [Tailwind CSS dark mode](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4.3 blog](https://tailwindcss.com/blog/tailwindcss-v4-3)
- [npm: next](https://www.npmjs.com/package/next?activeTab=versions)
- [npm: react](https://www.npmjs.com/package/react)
- [npm: react-dom](https://www.npmjs.com/package/react-dom)
- [npm: tailwindcss](https://www.npmjs.com/package/tailwindcss?activeTab=versions)
- [npm: @tailwindcss/postcss](https://www.npmjs.com/package/%40tailwindcss/postcss?activeTab=versions)
- [npm: postcss](https://www.npmjs.com/package/postcss)
- [TypeScript resolveJsonModule](https://www.typescriptlang.org/tsconfig/resolveJsonModule.html)
- [TypeScript 5.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)

Status: DONE
Summary: Verified the current runtime and official package/docs guidance; exact stable pins and a class-based dark-mode/static-route scaffold are the best fit.
Concerns/Blockers: TypeScript 7.0.2 is current stable on npm, but if the repo later shows TS/plugin friction, keep the Next-generated version and only upgrade after a clean `next build`.
