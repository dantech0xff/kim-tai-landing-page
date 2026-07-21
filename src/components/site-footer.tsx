import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import {
  getLegalPath,
  getSiteCopy,
  legalSlugs,
  type Locale,
} from "@/lib/content";

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = getSiteCopy(locale);
  const legalLabels = {
    "terms-of-service": copy.footer.termsOfService,
    "terms-and-conditions": copy.footer.termsAndConditions,
    "privacy-policy": copy.footer.privacyPolicy,
  } as const;

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="max-w-sm">
          <Link className="brand-link" href={`/${locale}`} aria-label={copy.metadata.title}>
            <BrandMark />
          </Link>
          <p className="mt-5 text-sm leading-7 text-[var(--text-muted)]">
            {copy.footer.summary}
          </p>
        </div>

        <div>
          <h2 className="footer-heading">{copy.footer.productHeading}</h2>
          <div className="mt-4 flex flex-col items-start gap-2">
            <Link className="footer-link" href={`/${locale}#features`}>
              {copy.navigation.features}
            </Link>
            <Link className="footer-link" href={`/${locale}#privacy`}>
              {copy.navigation.privacy}
            </Link>
            <Link className="footer-link" href={`/${locale}#download`}>
              {copy.navigation.download}
            </Link>
          </div>
        </div>

        <div>
          <h2 className="footer-heading">{copy.footer.legalHeading}</h2>
          <div className="mt-4 flex flex-col items-start gap-2">
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
        <p className="max-w-2xl">{copy.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
