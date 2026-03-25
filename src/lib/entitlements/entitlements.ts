export const TIER_PRIORITY = {
	free: 0,
	pro: 1,
	enterprise: 2,
} as const;

export type EntitlementTier = keyof typeof TIER_PRIORITY;

export const CAPABILITY_BUNDLES: Record<EntitlementTier, string[]> = {
	free: ["content.sample.read", "content.free.read", "progress.server"],
	pro: [
		"content.sample.read",
		"content.free.read",
		"progress.server",
		"content.premium.read",
		"randomization.premium.full",
		"review.mode.full",
		"certificate.basic",
	],
	enterprise: [
		"content.sample.read",
		"content.free.read",
		"progress.server",
		"content.premium.read",
		"randomization.premium.full",
		"review.mode.full",
		"certificate.basic",
		"certificate.branded",
		"reporting.team",
		"custom.content.premium.read",
	],
};

interface ResolveEntitlementInput {
	manualCapabilities?: string[] | null;
	manualTier?: string | null;
	subscriptionStatus?: string | null;
	subscriptionPlanKey?: string | null;
}

export interface ResolvedEntitlements {
	capabilities: string[];
	source: "fallback_free" | "manual" | "subscription" | "subscription+manual";
	tier: EntitlementTier;
}

function isEntitlementTier(value: string): value is EntitlementTier {
	return value in TIER_PRIORITY;
}

function resolveSubscriptionTier(
	status?: string | null,
	planKey?: string | null
): EntitlementTier | null {
	if (!(status && planKey)) {
		return null;
	}

	const normalizedStatus = status.toLowerCase();
	const isActive =
		normalizedStatus === "active" || normalizedStatus === "trialing";
	if (!isActive) {
		return null;
	}

	if (planKey.startsWith("enterprise")) {
		return "enterprise";
	}
	if (planKey.startsWith("pro")) {
		return "pro";
	}

	return null;
}

function maxTier(
	left: EntitlementTier | null,
	right: EntitlementTier | null
): EntitlementTier | null {
	if (!left) {
		return right;
	}
	if (!right) {
		return left;
	}
	return TIER_PRIORITY[left] >= TIER_PRIORITY[right] ? left : right;
}

export function hasCapability(
	capabilities: readonly string[],
	required: string
): boolean {
	return capabilities.includes(required);
}

export function resolveEntitlements(
	input: ResolveEntitlementInput
): ResolvedEntitlements {
	const manualTier =
		input.manualTier && isEntitlementTier(input.manualTier)
			? input.manualTier
			: null;
	const subscriptionTier = resolveSubscriptionTier(
		input.subscriptionStatus,
		input.subscriptionPlanKey
	);
	const tier = maxTier(subscriptionTier, manualTier) ?? "free";
	const baseCapabilities = CAPABILITY_BUNDLES[tier];
	const manualCapabilities = input.manualCapabilities ?? [];
	const capabilities = Array.from(
		new Set([...baseCapabilities, ...manualCapabilities])
	);

	let source: ResolvedEntitlements["source"] = "fallback_free";

	if (subscriptionTier && manualTier) {
		source = "subscription+manual";
	} else if (subscriptionTier) {
		source = "subscription";
	} else if (manualTier) {
		source = "manual";
	}

	return {
		tier,
		capabilities,
		source,
	};
}
