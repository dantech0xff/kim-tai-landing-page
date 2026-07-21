import Image from "next/image";

import { withBasePath } from "@/lib/base-path";
import {
  getPublishedDownloadUrl,
  getSiteCopy,
  siteConfig,
  type Locale,
} from "@/lib/content";

interface StoreButtonsProps {
  locale: Locale;
  placement?: "hero" | "download";
}

export function StoreButtons({
  locale,
  placement = "download",
}: StoreButtonsProps) {
  const copy = getSiteCopy(locale).download;
  const platforms = [
    {
      id: "ios",
      label: copy.iosLabel,
      config: siteConfig.downloads.ios,
    },
    {
      id: "android",
      label: copy.androidLabel,
      config: siteConfig.downloads.android,
    },
  ] as const;

  return (
    <div
      aria-label={copy.title}
      className={`store-buttons store-buttons--${placement}`}
      data-store-placement={placement}
      role="group"
    >
      {platforms.map(({ id, label, config }) => {
        const href = getPublishedDownloadUrl(id);
        const badge = config.badges[locale];
        const accessibleLabel = href
          ? label
          : `${label}: ${copy.comingSoon}`;
        const content = (
          <>
            <span aria-hidden="true" className="store-button__artwork">
              <Image
                alt=""
                className="store-button__badge"
                height={badge.height}
                src={withBasePath(badge.src)}
                unoptimized
                width={badge.width}
              />
            </span>
            <span className="store-button__status">
              {href ? config.platform : copy.comingSoon}
            </span>
          </>
        );

        if (!href) {
          return (
            <div
              aria-disabled="true"
              aria-label={accessibleLabel}
              className="store-button store-button--disabled"
              data-badge-src={badge.src}
              data-platform={id}
              data-published={config.published ? "true" : "false"}
              key={id}
              role="link"
            >
              {content}
            </div>
          );
        }

        return (
          <a
            aria-label={accessibleLabel}
            className="store-button"
            data-badge-src={badge.src}
            data-platform={id}
            data-published={config.published ? "true" : "false"}
            href={href}
            key={id}
            rel="noreferrer"
            target="_blank"
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
