import { describe, expect, it } from "vitest";

import { buildLifecycleEmailCopy } from "./lifecycle";

describe("buildLifecycleEmailCopy", () => {
	it("builds a welcome email payload", () => {
		const copy = buildLifecycleEmailCopy("welcome");

		expect(copy.subject).toBe("Welcome to Shipping API Dojo");
		expect(copy.title).toBe("Welcome to Shipping API Dojo");
	});

	it("uses plan-aware subject for subscription confirmation", () => {
		const copy = buildLifecycleEmailCopy("subscription_confirmation", {
			planKey: "pro_annual",
		});

		expect(copy.subject).toBe("Pro Annual subscription confirmed");
	});

	it("falls back to a generic plan label when unknown", () => {
		const copy = buildLifecycleEmailCopy("subscription_confirmation", {
			planKey: "custom_plan",
		});

		expect(copy.subject).toBe("Pro subscription confirmed");
	});
});
