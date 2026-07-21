import Image from "next/image";

import { siteConfig } from "@/lib/content";

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="brand-glyph" aria-hidden="true">
        <Image
          className="brand-glyph__image"
          src={siteConfig.icons.brandMark.src}
          alt=""
          width={siteConfig.icons.brandMark.width}
          height={siteConfig.icons.brandMark.height}
          sizes="44px"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[1.35rem] font-semibold tracking-[-0.03em]">
            {siteConfig.brand.shortName}
          </span>
          <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {siteConfig.brand.tagline}
          </span>
        </span>
      )}
    </span>
  );
}
