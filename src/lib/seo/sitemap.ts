/**
 * Sitemap generation for Shipping API Dojo.
 *
 * Pulls slugs from the canonical content modules so callers cannot diverge
 * from the live router. Used by both `scripts/generate-sitemap.ts` (build-time
 * regeneration) and `src/lib/seo/sitemap.test.ts` (drift regression test).
 */

import { carrierSurfaces } from "@/content/carriers";
import { lessonDefinitions } from "@/content/families";
import { wikiEntries } from "@/content/wiki";
import { toAbsoluteUrl } from "./site";

export interface SitemapEntry {
	changefreq:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	lastmod?: string;
	loc: string;
	priority: string;
}

interface StaticPage {
	changefreq: SitemapEntry["changefreq"];
	path: string;
	priority: string;
}

const STATIC_PAGES: StaticPage[] = [
	{ path: "/", priority: "1.0", changefreq: "weekly" },
	{ path: "/learn/rest", priority: "0.9", changefreq: "weekly" },
	{ path: "/learn/soap", priority: "0.9", changefreq: "weekly" },
	{ path: "/learn/cross-track", priority: "0.85", changefreq: "weekly" },
	{ path: "/arena", priority: "0.8", changefreq: "weekly" },
	{ path: "/wiki", priority: "0.7", changefreq: "weekly" },
	{ path: "/wiki/carriers", priority: "0.8", changefreq: "weekly" },
	{ path: "/directory", priority: "0.6", changefreq: "monthly" },
	{ path: "/privacy", priority: "0.3", changefreq: "yearly" },
	{ path: "/cookies", priority: "0.3", changefreq: "yearly" },
];

export function buildSitemapEntries(): SitemapEntry[] {
	const entries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
		loc: toAbsoluteUrl(page.path),
		changefreq: page.changefreq,
		priority: page.priority,
	}));

	for (const lesson of lessonDefinitions) {
		entries.push({
			loc: toAbsoluteUrl(`/lesson/${lesson.slug}`),
			changefreq: "monthly",
			priority: "0.7",
		});
	}

	for (const wiki of wikiEntries) {
		entries.push({
			loc: toAbsoluteUrl(`/wiki/${wiki.slug}`),
			changefreq: "monthly",
			priority: "0.6",
		});
	}

	for (const surface of carrierSurfaces) {
		// Sunset and deprecated surfaces stay in the sitemap so search engines
		// keep them crawlable; they remain the canonical answer to "is this API
		// still supported?" intent queries even after the API itself is gone.
		entries.push({
			loc: toAbsoluteUrl(`/wiki/carriers/${surface.slug}`),
			changefreq: "monthly",
			priority: surface.status === "active" ? "0.75" : "0.5",
			lastmod: surface.lastReviewed,
		});
	}

	return entries;
}

function renderUrl(entry: SitemapEntry): string {
	const lastmodTag = entry.lastmod
		? `\n    <lastmod>${entry.lastmod}</lastmod>`
		: "";
	return `  <url>\n    <loc>${entry.loc}</loc>${lastmodTag}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
}

export function renderSitemap(entries: SitemapEntry[]): string {
	const body = entries.map(renderUrl).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
