import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
	extractSubscriptionFields,
	parseCreemWebhookEvent,
	resolveBillingLifecycleEmailType,
	resolvePlanKeyFromProductId,
	resolveTierFromPlanKey,
	verifyCreemWebhookSignature,
} from "./creem";

const CREEM_CONFIG = {
	annualProductId: "prod_annual",
	enterpriseProductId: "prod_enterprise",
	monthlyProductId: "prod_monthly",
};

describe("verifyCreemWebhookSignature", () => {
	it("validates a matching signature", () => {
		const payload = JSON.stringify({ hello: "world" });
		const secret = "test_secret";
		const signature = createHmac("sha256", secret)
			.update(payload)
			.digest("hex");

		expect(
			verifyCreemWebhookSignature({
				payload,
				secret,
				signatureHeader: signature,
			})
		).toBe(true);
	});

	it("rejects a mismatched signature", () => {
		expect(
			verifyCreemWebhookSignature({
				payload: "{}",
				secret: "test_secret",
				signatureHeader: "bad_signature",
			})
		).toBe(false);
	});
});

describe("resolvePlanKeyFromProductId", () => {
	it("maps known product IDs to stable plan keys", () => {
		expect(resolvePlanKeyFromProductId("prod_monthly", CREEM_CONFIG)).toBe(
			"pro_monthly"
		);
		expect(resolvePlanKeyFromProductId("prod_annual", CREEM_CONFIG)).toBe(
			"pro_annual"
		);
		expect(resolvePlanKeyFromProductId("prod_enterprise", CREEM_CONFIG)).toBe(
			"enterprise"
		);
		expect(
			resolvePlanKeyFromProductId("prod_unknown", CREEM_CONFIG)
		).toBeNull();
	});
});

describe("resolveTierFromPlanKey", () => {
	it("maps plan keys to entitlement tiers", () => {
		expect(resolveTierFromPlanKey("pro_monthly")).toBe("pro");
		expect(resolveTierFromPlanKey("enterprise")).toBe("enterprise");
		expect(resolveTierFromPlanKey(null)).toBe("free");
	});
});

describe("parse/extract helpers", () => {
	it("parses webhook payload and extracts subscription fields", () => {
		const payload = JSON.stringify({
			data: {
				customer: {
					metadata: {
						userId: "user_123",
					},
				},
				subscription: {
					id: "sub_123",
					product_id: "prod_monthly",
					status: "active",
				},
			},
			id: "evt_123",
			type: "subscription.updated",
		});

		const event = parseCreemWebhookEvent(payload);
		const fields = extractSubscriptionFields(event, CREEM_CONFIG);

		expect(fields.userId).toBe("user_123");
		expect(fields.subscriptionId).toBe("sub_123");
		expect(fields.planKey).toBe("pro_monthly");
		expect(fields.status).toBe("active");
	});
});

describe("resolveBillingLifecycleEmailType", () => {
	it("classifies active subscription events as confirmations", () => {
		expect(
			resolveBillingLifecycleEmailType({
				eventType: "subscription.updated",
				status: "active",
			})
		).toBe("subscription_confirmation");
	});

	it("classifies failed payments", () => {
		expect(
			resolveBillingLifecycleEmailType({
				eventType: "invoice.payment_failed",
				status: "past_due",
			})
		).toBe("payment_failure");
	});

	it("classifies canceled subscriptions", () => {
		expect(
			resolveBillingLifecycleEmailType({
				eventType: "subscription.canceled",
				status: "canceled",
			})
		).toBe("subscription_cancellation");
	});
});
