import { createHmac, timingSafeEqual } from "node:crypto";

export interface CreemEnvConfig {
	apiKey: string;
	annualProductId: string;
	enterpriseProductId?: string;
	monthlyProductId: string;
	webhookSecret: string;
}

export interface CreemWebhookEvent {
	data?: Record<string, unknown>;
	id: string;
	type: string;
}

function normalizeSignature(signatureHeader: string): string {
	if (signatureHeader.startsWith("sha256=")) {
		return signatureHeader.slice("sha256=".length);
	}
	return signatureHeader;
}

export function verifyCreemWebhookSignature(params: {
	payload: string;
	secret: string;
	signatureHeader: string | null;
}): boolean {
	if (!params.signatureHeader) {
		return false;
	}

	const expected = createHmac("sha256", params.secret)
		.update(params.payload)
		.digest("hex");
	const provided = normalizeSignature(params.signatureHeader);

	const expectedBuffer = Buffer.from(expected);
	const providedBuffer = Buffer.from(provided);

	if (expectedBuffer.length !== providedBuffer.length) {
		return false;
	}

	return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function resolvePlanKeyFromProductId(
	productId: string | null | undefined,
	config: Pick<
		CreemEnvConfig,
		"annualProductId" | "enterpriseProductId" | "monthlyProductId"
	>
): string | null {
	if (!productId) {
		return null;
	}
	if (productId === config.monthlyProductId) {
		return "pro_monthly";
	}
	if (productId === config.annualProductId) {
		return "pro_annual";
	}
	if (config.enterpriseProductId && productId === config.enterpriseProductId) {
		return "enterprise";
	}
	return null;
}

export function resolveTierFromPlanKey(
	planKey: string | null
): "free" | "pro" | "enterprise" {
	if (!planKey) {
		return "free";
	}
	if (planKey === "enterprise") {
		return "enterprise";
	}
	if (planKey.startsWith("pro_")) {
		return "pro";
	}
	return "free";
}

export function parseCreemWebhookEvent(payload: string): CreemWebhookEvent {
	const parsed = JSON.parse(payload) as Partial<CreemWebhookEvent>;
	if (!(parsed?.id && parsed.type)) {
		throw new Error("Invalid Creem webhook payload");
	}

	return {
		id: parsed.id,
		type: parsed.type,
		data: parsed.data,
	};
}

function getObject(data: unknown): Record<string, unknown> | null {
	return data && typeof data === "object"
		? (data as Record<string, unknown>)
		: null;
}

function getString(
	obj: Record<string, unknown> | null,
	key: string
): string | null {
	const value = obj?.[key];
	return typeof value === "string" ? value : null;
}

export function extractSubscriptionFields(
	event: CreemWebhookEvent,
	config: Pick<
		CreemEnvConfig,
		"annualProductId" | "enterpriseProductId" | "monthlyProductId"
	>
): {
	planKey: string | null;
	status: string | null;
	subscriptionId: string | null;
	userId: string | null;
} {
	const eventData = getObject(event.data);
	const subscription = getObject(eventData?.subscription);
	const metadata = getObject(eventData?.metadata);
	const customer = getObject(eventData?.customer);
	const customerMetadata = getObject(customer?.metadata);

	const productId =
		getString(subscription, "product_id") ?? getString(eventData, "product_id");
	const planKey =
		getString(subscription, "plan_key") ??
		resolvePlanKeyFromProductId(productId, config);
	const status =
		getString(subscription, "status") ?? getString(eventData, "status");
	const subscriptionId =
		getString(subscription, "id") ?? getString(eventData, "subscription_id");
	const userId =
		getString(metadata, "userId") ??
		getString(customerMetadata, "userId") ??
		getString(eventData, "user_id");

	return {
		planKey,
		status,
		subscriptionId,
		userId,
	};
}
