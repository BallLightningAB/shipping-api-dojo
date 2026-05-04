import { Resend } from "resend";

export interface ResendWebhookEvent {
	created_at?: string;
	data?: Record<string, unknown>;
	id?: string;
	type: string;
}

const TRACKED_EVENT_TYPES = new Set([
	"email.bounced",
	"email.complained",
	"email.delivered",
	"email.suppressed",
]);

function getObject(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}

function getString(
	record: Record<string, unknown> | null,
	key: string
): string | null {
	const value = record?.[key];
	return typeof value === "string" ? value : null;
}

export function parseResendWebhookEvent(payload: string): ResendWebhookEvent {
	const event = JSON.parse(payload) as Partial<ResendWebhookEvent>;
	if (!event?.type) {
		throw new Error("Invalid Resend webhook payload");
	}
	return {
		created_at: event.created_at,
		data: event.data,
		id: event.id,
		type: event.type,
	};
}

export function isTrackedResendEventType(type: string): boolean {
	return TRACKED_EVENT_TYPES.has(type);
}

export function verifyResendWebhookSignature(params: {
	headers: Headers;
	payload: string;
	secret: string;
}): boolean {
	const svixId = params.headers.get("svix-id");
	const svixTimestamp = params.headers.get("svix-timestamp");
	const svixSignature = params.headers.get("svix-signature");

	if (!(svixId && svixTimestamp && svixSignature)) {
		return false;
	}

	const resend = new Resend("re_placeholder");

	try {
		resend.webhooks.verify({
			headers: {
				id: svixId,
				signature: svixSignature,
				timestamp: svixTimestamp,
			},
			payload: params.payload,
			webhookSecret: params.secret,
		});
		return true;
	} catch {
		return false;
	}
}

export function extractResendEmailFields(event: ResendWebhookEvent): {
	occurredAt: Date;
	providerEventId: string | null;
	recipient: string;
	userId: string | null;
} {
	const data = getObject(event.data);
	const tags = getObject(data?.tags);
	const recipient =
		getString(data, "to") ??
		getString(data, "email") ??
		"unknown@unknown.invalid";

	return {
		occurredAt: event.created_at ? new Date(event.created_at) : new Date(),
		providerEventId: event.id ?? null,
		recipient,
		userId: getString(tags, "userId"),
	};
}
