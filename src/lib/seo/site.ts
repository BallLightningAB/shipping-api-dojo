/**
 * Single source of truth for site-wide identity.
 *
 * Imported by sitemap and structured-data helpers so the canonical origin
 * cannot diverge between SEO surfaces.
 */

export const SITE_URL = "https://shipping.apidojo.app";
export const SITE_NAME = "Shipping API Dojo";
export const ORGANIZATION_NAME = "Ball Lightning AB";
export const ORGANIZATION_URL = "https://balllightning.cloud";

/**
 * Resolve a path or absolute URL to an absolute URL on the canonical origin.
 * Tolerates paths without a leading slash.
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
	if (pathOrUrl.startsWith("http")) {
		return pathOrUrl;
	}
	return pathOrUrl.startsWith("/")
		? `${SITE_URL}${pathOrUrl}`
		: `${SITE_URL}/${pathOrUrl}`;
}
