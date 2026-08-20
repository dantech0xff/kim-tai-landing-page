import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getAlternateLocale,
  getBlogPath,
  getSiteCopy,
  type Locale,
} from "@/lib/content";

interface SiteHeaderProps {
  languageHref?: string;
  locale: Locale;
  routeSuffix?: string;
}

/** Bố cục đối xứng: điều hướng hai bên, con dấu thương hiệu ở chính giữa. */
export function SiteHeader({
  languageHref,
  locale,
  routeSuffix = "",
}: SiteHeaderProps) {
  const copy = getSiteCopy(locale);
  const alternateLocale = getAlternateLocale(locale);
  const homeHref = `/${locale}`;
  const resolvedLanguageHref = languageHref ?? `/${alternateLocale}${routeSuffix}`;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav
          aria-label={locale === "vi" ? "Điều hướng chính" : "Main navigation"}
          className="site-nav"
        >
          <Link className="nav-link" href={`${homeHref}#features`}>
            {copy.navigation.features}
          </Link>
          <Link className="nav-link" href={`${homeHref}#privacy`}>
            {copy.navigation.privacy}
          </Link>
          <Link className="nav-link" href={`${homeHref}#download`}>
            {copy.navigation.download}
          </Link>
        </nav>

        <Link
          aria-label={`${copy.metadata.title} — ${locale === "vi" ? "trang chủ" : "home"}`}
          className="brand-link"
          href={homeHref}
        >
          <BrandMark />
        </Link>

        <div className="header-controls">
          <nav
            aria-label={locale === "vi" ? "Điều hướng phụ" : "Secondary navigation"}
            className="site-nav site-nav--end"
          >
            <Link className="nav-link" href={`${homeHref}#premium`}>
              {copy.navigation.premium}
            </Link>
            <Link className="nav-link" href={`${homeHref}#faq`}>
              {copy.navigation.faq}
            </Link>
            {locale === "vi" && (
              <Link className="nav-link" href={getBlogPath()}>
                {copy.navigation.blog}
              </Link>
            )}
          </nav>
          <Link
            aria-label={copy.navigation.language}
            className="language-button"
            href={resolvedLanguageHref}
            hrefLang={alternateLocale}
          >
            {alternateLocale.toUpperCase()}
          </Link>
          <ThemeToggle
            darkLabel={copy.navigation.themeDark}
            lightLabel={copy.navigation.themeLight}
          />
        </div>
      </div>
    </header>
  );
}
