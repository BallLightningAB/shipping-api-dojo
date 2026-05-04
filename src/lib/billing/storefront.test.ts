import { describe, expect, it } from "vitest";

import { readStorefrontPlanConfig } from "./storefront";

describe("readStorefrontPlanConfig", () => {
	it("returns only public Storefront URLs", () => {
		const config = readStorefrontPlanConfig({
			CREEM_PRO_ANNUAL_PRODUCT_ID: "prod_annual",
			CREEM_PRO_ANNUAL_STOREFRONT_URL: "https://creem.io/store/annual",
			CREEM_PRO_MONTHLY_PRODUCT_ID: "prod_monthly",
			CREEM_PRO_MONTHLY_STOREFRONT_URL: "https://creem.io/store/monthly",
		});

		expect(config.monthly.storefrontUrl).toBe("https://creem.io/store/monthly");
		expect(config.annual.storefrontUrl).toBe("https://creem.io/store/annual");
		expect("productId" in config.monthly).toBe(false);
		expect("productId" in config.annual).toBe(false);
	});

	it("falls back to safe support routing when Storefront URLs are missing or invalid", () => {
		const config = readStorefrontPlanConfig({
			CREEM_PRO_ANNUAL_STOREFRONT_URL: "http://creem.io/store/annual",
			CREEM_PRO_MONTHLY_STOREFRONT_URL: "javascript:alert(1)",
		});

		expect(config.monthly.storefrontUrl).toBeNull();
		expect(config.annual.storefrontUrl).toBeNull();
	});
});
