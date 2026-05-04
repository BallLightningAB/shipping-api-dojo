import { describe, expect, it } from "vitest";

import { CAPABILITY_BUNDLES } from "./entitlements";
import {
	canAccessScenarioRun,
	canUseLessonChallengeReroll,
	canUseScenarioReroll,
	fallbackFreeEntitlements,
	requiresPremiumScenarioDepth,
	TIER_CAPABILITY_MATRIX,
} from "./access-policy";

describe("entitlement access policy", () => {
	it("publishes a concrete free/pro/enterprise matrix", () => {
		expect(TIER_CAPABILITY_MATRIX.map((row) => row.tier)).toEqual([
			"free",
			"pro",
			"enterprise",
		]);
		expect(TIER_CAPABILITY_MATRIX.every((row) => row.surfaces.length > 0)).toBe(
			true
		);
	});

	it("falls back to free entitlements when paid state is missing", () => {
		expect(fallbackFreeEntitlements()).toEqual({
			capabilities: CAPABILITY_BUNDLES.free,
			source: "fallback_free",
			tier: "free",
		});
	});

	it("gates lesson and arena rerolls behind premium randomization capability", () => {
		expect(canUseLessonChallengeReroll(CAPABILITY_BUNDLES.free)).toBe(false);
		expect(canUseScenarioReroll(CAPABILITY_BUNDLES.free)).toBe(false);

		expect(canUseLessonChallengeReroll(CAPABILITY_BUNDLES.pro)).toBe(true);
		expect(canUseScenarioReroll(CAPABILITY_BUNDLES.enterprise)).toBe(true);
	});

	it("keeps baseline scenario runs available while gating advanced depth", () => {
		expect(requiresPremiumScenarioDepth(1)).toBe(false);
		expect(requiresPremiumScenarioDepth(2)).toBe(false);
		expect(requiresPremiumScenarioDepth(3)).toBe(true);
		expect(requiresPremiumScenarioDepth(4)).toBe(true);

		expect(canAccessScenarioRun(CAPABILITY_BUNDLES.free, 2)).toBe(true);
		expect(canAccessScenarioRun(CAPABILITY_BUNDLES.free, 3)).toBe(false);
		expect(canAccessScenarioRun(CAPABILITY_BUNDLES.pro, 3)).toBe(true);
		expect(canAccessScenarioRun(CAPABILITY_BUNDLES.enterprise, 4)).toBe(true);
	});
});
