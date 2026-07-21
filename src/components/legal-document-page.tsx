import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatLegalDate,
  getLegalDocument,
  getSiteCopy,
  interpolateLegalText,
  siteConfig,
  type LegalSlug,
  type Locale,
} from "@/lib/content";

interface LegalDocumentPageProps {
  locale: Locale;
  slug: LegalSlug;
}

export function LegalDocumentPage({ locale, slug }: LegalDocumentPageProps) {
  const copy = getSiteCopy(locale);
  const { document, sources } = getLegalDocument(locale, slug);
  const date = formatLegalDate(locale, siteConfig.release.lastUpdated);
  const effectiveDate = formatLegalDate(locale, siteConfig.release.effectiveDate);
  const operatorLabels = copy.legalUi.operatorDetails;
  const operatorDetails = [
    [operatorLabels.legalName, siteConfig.operator.legalName],
    [operatorLabels.registrationNumber, siteConfig.operator.registrationNumber],
    [operatorLabels.registeredAddress, siteConfig.operator.registeredAddress],
    [operatorLabels.phone, siteConfig.operator.phone],
    [operatorLabels.supportEmail, siteConfig.operator.supportEmail],
    [operatorLabels.privacyEmail, siteConfig.operator.privacyEmail],
  ] as const;

  return (
    <>
      <a className="skip-link" href="#legal-content">
        {copy.navigation.skip}
      </a>
      <SiteHeader locale={locale} routeSuffix={`/${slug}`} />

      <main className="legal-page page-container" id="legal-content">
        <div className="legal-hero">
          <Link className="back-link" href={`/${locale}`}>
            <AppIcon className="rotate-[-135deg]" name="arrow-up-right" size={18} />
            {copy.legalUi.back}
          </Link>
          <p className="eyebrow">{document.shortTitle}</p>
          <h1 className="legal-title">{document.title}</h1>
          <p className="legal-description">{document.description}</p>
          <div className="legal-meta">
            <span>{copy.legalUi.lastUpdated}: {date}</span>
            <span>{copy.legalUi.effectiveDate}: {effectiveDate}</span>
            <span>v{document.version}</span>
          </div>
        </div>

        {(!siteConfig.release.ready || !siteConfig.operator.configured) && (
          <aside className="release-warning" aria-label={copy.legalUi.previewTitle}>
            <span className="release-warning__icon">
              <AppIcon name="sliders" size={22} />
            </span>
            <div>
              <h2>{copy.legalUi.previewTitle}</h2>
              <p>{copy.legalUi.previewBody}</p>
            </div>
          </aside>
        )}

        {siteConfig.operator.configured && (
          <section className="operator-details" aria-labelledby="operator-details-title">
            <h2 id="operator-details-title">{operatorLabels.heading}</h2>
            <dl>
              {operatorDetails.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="legal-layout">
          <aside className="legal-toc" aria-label={copy.legalUi.contents}>
            <p>{copy.legalUi.contents}</p>
            <nav aria-label={copy.legalUi.contents}>
              {document.sections.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="legal-article">
            {document.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-paragraph-${paragraphIndex}`}>
                    {interpolateLegalText(locale, paragraph)}
                  </p>
                ))}
                {section.items.length > 0 && (
                  <ul>
                    {section.items.map((item, itemIndex) => (
                      <li key={`${section.id}-item-${itemIndex}`}>
                        <span aria-hidden="true">
                          <AppIcon name="check" size={18} />
                        </span>
                        <p>{interpolateLegalText(locale, item)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="legal-sources" id="official-sources">
              <h2>{copy.legalUi.sourceHeading}</h2>
              <div className="grid gap-3">
                {sources.map((source) => (
                  <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                    <span>
                      <strong>{source.title}</strong>
                      <small>{source.note}</small>
                    </span>
                    <AppIcon name="external" size={19} />
                  </a>
                ))}
              </div>
              <p className="legal-note">{copy.legalUi.notLegalAdvice}</p>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
