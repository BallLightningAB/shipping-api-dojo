/**
 * SEO Meta Tag Utilities for Carrier API-Trainer
 *
 * Provides helpers for generating meta tags, Open Graph, and Twitter Card tags
 * compatible with TanStack Start's head() function.
 */

export interface SeoMeta {
	title: string;
	description: string;
	/** Canonical URL for the page */
	url?: string;
	/** OG image URL (absolute) */
	image?: string;
	/** OG image alt text */
	imageAlt?: string;
	/** Article publish date (ISO 8601) */
	publishedAt?: string;
	/** Article modified date (ISO 8601) */
	modifiedAt?: string;
	/** Article author name */
	author?: string;
	/** Article tags/keywords */
	tags?: string[];
	/** Page type: website, article, etc. */
	type?: "website" | "article";
}

const SITE_NAME = "Carrier API-Trainer";
const SITE_URL = "https://api-trainer.balllightning.cloud";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_DESCRIPTION =
	"Interactive carrier-integration learning for REST and SOAP interview prep and troubleshooting.";
const TWITTER_HANDLE = "@nicbrulay";

interface MetaTag {
	name?: string;
	property?: string;
	content: string;
}

interface CoreMetaInput {
	title: string;
	description: string;
	url: string;
	image: string;
	imageAlt: string;
	type: string;
}

function buildCoreMeta(input: CoreMetaInput): MetaTag[] {
	const { title, description, url, image, imageAlt, type } = input;
	return [
		{ name: "description", content: description },
		{ property: "og:type", content: type },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ property: "og:image", content: image },
		{ property: "og:image:alt", content: imageAlt },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: TWITTER_HANDLE },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: image },
		{ name: "twitter:image:alt", content: imageAlt },
	];
}

function buildArticleMeta(seo: SeoMeta): MetaTag[] {
	const meta: MetaTag[] = [];

	if (seo.publishedAt) {
		meta.push({ property: "article:published_time", content: seo.publishedAt });
	}
	if (seo.modifiedAt) {
		meta.push({ property: "article:modified_time", content: seo.modifiedAt });
	}
	if (seo.author) {
		meta.push({ property: "article:author", content: seo.author });
	}
	if (seo.tags?.length) {
		for (const tag of seo.tags) {
			meta.push({ property: "article:tag", content: tag });
		}
	}

	return meta;
}

/**
 * Generate meta tags array for TanStack Start head() function
 */
export function generateMeta(seo: SeoMeta) {
	const title = seo.title.includes(SITE_NAME)
		? seo.title
		: `${seo.title} | ${SITE_NAME}`;
	const description = seo.description || DEFAULT_DESCRIPTION;
	const url = seo.url || SITE_URL;
	const image = seo.image || DEFAULT_IMAGE;
	const imageAlt = seo.imageAlt || seo.title;
	const type = seo.type || "website";

	const meta = buildCoreMeta({
		title,
		description,
		url,
		image,
		imageAlt,
		type,
	});

	if (type === "article") {
		meta.push(...buildArticleMeta(seo));
	}

	return meta;
}

/**
 * Generate canonical link for TanStack Start head() function
 */
export function generateCanonical(path: string) {
	const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
	return { rel: "canonical", href: url };
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION };
