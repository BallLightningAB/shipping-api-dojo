import { describe, expect, it } from "vitest";

import { readStorefrontPlanConfig } from "./storefront";

describe("readStorefrontPlanConfig", () => {
	it("keeps Pro product IDs separate from Storefront URLs", () => {
		const config = readStorefrontPlanConfig({
			CREEM_PRO_ANNUAL_PRODUCT_ID: "prod_annual",
			CREEM_PRO_ANNUAL_STOREFRONT_URL: "https://creem.io/store/annual",
			CREEM_PRO_MONTHLY_PRODUCT_ID: "prod_monthly",
			CREEM_PRO_MONTHLY_STOREFRONT_URL: "https://creem.io/store/monthly",
		});

		expect(config.monthly.productId).toBe("prod_monthly");
		expect(config.monthly.storefrontUrl).toBe("https://creem.io/store/monthly");
		expect(config.annual.productId).toBe("prod_annual");
		expect(config.annual.storefrontUrl).toBe("https://creem.io/store/annual");
	});

	it("falls back to safe support routing when Storefront URLs are missing or invalid", () => {
		const config = readStorefrontPlanConfig({
			CREEM_PRO_ANNUAL_STOREFRONT_URL: "javascript:alert(1)",
			CREEM_PRO_MONTHLY_STOREFRONT_URL: "",
		});

		expect(config.monthly.storefrontUrl).toBeNull();
		expect(config.annual.storefrontUrl).toBeNull();
		expect(config.monthly.productId).toBe("prod_3jDZfwYMV4z7s0yyzLMGtp");
		expect(config.annual.productId).toBe("prod_2UKovfLiNB4uUAdlQrN2TD");
	});
});
