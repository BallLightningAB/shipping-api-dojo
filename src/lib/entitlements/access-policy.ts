import {
	CAPABILITY_BUNDLES,
	hasCapability,
	type EntitlementTier,
	type ResolvedEntitlements,
} from "./entitlements";

export const PREMIUM_SCENARIO_MIN_LADDER_LEVEL = 3;

export interface TierCapabilityRow {
	tier: EntitlementTier;
	label: string;
	surfaces: string[];
}

export const TIER_CAPABILITY_MATRIX: TierCapabilityRow[] = [
	{
		tier: "free",
		label: "Free",
		surfaces: [
			"Public lessons, wiki, and directory",
			"Core lesson drills and standard arena scenarios",
			"Signed-in server-backed progress",
		],
	},
	{
		tier: "pro",
		label: "Pro",
		surfaces: [
			"All Free surfaces",
			"Premium challenge rerolls and variant depth",
			"Advanced review-mode scenario access",
			"Basic certificates (when shipped)",
		],
	},
	{
		tier: "enterprise",
		label: "Enterprise",
		surfaces: [
			"All Pro surfaces",
			"Branded certificates (when shipped)",
			"Team reporting and custom premium packs",
		],
	},
];

export function fallbackFreeEntitlements(): ResolvedEntitlements {
	return {
		capabilities: CAPABILITY_BUNDLES.free,
		source: "fallback_free",
		tier: "free",
	};
}

export function canUseLessonChallengeReroll(
	capabilities: readonly string[]
): boolean {
	return hasCapability(capabilities, "randomization.premium.full");
}

export function canUseScenarioReroll(capabilities: readonly string[]): boolean {
	return hasCapability(capabilities, "randomization.premium.full");
}

export function requiresPremiumScenarioDepth(ladderLevel?: number): boolean {
	return (
		typeof ladderLevel === "number" &&
		ladderLevel >= PREMIUM_SCENARIO_MIN_LADDER_LEVEL
	);
}

export function canAccessScenarioRun(
	capabilities: readonly string[],
	ladderLevel?: number
): boolean {
	if (!requiresPremiumScenarioDepth(ladderLevel)) {
		return true;
	}

	return hasCapability(capabilities, "review.mode.full");
}
