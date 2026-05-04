import { z } from "zod";

export const lessonPracticeSearchSchema = z.object({});

export const arenaPracticeSearchSchema = z.object({
	scenario: z.string().optional(),
});

export const LEGACY_SEED_SEARCH_PARAMS = [
	"seed",
	"runSeed",
	"exclude",
] as const;

const PARSING_BASE_URL = "http://shipping-api-dojo.local";

export interface StripLegacySeedParamsResult {
	changed: boolean;
	href: string;
}

export function stripLegacySeedParamsFromHref(
	href: string
): StripLegacySeedParamsResult {
	const url = new URL(href, PARSING_BASE_URL);
	let changed = false;

	for (const param of LEGACY_SEED_SEARCH_PARAMS) {
		if (url.searchParams.has(param)) {
			url.searchParams.delete(param);
			changed = true;
		}
	}

	if (!changed) {
		return { changed: false, href };
	}

	return {
		changed: true,
		href: `${url.pathname}${url.search}${url.hash}`,
	};
}
