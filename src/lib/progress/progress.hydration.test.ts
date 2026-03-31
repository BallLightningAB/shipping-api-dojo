import { describe, expect, it } from "vitest";

import { shouldReplaceLocalProgress } from "./progress.hydration";

describe("shouldReplaceLocalProgress", () => {
	it("replaces local progress when sync is fully resolved", () => {
		expect(shouldReplaceLocalProgress({ requiresDecision: false })).toBe(true);
	});

	it("preserves local progress while a merge decision is still required", () => {
		expect(shouldReplaceLocalProgress({ requiresDecision: true })).toBe(false);
	});
});
