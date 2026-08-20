import Link from "next/link";
import type { ReactNode } from "react";

import { AppIcon } from "@/components/app-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreButtons } from "@/components/store-buttons";
import {
  formatBlogDate,
  type BlogArticle,
  type BlogBlock,
} from "@/lib/content";

interface TechBlogArticleProps {
  article: BlogArticle;
}

function renderInlineText(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

function ArticleToc({ article, mobile = false }: TechBlogArticleProps & { mobile?: boolean }) {
  const navigation = (
    <nav aria-label={article.tocLabel}>
      {article.sections.map((section, index) => (
        <a href={`#${section.id}`} key={section.id}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {section.title}
        </a>
      ))}
    </nav>
  );

  if (mobile) {
    return (
      <details className="article-toc article-toc--mobile">
        <summary>
          {article.tocLabel}
          <AppIcon name="arrow-down" size={18} />
        </summary>
        {navigation}
      </details>
    );
  }

  return (
    <aside className="article-toc article-toc--desktop">
      <p>{article.tocLabel}</p>
      {navigation}
    </aside>
  );
}

function renderBlock(block: BlogBlock, key: string) {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{renderInlineText(block.text)}</p>;
    case "callout":
      return (
        <aside
          aria-label={block.title}
          className={`article-callout article-callout--${block.tone}`}
          key={key}
        >
          <strong>{block.title}</strong>
          <p>{renderInlineText(block.text)}</p>
        </aside>
      );
    case "code":
      return (
        <figure className="article-code" key={key}>
          <figcaption>
            <span>{block.label}</span>
            <span>{block.language}</span>
          </figcaption>
          <pre tabIndex={0}>
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className="article-list" key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`}>
              {renderInlineText(item)}
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <figure className="article-table" key={key}>
          <figcaption id={`${key}-caption`}>{block.caption}</figcaption>
          <div className="article-table__scroll" tabIndex={0}>
            <table aria-labelledby={`${key}-caption`}>
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} scope="col">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th
                          key={`${key}-cell-${rowIndex}-${cellIndex}`}
                          scope="row"
                        >
                          {renderInlineText(cell)}
                        </th>
                      ) : (
                        <td key={`${key}-cell-${rowIndex}-${cellIndex}`}>
                          {renderInlineText(cell)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
  }
}

export function TechBlogArticle({ article }: TechBlogArticleProps) {
  return (
    <>
      <a className="skip-link" href="#article-content">
        Bỏ qua đến bài viết
      </a>
      <SiteHeader languageHref="/en/" locale="vi" />

      <main className="article-page" id="article-content">
        <section className="article-hero page-container" aria-labelledby="article-title">
          <Link className="back-link" href="/vi/">
            <AppIcon className="rotate-[-135deg]" name="arrow-up-right" size={18} />
            {article.backLabel}
          </Link>
          <p className="eyebrow">{article.eyebrow}</p>
          <h1 className="article-title" id="article-title">
            {article.title}
          </h1>
          <p className="article-intro">{renderInlineText(article.intro)}</p>

          <div className="article-meta">
            <dl>
              <div>
                <dt>{article.publishedLabel}</dt>
                <dd>
                  <time dateTime={article.publishedAt}>
                    {formatBlogDate(article.publishedAt)}
                  </time>
                </dd>
              </div>
              <div>
                <dt>{article.updatedLabel}</dt>
                <dd>
                  <time dateTime={article.updatedAt}>
                    {formatBlogDate(article.updatedAt)}
                  </time>
                </dd>
              </div>
              <div>
                <dt>Độ dài</dt>
                <dd>
                  {article.readingTimeMinutes} {article.readingTimeLabel}
                </dd>
              </div>
            </dl>
            <ul aria-label="Chủ đề bài viết">
              {article.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>

          <figure className="seal-panel article-pipeline">
            <p>{article.pipeline.label}</p>
            <ol>
              {article.pipeline.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            <figcaption>{article.pipeline.caption}</figcaption>
          </figure>
        </section>

        <div className="article-layout page-container">
          <ArticleToc article={article} />

          <article aria-labelledby="article-title" className="article-body">
            <ArticleToc article={article} mobile />

            <aside className="article-disclaimer" aria-label={article.disclaimer.title}>
              <strong>{article.disclaimer.title}</strong>
              <p>{article.disclaimer.text}</p>
            </aside>

            {article.sections.map((section, sectionIndex) => (
              <section className="article-section" id={section.id} key={section.id}>
                <header>
                  <span aria-hidden="true">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <h2>{section.title}</h2>
                </header>
                {section.blocks.map((block, blockIndex) =>
                  renderBlock(block, `${section.id}-${block.type}-${blockIndex}`),
                )}
              </section>
            ))}

            <section className="article-cta" aria-labelledby="article-cta-title">
              <span aria-hidden="true" className="seal-glyph">
                金
              </span>
              <p className="eyebrow eyebrow--on-seal">{article.cta.eyebrow}</p>
              <h2 id="article-cta-title">{article.cta.title}</h2>
              <p>{article.cta.description}</p>
              <StoreButtons locale="vi" />
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale="vi" />
    </>
  );
}
