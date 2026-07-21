import Image from "next/image";

import { siteConfig, type ScreenshotKey } from "@/lib/content";

interface AppScreenshotProps {
  alt: string;
  className?: string;
  imageClassName?: string;
  imageKey: ScreenshotKey;
  priority?: boolean;
  sizes: string;
}

export function AppScreenshot({
  alt,
  className = "",
  imageClassName = "",
  imageKey,
  priority = false,
  sizes,
}: AppScreenshotProps) {
  const image = siteConfig.screenshots[imageKey];

  return (
    <div className={`app-screenshot ${className}`}>
      <Image
        alt={alt}
        className={`object-cover ${imageClassName}`}
        fill
        priority={priority}
        sizes={sizes}
        src={image.src}
      />
    </div>
  );
}
