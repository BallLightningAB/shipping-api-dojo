import { createServerFn } from "@tanstack/react-start";

import { normalizeHttpUrl } from "../url/http-url";

export interface StorefrontPlanConfig {
	annual: {
		storefrontUrl: string | null;
	};
	monthly: {
		storefrontUrl: string | null;
	};
}

export function readStorefrontPlanConfig(
	env: NodeJS.ProcessEnv = process.env,
): StorefrontPlanConfig {
	return {
		annual: {
			storefrontUrl: normalizeHttpUrl(env.CREEM_PRO_ANNUAL_STOREFRONT_URL),
		},
		monthly: {
			storefrontUrl: normalizeHttpUrl(env.CREEM_PRO_MONTHLY_STOREFRONT_URL),
		},
	};
}

export const getStorefrontPlanConfig = createServerFn({
	method: "GET",
}).handler(async () => readStorefrontPlanConfig());
