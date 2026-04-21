import { describe, expect, it } from "vitest";

import {
	buildArenaScenarioCards,
	buildLessonPracticeRun,
	buildScenarioPracticeRun,
} from "./practice-runs";

describe("practice run materialization", () => {
	it("does not expose lesson seeds in the client-facing run payload", () => {
		const run = buildLessonPracticeRun("rest-1-http-semantics", 123_456);

		expect(run).not.toBeNull();
		expect(run).not.toHaveProperty("seed");
		expect(run?.drills.length).toBeGreaterThan(0);
	});

	it("does not expose scenario run seeds in the client-facing run payload", () => {
		const scenario = buildScenarioPracticeRun(
			"duplicate-webhook-replay",
			123_456
		);

		expect(scenario).not.toBeNull();
		expect(scenario).not.toHaveProperty("runSeed");
	});

	it("does not expose arena card seeds in the client-facing card payload", () => {
		const cards = buildArenaScenarioCards(123_456, {
			canAccessLadderLevel: () => true,
			requiresPremiumDepth: () => false,
		});

		expect(cards.length).toBeGreaterThan(0);
		expect(cards[0]).not.toHaveProperty("seed");
		expect(cards[0]).not.toHaveProperty("runSeed");
	});
});
