import { createServerFn } from "@tanstack/react-start";

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
			storefrontUrl: optionalUrl(env.CREEM_PRO_ANNUAL_STOREFRONT_URL),
		},
		monthly: {
			storefrontUrl: optionalUrl(env.CREEM_PRO_MONTHLY_STOREFRONT_URL),
		},
	};
}

export const getStorefrontPlanConfig = createServerFn({
	method: "GET",
}).handler(async () => readStorefrontPlanConfig());
