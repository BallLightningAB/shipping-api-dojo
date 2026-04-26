import { describe, expect, it } from "vitest";

import {
	arenaPracticeSearchSchema,
	lessonPracticeSearchSchema,
	stripLegacySeedParamsFromHref,
} from "./seed-search";

describe("practice route search schemas", () => {
	it("strips legacy lesson seed and exclusion params from route state", () => {
		const search = lessonPracticeSearchSchema.parse({
			exclude: "rest-timeout-recovery:a",
			seed: 123_456,
		});

		expect(search).toEqual({});
		expect("seed" in search).toBe(false);
		expect("exclude" in search).toBe(false);
	});

	it("keeps arena scenario selection but strips seed-bearing params", () => {
		const search = arenaPracticeSearchSchema.parse({
			runSeed: 111_111,
			scenario: "duplicate-webhook-replay",
			seed: 222_222,
		});

		expect(search).toEqual({ scenario: "duplicate-webhook-replay" });
		expect("seed" in search).toBe(false);
		expect("runSeed" in search).toBe(false);
	});
});

describe("stripLegacySeedParamsFromHref", () => {
	it("returns the original href unchanged when no legacy seed params are present", () => {
		const result = stripLegacySeedParamsFromHref(
			"/lesson/rest-timeout-recovery"
		);
		expect(result).toEqual({
			changed: false,
			href: "/lesson/rest-timeout-recovery",
		});
	});

	it("preserves non-legacy search params and the hash fragment", () => {
		const result = stripLegacySeedParamsFromHref(
			"/arena?scenario=duplicate-webhook-replay&seed=42#step-2"
		);

		expect(result.changed).toBe(true);
		expect(result.href).toBe("/arena?scenario=duplicate-webhook-replay#step-2");
	});

	it("removes every legacy seed-bearing param", () => {
		const result = stripLegacySeedParamsFromHref(
			"/lesson/rest-timeout-recovery?seed=1&runSeed=2&exclude=a"
		);

		expect(result.changed).toBe(true);
		expect(result.href).toBe("/lesson/rest-timeout-recovery");
	});

	it("accepts hrefs with no leading slash and normalizes via the parsing base URL", () => {
		const result = stripLegacySeedParamsFromHref(
			"lesson/rest-timeout-recovery?seed=1"
		);

		expect(result.changed).toBe(true);
		expect(result.href).toBe("/lesson/rest-timeout-recovery");
	});
});
