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
});
