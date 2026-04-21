import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";

import {
	hasCapability,
	resolveEntitlements,
} from "@/lib/entitlements/entitlements";

export async function resolveEntitlementsForUserId(userId?: string | null) {
	if (!userId) {
		return resolveEntitlements({});
	}

	const { getDb } = await import("@/lib/db/client");
	const { subscriptions, userEntitlements } = await import("@/lib/db/schema");
	const db = getDb();

	const [manualEntitlement] = await db
		.select({
			capabilities: userEntitlements.capabilities,
			tier: userEntitlements.tier,
		})
		.from(userEntitlements)
		.where(eq(userEntitlements.userId, userId))
		.limit(1);

	const [latestSubscription] = await db
		.select({
			planKey: subscriptions.planKey,
			status: subscriptions.status,
		})
		.from(subscriptions)
		.where(eq(subscriptions.userId, userId))
		.orderBy(desc(subscriptions.updatedAt))
		.limit(1);

	return resolveEntitlements({
		manualCapabilities: Array.isArray(manualEntitlement?.capabilities)
			? (manualEntitlement.capabilities as string[])
			: [],
		manualTier: manualEntitlement?.tier ?? null,
		subscriptionPlanKey: latestSubscription?.planKey ?? null,
		subscriptionStatus: latestSubscription?.status ?? null,
	});
}

export const getCurrentEntitlements = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getRequestSession } = await import("@/lib/auth/server");
		const session = await getRequestSession();
		return resolveEntitlementsForUserId(session?.user?.id);
	}
);

export const requireCapability = createServerFn({ method: "GET" })
	.inputValidator((input: unknown): { capability: string } => {
		const data = input as { capability?: unknown };
		if (
			!data ||
			typeof data.capability !== "string" ||
			data.capability.length < 1
		) {
			throw new Error("Invalid capability input");
		}
		return { capability: data.capability };
	})
	.handler(async ({ data }) => {
		const { requireRequestSession } = await import("@/lib/auth/server");
		await requireRequestSession();
		const entitlements = await getCurrentEntitlements();
		if (!hasCapability(entitlements.capabilities, data.capability)) {
			throw new Error(`FORBIDDEN_CAPABILITY:${data.capability}`);
		}
		return entitlements;
	});
