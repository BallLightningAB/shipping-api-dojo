import { describe, expect, it } from "vitest";

import { carrierSurfaces, getCarrierSurfaceBySlug } from "./carriers";
import { directoryEntries } from "./directory";
import { wikiEntries } from "./wiki";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
const HTTPS_URL = /^https:\/\//;
const WHITESPACE = /\s+/;

describe("carrierSurfaces", () => {
	it("ships at least the prioritized 8-12 high-value surfaces from issue #15", () => {
		expect(carrierSurfaces.length).toBeGreaterThanOrEqual(8);
		expect(carrierSurfaces.length).toBeLessThanOrEqual(20);
	});

	it("uses unique slugs", () => {
		const slugs = carrierSurfaces.map((surface) => surface.slug);
		const uniqueSlugs = new Set(slugs);
		expect(uniqueSlugs.size).toBe(slugs.length);
	});

	it("uses lowercase slug pattern with vendor-businessunit-region-protocol shape", () => {
		for (const surface of carrierSurfaces) {
			expect(surface.slug).toMatch(SLUG_PATTERN);
		}
	});

	it("requires every surface to have at least 2 official sources", () => {
		for (const surface of carrierSurfaces) {
			expect(surface.sources.length).toBeGreaterThanOrEqual(2);
		}
	});

	it("requires every surface to have at least 3 FAQs for the FAQPage JSON-LD", () => {
		for (const surface of carrierSurfaces) {
			expect(surface.faqs.length).toBeGreaterThanOrEqual(3);
			for (const faq of surface.faqs) {
				expect(faq.question.length).toBeGreaterThan(10);
				expect(faq.answer.length).toBeGreaterThan(20);
			}
		}
	});

	it("requires every surface body to be substantive (>=180 words)", () => {
		// 180 is the floor for the long-form body alone. Each rendered page also
		// carries FAQs, structured surface details, and sources, so the actual
		// page content per surface is materially larger than the body count.
		for (const surface of carrierSurfaces) {
			const wordCount = surface.body.split(WHITESPACE).filter(Boolean).length;
			expect(wordCount).toBeGreaterThanOrEqual(180);
		}
	});

	it("links every surface to at least 2 concept wiki entries", () => {
		const conceptSlugs = new Set(wikiEntries.map((entry) => entry.slug));
		for (const surface of carrierSurfaces) {
			expect(surface.relatedConceptSlugs.length).toBeGreaterThanOrEqual(2);
			for (const slug of surface.relatedConceptSlugs) {
				expect(conceptSlugs.has(slug)).toBe(true);
			}
		}
	});

	it("links every surface to at least one directory entry that exists in the directory", () => {
		const directorySlugs = new Set(
			directoryEntries
				.map((entry) => entry.slug)
				.filter((slug): slug is string => Boolean(slug))
		);
		for (const surface of carrierSurfaces) {
			expect(surface.directorySlugs.length).toBeGreaterThanOrEqual(1);
			for (const slug of surface.directorySlugs) {
				expect(directorySlugs.has(slug)).toBe(true);
			}
		}
	});

	it("resolves replacementSurfaceSlug to a real carrier surface for sunset/deprecated/legacy entries", () => {
		const slugs = new Set(carrierSurfaces.map((surface) => surface.slug));
		for (const surface of carrierSurfaces) {
			if (
				surface.status === "sunset" ||
				surface.status === "deprecated" ||
				surface.status === "legacy"
			) {
				expect(surface.replacementSurfaceSlug).toBeDefined();
				if (surface.replacementSurfaceSlug) {
					expect(slugs.has(surface.replacementSurfaceSlug)).toBe(true);
				}
				expect(surface.deprecationNotes).toBeDefined();
			}
		}
	});

	it("resolves all relatedSurfaceSlugs to real carrier surfaces", () => {
		const slugs = new Set(carrierSurfaces.map((surface) => surface.slug));
		for (const surface of carrierSurfaces) {
			for (const related of surface.relatedSurfaceSlugs) {
				expect(slugs.has(related)).toBe(true);
				// A surface should not list itself as related.
				expect(related).not.toBe(surface.slug);
			}
		}
	});

	it("uses HTTPS for every official doc and source URL", () => {
		for (const surface of carrierSurfaces) {
			for (const source of [...surface.officialDocs, ...surface.sources]) {
				expect(source.url).toMatch(HTTPS_URL);
			}
		}
	});

	it("getCarrierSurfaceBySlug returns the matching surface", () => {
		const sample = carrierSurfaces[0];
		expect(getCarrierSurfaceBySlug(sample.slug)).toEqual(sample);
		expect(getCarrierSurfaceBySlug("does-not-exist")).toBeUndefined();
	});

	it("groups DHL into separate business-unit surfaces (Express, eCommerce, Parcel DE, Freight Sweden) rather than a single page", () => {
		const dhl = carrierSurfaces.filter(
			(surface) => surface.vendorSlug === "dhl"
		);
		const businessUnits = new Set(
			dhl.map((surface) => surface.businessUnitSlug)
		);
		expect(businessUnits.has("express")).toBe(true);
		expect(businessUnits.has("ecommerce")).toBe(true);
		expect(businessUnits.has("parcel-de")).toBe(true);
		expect(businessUnits.has("freight")).toBe(true);
	});

	it("represents both modern and legacy USPS surfaces so 'USPS Web Tools' search intent has a destination", () => {
		const usps = carrierSurfaces.filter(
			(surface) => surface.vendorSlug === "usps"
		);
		const statuses = new Set(usps.map((surface) => surface.status));
		expect(statuses.has("active")).toBe(true);
		expect(statuses.has("deprecated") || statuses.has("sunset")).toBe(true);
	});

	it("represents both modern and legacy UPS surfaces so 'UPS XML API' search intent has a destination", () => {
		const ups = carrierSurfaces.filter(
			(surface) => surface.vendorSlug === "ups"
		);
		const statuses = new Set(ups.map((surface) => surface.status));
		expect(statuses.has("active")).toBe(true);
		expect(statuses.has("sunset") || statuses.has("legacy")).toBe(true);
	});

	it("represents both REST and SOAP FedEx surfaces", () => {
		const fedex = carrierSurfaces.filter(
			(surface) => surface.vendorSlug === "fedex"
		);
		const protocols = new Set(fedex.map((surface) => surface.protocol));
		expect(protocols.has("rest")).toBe(true);
		expect(protocols.has("soap")).toBe(true);
	});
});
