/**
 * JSON-LD Structured Data for Shipping API Dojo
 *
 * Provides schema.org structured data for SEO:
 * - WebSite + WebApplication schema on root
 * - Article + BreadcrumbList + FAQPage schemas for wiki and carrier surfaces
 */

import {
	ORGANIZATION_NAME,
	ORGANIZATION_URL,
	SITE_NAME,
	SITE_URL,
	toAbsoluteUrl,
} from "./site";

const ORGANIZATION_ID = `${ORGANIZATION_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#application`;

export function generateRootEntityGraphSchema() {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": ORGANIZATION_ID,
				name: ORGANIZATION_NAME,
				url: ORGANIZATION_URL,
				sameAs: ["https://github.com/BallLightningAB"],
			},
			{
				"@type": "WebSite",
				"@id": WEBSITE_ID,
				name: SITE_NAME,
				description:
					"Interactive shipping and carrier integration learning for REST and SOAP interview prep and troubleshooting.",
				url: SITE_URL,
				publisher: {
					"@id": ORGANIZATION_ID,
				},
			},
			{
				"@type": "WebApplication",
				"@id": APP_ID,
				name: SITE_NAME,
				description:
					"Interactive learning tool for shipping REST and SOAP API integration with lessons, drills, and incident scenarios.",
				url: SITE_URL,
				applicationCategory: "EducationalApplication",
				operatingSystem: "All",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
				},
				publisher: {
					"@id": ORGANIZATION_ID,
				},
			},
		],
	};
}

/**
 * Generate script tag content for JSON-LD. Returns an empty string when the
 * payload is null so callers that build their `head.scripts` array eagerly
 * (e.g., breadcrumbs) cannot crash SSR on empty input.
 */
export function jsonLdScript(data: object | null): string {
	if (data === null) {
		return "";
	}
	return JSON.stringify(data);
}

export interface ArticleSchemaInput {
	author?: string;
	dateModified?: string;
	datePublished?: string;
	description: string;
	title: string;
	url: string;
}

/**
 * Generate Article schema.org JSON-LD for wiki and carrier-surface pages.
 *
 * The URL is treated as the canonical identity of the article, so it is also
 * used as `mainEntityOfPage` to satisfy schema.org's expectation that an
 * Article advertises which page is its main entity.
 */
export function generateArticleSchema(input: ArticleSchemaInput) {
	const url = toAbsoluteUrl(input.url);
	const dateModified = input.dateModified ?? input.datePublished;

	const article: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: input.title,
		description: input.description,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
		url,
		isPartOf: { "@id": WEBSITE_ID },
		publisher: { "@id": ORGANIZATION_ID },
	};

	if (input.datePublished) {
		article.datePublished = input.datePublished;
	}
	if (dateModified) {
		article.dateModified = dateModified;
	}
	if (input.author) {
		article.author = {
			"@type": "Person",
			name: input.author,
		};
	}

	return article;
}

export interface BreadcrumbCrumb {
	name: string;
	/** Page URL or path; the home crumb may omit it. */
	url?: string;
}

/**
 * Generate a BreadcrumbList JSON-LD payload.
 *
 * Each crumb's position is 1-indexed per the schema.org spec, and `item` is
 * resolved to an absolute URL when a path is provided. Returns null on empty
 * input so SSR callers can omit the script tag without crashing the page,
 * matching the pattern used by `generateFAQPageSchema`.
 */
export function generateBreadcrumbListSchema(
	crumbs: BreadcrumbCrumb[]
): object | null {
	if (crumbs.length === 0) {
		return null;
	}

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map((crumb, index) => {
			const entry: Record<string, unknown> = {
				"@type": "ListItem",
				position: index + 1,
				name: crumb.name,
			};

			if (crumb.url) {
				entry.item = toAbsoluteUrl(crumb.url);
			}

			return entry;
		}),
	};
}

/**
 * Build the `head.scripts` entries for a BreadcrumbList JSON-LD payload.
 *
 * Returns an empty array when the crumb list is empty (matching the
 * null-return contract of `generateBreadcrumbListSchema`) so route
 * `head` builders can spread the result into their `scripts` array
 * unconditionally without producing an empty `<script>` tag. This keeps
 * the four wiki routes that emit breadcrumb JSON-LD on the same
 * abstraction.
 */
export function breadcrumbScripts(
	crumbs: BreadcrumbCrumb[]
): { type: string; children: string }[] {
	const schema = generateBreadcrumbListSchema(crumbs);
	if (schema === null) {
		return [];
	}
	return [
		{
			type: "application/ld+json",
			children: jsonLdScript(schema),
		},
	];
}

export interface FaqEntry {
	answer: string;
	question: string;
}

/**
 * Generate a FAQPage JSON-LD payload from a list of question/answer pairs.
 * Returns null when the input list is empty so callers can omit the script
 * tag entirely on pages without FAQs.
 */
export function generateFAQPageSchema(faqs: FaqEntry[]): object | null {
	if (faqs.length === 0) {
		return null;
	}

	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
}
