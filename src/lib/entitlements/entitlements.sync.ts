import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";

import { getRequestSession, requireRequestSession } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { subscriptions, userEntitlements } from "@/lib/db/schema";
import {
	hasCapability,
	resolveEntitlements,
} from "@/lib/entitlements/entitlements";

export const getCurrentEntitlements = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getRequestSession();
		if (!session?.user?.id) {
			return resolveEntitlements({});
		}

		const db = getDb();

		const [manualEntitlement] = await db
			.select({
				capabilities: userEntitlements.capabilities,
				tier: userEntitlements.tier,
			})
			.from(userEntitlements)
			.where(eq(userEntitlements.userId, session.user.id))
			.limit(1);

		const [latestSubscription] = await db
			.select({
				planKey: subscriptions.planKey,
				status: subscriptions.status,
			})
			.from(subscriptions)
			.where(eq(subscriptions.userId, session.user.id))
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
		await requireRequestSession();
		const entitlements = await getCurrentEntitlements();
		if (!hasCapability(entitlements.capabilities, data.capability)) {
			throw new Error(`FORBIDDEN_CAPABILITY:${data.capability}`);
		}
		return entitlements;
	});
