import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const [repositoryOwner = "dantech0xff", repositoryName = "kim-tai-landing-page"] =
  process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const isUserSite = repositoryName.endsWith(".github.io");
const basePath = isGitHubPages && !isUserSite ? `/${repositoryName}` : "";
const siteOrigin = isGitHubPages
  ? `https://${repositoryOwner.toLowerCase()}.github.io`
  : process.env.SITE_ORIGIN ?? "http://localhost:3000";

const sharedConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_ORIGIN: siteOrigin,
  },
};

const nextConfig: NextConfig = isGitHubPages
  ? {
      ...sharedConfig,
      env: {
        ...sharedConfig.env,
        NEXT_PUBLIC_CANONICAL_ORIGIN:
          process.env.CANONICAL_ORIGIN ?? "https://kimtai.dantech.academy",
      },
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
      trailingSlash: true,
      async redirects() {
        return [
          {
            source: "/",
            destination: "/vi/",
            permanent: false,
          },
        ];
      },
    };

export default nextConfig;
