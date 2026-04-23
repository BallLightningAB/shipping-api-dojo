import { describe, expect, it } from "vitest";
import { isDevSeedInProgress } from "../email/lifecycle";
import {
	type ResolvedEntitlements,
	resolveEntitlements,
} from "../entitlements/entitlements";
import {
	DEV_TIER_KEYS,
	DEV_TIER_USERS,
	resolveSubscriptionSeedShape,
} from "./seed-fixtures";
import { evaluateSeedGuard } from "./seed-guard";

const NODE_ENV_REASON = /NODE_ENV/;
const ENABLE_DEV_SEED_REASON = /ENABLE_DEV_SEED/;
const DATABASE_URL_REASON = /DATABASE_URL/;

describe("evaluateSeedGuard", () => {
	const base = {
		NODE_ENV: "development",
		ENABLE_DEV_SEED: "true",
		DATABASE_URL: "postgres://localhost:5432/dev",
	};

	it("allows running in local development when explicitly opted in", () => {
		expect(evaluateSeedGuard(base).allowed).toBe(true);
	});

	it("allows running under vitest (NODE_ENV=test) when explicitly opted in", () => {
		expect(evaluateSeedGuard({ ...base, NODE_ENV: "test" }).allowed).toBe(true);
	});

	it("blocks running in production", () => {
		const result = evaluateSeedGuard({ ...base, NODE_ENV: "production" });
		expect(result.allowed).toBe(false);
		expect(result.reason).toMatch(NODE_ENV_REASON);
	});

	it("blocks running when VERCEL_ENV is preview or production", () => {
		expect(evaluateSeedGuard({ ...base, VERCEL_ENV: "preview" }).allowed).toBe(
			false
		);
		expect(
			evaluateSeedGuard({ ...base, VERCEL_ENV: "production" }).allowed
		).toBe(false);
	});

	it("requires ENABLE_DEV_SEED=true", () => {
		const result = evaluateSeedGuard({ ...base, ENABLE_DEV_SEED: undefined });
		expect(result.allowed).toBe(false);
		expect(result.reason).toMatch(ENABLE_DEV_SEED_REASON);
	});

	it("requires DATABASE_URL so the real resolver path runs", () => {
		const result = evaluateSeedGuard({ ...base, DATABASE_URL: undefined });
		expect(result.allowed).toBe(false);
		expect(result.reason).toMatch(DATABASE_URL_REASON);
	});
});

describe("DEV_TIER_USERS fixtures drive the real resolver path", () => {
	function resolvedForFixture(
		key: (typeof DEV_TIER_KEYS)[number]
	): ResolvedEntitlements {
		const fixture = DEV_TIER_USERS[key];
		const shape = resolveSubscriptionSeedShape(fixture.subscriptionState);
		return resolveEntitlements({
			subscriptionPlanKey: shape?.planKey ?? null,
			subscriptionStatus: shape?.status ?? null,
		});
	}

	it("produces a free tier for the free fixture with no subscription", () => {
		expect(resolvedForFixture("free").tier).toBe("free");
	});

	it("produces a pro tier for the pro fixture with an active pro_monthly row", () => {
		expect(resolvedForFixture("pro").tier).toBe("pro");
	});

	it("produces an enterprise tier for the enterprise fixture with an active enterprise row", () => {
		expect(resolvedForFixture("enterprise").tier).toBe("enterprise");
	});

	it("falls back to free for canceled subscriptions without masking", () => {
		const resolved = resolvedForFixture("canceled");
		expect(resolved.tier).toBe("free");
		expect(resolved.source).toBe("fallback_free");
	});

	it("falls back to free for past-due subscriptions without masking", () => {
		const resolved = resolvedForFixture("inactive");
		expect(resolved.tier).toBe("free");
		expect(resolved.source).toBe("fallback_free");
	});

	it("covers the documented tier set", () => {
		expect([...DEV_TIER_KEYS].sort()).toEqual(
			["canceled", "enterprise", "free", "inactive", "pro"].sort()
		);
	});
});

describe("isDevSeedInProgress", () => {
	it("returns true when DEV_SEED_IN_PROGRESS is exactly 'true'", () => {
		expect(isDevSeedInProgress({ DEV_SEED_IN_PROGRESS: "true" })).toBe(true);
	});

	it("returns false for any other value or unset", () => {
		expect(isDevSeedInProgress({})).toBe(false);
		expect(isDevSeedInProgress({ DEV_SEED_IN_PROGRESS: "TRUE" })).toBe(false);
		expect(isDevSeedInProgress({ DEV_SEED_IN_PROGRESS: "1" })).toBe(false);
		expect(isDevSeedInProgress({ DEV_SEED_IN_PROGRESS: "" })).toBe(false);
	});
});
