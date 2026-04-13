export interface LessonCatalogEntry {
	id: string;
	slug: string;
	objectives: string[];
	drillFamilyIds: string[];
}

export const lessonCatalog: LessonCatalogEntry[] = [
	{
		id: "lesson-intro-carrier-integrations",
		slug: "intro-carrier-integrations",
		objectives: [
			"Recognize why carrier integrations fail even when the transport layer looks healthy.",
			"Treat hidden body-level errors and ambiguous outcomes as first-class integration risks.",
			"Use the same evidence-first recovery mindset before you touch production carrier writes.",
		],
		drillFamilyIds: [
			"detect-body-errors-despite-http-200",
			"rest-timeout-recovery",
		],
	},
	{
		id: "lesson-rest-auth-headers",
		slug: "rest-2-auth-headers",
		objectives: [
			"Cache and refresh short-lived carrier auth tokens without hammering the auth endpoint.",
			"Send the minimum required headers on every write and read request.",
			"Treat correlation IDs as part of the operational contract, not optional metadata.",
		],
		drillFamilyIds: [
			"rest-oauth-token-lifecycle",
			"rest-required-headers-correlation-ids",
		],
	},
	{
		id: "lesson-rest-error-mapping",
		slug: "rest-3-error-mapping",
		objectives: [
			"Normalize inconsistent carrier error payloads into one internal contract.",
			"Use Problem Details as the boundary format your upstream systems can rely on.",
			"Separate retryable, permanent, and ambiguous failures before you automate recovery.",
		],
		drillFamilyIds: [
			"rest-problem-details-normalization",
			"rest-error-classification",
		],
	},
	{
		id: "lesson-rest-pagination-webhooks",
		slug: "rest-4-pagination-webhooks",
		objectives: [
			"Choose pagination strategies that stay correct while carrier data changes underneath you.",
			"Design webhook receivers that acknowledge fast and process safely.",
			"Treat deduplication, ordering, and signature verification as part of one receiver contract.",
		],
		drillFamilyIds: ["rest-pagination-drift", "rest-webhook-receiver-behavior"],
	},
	{
		id: "lesson-soap-wsdl-xsd",
		slug: "soap-2-wsdl-xsd",
		objectives: [
			"Read WSDLs as the source of truth for service, binding, and operation behavior.",
			"Use generated clients and contract diffs instead of hand-maintained SOAP templates.",
			"Treat contract drift as an operational change you can detect before production breaks.",
		],
		drillFamilyIds: [
			"soap-wsdl-contract-reading",
			"detect-breaking-carrier-contract-changes",
		],
	},
	{
		id: "lesson-soap-fault-handling",
		slug: "soap-3-fault-handling",
		objectives: [
			"Extract the actionable part of a SOAP fault instead of stopping at the faultstring.",
			"Map SOAP fault detail into your internal incident model.",
			"Log the exact evidence your team and the carrier both need during an escalation.",
		],
		drillFamilyIds: [
			"soap-fault-detail-extraction",
			"incident-evidence-logging",
		],
	},
];
