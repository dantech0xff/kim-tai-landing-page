import type { CSSProperties, ReactElement } from "react";

import { AppIcon } from "@/components/app-icon";
import type { FeatureId } from "@/lib/content";

export interface FeatureVisualCopy {
  portfolio: {
    title: string;
    primaryPurity: string;
    quantity: string;
    secondaryPurity: string;
    status: string;
    bars: number[];
  };
  market: {
    title: string;
    primary: string;
    secondary: string;
    summary: string;
    primarySeries: number[];
    secondarySeries: number[];
  };
  local: {
    title: string;
    steps: string[];
    status: string;
  };
  personalize: {
    title: string;
    rows: Array<{
      label: string;
      value: string;
      position: number;
    }>;
  };
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;

  return Math.min(100, Math.max(0, value));
}

function getBarStyle(value: number): CSSProperties {
  return {
    "--bar-size": `${clampPercentage(value)}%`,
  } as CSSProperties;
}

function getMarkerStyle(value: number): CSSProperties {
  return {
    "--marker-position": `${clampPercentage(value)}%`,
  } as CSSProperties;
}

function getPolylinePoints(series: number[]): string {
  const lastIndex = series.length - 1;

  return series
    .map((value, index) => {
      const x = lastIndex > 0 ? (index / lastIndex) * 100 : 50;
      const y = 100 - clampPercentage(value);

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function PortfolioSimulation({
  visual,
}: {
  visual: FeatureVisualCopy["portfolio"];
}): ReactElement {
  return (
    <div
      aria-label={`${visual.title}. ${visual.primaryPurity}: ${visual.quantity}. ${visual.secondaryPurity}. ${visual.status}.`}
      className="feature-simulation feature-simulation--portfolio"
      role="img"
    >
      <div className="portfolio-chart">
        <div className="portfolio-chart__header">
          <span className="portfolio-chart__purity">{visual.primaryPurity}</span>
          <strong className="portfolio-chart__title">{visual.title}</strong>
        </div>
        <p className="portfolio-chart__quantity">{visual.quantity}</p>
        <div aria-hidden="true" className="portfolio-chart__bars">
          {visual.bars.map((bar, index) => (
            <span
              className="portfolio-chart__bar"
              key={`${index}-${bar}`}
              style={getBarStyle(bar)}
            />
          ))}
        </div>
        <div className="portfolio-chart__caption">
          <span>{visual.secondaryPurity}</span>
          <span className="portfolio-chart__status">{visual.status}</span>
        </div>
      </div>
    </div>
  );
}

function MarketSimulation({
  visual,
}: {
  visual: FeatureVisualCopy["market"];
}): ReactElement {
  const primaryPoints = getPolylinePoints(visual.primarySeries);
  const secondaryPoints = getPolylinePoints(visual.secondarySeries);

  return (
    <div
      aria-label={`${visual.title}. ${visual.summary} ${visual.primary}; ${visual.secondary}.`}
      className="feature-simulation feature-simulation--market"
      role="img"
    >
      <div className="market-chart">
        <strong className="market-chart__title">{visual.title}</strong>
        <svg
          aria-hidden="true"
          className="market-chart__plot"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polyline
            className="market-chart__line market-chart__line--primary"
            fill="none"
            points={primaryPoints}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className="market-chart__line market-chart__line--secondary"
            fill="none"
            points={secondaryPoints}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ul className="market-chart__legend">
          <li>
            <span
              aria-hidden="true"
              className="market-chart__legend-mark market-chart__legend-mark--primary"
            />
            {visual.primary}
          </li>
          <li>
            <span
              aria-hidden="true"
              className="market-chart__legend-mark market-chart__legend-mark--secondary"
            />
            {visual.secondary}
          </li>
        </ul>
      </div>
    </div>
  );
}

function LocalSimulation({
  visual,
}: {
  visual: FeatureVisualCopy["local"];
}): ReactElement {
  const centerIndex = Math.floor(visual.steps.length / 2);

  return (
    <div
      aria-label={`${visual.title}. ${visual.steps.join(", ")}. ${visual.status}.`}
      className="feature-simulation feature-simulation--local"
      role="img"
    >
      <div className="local-chart">
        <strong className="local-chart__title">{visual.title}</strong>
        <ol className="local-chart__nodes">
          {visual.steps.map((step, index) => {
            const isDevice = index === centerIndex;

            return (
              <li
                className={`local-chart__node local-chart__node--${isDevice ? "device" : "check"}`}
                key={`${index}-${step}`}
              >
                <span aria-hidden="true" className="local-chart__icon">
                  <AppIcon name={isDevice ? "device" : "check"} size={isDevice ? 34 : 20} />
                </span>
                <span className="local-chart__label">{step}</span>
              </li>
            );
          })}
        </ol>
        <p className="local-chart__status">
          <AppIcon name="check" size={18} />
          {visual.status}
        </p>
      </div>
    </div>
  );
}

function PersonalizeSimulation({
  visual,
}: {
  visual: FeatureVisualCopy["personalize"];
}): ReactElement {
  const rowSummary = visual.rows
    .map((row) => `${row.label}: ${row.value}`)
    .join(". ");

  return (
    <div
      aria-label={`${visual.title}. ${rowSummary}.`}
      className="feature-simulation feature-simulation--personalize"
      role="img"
    >
      <div className="personalize-chart">
        <strong className="personalize-chart__title">{visual.title}</strong>
        <dl className="personalize-chart__rows">
          {visual.rows.map((row, index) => (
            <div className="personalize-chart__row" key={`${index}-${row.label}`}>
              <div className="personalize-chart__copy">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
              <div aria-hidden="true" className="personalize-chart__lane">
                <span
                  className="personalize-chart__marker"
                  style={getMarkerStyle(row.position)}
                />
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function FeatureSimulation({
  featureId,
  visuals,
}: {
  featureId: FeatureId;
  visuals: FeatureVisualCopy;
}): ReactElement {
  switch (featureId) {
    case "portfolio":
      return <PortfolioSimulation visual={visuals.portfolio} />;
    case "market":
      return <MarketSimulation visual={visuals.market} />;
    case "local-first":
      return <LocalSimulation visual={visuals.local} />;
    case "personalize":
      return <PersonalizeSimulation visual={visuals.personalize} />;
  }
}
