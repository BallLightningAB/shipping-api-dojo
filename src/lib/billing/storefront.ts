import { createServerFn } from "@tanstack/react-start";

const PRO_MONTHLY_PRODUCT_ID = "prod_3jDZfwYMV4z7s0yyzLMGtp";
const PRO_ANNUAL_PRODUCT_ID = "prod_2UKovfLiNB4uUAdlQrN2TD";

function optionalUrl(value: string | undefined): string | null {
	if (!value) {
		return null;
	}

	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export interface StorefrontPlanConfig {
	annual: {
		productId: string;
		storefrontUrl: string | null;
	};
	monthly: {
		productId: string;
		storefrontUrl: string | null;
	};
}

export function readStorefrontPlanConfig(
	env: NodeJS.ProcessEnv = process.env
): StorefrontPlanConfig {
	return {
		annual: {
			productId: env.CREEM_PRO_ANNUAL_PRODUCT_ID ?? PRO_ANNUAL_PRODUCT_ID,
			storefrontUrl: optionalUrl(env.CREEM_PRO_ANNUAL_STOREFRONT_URL),
		},
		monthly: {
			productId: env.CREEM_PRO_MONTHLY_PRODUCT_ID ?? PRO_MONTHLY_PRODUCT_ID,
			storefrontUrl: optionalUrl(env.CREEM_PRO_MONTHLY_STOREFRONT_URL),
		},
	};
}

export const getStorefrontPlanConfig = createServerFn({
	method: "GET",
}).handler(async () => readStorefrontPlanConfig());
