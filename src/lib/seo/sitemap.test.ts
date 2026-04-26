import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { carrierSurfaces } from "@/content/carriers";
import { lessonDefinitions } from "@/content/families";
import { wikiEntries } from "@/content/wiki";
import { buildSitemapEntries, renderSitemap, SITE_URL } from "./sitemap";

const SITEMAP_PATH = path.join(process.cwd(), "public", "sitemap.xml");
const XML_PROLOG = /^<\?xml version="1\.0" encoding="UTF-8"\?>/;
const URLSET_OPEN =
	/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/;
const URLSET_CLOSE = /<\/urlset>$/;

function readPublishedSitemap(): string {
	return fs.readFileSync(SITEMAP_PATH, "utf-8");
}

describe("buildSitemapEntries", () => {
	it("includes every wiki concept slug", () => {
		const entries = buildSitemapEntries();
		const locs = new Set(entries.map((entry) => entry.loc));
		for (const wiki of wikiEntries) {
			expect(locs.has(`${SITE_URL}/wiki/${wiki.slug}`)).toBe(true);
		}
	});

	it("includes every carrier surface slug, including sunset/legacy", () => {
		const entries = buildSitemapEntries();
		const locs = new Set(entries.map((entry) => entry.loc));
		for (const surface of carrierSurfaces) {
			expect(locs.has(`${SITE_URL}/wiki/carriers/${surface.slug}`)).toBe(true);
		}
	});

	it("includes every lesson slug", () => {
		const entries = buildSitemapEntries();
		const locs = new Set(entries.map((entry) => entry.loc));
		for (const lesson of lessonDefinitions) {
			expect(locs.has(`${SITE_URL}/lesson/${lesson.slug}`)).toBe(true);
		}
	});

	it("includes the static landing, wiki index, and carrier index routes", () => {
		const entries = buildSitemapEntries();
		const locs = new Set(entries.map((entry) => entry.loc));
		expect(locs.has(`${SITE_URL}/`)).toBe(true);
		expect(locs.has(`${SITE_URL}/wiki`)).toBe(true);
		expect(locs.has(`${SITE_URL}/wiki/carriers`)).toBe(true);
		expect(locs.has(`${SITE_URL}/directory`)).toBe(true);
	});

	it("does not include duplicate locs", () => {
		const entries = buildSitemapEntries();
		const locs = entries.map((entry) => entry.loc);
		expect(new Set(locs).size).toBe(locs.length);
	});
});

describe("renderSitemap", () => {
	it("produces a valid sitemap XML envelope", () => {
		const xml = renderSitemap(buildSitemapEntries());
		expect(xml).toMatch(XML_PROLOG);
		expect(xml).toMatch(URLSET_OPEN);
		expect(xml).toMatch(URLSET_CLOSE);
	});
});

describe("public/sitemap.xml", () => {
	it("matches the deterministic generator output (no drift)", () => {
		const actual = readPublishedSitemap();
		const expected = `${renderSitemap(buildSitemapEntries())}\n`;
		expect(actual).toBe(expected);
	});

	it("includes every carrier surface slug as a URL", () => {
		const actual = readPublishedSitemap();
		for (const surface of carrierSurfaces) {
			expect(actual).toContain(
				`<loc>${SITE_URL}/wiki/carriers/${surface.slug}</loc>`
			);
		}
	});
});
