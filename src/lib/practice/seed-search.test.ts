import { describe, expect, it } from "vitest";

import {
	arenaPracticeSearchSchema,
	lessonPracticeSearchSchema,
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
