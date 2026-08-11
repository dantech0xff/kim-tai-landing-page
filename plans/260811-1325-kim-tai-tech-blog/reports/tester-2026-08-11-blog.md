# Vietnamese technical blog test report

> Superseded on 11 August 2026 by the concise four-section rewrite. Counts below describe the earlier long-form article; current evidence is in [reviewer-260811-1456-concise-blog-rewrite.md](./reviewer-260811-1456-concise-blog-rewrite.md).

Date: 2026-08-11  
Result: PASS

## Scope

- Reused production server `http://127.0.0.1:3000` (listener PID 987).
- Did not start/stop the server, run a build, or modify `.next`/`out`.
- Browser session: `tester-blog-slice-019fefaa`; closed after testing.

## Quality gates

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run validate:content` | 0 | Content schema checks passed. Expected preview-mode/noindex warning only. |
| `npm run typecheck` | 0 | Passed with no diagnostics. |
| `npm run lint` | 0 | Passed with no diagnostics. |

## HTTP contract

Checked with `curl -sS` against the live server.

| Route | Expected | Actual |
| --- | ---: | ---: |
| `/vi/blog/toi-lay-gia-vang-online-nhu-the-nao/` | 200 | 200 |
| `/en/blog/toi-lay-gia-vang-online-nhu-the-nao/` | 404 | 404 |
| `/vi/blog/khong-ton-tai/` | 404 | 404 |

Vietnamese HTML title: `Kim Tài lấy giá vàng online như thế nào?`.

## Browser checks

Used `agent-browser 0.13.0` against the live Vietnamese article.

### Desktop, 1440 x 900

- Document title matched expected article title.
- Exactly 1 `h1`.
- Exactly 12 `section.article-section` elements.
- Desktop TOC visible with 12 links.
- Mobile TOC present but hidden.
- Console log: empty.
- Page error log: empty.

### Mobile, 375 x 812

- Exactly 1 `h1` and 12 article sections.
- Mobile TOC and summary visible; desktop TOC hidden.
- Clicking the summary opened the disclosure and exposed all 12 links.
- First TOC link navigated to `#9999-khong-phai-la-gia`; target existed and landed at approximately 120 px from the viewport top.
- No horizontal overflow before or after opening the TOC: root/client and scroll widths both 375 px.
- Clean reload console log: empty.
- Clean reload page error log: empty.

## Test-harness note

One exploratory evaluation used `document.querySelector("#9999-khong-phai-la-gia")` and failed because a CSS ID selector beginning with a digit must be escaped. The assertion was rerun with `document.getElementById(...)` and passed. This was a test expression error, not an application console/page error; the subsequent clean reload logs were empty.

## Failures

No product failures found.

## Unresolved questions

None.
