import Image from "next/image";

import { withBasePath } from "@/lib/base-path";
import { siteConfig } from "@/lib/content";

interface BrandMarkProps {
  compact?: boolean;
}

/** Con dấu tròn viền chỉ vàng, đặt trên chữ hiệu giãn cách rộng. */
export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-stack">
      <span className="brand-glyph" aria-hidden="true">
        <Image
          className="brand-glyph__image"
          src={withBasePath(siteConfig.icons.brandMark.src)}
          alt=""
          width={siteConfig.icons.brandMark.width}
          height={siteConfig.icons.brandMark.height}
          sizes="52px"
        />
      </span>
      {!compact && (
        <span className="brand-wordmark">{siteConfig.brand.shortName}</span>
      )}
    </span>
  );
}
