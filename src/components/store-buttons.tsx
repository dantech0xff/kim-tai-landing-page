import { AppIcon } from "@/components/app-icon";
import {
  getPublishedDownloadUrl,
  getSiteCopy,
  siteConfig,
  type Locale,
} from "@/lib/content";

interface StoreButtonsProps {
  locale: Locale;
}

export function StoreButtons({ locale }: StoreButtonsProps) {
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
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {platforms.map(({ id, label, config }) => {
        const href = getPublishedDownloadUrl(id);
        const content = (
          <>
            <span className="store-button__icon">
              <AppIcon name="arrow-down" size={22} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] opacity-70">
                {href ? config.platform : copy.comingSoon}
              </span>
              <span className="mt-1 block text-sm font-semibold sm:text-base">
                {label}
              </span>
            </span>
            {href && (
              <AppIcon className="ml-auto shrink-0 opacity-70" name="external" size={18} />
            )}
          </>
        );

        if (!href) {
          return (
            <div
              aria-disabled="true"
              className="store-button store-button--disabled"
              key={id}
            >
              {content}
            </div>
          );
        }

        return (
          <a
            className="store-button"
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
