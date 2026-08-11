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
        <Link
          aria-label={`${copy.metadata.title} — ${locale === "vi" ? "trang chủ" : "home"}`}
          className="brand-link"
          href={homeHref}
        >
          <BrandMark />
        </Link>

        <nav
          aria-label={locale === "vi" ? "Điều hướng chính" : "Main navigation"}
          className="hidden items-center gap-1 lg:flex"
        >
          <Link className="nav-link" href={`${homeHref}#features`}>
            {copy.navigation.features}
          </Link>
          <Link className="nav-link" href={`${homeHref}#privacy`}>
            {copy.navigation.privacy}
          </Link>
          <Link className="nav-link" href={`${homeHref}#faq`}>
            {copy.navigation.faq}
          </Link>
          {locale === "vi" && (
            <Link className="nav-link" href={getBlogPath()}>
              {copy.navigation.blog}
            </Link>
          )}
          <Link className="nav-link" href={`${homeHref}#download`}>
            {copy.navigation.download}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
