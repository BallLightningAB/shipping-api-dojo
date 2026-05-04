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
import { captureException } from "@/lib/observability/logger";

export const Route = createFileRoute("/api/webhooks/resend")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					return await handleResendWebhook(request);
				} catch (error) {
					// Resend retries non-2xx responses, so failing silently would cause
					// re-delivery and hide real errors. Mirror the creem webhook
					// pattern: log through captureException so Sentry surfaces the
					// failure once a DSN is configured, then return 500 to preserve
					// Resend's built-in retry behavior.
					captureException(error, {
						operation: "resend_webhook",
						route: "/api/webhooks/resend",
					});
					return new Response("Webhook processing failed", { status: 500 });
				}
			},
		},
	},
});

async function handleResendWebhook(request: Request) {
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
			return new Response(JSON.stringify({ idempotent: true, ok: true }), {
				headers: { "content-type": "application/json" },
				status: 200,
			});
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
}
