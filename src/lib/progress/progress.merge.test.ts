import { describe, expect, it } from "vitest";

import { mergeProgressSnapshots } from "./progress.merge";
import { DEFAULT_PROGRESS } from "./progress.schema";

describe("mergeProgressSnapshots", () => {
	it("merges lessons and keeps the strongest scores", () => {
		const server = {
			...DEFAULT_PROGRESS,
			xp: 40,
			lessons: {
				"rest-1-http-semantics": {
					completed: false,
					completedAt: null,
					drillScores: {
						"rest-mcq-1": 60,
					},
				},
			},
		};
		const local = {
			...DEFAULT_PROGRESS,
			xp: 55,
			lessons: {
				"rest-1-http-semantics": {
					completed: true,
					completedAt: "2026-03-25T09:00:00.000Z",
					drillScores: {
						"rest-mcq-1": 80,
						"rest-cloze-1": 100,
					},
				},
			},
		};

		const merged = mergeProgressSnapshots(server, local);

		expect(merged.xp).toBe(55);
		expect(merged.lessons["rest-1-http-semantics"]?.completed).toBe(true);
		expect(
			merged.lessons["rest-1-http-semantics"]?.drillScores["rest-mcq-1"]
		).toBe(80);
		expect(
			merged.lessons["rest-1-http-semantics"]?.drillScores["rest-cloze-1"]
		).toBe(100);
	});

	it("unions scenario completion and keeps latest activity date", () => {
		const server = {
			...DEFAULT_PROGRESS,
			lastActiveDate: "2026-03-24",
			scenariosCompleted: ["timeout-create-shipment"],
		};
		const local = {
			...DEFAULT_PROGRESS,
			lastActiveDate: "2026-03-25",
			scenariosCompleted: ["wsdl-change-breaks-client"],
		};

		const merged = mergeProgressSnapshots(server, local);

		expect(merged.lastActiveDate).toBe("2026-03-25");
		expect(merged.scenariosCompleted).toContain("timeout-create-shipment");
		expect(merged.scenariosCompleted).toContain("wsdl-change-breaks-client");
	});

	it("normalizes legacy local progress before merging with server progress", () => {
		const server = {
			...DEFAULT_PROGRESS,
			lessons: {
				"rest-2-auth-headers": {
					completed: false,
					completedAt: null,
					drillScores: {
						"rest-required-headers-correlation-ids": 70,
					},
				},
			},
		};
		const local = {
			...DEFAULT_PROGRESS,
			version: 1,
			lessons: {
				"rest-2-auth-headers": {
					completed: false,
					completedAt: null,
					drillScores: {
						"rest2-builder-1": 95,
					},
				},
			},
			scenariosCompleted: ["rate-limit-429"],
		};

		const merged = mergeProgressSnapshots(server, local);

		expect(
			merged.lessons["rest-2-auth-headers"]?.drillScores[
				"rest-required-headers-correlation-ids"
			]
		).toBe(95);
		expect(merged.scenariosCompleted).toContain("rate-limiting-storm");
	});
});
