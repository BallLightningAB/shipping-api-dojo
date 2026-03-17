import { describe, expect, it } from "vitest";

import {
	DEFAULT_IMAGE,
	SITE_URL,
	generateCanonical,
	generateMeta,
} from "./meta";

describe("generateMeta", () => {
	it("adds the site name to titles and resolves relative URLs", () => {
		const meta = generateMeta({
			title: "REST Lesson",
			description: "A lesson",
			url: "/lesson/rest",
			image: "/rest.png",
		});

		expect(meta).toContainEqual({
			property: "og:title",
			content: "REST Lesson | Shipping API Dojo",
		});
		expect(meta).toContainEqual({
			property: "og:url",
			content: `${SITE_URL}/lesson/rest`,
		});
		expect(meta).toContainEqual({
			property: "og:image",
			content: `${SITE_URL}/rest.png`,
		});
	});

	it("falls back to the default image when none is provided", () => {
		const meta = generateMeta({
			title: "Arena",
			description: "Scenario drills",
		});

		expect(meta).toContainEqual({
			property: "og:image",
			content: DEFAULT_IMAGE,
		});
	});
});

describe("generateCanonical", () => {
	it("returns an absolute canonical URL", () => {
		expect(generateCanonical("/arena")).toEqual({
			rel: "canonical",
			href: `${SITE_URL}/arena`,
		});
	});
});
