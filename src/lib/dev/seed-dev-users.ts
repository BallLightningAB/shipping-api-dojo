/**
 * Idempotent seed implementation for dev-tier users.
 *
 * The implementation runs Better Auth's email/password sign-up for each
 * fixture and then writes billing-shaped subscription rows so that
 * `resolveEntitlementsForUserId` returns the expected tier through the
 * same code path production uses.
 *
 * This module is environment-guarded by {@link assertSeedGuardAllowed} and
 * must never be exported from anywhere that can reach production bundles.
 */

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { subscriptions, user } from "@/lib/db/schema";
import {
	DEV_TIER_KEYS,
	DEV_TIER_USERS,
	type DevTierKey,
	resolveSubscriptionSeedShape,
	type SeededUserFixture,
} from "@/lib/dev/seed-fixtures";
import {
	assertSeedGuardAllowed,
	type SeedGuardEnv,
} from "@/lib/dev/seed-guard";

export interface SeedResultEntry {
	created: boolean;
	email: string;
	expectedTier: SeededUserFixture["expectedTier"];
	key: DevTierKey;
	password: string;
	subscriptionId: string | null;
	userId: string;
}

export interface SeedDevUsersResult {
	entries: SeedResultEntry[];
}

async function ensureUserForFixture(
	fixture: SeededUserFixture
): Promise<{ id: string; created: boolean }> {
	const db = getDb();
	const [existing] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, fixture.email))
		.limit(1);

	if (existing?.id) {
		return { id: existing.id, created: false };
	}

	let signUp: Awaited<ReturnType<typeof auth.api.signUpEmail>>;
	try {
		signUp = await auth.api.signUpEmail({
			body: {
				email: fixture.email,
				password: fixture.password,
				name: fixture.name,
			},
		});
	} catch (cause) {
		// Better Auth's server API throws APIError on validation/DB failures
		// (e.g. password complexity, unique constraint, transient DB). Preserve
		// the original message and stack via `cause` so failed seeds are
		// diagnosable without digging through logs.
		const causeMessage = cause instanceof Error ? cause.message : String(cause);
		throw new Error(
			`Better Auth signUpEmail failed for ${fixture.email}: ${causeMessage}`,
			{ cause: cause instanceof Error ? cause : undefined }
		);
	}

	const userId = signUp?.user?.id;
	if (!userId) {
		throw new Error(
			`Better Auth signUpEmail did not return a user id for ${fixture.email}. ` +
				`Response: ${JSON.stringify(signUp)}`
		);
	}

	return { id: userId, created: true };
}

async function upsertSubscriptionForFixture(
	userId: string,
	fixture: SeededUserFixture
): Promise<string | null> {
	const db = getDb();
	const shape = resolveSubscriptionSeedShape(fixture.subscriptionState);

	if (!shape) {
		// Pure Free fixture — ensure no leftover subscription rows mask the state.
		await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
		return null;
	}

	const subscriptionId = `dev-seed-${fixture.key}`;
	const now = new Date();
	const periodStart = now;
	const durationMs = shape.planKey.includes("annual")
		? 365 * 24 * 60 * 60 * 1000
		: 30 * 24 * 60 * 60 * 1000;
	const periodEnd = new Date(now.getTime() + durationMs);
	const rawPayload = {
		source: "dev-seed",
		fixture: fixture.key,
		state: fixture.subscriptionState,
	};

	await db
		.insert(subscriptions)
		.values({
			id: subscriptionId,
			userId,
			provider: "dev-seed",
			status: shape.status,
			planKey: shape.planKey,
			productId: shape.productId,
			priceId: null,
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
			cancelAtPeriodEnd: shape.cancelAtPeriodEnd,
			rawPayload,
		})
		.onConflictDoUpdate({
			target: subscriptions.id,
			set: {
				userId,
				provider: "dev-seed",
				status: shape.status,
				planKey: shape.planKey,
				productId: shape.productId,
				priceId: null,
				cancelAtPeriodEnd: shape.cancelAtPeriodEnd,
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
				rawPayload,
				updatedAt: now,
			},
		});

	return subscriptionId;
}

async function seedEntryForKey(key: DevTierKey): Promise<SeedResultEntry> {
	const fixture = DEV_TIER_USERS[key];
	const { id: userId, created } = await ensureUserForFixture(fixture);
	const subscriptionId = await upsertSubscriptionForFixture(userId, fixture);
	return {
		created,
		email: fixture.email,
		expectedTier: fixture.expectedTier,
		key,
		password: fixture.password,
		subscriptionId,
		userId,
	};
}

export async function seedDevUsers(
	env: SeedGuardEnv = process.env
): Promise<SeedDevUsersResult> {
	assertSeedGuardAllowed(env);

	// Signal the lifecycle email hook (see `isDevSeedInProgress` in
	// `@/lib/email/lifecycle`) so Better Auth's `databaseHooks.user.create.after`
	// welcome-email path short-circuits instead of hitting Resend with dummy
	// addresses. The real hook still runs end-to-end; only the network call
	// is suppressed.
	const previousFlag = process.env.DEV_SEED_IN_PROGRESS;
	process.env.DEV_SEED_IN_PROGRESS = "true";
	try {
		// Fixtures are independent so we can run sign-up + subscription upsert in
		// parallel. The single-runner seed command cannot contend with itself;
		// the atomic upsert on `subscriptions.id` keeps the billing shape
		// deterministic across reruns.
		const entries = await Promise.all(DEV_TIER_KEYS.map(seedEntryForKey));
		return { entries };
	} finally {
		if (previousFlag === undefined) {
			Reflect.deleteProperty(process.env, "DEV_SEED_IN_PROGRESS");
		} else {
			process.env.DEV_SEED_IN_PROGRESS = previousFlag;
		}
	}
}
