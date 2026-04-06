const DEFAULT_API_ORIGIN = "https://api.rhapsodyomegaforce.org";
const DEFAULT_API_BASE_URL = `${DEFAULT_API_ORIGIN}/api`;

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
}

export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}
