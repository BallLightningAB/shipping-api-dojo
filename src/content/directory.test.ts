import { describe, expect, it } from "vitest";

import { carrierSurfaces } from "./carriers";
import { directoryEntries } from "./directory";

const HTTP_OR_HTTPS_URL = /^https?:\/\//;
const HTTPS_URL = /^https:\/\//;

describe("directoryEntries", () => {
	it("uses unique URLs across all entries", () => {
		const urls = directoryEntries.map((entry) => entry.url);
		expect(new Set(urls).size).toBe(urls.length);
	});

	it("uses unique slugs when entries opt in to one", () => {
		const slugs = directoryEntries
			.map((entry) => entry.slug)
			.filter((slug): slug is string => Boolean(slug));
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it("uses HTTPS for every entry URL", () => {
		for (const entry of directoryEntries) {
			expect(entry.url).toMatch(HTTP_OR_HTTPS_URL);
		}
	});

	it("requires every carrier-category entry to declare vendor and region", () => {
		for (const entry of directoryEntries) {
			if (entry.category === "carrier") {
				expect(entry.vendor).toBeDefined();
				expect(entry.region).toBeDefined();
			}
		}
	});

	it("requires deprecated and sunset entries to carry a deprecation explanation", () => {
		for (const entry of directoryEntries) {
			if (entry.status === "deprecated" || entry.status === "sunset") {
				expect(entry.deprecation).toBeDefined();
				expect(entry.deprecation?.notes).toBeTruthy();
			}
		}
	});

	it("validates tooling URLs as absolute HTTPS when present", () => {
		for (const entry of directoryEntries) {
			const tooling = entry.tooling;
			if (!tooling) {
				continue;
			}
			for (const url of [
				tooling.wsdlUrl,
				tooling.openApiUrl,
				tooling.ediGuideUrl,
				tooling.graphqlEndpoint,
				tooling.postmanCollectionUrl,
			]) {
				if (url) {
					expect(url).toMatch(HTTPS_URL);
				}
			}
		}
	});

	it("validates sandbox URLs as absolute HTTPS when present", () => {
		for (const entry of directoryEntries) {
			if (entry.sandbox?.url) {
				expect(entry.sandbox.url).toMatch(HTTPS_URL);
			}
		}
	});

	it("resolves carrierSlug to a real CarrierSurface", () => {
		const surfaceSlugs = new Set(
			carrierSurfaces.map((surface) => surface.slug)
		);
		for (const entry of directoryEntries) {
			if (entry.carrierSlug) {
				expect(surfaceSlugs.has(entry.carrierSlug)).toBe(true);
			}
		}
	});

	it("covers every active carrier surface with at least one directory entry", () => {
		// Active surfaces must have their own directory entry. Legacy/sunset
		// surfaces are allowed to share a directory entry with their active
		// replacement, because the carrier portal usually hosts both rather
		// than maintaining a separate page for the legacy product.
		const directoryByCarrierSlug = new Set(
			directoryEntries
				.map((entry) => entry.carrierSlug)
				.filter((slug): slug is string => Boolean(slug))
		);
		for (const surface of carrierSurfaces) {
			if (surface.status === "active") {
				expect(directoryByCarrierSlug.has(surface.slug)).toBe(true);
			}
		}
	});
});
