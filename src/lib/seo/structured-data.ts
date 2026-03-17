/**
 * JSON-LD Structured Data for Shipping API Dojo
 *
 * Provides schema.org structured data for SEO:
 * - WebSite + WebApplication schema on root
 * - LearningResource schema for lessons
 */

const SITE_URL = "https://shipping.apidojo.app";
const SITE_NAME = "Shipping API Dojo";
const ORGANIZATION_NAME = "Ball Lightning AB";
const ORGANIZATION_URL = "https://balllightning.cloud";

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
 * Generate script tag content for JSON-LD
 */
export function jsonLdScript(data: object): string {
	return JSON.stringify(data);
}
