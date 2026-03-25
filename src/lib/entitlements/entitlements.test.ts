import { describe, expect, it } from "vitest";

import { hasCapability, resolveEntitlements } from "./entitlements";

describe("resolveEntitlements", () => {
	it("falls back to free tier for anonymous or unsubscribed users", () => {
		const resolved = resolveEntitlements({});

		expect(resolved.tier).toBe("free");
		expect(resolved.source).toBe("fallback_free");
		expect(hasCapability(resolved.capabilities, "progress.server")).toBe(true);
		expect(hasCapability(resolved.capabilities, "content.premium.read")).toBe(
			false
		);
	});

	it("resolves pro tier for active pro subscription", () => {
		const resolved = resolveEntitlements({
			subscriptionPlanKey: "pro_monthly",
			subscriptionStatus: "active",
		});

		expect(resolved.tier).toBe("pro");
		expect(resolved.source).toBe("subscription");
		expect(hasCapability(resolved.capabilities, "content.premium.read")).toBe(
			true
		);
	});

	it("keeps highest tier when both manual and subscription are present", () => {
		const resolved = resolveEntitlements({
			manualTier: "enterprise",
			subscriptionPlanKey: "pro_annual",
			subscriptionStatus: "active",
		});

		expect(resolved.tier).toBe("enterprise");
		expect(resolved.source).toBe("subscription+manual");
		expect(hasCapability(resolved.capabilities, "certificate.branded")).toBe(
			true
		);
	});
});
