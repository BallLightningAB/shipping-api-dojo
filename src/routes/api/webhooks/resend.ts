import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import { getAuthEnv } from "@/lib/auth/env";
import { getDb } from "@/lib/db/client";
import { emailEvents } from "@/lib/db/schema";
import {
	extractResendEmailFields,
	isTrackedResendEventType,
	parseResendWebhookEvent,
	verifyResendWebhookSignature,
} from "@/lib/email/resend-events";

export const Route = createFileRoute("/api/webhooks/resend")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const env = getAuthEnv();
				const payload = await request.text();

				if (
					env.RESEND_WEBHOOK_SECRET &&
					!verifyResendWebhookSignature({
						headers: request.headers,
						payload,
						secret: env.RESEND_WEBHOOK_SECRET,
					})
				) {
					return new Response("Invalid webhook signature", { status: 401 });
				}

				const event = parseResendWebhookEvent(payload);
				if (!isTrackedResendEventType(event.type)) {
					return new Response(JSON.stringify({ ignored: true, ok: true }), {
						headers: { "content-type": "application/json" },
						status: 200,
					});
				}

				const fields = extractResendEmailFields(event);
				const db = getDb();

				if (fields.providerEventId) {
					const [existingEvent] = await db
						.select({ id: emailEvents.id })
						.from(emailEvents)
						.where(
							and(
								eq(emailEvents.provider, "resend"),
								eq(emailEvents.providerEventId, fields.providerEventId),
								eq(emailEvents.eventType, event.type)
							)
						)
						.limit(1);

					if (existingEvent) {
						return new Response(
							JSON.stringify({ idempotent: true, ok: true }),
							{
								headers: { "content-type": "application/json" },
								status: 200,
							}
						);
					}
				}

				await db.insert(emailEvents).values({
					eventType: event.type,
					occurredAt: fields.occurredAt,
					payload: event,
					provider: "resend",
					providerEventId: fields.providerEventId,
					recipient: fields.recipient,
					userId: fields.userId,
				});

				return new Response(JSON.stringify({ ok: true }), {
					headers: { "content-type": "application/json" },
					status: 200,
				});
			},
		},
	},
});
