const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath = configuredBasePath.replace(/\/+$/, "");
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";

export function withBasePath(pathname: string) {
  if (!pathname.startsWith("/") || !basePath) return pathname;
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return pathname;
  return `${basePath}${pathname}`;
}
