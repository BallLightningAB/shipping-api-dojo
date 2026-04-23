/**
 * Canonical dev-tier seeded user fixtures.
 *
 * These fixtures are the single source of truth for the deterministic dev
 * users that the seed command creates and that Playwright's tiered-auth
 * smoke suite expects. They are intentionally safe to import from unit
 * tests, scripts, and browser fixtures because they contain only static
 * metadata — no runtime side effects.
 *
 * A tier fixture pairs a Better Auth email/password account with a
 * billing-shaped subscription state so the real entitlement resolver path
 * (manual row + latest subscription) is exercised end-to-end.
 */

import type { EntitlementTier } from "@/lib/entitlements/entitlements";

export type SeededSubscriptionState =
	| "none"
	| "active_pro_monthly"
	| "active_pro_annual"
	| "active_enterprise"
	| "canceled_pro"
	| "past_due_pro";

export interface SeededUserFixture {
	email: string;
	/** Tier the entitlement resolver is expected to report for this fixture. */
	expectedTier: EntitlementTier;
	/** Stable key used as the Better Auth user id and subscription row prefix. */
	key: string;
	name: string;
	password: string;
	/** Billing-shape state the seed command writes into `subscriptions`. */
	subscriptionState: SeededSubscriptionState;
}

/**
 * Shared password for all dev-tier fixtures. This is only ever used against
 * local or test databases; the seed guard refuses to run in production or
 * preview environments.
 */
export const DEV_TIER_PASSWORD = "dev-tier-password-do-not-use-elsewhere";

const DEV_TIER_DOMAIN = "dev.shipping-api-dojo.local";

export const DEV_TIER_USERS = {
	free: {
		key: "dev-free",
		email: `free@${DEV_TIER_DOMAIN}`,
		password: DEV_TIER_PASSWORD,
		name: "Dev Free",
		expectedTier: "free",
		subscriptionState: "none",
	},
	pro: {
		key: "dev-pro",
		email: `pro@${DEV_TIER_DOMAIN}`,
		password: DEV_TIER_PASSWORD,
		name: "Dev Pro",
		expectedTier: "pro",
		subscriptionState: "active_pro_monthly",
	},
	enterprise: {
		key: "dev-enterprise",
		email: `enterprise@${DEV_TIER_DOMAIN}`,
		password: DEV_TIER_PASSWORD,
		name: "Dev Enterprise",
		expectedTier: "enterprise",
		subscriptionState: "active_enterprise",
	},
	canceled: {
		key: "dev-canceled",
		email: `canceled@${DEV_TIER_DOMAIN}`,
		password: DEV_TIER_PASSWORD,
		name: "Dev Canceled",
		expectedTier: "free",
		subscriptionState: "canceled_pro",
	},
	inactive: {
		key: "dev-inactive",
		email: `inactive@${DEV_TIER_DOMAIN}`,
		password: DEV_TIER_PASSWORD,
		name: "Dev Inactive",
		expectedTier: "free",
		subscriptionState: "past_due_pro",
	},
} as const satisfies Record<string, SeededUserFixture>;

export type DevTierKey = keyof typeof DEV_TIER_USERS;

export const DEV_TIER_KEYS: readonly DevTierKey[] = [
	"free",
	"pro",
	"enterprise",
	"canceled",
	"inactive",
];

export function getDevTierFixture(key: DevTierKey): SeededUserFixture {
	return DEV_TIER_USERS[key];
}

export interface SubscriptionSeedShape {
	cancelAtPeriodEnd: boolean;
	planKey: string;
	productId: string;
	status: string;
}

/**
 * Resolve the billing-shaped subscription row the seed command should write
 * for a given fixture state. Returns `null` when no subscription row should
 * exist (e.g. pure Free users).
 */
export function resolveSubscriptionSeedShape(
	state: SeededSubscriptionState
): SubscriptionSeedShape | null {
	switch (state) {
		case "none":
			return null;
		case "active_pro_monthly":
			return {
				planKey: "pro_monthly",
				status: "active",
				productId: "dev-seed-pro-monthly",
				cancelAtPeriodEnd: false,
			};
		case "active_pro_annual":
			return {
				planKey: "pro_annual",
				status: "active",
				productId: "dev-seed-pro-annual",
				cancelAtPeriodEnd: false,
			};
		case "active_enterprise":
			return {
				planKey: "enterprise",
				status: "active",
				productId: "dev-seed-enterprise",
				cancelAtPeriodEnd: false,
			};
		case "canceled_pro":
			return {
				planKey: "pro_monthly",
				status: "canceled",
				productId: "dev-seed-pro-monthly",
				cancelAtPeriodEnd: true,
			};
		case "past_due_pro":
			return {
				planKey: "pro_monthly",
				status: "past_due",
				productId: "dev-seed-pro-monthly",
				cancelAtPeriodEnd: false,
			};
		default: {
			const exhaustive: never = state;
			throw new Error(
				`Unhandled seeded subscription state: ${String(exhaustive)}`
			);
		}
	}
}
