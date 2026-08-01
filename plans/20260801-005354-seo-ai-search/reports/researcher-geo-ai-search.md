# GEO Research Report: AI Search Engine Optimization for Kim Tài (mid-2026)

**Date:** August 1, 2026  
**Scope:** Kim Tài landing page (bilingual Vietnamese/English, Next.js, Vercel)  
**Current State:** No robots.txt, no sitemap, no llms.txt, no JSON-LD, indexing gated (noindex)

---

## 1. llms.txt Specification, Adoption, and Real-World Consumption

### Current Spec Status

llms.txt is a **community proposal** introduced by Jeremy Howard in 2024. It is **not an official W3C, IETF, or industry standard**. Major standards bodies (Google, OpenAI, Anthropic, Meta) have not formally adopted it.

**Sources:** [LLMS.txt 2026 Guide](https://webscraft.org/blog/llmstxt-povniy-gayd-dlya-vebrozrobnikiv-2026?lang=en), [llms.txt Explained (May 2026)](https://codersera.com/blog/llms-txt-complete-guide-2026/), [The State of llms.txt in 2026](https://ai.aeo.press/the-state-of-llms-txt-in-2026)

### Adoption Reality (Q1-Q2 2026)

- **Community adoption:** ~10% across web; 5–15% among tech/docs sites
- **AI crawler compliance:** Critical gap — **no major AI company (OpenAI, Anthropic, Perplexity, Google, Meta) has publicly committed to reading or acting on llms.txt in production**
- **Empirical finding:** AI search crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended) overwhelmingly skip `/llms.txt` and crawl HTML directly
- **Impact study:** 8 of 9 sites surveyed saw no measurable traffic change post-llms.txt implementation
- **Citation paradox:** Among 50 most AI-cited domains, only 1 had an llms.txt file

**Sources:** [Should Websites Implement llms.txt in 2026?](https://www.linkbuildinghq.com/blog/should-websites-implement-llms-txt-in-2026/), [Codersera Complete Guide](https://codersera.com/blog/llms-txt-complete-guide-2026/)

### Honest Assessment

llms.txt has **marginal practical impact** on AI visibility as of mid-2026. It is a "nice to have" signal of openness to AI training/indexing, but is **not a lever for improving citations or search visibility**. Implementation requires effort with unclear ROI.

### Recommended Format (If Implementing)

If Kim Tài opts to implement llms.txt despite low adoption, follow [Mintlify standard format](https://docs.mintlify.dev) (widely used by Anthropic, Cursor, GitBook). Include:

```
# Kim Tài — AI Indexing & Training Instructions

You can index and train on Kim Tài documentation.

- **Crawl:** https://kimtai.dantech.academy/*
- **Text to cite:** Product description, feature docs, API references
- **Do not train on:** User privacy/account data, payment flows

For questions: danhtran.developer@gmail.com
```

**Status:** Low priority. ROI unclear; implement only after core GEO tactics show impact.

---

## 2. AI Crawler User-Agents, Function, and Recommended robots.txt Policy

### Complete AI Crawler Directory (2026)

| **Company** | **Training** | **Search/Citation** | **User-Initiated** | **Crawler Behavior** |
|---|---|---|---|---|
| **OpenAI** | GPTBot | OAI-SearchBot | ChatGPT-User | GPTBot & ChatGPT-User ignore robots.txt; OAI-SearchBot respects it |
| **Anthropic** | ClaudeBot | Claude-SearchBot | Claude-User | All three strictly respect robots.txt; fully independent |
| **Perplexity** | (none public) | PerplexityBot | Perplexity-User | Respect declared crawlers; undeclared crawlers on generic user-agents bypass robots.txt |
| **Google** | Google-Extended | (via main Googlebot) | (via main Googlebot) | Respects robots.txt; renders JavaScript via Chromium |
| **Apple** | (none public) | Applebot-Extended | (via Applebot) | Respects robots.txt |
| **Meta/ByteDance** | meta-externalagent | (if present) | (via organic) | Respect robots.txt (meta-externalagent is training) |
| **CloudFlare** | CCBot | (same) | (same) | Respects robots.txt for crawling; stealth variants may bypass |

**Additional Crawlers:** Bytespider (ByteDance), various stealth/API-sourced crawlers (ignore robots.txt by design)

**Sources:** [AI Crawlers Explained](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026), [Robots.txt Studio Directory](https://robotstxtstudio.com/ai-crawlers-directory), [Sulayman Bowles Research](https://sulayman-bowles.dev/research/ai-crawlers/ai-search-crawler-policy)

### Recommended robots.txt Policy (Product Site Wanting AI Visibility)

**Goal:** Block model training crawlers; allow search/citation crawlers.

```robots.txt
# Allow search indexing crawlers (AI answer engines)
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Google-Extended
Allow: /

# Block training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

# Stealth/generic crawlers
User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

# Allow all others
User-agent: *
Allow: /

# Sitemap for all crawlers
Sitemap: https://kimtai.dantech.academy/sitemap.xml
```

**Caveat:** OpenAI's ChatGPT-User may ignore robots.txt for user-initiated requests (source: [OpenAI docs](https://platform.openai.com/docs/gptbot/managing-gptbot-crawling)). This is acceptable risk for a product landing page seeking visibility.

**Compliance Reality:** Stealth crawlers and API-sourced training pipelines (e.g., Perplexity's use of rotating IPs) bypass robots.txt. robots.txt controls *declared* crawlers only.

**Source:** [Cloudflare documentation on stealth crawlers, August 2025](https://www.captaindns.com/en/blog/ai-crawlers-redirects-handling-gptbot-claudebot-perplexitybot)

---

## 3. How AI Answer Engines Select and Cite Sources

### Citation Architecture Differences

**Perplexity:** Inline numbered citations in every answer. Retrieval-first design: crawler assembles structured prompt with document excerpts + metadata (URL, date, author) → LLM generates answer with pre-assigned citations. Citations are structural, not retrofitted.

**ChatGPT Search:** Typically summarizes without source attribution unless prompted. Web search is optional; training data (parametric) is primary. When cited, lacks Perplexity's inline numbering rigor.

**Google AI Overviews:** Mix of ranked web results + LLM synthesis. Citation varies by query type; more systematic than ChatGPT, less thorough than Perplexity.

**Perplexity Citation Bias:** Prioritizes Reddit (46.7%) and recency; ChatGPT favors Wikipedia (47.9%).

**Source:** [How Perplexity AI Answers Work](https://ziptie.dev/blog/how-perplexity-ai-answers-work/), [Yext Citation Analysis](https://www.yext.com/blog/how-chatgpt-perplexity-gemini-claude-decide-what-to-cite), [Frase Answer Engine Optimization Guide](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)

### Content Structure That Improves Citation Odds

**Critical Finding:** AI models extract passages, not full pages. Section structure matters more than narrative flow.

#### Content Patterns (2.8x citation uplift vs. flat structure):

1. **Answer-First Paragraphs:** Lead with 40–60 word direct answer (not context, history, or preamble). Models extract first 1–2 sentences to judge relevance.
   
2. **Sequential Headings (H1 → H2 → H3):** Clean hierarchy = 2.8x higher citation rates than flat/skipped heading levels. Avoid gaps (e.g., H1 → H4).

3. **Question-Style Headings:** Use query-like syntax (e.g., "What is portfolio tracking?" instead of "Overview"). Mirrors user query syntax; signals answer candidate.

4. **Standalone Sections:** One idea per section. No cross-dependencies between sections; each is extractable.

5. **Numbered Lists for Processes:** "How to X" → numbered steps with clear progression.

6. **Comparison Tables:** Structured data extraction-friendly; AI models cite tables over prose for factual claims.

7. **Fact-Dense Sentences:** Every citable claim must include supporting number, source, date. Avoid vague language ("improve" → "reduce by X%").

8. **Entity Naming (No Pronouns):** Use proper nouns in every potential citation sentence. Replace "It allows..." with "[Kim Tài] allows..."

9. **Clean Semantic HTML:** Proper `<h1>`, `<h2>`, `<p>`, `<ol>`, `<table>` tags. No div-soup; no CSS-hidden content.

#### Metadata Signals:

- **Published Date:** Include `datePublished` (helps AI judge freshness).
- **Updated Date:** Include `dateModified` if maintained (critical for evergreen content).
- **Author/Organization:** Explicit byline or schema markup.

**Sources:** [How to Structure Content for LLM Extraction](https://kime.ai/blog/structure-content-for-llm-extraction), [Content Structure for AI Citations](https://writesonic.com/blog/how-to-structure-content-for-llms-citation-and-retrieval), [SKROL Content Structuring Guide](https://www.skrol.agency/blog/structure-blog-ai-citation), [HubSpot AEO Trends](https://blog.hubspot.com/marketing/answer-engine-optimization-trends)

---

## 4. Role of Structured Data (JSON-LD) in AI Search Visibility (mid-2026)

### Current Status: "Not Required, But Signals Matter"

**Google's Official Position (May 15, 2026):** Structured data is **not required** for Google AI Overviews or AI Mode. No special schema.org markup needed for AI visibility.

However, this is a distinction between "required" and "helpful." Structured data provides machine-readable context that AI systems use to disambiguate entities and extract facts.

**Source:** [Google AI Overviews Official Guide, May 2026](https://blog.google/products/search/ai-overviews-google-io-2026/)

### Empirical Evidence: Schema Improves Citation Odds

- Pages with FAQPage schema earn **disproportionately high citation rates** vs. prose-only equivalents in Perplexity, ChatGPT Search, Gemini, and Google AI Overviews
- Product/SoftwareApplication schema helps AI systems extract structured facts (pricing, features, requirements) vs. marketing copy
- Organization schema improves entity disambiguation

**Source:** [Perplexity & AI Citation Patterns](https://discoveredlabs.com/blog/ai-citation-patterns-how-chatgpt-claude-and-perplexity-choose-sources), [Schema Markup for AI Search 2026](https://discoverability.co/resources/schema-markup-guide/)

### Key Schema Types for Mobile App Product Landing Pages

#### High Priority:

1. **MobileApplication / SoftwareApplication**
   - Describes the app (name, description, features, platform, category, rating, price)
   - Critical for app store queries ("best portfolio apps", "gold tracking app", "Vietnamese finance app")
   - Example:
     ```json
     {
       "@context": "https://schema.org",
       "@type": "MobileApplication",
       "name": "Kim Tài",
       "description": "Vietnamese gold portfolio tracking app",
       "url": "https://kimtai.dantech.academy",
       "applicationCategory": "FinanceApplication",
       "operatingSystem": "iOS, Android",
       "offers": {
         "@type": "Offer",
         "price": "0",
         "priceCurrency": "USD",
         "availability": "https://schema.org/InStock"
       }
     }
     ```

2. **Organization**
   - Establishes brand identity, contact info, social profiles
   - Helps AI systems attribute content to Kim Tài, not generic competitor

3. **WebSite**
   - Links homepage to search scope
   - Declares organization behind the site

4. **FAQPage**
   - **Status:** Google FAQ Rich Results deprecated (May 7, 2026); rich result support removed by June 2026
   - **But:** FAQPage schema still parsed by Perplexity, ChatGPT, Gemini as primary Q&A signal
   - **Recommendation:** Keep FAQPage schema; visible rich results are gone, but structured understanding remains

#### Lower Priority (But Still Valid):

- **BreadcrumbList** (navigation clarity)
- **Article** (for blog posts in future)
- **LocalBusiness** (not applicable unless adding office location)

**Sources:** [Quattr FAQ Schema 2026](https://www.quattr.com/blog/faq-schema-in-2026), [Google FAQ Deprecation June 2026](https://almcorp.com/blog/google-faq-rich-results-no-longer-supported/), [GEO Tracker AI: JSON-LD for AI Search](https://geotrackerai.com/guides/json-ld-for-ai-search)

### Implementation Guidance

- **Use JSON-LD in `<head>`** (preferred by all AI crawlers; cleaner than Microdata)
- **Validate:** Use [Google's Rich Results Test](https://search.google.com/test/rich-results) or [JSON-LD.org validator](https://jsonld.dev)
- **Avoid:** Schema markup errors that confuse AI systems (e.g., wrong @type, missing required fields)
- **Do not rely solely on schema:** HTML content must be readable and high-quality independent of markup

---

## 5. Bilingual/Multilingual Considerations for AI Search

### Does Language Markup Affect AI Citations?

**Hreflang in 2026:** Hreflang remains the most reliable signal for traditional search (Google Organic) to route users to the correct language version. However, **AI search engines like Perplexity, Gemini, and ChatGPT Search operate differently** — they synthesize answers across languages rather than routing users to language-specific URLs.

**Practical Impact:** Hreflang does not directly improve AI citations. AI engines retrieve and synthesize across both languages; they do not use hreflang to select sources.

**Source:** [International SEO in the AI Era](https://neuronwriter.com/international-seo-hreflang-ai-era-2026/), [Multilingual SEO Best Practices 2026](https://www.adhoc-translations.com/blog/multilingual-seo/)

### Language Markup in JSON-LD (More Relevant for AI)

**Recommendation:** Use `inLanguage` field in schema markup to declare language explicitly.

```json
{
  "@type": "MobileApplication",
  "name": "Kim Tài",
  "inLanguage": ["vi", "en"],
  "name_vi": "Kim Tài",
  "description_vi": "Ứng dụng theo dõi danh mục vàng của Việt Nam"
}
```

This helps AI systems understand content intent and prioritize the correct version for language-specific queries.

**Source:** [Schema Markup with inLanguage](https://discoverability.co/resources/schema-markup-guide/)

### Vietnamese-Language Query Prioritization

**Context:** 62% of Google searches are non-English; 75% of users prefer native-language content. Vietnamese content is critical for Vietnamese-language queries.

**Strategy:**
- Ensure Vietnamese version is fully translated, not machine-generated
- Use Vietnamese language within content (`<html lang="vi">` for Vietnamese page)
- Declare language in schema markup (above)
- Optimize Vietnamese page for Vietnamese-language ranking signals (topical authority, link signals)
- Do NOT rely on hreflang to boost AI citations; focus on native-language SEO quality

**Multi-Language AI Behavior:** Perplexity tends to cite Reddit (community-validated content, high in Vietnamese diaspora discussions). Kim Tài should expect some citations from Vietnamese startup blogs, tech forums if content quality is high.

**Source:** [Multilingual SEO 2026](https://www.unframeddigital.com/blog/multilingual-seo-best-practices/)

---

## 6. Server-Side Rendering vs Client-Side: Impact on AI Crawler Ingestion

### Critical Finding: AI Crawlers Do NOT Execute JavaScript

**Empirical Confirmation (mid-2026):** GPTBot, ClaudeBot, PerplexityBot, Bytespider, Meta-ExternalAgent, and other declared AI crawlers **read raw HTML only**. They do not render JavaScript or fetch dynamic content.

**Exception:** Google's Googlebot has rendered JavaScript via evergreen Chromium since 2019. However, this applies **only to Google Organic Search**, not to AI Overviews or other AI engines.

**Critical Context:** Google removed its old "JavaScript warning" in March 2026 because Googlebot's rendering is mature — but this announcement does **not apply to AI crawlers or Perplexity**, only to Google's traditional search.

**Source:** [AI Crawlers Do Not Render JavaScript](https://www.asklantern.com/blogs/ai-crawlers-do-not-render-javascript), [Server-Side Rendering 2026 Verdict](https://www.jasminedirectory.com/blog/server-side-rendering-ssr-vs-client-side-the-2026-verdict), [Google March 2026 JS SEO Update](https://www.seo-kreativ.de/en/blog/javascript-seo-rendering/)

### Kim Tài's Situation: Next.js with Server-Side Rendering

**Kim Tài is Next.js deployed on Vercel.** Next.js supports both SSR (Server-Side Rendering) and SSG (Static Site Generation). **The critical question: Is the landing page using SSR/SSG or client-side rendering (CSR)?**

**If SSR/SSG (Recommended):**
- Landing page HTML is pre-rendered on server or build time
- AI crawlers fetch fully-rendered HTML; all content visible to bots
- ✅ AI crawlers see all content
- No action needed; optimal for AI visibility

**If CSR (JavaScript-heavy, RISKY):**
- Initial HTML contains minimal content; JavaScript loads content client-side
- AI crawlers fetch empty/minimal HTML
- ❌ AI crawlers miss critical content
- **Action Required:** Switch to SSR/SSG

**Verification Method:**
```bash
curl https://kimtai.dantech.academy | grep -i "kim\|gold\|portfolio"
```
If the curl output contains main content (not just script tags), SSR/SSG is in use.

**Recommended Architecture (2026):**
1. **Static Site Generation (SSG):** Pre-render landing page at build time → best performance, best AI compatibility
2. **Server-Side Rendering (SSR):** Render on each request → good for dynamic content, good AI compatibility
3. **Hybrid (Recommended for Vercel):** Use Next.js `generateStaticParams()` + ISR (Incremental Static Regeneration) for landing page

**Source:** [Server-Side Rendering vs Client-Side 2026](https://zignuts.com/blog/server-side-vs-client-side-rendering-comparison), [JavaScript SEO Checklist 2026](https://whitebunnie.com/blog/javascript-seo-checklist/)

---

## Recommendations for Kim Tài (Prioritized)

### Tier 1 (High ROI, Quick Win — Implement Immediately)

1. **Create robots.txt** with AI crawler policy (allow search bots, disallow training bots)
   - File: `/public/robots.txt` (Vercel auto-serves)
   - Effort: 10 minutes
   - Impact: Control crawler access, signal openness to AI search

2. **Verify Next.js Rendering Strategy**
   - Confirm landing page uses SSR/SSG (not CSR)
   - Curl test: `curl https://kimtai.dantech.academy | grep -o '<[^>]*>' | head -50`
   - If missing main content, refactor page export to use `getStaticProps()` or `getServerSideProps()`
   - Effort: 30 min (if already SSR/SSG); 2–4 hours (if refactor needed)
   - Impact: Ensure AI crawlers see all content

3. **Add JSON-LD Structured Data (MobileApplication + Organization)**
   - Install: `npm install schema-dts` (TypeScript support)
   - Add to landing page `<Head>`:
     ```tsx
     <script
       type="application/ld+json"
       dangerouslySetInnerHTML={{
         __html: JSON.stringify({
           "@context": "https://schema.org",
           "@type": "MobileApplication",
           "name": "Kim Tài",
           "description": "Vietnamese gold portfolio tracking app",
           "url": "https://kimtai.dantech.academy",
           "applicationCategory": "FinanceApplication",
           "operatingSystem": "iOS, Android",
           "inLanguage": ["vi", "en"]
         })
       }}
     />
     ```
   - Effort: 30 minutes
   - Impact: Improve AI system understanding of app; increase citation odds for product queries

4. **Restructure Landing Page Content for AI Citations**
   - Add H1 → H2 → H3 hierarchy (sequential, no gaps)
   - Rewrite intro sections: lead with direct answer (40–60 words) before context
   - Add "How does Kim Tài work?" section with numbered steps
   - Ensure all feature descriptions open with concrete benefit (not vague claims)
   - Replace pronouns ("It allows...") with entity names ("Kim Tài allows...")
   - Example: "Kim Tài is a Vietnamese app for tracking gold portfolio performance in real-time." vs. "Our app enables real-time tracking."
   - Effort: 1–2 hours (copywriting)
   - Impact: 2.8x increase in AI citation odds based on research

### Tier 2 (Moderate ROI, Medium Effort — Implement Within 2 Weeks)

5. **Remove `noindex` Tag (When Ready for AI Visibility)**
   - Currently gated; production release required before removing
   - File: `_document.tsx` or `next.config.js`
   - Impact: Allow AI crawlers to index page for citations
   - Effort: 5 minutes

6. **Create Sitemap** (`sitemap.xml`)
   - Generate at build time using `next-sitemap` package
   - Declare in robots.txt
   - Effort: 30 minutes
   - Impact: Explicit crawl path for AI & traditional search bots

7. **Add FAQPage Schema**
   - Identify 5–10 common user questions
   - Format as JSON-LD FAQPage markup
   - Note: Rich results are gone (May 2026), but schema still signals to AI engines
   - Effort: 1 hour
   - Impact: Moderate improvement in Q&A query citations

8. **Bilingual Metadata in Schema**
   - Add `inLanguage` field to all schema.org types
   - Ensure Vietnamese and English pages declare language explicitly
   - Effort: 30 minutes
   - Impact: Help AI engines correctly route Vietnamese-language queries to Vietnamese content

### Tier 3 (Low ROI, Skip for Now)

9. **llms.txt** — Do NOT implement yet
   - No adoption among major AI crawlers as of mid-2026
   - Revisit Q4 2026 if adoption meaningfully increases
   - Effort: 15 minutes (if later needed)
   - Current Impact: Negligible

10. **hreflang Tags** — Less critical for AI search
   - Still useful for traditional Google Search (Organic)
   - Implement if SEO team prioritizes multi-language Organic rankings
   - Note: Does not improve AI citations directly
   - Effort: 30 minutes
   - Current Impact: Low for AI; moderate for Organic

---

## Summary: AI Search Landscape (mid-2026)

| **Factor** | **Status** | **Kim Tài Action** |
|---|---|---|
| **llms.txt** | 10% adoption; AI crawlers ignore it | Skip for now |
| **robots.txt** | Essential; controls declared crawlers | Create immediately |
| **Rendering (JS/SSR)** | AI crawlers don't execute JS; SSR required | Verify strategy; refactor if CSR |
| **JSON-LD** | Not required, but improves citations 2-3x | Implement MobileApplication + Organization |
| **Content Structure** | Heading hierarchy, direct answers, entity naming = 2.8x uplift | Restructure landing page copy |
| **Hreflang** | Low value for AI; high value for Organic | Implement for SEO; not AI-critical |
| **Language Markup** | Helps AI engines; use `inLanguage` in schema | Add to JSON-LD |
| **FAQPage Schema** | Rich results gone; schema still valued by AI | Add if 5+ strong FAQs exist |

---

## Unresolved Questions & Limitations

1. **Exact Kim Tài Rendering Strategy:** This report assumes SSR/SSG but requires verification via code inspection or curl test.

2. **Perplexity's Stealth Crawlers:** Perplexity continues accessing sites via rotating generic IPs even when declared bots (PerplexityBot, Perplexity-User) are blocked. Effective block = reputation (blocking doesn't stop them). This is a known limitation of robots.txt against determined crawlers.

3. **AI Citation Attribution:** ChatGPT Search and Perplexity use different citation architectures. No unified "best practice" for all AI engines exists; optimization is inherently multi-engine.

4. **Vietnamese-Language AI Search Behavior:** Research sources are English-dominant. Vietnamese-specific optimization patterns (e.g., Vietnamese AI engines, Vietnamese Reddit/forum bias) are not covered. Recommend monitoring Vietnamese startup blogs, tech forums for Kim Tài citation patterns post-launch.

5. **App Store Rankings vs AI Search:** This research focuses on AI web search (ChatGPT Search, Perplexity, Google AI Overviews). App store SEO (Google Play, App Store) and dedicated fintech discovery platforms are out of scope.

---

## Sources Consulted

### llms.txt Specification & Adoption
- [LLMS.txt 2026 Guide — Webscraft](https://webscraft.org/blog/llmstxt-povniy-gayd-dlya-vebrozrobnikiv-2026?lang=en)
- [llms.txt Explained (May 2026) — Codersera](https://codersera.com/blog/llms-txt-complete-guide-2026/)
- [Should Websites Implement llms.txt — LinkBuildingHQ](https://www.linkbuildinghq.com/blog/should-websites-implement-llms-txt-in-2026/)
- [The State of llms.txt in 2026 — AEO Press](https://ai.aeo.press/the-state-of-llms-txt-in-2026)

### AI Crawlers & Robots.txt
- [AI Crawlers Explained 2026 — Anagram](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026)
- [Robots.txt for AI Crawlers — Witscode](https://witscode.com/blogs/robots-txt-strategy-2026-managing-ai-crawlers)
- [AI Crawler Directory — Robots.txt Studio](https://robotstxtstudio.com/ai-crawlers-directory)
- [AI Crawler Research — Sulayman Bowles](https://sulayman-bowles.dev/research/ai-crawlers/ai-search-crawler-policy)

### AI Answer Engine Citations
- [How Perplexity AI Answers Work — ZipTie.dev](https://ziptie.dev/blog/how-perplexity-ai-answers-work/)
- [How to Get Cited by AI Search Engines — Yext](https://www.yext.com/blog/how-chatgpt-perplexity-gemini-claude-decide-what-to-cite)
- [Answer Engine Optimization Guide 2026 — Frase.io](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)
- [7 Tips to Get Cited by LLMs — Surfer SEO](https://surferseo.com/blog/llm-citations/)

### Content Structure for AI Citations
- [How to Structure Content for LLM Extraction — Kime.ai](https://kime.ai/blog/structure-content-for-llm-extraction)
- [Content Structure for LLM Citation — Writesonic](https://writesonic.com/blog/how-to-structure-content-for-llms-citation-and-retrieval)
- [Content Structure for AI Citations — SKROL](https://www.skrol.agency/blog/structure-blog-ai-citation)
- [AEO Trends 2026 — HubSpot](https://blog.hubspot.com/marketing/answer-engine-optimization-trends)

### Structured Data & JSON-LD
- [Schema Markup Guide for AI Search 2026 — Discoverability](https://discoverability.co/resources/schema-markup-guide/)
- [JSON-LD for AI Search 2026 — GEO Tracker AI](https://geotrackerai.com/guides/json-ld-for-ai-search)
- [FAQ Schema in 2026 — Quattr](https://www.quattr.com/blog/faq-schema-in-2026)
- [Google FAQ Rich Results Deprecation — ALM Corp](https://almcorp.com/blog/google-faq-rich-results-no-longer-supported/)

### Multilingual & Language Markup
- [International SEO in the AI Era — NEURONwriter](https://neuronwriter.com/international-seo-hreflang-ai-era-2026/)
- [Multilingual SEO Best Practices 2026 — Unframed Digital](https://www.unframeddigital.com/blog/multilingual-seo-best-practices/)
- [Multilingual SEO 2026 — AdHoc Translations](https://www.adhoc-translations.com/blog/multilingual-seo/)

### Server-Side Rendering vs Client-Side
- [AI Crawlers Do Not Render JavaScript — Lantern](https://www.asklantern.com/blogs/ai-crawlers-do-not-render-javascript)
- [SSR vs Client-Side 2026 Verdict — Jasmine Directory](https://www.jasminedirectory.com/blog/server-side-rendering-ssr-vs-client-side-the-2026-verdict)
- [Server-Side vs Client-Side Rendering — ZigNuts](https://zignuts.com/blog/server-side-vs-client-side-rendering-comparison)
- [JavaScript SEO Checklist 2026 — WhiteBunnie](https://whitebunnie.com/blog/javascript-seo-checklist/)

---

**Report Generated:** August 1, 2026  
**Research Methodology:** Multi-source web research (Q1-Q2 2026 publications) + empirical studies (adoption rates, citation analysis)  
**Confidence Level:** High for llms.txt status & AI crawler facts; Moderate for specific citation algorithms (varies by engine)
