import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { requireRequestSession } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import {
	billingEvents,
	emailEvents,
	progressMergeEvents,
	session,
	subscriptions,
	user,
	userEntitlements,
	userProgress,
} from "@/lib/db/schema";
import type { ProgressData } from "@/lib/progress/progress.schema";

export interface AccountPrivacyExport {
	account: {
		createdAt: Date;
		email: string;
		emailVerified: boolean;
		id: string;
		image: string | null;
		name: string;
		updatedAt: Date;
	};
	billingEvents: Array<{
		eventType: string;
		id: string;
		processedAt: Date | null;
		provider: string;
		receivedAt: Date;
		subscriptionId: string | null;
	}>;
	emailEvents: Array<{
		eventType: string;
		id: number;
		occurredAt: Date;
		provider: string;
		providerEventId: string | null;
		recipient: string;
	}>;
	entitlements: {
		capabilities: string[];
		effectiveFrom: Date;
		effectiveTo: Date | null;
		source: string;
		tier: string;
		updatedAt: Date;
	} | null;
	exportedAt: string;
	exportVersion: number;
	progress: {
		progressJson: ProgressData;
		updatedAt: Date;
		version: number;
	} | null;
	progressMergeEvents: Array<{
		createdAt: Date;
		id: number;
		mergeStrategy: string;
	}>;
	serviceNotes: string[];
	sessions: Array<{
		createdAt: Date;
		expiresAt: Date;
		id: string;
		ipAddress: string | null;
		userAgent: string | null;
	}>;
	subscriptions: Array<{
		cancelAtPeriodEnd: boolean;
		currentPeriodEnd: Date | null;
		currentPeriodStart: Date | null;
		id: string;
		planKey: string;
		productId: string;
		provider: string;
		status: string;
		updatedAt: Date;
	}>;
}

export const getAccountPrivacyExport = createServerFn({
	method: "GET",
}).handler(async () => {
	const requestSession = await requireRequestSession();
	const db = getDb();
	const userId = requestSession.user.id;

	const [accountRow] = await db
		.select({
			createdAt: user.createdAt,
			email: user.email,
			emailVerified: user.emailVerified,
			id: user.id,
			image: user.image,
			name: user.name,
			updatedAt: user.updatedAt,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const [progressRow] = await db
		.select({
			progressJson: userProgress.progressJson,
			updatedAt: userProgress.updatedAt,
			version: userProgress.version,
		})
		.from(userProgress)
		.where(eq(userProgress.userId, userId))
		.limit(1);

	const [entitlementRow] = await db
		.select({
			capabilities: userEntitlements.capabilities,
			effectiveFrom: userEntitlements.effectiveFrom,
			effectiveTo: userEntitlements.effectiveTo,
			source: userEntitlements.source,
			tier: userEntitlements.tier,
			updatedAt: userEntitlements.updatedAt,
		})
		.from(userEntitlements)
		.where(eq(userEntitlements.userId, userId))
		.limit(1);

	const sessionRows = await db
		.select({
			createdAt: session.createdAt,
			expiresAt: session.expiresAt,
			id: session.id,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
		})
		.from(session)
		.where(eq(session.userId, userId))
		.orderBy(desc(session.createdAt));

	const subscriptionRows = await db
		.select({
			cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
			currentPeriodEnd: subscriptions.currentPeriodEnd,
			currentPeriodStart: subscriptions.currentPeriodStart,
			id: subscriptions.id,
			planKey: subscriptions.planKey,
			productId: subscriptions.productId,
			provider: subscriptions.provider,
			status: subscriptions.status,
			updatedAt: subscriptions.updatedAt,
		})
		.from(subscriptions)
		.where(eq(subscriptions.userId, userId))
		.orderBy(desc(subscriptions.updatedAt));

	const billingRows = await db
		.select({
			eventType: billingEvents.eventType,
			id: billingEvents.id,
			processedAt: billingEvents.processedAt,
			provider: billingEvents.provider,
			receivedAt: billingEvents.receivedAt,
			subscriptionId: billingEvents.subscriptionId,
		})
		.from(billingEvents)
		.where(eq(billingEvents.userId, userId))
		.orderBy(desc(billingEvents.receivedAt));

	const emailRows = await db
		.select({
			eventType: emailEvents.eventType,
			id: emailEvents.id,
			occurredAt: emailEvents.occurredAt,
			provider: emailEvents.provider,
			providerEventId: emailEvents.providerEventId,
			recipient: emailEvents.recipient,
		})
		.from(emailEvents)
		.where(eq(emailEvents.userId, userId))
		.orderBy(desc(emailEvents.occurredAt));

	const mergeEventRows = await db
		.select({
			createdAt: progressMergeEvents.createdAt,
			id: progressMergeEvents.id,
			mergeStrategy: progressMergeEvents.mergeStrategy,
		})
		.from(progressMergeEvents)
		.where(eq(progressMergeEvents.userId, userId))
		.orderBy(desc(progressMergeEvents.createdAt));

	if (!accountRow) {
		throw new Error("ACCOUNT_EXPORT_USER_NOT_FOUND");
	}

	const exportPayload: AccountPrivacyExport = {
		account: accountRow,
		billingEvents: billingRows,
		emailEvents: emailRows,
		entitlements: entitlementRow
			? {
					...entitlementRow,
					capabilities: Array.isArray(entitlementRow.capabilities)
						? (entitlementRow.capabilities as string[])
						: [],
				}
			: null,
		exportVersion: 1,
		exportedAt: new Date().toISOString(),
		progress: progressRow
			? {
					...progressRow,
					progressJson: progressRow.progressJson as ProgressData,
				}
			: null,
		progressMergeEvents: mergeEventRows,
		serviceNotes: [
			"Payment-card details are handled by the payment provider and are not exported from this app.",
			"Deletion requests are currently reviewed manually because account data can span auth, progress, subscriptions, billing events, and email-event records.",
			"Some billing, fraud-prevention, abuse-prevention, legal, or accounting records may need to be retained even after a deletion request is processed.",
		],
		sessions: sessionRows,
		subscriptions: subscriptionRows,
	};

	return exportPayload;
});
