import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import {
  getBlogPath,
  getLegalPath,
  getSiteCopy,
  legalSlugs,
  type Locale,
} from "@/lib/content";

interface SiteFooterProps {
  locale: Locale;
  /* Tuyên bố giá tham khảo chỉ thuộc về các trang pháp lý, không lặp trên toàn site. */
  showPriceDisclaimer?: boolean;
}

export function SiteFooter({ locale, showPriceDisclaimer = false }: SiteFooterProps) {
  const copy = getSiteCopy(locale);
  const legalLabels = {
    "terms-of-service": copy.footer.termsOfService,
    "terms-and-conditions": copy.footer.termsAndConditions,
    "privacy-policy": copy.footer.privacyPolicy,
  } as const;

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Link className="brand-link" href={`/${locale}`} aria-label={copy.metadata.title}>
          <BrandMark />
        </Link>
        <p className="site-footer__summary">{copy.footer.summary}</p>
      </div>

      <div className="site-footer__grid">
        <div className="site-footer__group">
          <h2 className="footer-heading">{copy.footer.productHeading}</h2>
          <div className="footer-links">
            <Link className="footer-link" href={`/${locale}#features`}>
              {copy.navigation.features}
            </Link>
            <Link className="footer-link" href={`/${locale}#premium`}>
              {copy.navigation.premium}
            </Link>
            <Link className="footer-link" href={`/${locale}#privacy`}>
              {copy.navigation.privacy}
            </Link>
            {locale === "vi" && (
              <Link className="footer-link" href={getBlogPath()}>
                {copy.navigation.blog}
              </Link>
            )}
            <Link className="footer-link" href={`/${locale}#download`}>
              {copy.navigation.download}
            </Link>
          </div>
        </div>

        <div className="site-footer__group">
          <h2 className="footer-heading">{copy.footer.legalHeading}</h2>
          <div className="footer-links">
            {legalSlugs.map((slug) => (
              <Link className="footer-link" href={getLegalPath(locale, slug)} key={slug}>
                {legalLabels[slug]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {copy.footer.copyright}</p>
        {showPriceDisclaimer && <p>{copy.footer.disclaimer}</p>}
      </div>
    </footer>
  );
}
