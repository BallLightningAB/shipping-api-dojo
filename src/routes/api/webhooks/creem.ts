import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import {
	extractPreviousSubscriptionStatus,
	extractSubscriptionFields,
	isActiveSubscriptionStatus,
	parseCreemWebhookEvent,
	resolveBillingLifecycleEmailType,
	resolveTierFromSubscription,
	verifyCreemWebhookSignature,
} from "@/lib/billing/creem";
import { getCreemEnv } from "@/lib/billing/creem.env";
import { CAPABILITY_BUNDLES } from "@/lib/entitlements/entitlements";
import { getDb } from "@/lib/db/client";
import {
	billingEvents,
	subscriptions,
	user,
	userEntitlements,
} from "@/lib/db/schema";
import {
	sendPaymentFailureEmail,
	sendSubscriptionCancellationEmail,
	sendSubscriptionConfirmationEmail,
} from "@/lib/email/lifecycle";

function resolveProductIdForPlanKey(
	planKey: string,
	creemEnv: ReturnType<typeof getCreemEnv>
) {
	if (planKey === "pro_annual") {
		return creemEnv.CREEM_PRO_ANNUAL_PRODUCT_ID;
	}
	if (planKey === "pro_monthly") {
		return creemEnv.CREEM_PRO_MONTHLY_PRODUCT_ID;
	}
	return creemEnv.CREEM_ENTERPRISE_PRODUCT_ID ?? "enterprise";
}

export const Route = createFileRoute("/api/webhooks/creem")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const creemEnv = getCreemEnv();
				const signature = request.headers.get("x-creem-signature");
				const payload = await request.text();

				if (
					!verifyCreemWebhookSignature({
						payload,
						secret: creemEnv.CREEM_WEBHOOK_SECRET,
						signatureHeader: signature,
					})
				) {
					return new Response("Invalid signature", { status: 401 });
				}

				const event = parseCreemWebhookEvent(payload);
				const db = getDb();

				const [existingEvent] = await db
					.select({
						id: billingEvents.id,
						processedAt: billingEvents.processedAt,
					})
					.from(billingEvents)
					.where(eq(billingEvents.id, event.id))
					.limit(1);

				if (existingEvent?.processedAt) {
					return new Response(JSON.stringify({ ok: true, idempotent: true }), {
						headers: { "content-type": "application/json" },
						status: 200,
					});
				}

				if (!existingEvent) {
					await db.insert(billingEvents).values({
						eventType: event.type,
						id: event.id,
						payload: event,
						provider: "creem",
					});
				}

				const fields = extractSubscriptionFields(event, {
					annualProductId: creemEnv.CREEM_PRO_ANNUAL_PRODUCT_ID,
					enterpriseProductId: creemEnv.CREEM_ENTERPRISE_PRODUCT_ID,
					monthlyProductId: creemEnv.CREEM_PRO_MONTHLY_PRODUCT_ID,
				});

				if (
					fields.userId &&
					fields.subscriptionId &&
					fields.planKey &&
					fields.status
				) {
					await db
						.insert(subscriptions)
						.values({
							id: fields.subscriptionId,
							planKey: fields.planKey,
							productId: resolveProductIdForPlanKey(fields.planKey, creemEnv),
							provider: "creem",
							rawPayload: event,
							status: fields.status,
							userId: fields.userId,
						})
						.onConflictDoUpdate({
							target: subscriptions.id,
							set: {
								planKey: fields.planKey,
								rawPayload: event,
								status: fields.status,
								updatedAt: new Date(),
								userId: fields.userId,
							},
						});

					const resolvedTier = resolveTierFromSubscription({
						planKey: fields.planKey,
						status: fields.status,
					});
					const entitlementSource = isActiveSubscriptionStatus(fields.status)
						? "creem_webhook"
						: "creem_webhook_inactive";

					await db
						.insert(userEntitlements)
						.values({
							capabilities: CAPABILITY_BUNDLES[resolvedTier],
							source: entitlementSource,
							tier: resolvedTier,
							userId: fields.userId,
						})
						.onConflictDoUpdate({
							target: userEntitlements.userId,
							set: {
								capabilities: CAPABILITY_BUNDLES[resolvedTier],
								source: entitlementSource,
								tier: resolvedTier,
								updatedAt: new Date(),
							},
						});

					const [billingUser] = await db
						.select({ email: user.email })
						.from(user)
						.where(eq(user.id, fields.userId))
						.limit(1);

					const lifecycleEmailType = resolveBillingLifecycleEmailType({
						eventType: event.type,
						previousStatus: extractPreviousSubscriptionStatus(event),
						status: fields.status,
					});

					if (billingUser?.email && lifecycleEmailType) {
						if (lifecycleEmailType === "subscription_confirmation") {
							await sendSubscriptionConfirmationEmail(
								billingUser.email,
								fields.planKey
							);
						}

						if (lifecycleEmailType === "payment_failure") {
							await sendPaymentFailureEmail(billingUser.email);
						}

						if (lifecycleEmailType === "subscription_cancellation") {
							await sendSubscriptionCancellationEmail(billingUser.email);
						}
					}
				}

				await db
					.update(billingEvents)
					.set({
						processedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(billingEvents.id, event.id),
							eq(billingEvents.provider, "creem")
						)
					);

				return new Response(JSON.stringify({ ok: true }), {
					headers: { "content-type": "application/json" },
					status: 200,
				});
			},
		},
	},
});
