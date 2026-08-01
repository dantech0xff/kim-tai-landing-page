import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { AppScreenshot } from "@/components/app-screenshot";
import { FeatureSimulation } from "@/components/feature-simulations";
import { OrbitMotif } from "@/components/orbit-motif";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreButtons } from "@/components/store-buttons";
import { StructuredData } from "@/components/structured-data";
import {
  getLegalPath,
  getSiteCopy,
  type FeatureId,
  type FeatureIcon,
  type LocalizedFeature,
  type Locale,
} from "@/lib/content";
import { buildFaqPage } from "@/lib/structured-data";

interface LandingPageProps {
  locale: Locale;
}

const featureCardClasses: Record<FeatureId, string> = {
  portfolio: "feature-card--portfolio md:col-span-5 lg:col-span-5",
  market: "feature-card--market md:col-span-7 lg:col-span-7",
  "local-first": "feature-card--local md:col-span-4 lg:col-span-4",
  personalize: "feature-card--settings md:col-span-8 lg:col-span-8",
};

const featureIconMap: Record<FeatureIcon, "ledger" | "trend" | "device" | "sliders"> = {
  ledger: "ledger",
  trend: "trend",
  device: "device",
  sliders: "sliders",
};

export function LandingPage({ locale }: LandingPageProps) {
  const copy = getSiteCopy(locale);
  const features = copy.features as LocalizedFeature[];
  const featuresById = Object.fromEntries(
    features.map((feature) => [feature.id, feature]),
  ) as Record<FeatureId, LocalizedFeature>;
  const portfolio = featuresById.portfolio;
  const market = featuresById.market;

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.navigation.skip}
      </a>
      <SiteHeader locale={locale} />

      <main id="main-content">
        <section className="hero-shell page-container" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{copy.hero.eyebrow}</p>
              <h1 className="hero-title" id="hero-title">
                <span>{copy.hero.titleStart}</span>{" "}
                <span className="text-[var(--accent-rose)]">{copy.hero.titleAccent}</span>
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

            <div
              aria-label={copy.hero.galleryLabel}
              className="hero-visual"
              role="group"
            >
              <OrbitMotif className="hero-orbit" />
              <div className="hero-screen-deck">
                <AppScreenshot
                  alt={copy.hero.screens.overview}
                  className="hero-screen hero-screen--overview"
                  imageClassName="object-top"
                  imageKey="overview"
                  priority
                  sizes="(max-width: 767px) 58vw, (max-width: 1199px) 28vw, 250px"
                />
                <AppScreenshot
                  alt={copy.hero.screens.market}
                  className="hero-screen hero-screen--market"
                  imageClassName="object-top"
                  imageKey="market"
                  priority
                  sizes="(max-width: 767px) 42vw, (max-width: 1199px) 20vw, 210px"
                />
                <AppScreenshot
                  alt={copy.hero.screens.settings}
                  className="hero-screen hero-screen--settings"
                  imageClassName="object-top"
                  imageKey="settings"
                  priority
                  sizes="(max-width: 767px) 42vw, (max-width: 1199px) 20vw, 210px"
                />
              </div>
              <div className="hero-float-card">
                <span>{copy.hero.floatingLabel}</span>
                <strong>{copy.hero.floatingValue}</strong>
              </div>
            </div>

            <div className="hero-mini-card hero-mini-card--gold">
              <span className="feature-icon feature-icon--small">
                <AppIcon name="ledger" size={21} />
              </span>
              <p>{portfolio.eyebrow}</p>
              <strong>{portfolio.stat}</strong>
            </div>

            <div className="hero-mini-card hero-mini-card--mint">
              <span className="feature-icon feature-icon--small">
                <AppIcon name="trend" size={21} />
              </span>
              <p>{market.eyebrow}</p>
              <strong>{market.stat}</strong>
            </div>
          </div>
        </section>

        <section className="section-shell page-container" id="features" aria-labelledby="features-title">
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
                className={`feature-card feature-card--${feature.tone} ${featureCardClasses[feature.id]}`}
                key={feature.id}
              >
                <div className="feature-card__copy">
                  <div className="flex items-center justify-between gap-4">
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

        <section className="section-shell page-container" id="privacy" aria-labelledby="principles-title">
          <div className="principles-card">
            <div className="principles-card__lead">
              <p className="eyebrow eyebrow--on-accent">{copy.principles.eyebrow}</p>
              <h2 className="principles-title" id="principles-title">
                {copy.principles.title}
              </h2>
              <p className="principles-description">{copy.principles.description}</p>
              <Link className="principles-link" href={getLegalPath(locale, "privacy-policy")}>
                {copy.footer.privacyPolicy}
                <AppIcon name="arrow-up-right" size={18} />
              </Link>
            </div>

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

        <section className="section-shell page-container" id="faq" aria-labelledby="faq-title">
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
        </section>

        <section className="download-section page-container" id="download" aria-labelledby="download-title">
          <div className="download-card">
            <OrbitMotif className="download-orbit" compact />
            <div className="relative z-10 max-w-3xl">
              <p className="eyebrow eyebrow--on-gold">{copy.download.eyebrow}</p>
              <h2 className="download-title" id="download-title">
                {copy.download.title}
              </h2>
              <p className="download-description">{copy.download.description}</p>
              <StoreButtons locale={locale} placement="download" />
              <p className="mt-5 max-w-2xl text-sm leading-6 opacity-75">
                {copy.download.externalNote}
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
