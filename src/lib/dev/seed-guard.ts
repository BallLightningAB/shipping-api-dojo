/**
 * Environment guard for dev-only seeding.
 *
 * The dev-tier seed command creates deterministic Free/Pro/Enterprise/canceled/
 * inactive users with real Better Auth accounts plus billing-shaped subscription
 * rows. It must never run against production or preview environments. This
 * guard is shared between the CLI seed script and its tests so the
 * gating rules stay in one place.
 */

export interface SeedGuardEnv {
	readonly DATABASE_URL?: string | undefined;
	readonly ENABLE_DEV_SEED?: string | undefined;
	readonly NODE_ENV?: string | undefined;
	readonly VERCEL_ENV?: string | undefined;
	readonly [key: string]: string | undefined;
}

export interface SeedGuardResult {
	allowed: boolean;
	reason?: string;
}

const ALLOWED_NODE_ENVS = new Set(["development", "test"]);
const BLOCKED_VERCEL_ENVS = new Set(["production", "preview"]);

export function evaluateSeedGuard(env: SeedGuardEnv): SeedGuardResult {
	const nodeEnv = env.NODE_ENV ?? "development";

	if (!ALLOWED_NODE_ENVS.has(nodeEnv)) {
		return {
			allowed: false,
			reason: `Dev seeding is only allowed when NODE_ENV is one of [${[...ALLOWED_NODE_ENVS].join(", ")}], received "${nodeEnv}".`,
		};
	}

	if (env.VERCEL_ENV && BLOCKED_VERCEL_ENVS.has(env.VERCEL_ENV)) {
		return {
			allowed: false,
			reason: `Dev seeding is blocked when VERCEL_ENV is "${env.VERCEL_ENV}".`,
		};
	}

	if (env.ENABLE_DEV_SEED !== "true") {
		return {
			allowed: false,
			reason:
				'Set ENABLE_DEV_SEED="true" to opt in to the dev-only tiered seed command.',
		};
	}

	if (!env.DATABASE_URL) {
		return {
			allowed: false,
			reason:
				"DATABASE_URL is required for dev seeding so the resolver uses the same code path as production.",
		};
	}

	return { allowed: true };
}

export function assertSeedGuardAllowed(env: SeedGuardEnv): void {
	const result = evaluateSeedGuard(env);
	if (!result.allowed) {
		throw new Error(`[seed-dev-users] ${result.reason}`);
	}
}
