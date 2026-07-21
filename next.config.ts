import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const [repositoryOwner = "dantech0xff", repositoryName = "kim-tai-landing-page"] =
  process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const isUserSite = repositoryName.endsWith(".github.io");
const basePath = isGitHubPages && !isUserSite ? `/${repositoryName}` : "";
const siteOrigin = isGitHubPages
  ? `https://${repositoryOwner.toLowerCase()}.github.io`
  : "http://localhost:3000";

const sharedConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_ORIGIN: siteOrigin,
  },
};

const nextConfig: NextConfig = isGitHubPages
  ? {
      ...sharedConfig,
      basePath,
      images: {
        unoptimized: true,
      },
      output: "export",
      trailingSlash: true,
    }
  : {
      ...sharedConfig,
      images: {
        formats: ["image/avif", "image/webp"],
      },
      async redirects() {
        return [
          {
            source: "/",
            destination: "/vi",
            permanent: false,
          },
        ];
      },
    };

export default nextConfig;
