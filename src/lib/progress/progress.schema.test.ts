import { describe, expect, it } from "vitest";

import {
	CURRENT_VERSION,
	DEFAULT_PROGRESS,
	parseProgress,
} from "./progress.schema";

describe("parseProgress", () => {
	it("returns defaults when the input is invalid", () => {
		expect(parseProgress({ nope: true })).toEqual(DEFAULT_PROGRESS);
	});

	it("preserves valid progress payloads", () => {
		const parsed = parseProgress({
			version: CURRENT_VERSION,
			xp: 42,
			streak: 3,
			lastActiveDate: "2026-03-17",
			lessons: {
				restIntro: {
					completed: true,
					completedAt: "2026-03-17T10:00:00.000Z",
					drillScores: {
						mcq1: 100,
					},
				},
			},
			scenariosCompleted: ["timeout-create-shipment"],
		});

		expect(parsed.xp).toBe(42);
		expect(parsed.lessons.restIntro?.completed).toBe(true);
		expect(parsed.scenariosCompleted).toEqual(["timeout-create-shipment"]);
	});

	it("migrates old versions to the current version", () => {
		const parsed = parseProgress({
			...DEFAULT_PROGRESS,
			version: 0,
			xp: 5,
		});

		expect(parsed.version).toBe(CURRENT_VERSION);
		expect(parsed.xp).toBe(5);
	});

	it("remaps legacy drill and scenario progress keys to canonical families", () => {
		const parsed = parseProgress({
			version: 1,
			xp: 24,
			streak: 2,
			lastActiveDate: "2026-04-11",
			lessons: {
				"rest-1-http-semantics": {
					completed: false,
					completedAt: null,
					drillScores: {
						"rest1-mcq-1": 60,
					},
				},
				"rest-2-auth-headers": {
					completed: false,
					completedAt: null,
					drillScores: {
						"rest2-builder-1": 90,
					},
				},
			},
			scenariosCompleted: ["rate-limit-429"],
		});

		expect(
			parsed.lessons["rest-1-http-semantics"]?.drillScores[
				"rest-http-method-classification"
			]
		).toBe(60);
		expect(
			parsed.lessons["rest-2-auth-headers"]?.drillScores[
				"rest-required-headers-correlation-ids"
			]
		).toBe(90);
		expect(parsed.scenariosCompleted).toEqual(["rate-limiting-storm"]);
	});
});
