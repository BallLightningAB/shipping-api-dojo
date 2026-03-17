/**
 * SEO Meta Tag Utilities for Shipping API Dojo
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

const SITE_NAME = "Shipping API Dojo";
const SITE_URL = "https://api-trainer.balllightning.cloud";
const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";
const OG_IMAGE_TYPE = "image/png";
const DEFAULT_DESCRIPTION =
	"Interactive carrier-integration learning for REST and SOAP interview prep and troubleshooting.";
const TWITTER_HANDLE = "@nicbrulay";

function toAbsoluteUrl(pathOrUrl: string) {
	if (pathOrUrl.startsWith("http")) {
		return pathOrUrl;
	}

	return pathOrUrl.startsWith("/")
		? `${SITE_URL}${pathOrUrl}`
		: `${SITE_URL}/${pathOrUrl}`;
}

const DEFAULT_IMAGE = toAbsoluteUrl("/og-home.png");

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
		{ property: "og:image:url", content: image },
		{ property: "og:image:alt", content: imageAlt },
		{ property: "og:image:width", content: OG_IMAGE_WIDTH },
		{ property: "og:image:height", content: OG_IMAGE_HEIGHT },
		{ property: "og:image:type", content: OG_IMAGE_TYPE },
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
	const url = seo.url ? toAbsoluteUrl(seo.url) : SITE_URL;
	const image = seo.image ? toAbsoluteUrl(seo.image) : DEFAULT_IMAGE;
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
	const url = toAbsoluteUrl(path);
	return { rel: "canonical", href: url };
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION };
