import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { FeatureSimulation } from "@/components/feature-simulations";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreButtons } from "@/components/store-buttons";
import { StructuredData } from "@/components/structured-data";
import {
  getLegalPath,
  getSiteCopy,
  type FeatureIcon,
  type LocalizedFeature,
  type Locale,
} from "@/lib/content";
import { buildFaqPage } from "@/lib/structured-data";

interface LandingPageProps {
  locale: Locale;
}

const featureIconMap: Record<FeatureIcon, "ledger" | "trend" | "device" | "sliders"> = {
  ledger: "ledger",
  trend: "trend",
  device: "device",
  sliders: "sliders",
};

export function LandingPage({ locale }: LandingPageProps) {
  const copy = getSiteCopy(locale);
  const features = copy.features as LocalizedFeature[];

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.navigation.skip}
      </a>
      <SiteHeader locale={locale} />

      <main id="main-content">
        <section className="hero-shell page-container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1 className="hero-title" id="hero-title">
              <span>{copy.hero.titleStart}</span> <span>{copy.hero.titleAccent}</span>
            </h1>
            <p className="hero-description">{copy.hero.description}</p>

            <StoreButtons locale={locale} placement="hero" />
            <Link className="hero-secondary-link" href="#features">
              {copy.hero.secondaryCta}
              <AppIcon name="arrow-up-right" size={17} />
            </Link>

            <p className="hero-trust-note">
              <AppIcon name="check" size={18} />
              {copy.hero.trustNote}
            </p>
          </div>

          <div className="seal-panel hero-seal">
            <span aria-hidden="true" className="seal-glyph">
              金
            </span>
            <p className="hero-seal__label">{copy.hero.ledger.label}</p>

            <p className="hero-seal__value-label">{copy.hero.ledger.valueLabel}</p>
            <p className="hero-seal__value">{copy.hero.ledger.value}</p>

            <dl className="hero-seal__grid">
              {copy.hero.ledger.items.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="hero-seal__note">{copy.hero.ledger.note}</p>
          </div>
        </section>

        <section className="stats-section page-container" aria-label={copy.stats.label}>
          <dl className="stats-band">
            {copy.stats.items.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="section-shell page-container"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <p className="eyebrow">{copy.featureIntro.eyebrow}</p>
            <h2 className="section-title" id="features-title">
              {copy.featureIntro.title}
            </h2>
            <p className="section-description">{copy.featureIntro.description}</p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article
                className={`feature-card feature-card--${feature.tone}`}
                key={feature.id}
              >
                <div className="feature-card__copy">
                  <div className="feature-card__top">
                    <span className="feature-icon">
                      <AppIcon name={featureIconMap[feature.icon]} size={24} />
                    </span>
                    <span className="feature-stat">{feature.stat}</span>
                  </div>
                  <p className="feature-eyebrow">{feature.eyebrow}</p>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>

                <FeatureSimulation
                  featureId={feature.id}
                  visuals={copy.featureVisuals}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="premium-section" id="premium" aria-labelledby="premium-title">
          <div className="section-shell page-container">
            <div className="section-heading">
              <p className="eyebrow">{copy.premium.eyebrow}</p>
              <h2 className="section-title" id="premium-title">
                {copy.premium.title}
              </h2>
              <p className="section-description">{copy.premium.description}</p>
            </div>

            <ul className="skin-grid">
              {copy.premium.items.map((item) => (
                <li className={`skin-card skin-card--${item.id}`} key={item.id}>
                  {/* Cùng một bộ số liệu với thẻ Hero — chỉ chất liệu và sắc nhấn đổi. */}
                  <div className="skin-card__panel">
                    <span aria-hidden="true" className="skin-card__glyph">
                      金
                    </span>
                    <p className="skin-card__label">{copy.hero.ledger.valueLabel}</p>
                    <p className="skin-card__value">{copy.hero.ledger.value}</p>
                    <dl className="skin-card__rows">
                      {copy.hero.ledger.items.slice(0, 2).map((row) => (
                        <div key={row.label}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <p className="skin-card__name">{item.name}</p>
                  <p className="skin-card__description">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="section-shell page-container"
          id="privacy"
          aria-labelledby="principles-title"
        >
          <div className="principles-card">
            <p className="eyebrow">{copy.principles.eyebrow}</p>
            <h2 className="principles-title" id="principles-title">
              {copy.principles.title}
            </h2>
            <p className="principles-description">{copy.principles.description}</p>
            <Link className="principles-link" href={getLegalPath(locale, "privacy-policy")}>
              {copy.footer.privacyPolicy}
              <AppIcon name="arrow-up-right" size={18} />
            </Link>

            <ol className="principles-list">
              {copy.principles.points.map((point, index) => (
                <li key={point}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="section-shell page-container">
            <StructuredData data={buildFaqPage(locale)} />
            <div className="section-heading">
              <p className="eyebrow">{copy.faq.eyebrow}</p>
              <h2 className="section-title" id="faq-title">
                {copy.faq.title}
              </h2>
            </div>

            <div className="faq-grid">
              {copy.faq.items.map((item) => (
                <article className="faq-card" key={item.id}>
                  <h3 className="faq-question">{item.question}</h3>
                  <p className="faq-answer">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="download-section page-container"
          id="download"
          aria-labelledby="download-title"
        >
          <div className="download-card">
            <span aria-hidden="true" className="seal-glyph">
              金
            </span>
            <p className="eyebrow eyebrow--on-seal">{copy.download.eyebrow}</p>
            <h2 className="download-title" id="download-title">
              {copy.download.title}
            </h2>
            <p className="download-description">{copy.download.description}</p>
            <StoreButtons locale={locale} placement="download" />
            <p className="download-note">{copy.download.externalNote}</p>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
