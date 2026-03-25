import { describe, expect, it } from "vitest";

import {
	extractResendEmailFields,
	isTrackedResendEventType,
	parseResendWebhookEvent,
	verifyResendWebhookSignature,
} from "./resend-events";

describe("Resend webhook parsing", () => {
	it("parses and extracts fields from webhook payload", () => {
		const payload = JSON.stringify({
			created_at: "2026-03-25T13:00:00.000Z",
			data: {
				tags: {
					userId: "user_123",
				},
				to: "auth@mail.apidojo.app",
			},
			id: "re_evt_123",
			type: "email.delivered",
		});

		const event = parseResendWebhookEvent(payload);
		const fields = extractResendEmailFields(event);

		expect(event.type).toBe("email.delivered");
		expect(fields.providerEventId).toBe("re_evt_123");
		expect(fields.recipient).toBe("auth@mail.apidojo.app");
		expect(fields.userId).toBe("user_123");
	});

	it("rejects webhook verification when svix headers are missing", () => {
		const isValid = verifyResendWebhookSignature({
			headers: new Headers(),
			payload: JSON.stringify({ type: "email.delivered" }),
			secret: "whsec_test",
		});

		expect(isValid).toBe(false);
	});

	it("tracks only supported delivery lifecycle event types", () => {
		expect(isTrackedResendEventType("email.delivered")).toBe(true);
		expect(isTrackedResendEventType("email.bounced")).toBe(true);
		expect(isTrackedResendEventType("email.complained")).toBe(true);
		expect(isTrackedResendEventType("email.suppressed")).toBe(true);
		expect(isTrackedResendEventType("email.opened")).toBe(false);
	});
});
