import { describe, expect, it } from "vitest";

import {
	generateArticleSchema,
	generateBreadcrumbListSchema,
	generateFAQPageSchema,
	generateRootEntityGraphSchema,
} from "./structured-data";

const SITE_URL = "https://shipping.apidojo.app";

describe("generateRootEntityGraphSchema", () => {
	it("uses the Shipping API Dojo brand and live domain", () => {
		const schema = generateRootEntityGraphSchema() as unknown as {
			"@graph": Record<string, unknown>[];
		};

		const website = schema["@graph"].find(
			(entry) => entry["@type"] === "WebSite"
		);
		const app = schema["@graph"].find(
			(entry) => entry["@type"] === "WebApplication"
		);

		expect(website?.name).toBe("Shipping API Dojo");
		expect(website?.url).toBe("https://shipping.apidojo.app");
		expect(app?.name).toBe("Shipping API Dojo");
		expect(app?.url).toBe("https://shipping.apidojo.app");
	});
});

describe("generateArticleSchema", () => {
	it("emits an Article with absolute URL, mainEntityOfPage, and publisher pointer", () => {
		const article = generateArticleSchema({
			title: "Idempotency",
			description: "Why duplicate requests should not duplicate state.",
			url: "/wiki/idempotency",
			datePublished: "2026-04-25",
		}) as Record<string, unknown>;

		expect(article["@context"]).toBe("https://schema.org");
		expect(article["@type"]).toBe("Article");
		expect(article.headline).toBe("Idempotency");
		expect(article.url).toBe(`${SITE_URL}/wiki/idempotency`);
		expect(article.mainEntityOfPage).toEqual({
			"@type": "WebPage",
			"@id": `${SITE_URL}/wiki/idempotency`,
		});
		expect(article.datePublished).toBe("2026-04-25");
		expect(article.dateModified).toBe("2026-04-25");
		expect(article.publisher).toEqual({
			"@id": "https://balllightning.cloud/#organization",
		});
	});

	it("preserves explicitly provided dateModified separate from datePublished", () => {
		const article = generateArticleSchema({
			title: "T",
			description: "D",
			url: "/wiki/t",
			datePublished: "2026-04-01",
			dateModified: "2026-04-25",
		}) as Record<string, unknown>;

		expect(article.datePublished).toBe("2026-04-01");
		expect(article.dateModified).toBe("2026-04-25");
	});

	it("omits author when none is provided", () => {
		const article = generateArticleSchema({
			title: "T",
			description: "D",
			url: "/wiki/t",
		}) as Record<string, unknown>;

		expect(article.author).toBeUndefined();
	});
});

describe("generateBreadcrumbListSchema", () => {
	it("renders 1-indexed list items with absolute URLs", () => {
		const schema = generateBreadcrumbListSchema([
			{ name: "Home", url: "/" },
			{ name: "Wiki", url: "/wiki" },
			{ name: "Idempotency", url: "/wiki/idempotency" },
		]) as Record<string, unknown>;

		expect(schema["@type"]).toBe("BreadcrumbList");

		const items = schema.itemListElement as Record<string, unknown>[];
		expect(items).toHaveLength(3);
		expect(items[0]).toMatchObject({
			position: 1,
			name: "Home",
			item: `${SITE_URL}/`,
		});
		expect(items[2]).toMatchObject({
			position: 3,
			name: "Idempotency",
			item: `${SITE_URL}/wiki/idempotency`,
		});
	});

	it("allows breadcrumbs without URLs (e.g., interior categories)", () => {
		const schema = generateBreadcrumbListSchema([
			{ name: "Home", url: "/" },
			{ name: "DHL" },
		]) as Record<string, unknown>;

		const items = schema.itemListElement as Record<string, unknown>[];
		expect(items[1]).toMatchObject({ position: 2, name: "DHL" });
		expect(items[1].item).toBeUndefined();
	});

	it("returns null on empty input so SSR callers can skip the script tag", () => {
		expect(generateBreadcrumbListSchema([])).toBeNull();
	});
});

describe("generateFAQPageSchema", () => {
	it("returns null on empty input so callers can skip the script tag entirely", () => {
		expect(generateFAQPageSchema([])).toBeNull();
	});

	it("emits a FAQPage with Question/Answer entities", () => {
		const schema = generateFAQPageSchema([
			{ question: "Q1?", answer: "A1." },
			{ question: "Q2?", answer: "A2." },
		]) as Record<string, unknown>;

		expect(schema["@type"]).toBe("FAQPage");
		const entities = schema.mainEntity as Record<string, unknown>[];
		expect(entities).toHaveLength(2);
		expect(entities[0]).toMatchObject({
			"@type": "Question",
			name: "Q1?",
			acceptedAnswer: { "@type": "Answer", text: "A1." },
		});
	});
});
