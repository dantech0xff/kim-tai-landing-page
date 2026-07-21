export type StorePlatform = "ios" | "android";

const storeHosts: Record<StorePlatform, string> = {
  ios: "apps.apple.com",
  android: "play.google.com",
};

const appStoreIdPattern = /^\d+$/;
const androidPackageNamePattern =
  /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;

export function isVerifiedStoreUrl(
  platform: StorePlatform,
  rawUrl: string,
  expectedIdentity: string,
): boolean {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== storeHosts[platform] ||
    url.port ||
    url.username ||
    url.password
  ) {
    return false;
  }

  if (platform === "ios") {
    if (!appStoreIdPattern.test(expectedIdentity)) return false;

    return (
      url.pathname.endsWith(`/id${expectedIdentity}`) ||
      url.pathname.endsWith(`/id${expectedIdentity}/`)
    );
  }

  if (!androidPackageNamePattern.test(expectedIdentity)) return false;
  if (!/^\/store\/apps\/details\/?$/.test(url.pathname)) return false;

  const packageIds = url.searchParams.getAll("id");
  return packageIds.length === 1 && packageIds[0] === expectedIdentity;
}
