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

interface OperatorDetail {
  href?: string;
  label: string;
  value: string;
}

/**
 * Tiêu đề trong tài liệu pháp lý đã mang sẵn số thứ tự ("1. Phạm vi ...").
 * Tách số ra con dấu tròn để không lặp số hai lần cạnh nhau.
 */
const splitSectionTitle = (title: string, index: number) => {
  const match = /^(\d+)\.\s*/.exec(title);

  return match
    ? { label: title.slice(match[0].length), number: match[1].padStart(2, "0") }
    : { label: title, number: String(index + 1).padStart(2, "0") };
};

export function LegalDocumentPage({ locale, slug }: LegalDocumentPageProps) {
  const copy = getSiteCopy(locale);
  const { document, sources } = getLegalDocument(locale, slug);
  const date = formatLegalDate(locale, siteConfig.release.lastUpdated);
  const effectiveDate = formatLegalDate(locale, siteConfig.release.effectiveDate);
  const operatorLabels = copy.legalUi.operatorDetails;
  const legalOperatorDetails: OperatorDetail[] = [
    { label: operatorLabels.legalName, value: siteConfig.operator.legalName },
    {
      label: operatorLabels.registrationNumber,
      value: siteConfig.operator.registrationNumber,
    },
    {
      label: operatorLabels.registeredAddress,
      value: siteConfig.operator.registeredAddress,
    },
    { label: operatorLabels.phone, value: siteConfig.operator.phone },
    { label: operatorLabels.supportEmail, value: siteConfig.operator.supportEmail },
    { label: operatorLabels.privacyEmail, value: siteConfig.operator.privacyEmail },
  ];
  const operatorDetails: OperatorDetail[] = [
    {
      label: operatorLabels.publicName,
      value: siteConfig.operator.publicName,
    },
    ...(siteConfig.operator.configured ? legalOperatorDetails : []),
    {
      href: siteConfig.operator.facebookUrl,
      label: operatorLabels.facebook,
      value: operatorLabels.facebookCta,
    },
  ].filter((detail) => detail.value.trim());

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

        {operatorDetails.length > 0 && (
          <section className="operator-details" aria-labelledby="operator-details-title">
            <h2 id="operator-details-title">
              {siteConfig.operator.configured
                ? operatorLabels.heading
                : operatorLabels.publicHeading}
            </h2>
            <dl>
              {operatorDetails.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>
                    {detail.href ? (
                      <a href={detail.href} rel="noreferrer" target="_blank">
                        {detail.value}
                        <AppIcon name="arrow-up-right" size={16} />
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="legal-layout">
          <aside className="legal-toc" aria-label={copy.legalUi.contents}>
            <p>{copy.legalUi.contents}</p>
            <nav aria-label={copy.legalUi.contents}>
              {document.sections.map((section, index) => {
                const { label, number } = splitSectionTitle(section.title, index);

                return (
                  <a href={`#${section.id}`} key={section.id}>
                    <span aria-hidden="true">{number}</span>
                    {label}
                  </a>
                );
              })}
              <a href="#official-sources">
                <span aria-hidden="true">§</span>
                {copy.legalUi.sourceHeading}
              </a>
            </nav>
          </aside>

          <article className="legal-article">
            {document.sections.map((section, sectionIndex) => {
              const { label, number } = splitSectionTitle(section.title, sectionIndex);

              return (
              <section id={section.id} key={section.id}>
                <header className="doc-heading">
                  <span aria-hidden="true">{number}</span>
                  <h2>{label}</h2>
                </header>
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
                          <AppIcon name="check" size={14} />
                        </span>
                        <p>{interpolateLegalText(locale, item)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              );
            })}

            <section className="legal-sources" id="official-sources">
              <h2>{copy.legalUi.sourceHeading}</h2>
              <div className="legal-sources__list">
                {sources.map((source) => (
                  <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                    <span>
                      <strong>{source.title}</strong>
                      <small>{source.note}</small>
                    </span>
                    <AppIcon name="external" size={18} />
                  </a>
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
