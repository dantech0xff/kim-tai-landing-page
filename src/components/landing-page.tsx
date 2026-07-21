import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { AppScreenshot } from "@/components/app-screenshot";
import { OrbitMotif } from "@/components/orbit-motif";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreButtons } from "@/components/store-buttons";
import {
  getLegalPath,
  getSiteCopy,
  type FeatureIcon,
  type LocalizedFeature,
  type Locale,
  type ScreenshotKey,
} from "@/lib/content";

interface LandingPageProps {
  locale: Locale;
}

const featureCardClasses: Record<string, string> = {
  portfolio: "feature-card--portfolio md:col-span-5 lg:col-span-5",
  market: "feature-card--market md:col-span-7 lg:col-span-7 md:row-span-2",
  "local-first": "feature-card--local md:col-span-5 lg:col-span-5",
  personalize: "feature-card--settings md:col-span-12 lg:col-span-12",
};

const featureIconMap: Record<FeatureIcon, "ledger" | "trend" | "device" | "sliders"> = {
  ledger: "ledger",
  trend: "trend",
  device: "device",
  sliders: "sliders",
};

export function LandingPage({ locale }: LandingPageProps) {
  const copy = getSiteCopy(locale);
  const [portfolio, market, localFirst, personalize] =
    copy.features as LocalizedFeature[];
  const ledgerVisual = copy.ledgerVisual;

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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="primary-button" href="#download">
                  {copy.hero.primaryCta}
                  <AppIcon name="arrow-down" size={19} />
                </Link>
                <Link className="secondary-button" href="#features">
                  {copy.hero.secondaryCta}
                  <AppIcon name="arrow-up-right" size={18} />
                </Link>
              </div>

              <p className="hero-trust-note">
                <AppIcon name="check" size={18} />
                {copy.hero.trustNote}
              </p>
            </div>

            <div className="hero-visual">
              <OrbitMotif className="hero-orbit" />
              <div className="hero-phone-pedestal">
                <AppScreenshot
                  alt={copy.hero.visualLabel}
                  className="hero-phone"
                  imageClassName="object-top"
                  imageKey="overview"
                  priority
                  sizes="(max-width: 767px) 86vw, (max-width: 1199px) 42vw, 470px"
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
            {[portfolio, market, localFirst, personalize].map((feature) => (
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

                {feature.id === "portfolio" && (
                  <div className="ledger-visual" aria-hidden="true">
                    <div className="ledger-visual__total">
                      <span>{ledgerVisual.primaryPurity}</span>
                      <strong>{ledgerVisual.quantity}</strong>
                    </div>
                    <div className="ledger-visual__bars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="ledger-visual__caption">
                      <span>{ledgerVisual.secondaryPurity}</span>
                      <span>{ledgerVisual.status}</span>
                    </div>
                  </div>
                )}

                {feature.id === "local-first" && (
                  <div className="local-visual" aria-hidden="true">
                    <div className="local-visual__device">
                      <AppIcon name="device" size={50} />
                      <span className="local-visual__check">
                        <AppIcon name="check" size={21} />
                      </span>
                    </div>
                    <OrbitMotif compact />
                  </div>
                )}

                {feature.image && feature.id !== "portfolio" && (
                  <AppScreenshot
                    alt={`${feature.eyebrow}: ${feature.title}`}
                    className={`feature-shot feature-shot--${feature.id}`}
                    imageClassName={
                      feature.id === "market"
                        ? "object-[50%_24%]"
                        : "object-[50%_22%]"
                    }
                    imageKey={feature.image as ScreenshotKey}
                    sizes={
                      feature.id === "market"
                        ? "(max-width: 767px) 92vw, (max-width: 1199px) 55vw, 720px"
                        : "(max-width: 767px) 92vw, (max-width: 1199px) 80vw, 1040px"
                    }
                  />
                )}
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

        <section className="download-section page-container" id="download" aria-labelledby="download-title">
          <div className="download-card">
            <OrbitMotif className="download-orbit" compact />
            <div className="relative z-10 max-w-3xl">
              <p className="eyebrow eyebrow--on-gold">{copy.download.eyebrow}</p>
              <h2 className="download-title" id="download-title">
                {copy.download.title}
              </h2>
              <p className="download-description">{copy.download.description}</p>
              <StoreButtons locale={locale} />
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
