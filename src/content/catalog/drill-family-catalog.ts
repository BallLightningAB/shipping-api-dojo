import type { DrillType } from "../types";

export interface DrillFamilyCatalogEntry {
	id: string;
	type: DrillType;
	concept: string;
	misconception: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
	legacyDrillIds: string[];
}

export const drillFamilyCatalog: DrillFamilyCatalogEntry[] = [
	{
		id: "detect-body-errors-despite-http-200",
		type: "mcq",
		concept:
			"Detecting carrier failures hidden behind success-looking transport signals",
		misconception:
			"Assuming a healthy HTTP status means the carrier accepted and completed the operation.",
		difficulty: "beginner",
		tags: ["intro", "rest", "error-handling"],
		legacyDrillIds: ["intro-mcq-1", "intro-mcq-2"],
	},
	{
		id: "rest-oauth-token-lifecycle",
		type: "mcq",
		concept: "OAuth token caching and refresh discipline",
		misconception:
			"Treating auth token acquisition as a per-request concern instead of an operational cache.",
		difficulty: "beginner",
		tags: ["rest", "auth", "oauth"],
		legacyDrillIds: ["rest2-mcq-1"],
	},
	{
		id: "rest-required-headers-correlation-ids",
		type: "builder.rest",
		concept: "Required headers and request traceability",
		misconception:
			"Treating correlation IDs and carrier-required headers as optional request decoration.",
		difficulty: "beginner",
		tags: ["rest", "headers", "observability"],
		legacyDrillIds: ["rest2-builder-1"],
	},
	{
		id: "rest-problem-details-normalization",
		type: "mcq",
		concept: "Error normalization at the carrier integration boundary",
		misconception:
			"Passing carrier-specific error shapes upstream instead of normalizing them once.",
		difficulty: "beginner",
		tags: ["rest", "errors", "problem-details"],
		legacyDrillIds: ["rest3-mcq-1"],
	},
	{
		id: "rest-error-classification",
		type: "cloze",
		concept: "Operational classification of failures",
		misconception:
			"Using one retry rule for every failure instead of classifying retryable, permanent, and ambiguous outcomes.",
		difficulty: "beginner",
		tags: ["rest", "errors", "incident-response"],
		legacyDrillIds: ["rest3-cloze-1"],
	},
	{
		id: "rest-pagination-drift",
		type: "mcq",
		concept: "Pagination stability under live carrier data",
		misconception:
			"Assuming offset pagination stays correct while the underlying result set changes.",
		difficulty: "beginner",
		tags: ["rest", "pagination", "sync"],
		legacyDrillIds: ["rest4-mcq-1"],
	},
	{
		id: "rest-webhook-receiver-behavior",
		type: "mcq",
		concept: "Webhook receiver acknowledgement and safety",
		misconception:
			"Doing heavy work inline before acknowledging carrier webhooks.",
		difficulty: "beginner",
		tags: ["rest", "webhooks", "operations"],
		legacyDrillIds: ["rest4-mcq-2"],
	},
	{
		id: "rest-rate-limits-backpressure",
		type: "mcq",
		concept: "Rate limiting, throttling, and internal backpressure",
		misconception:
			"Treating 429 handling as retries only instead of a combined throttle and queue-management problem.",
		difficulty: "intermediate",
		tags: ["rest", "rate-limits", "queues"],
		legacyDrillIds: ["rest7-mcq-1", "rest7-mcq-2"],
	},
	{
		id: "rest-partial-success-compensation",
		type: "mcq",
		concept: "Partial-success handling and compensation design",
		misconception:
			"Collapsing mixed outcomes into one success flag instead of modeling compensating actions explicitly.",
		difficulty: "intermediate",
		tags: ["rest", "bulk", "compensation"],
		legacyDrillIds: ["rest8-mcq-1", "rest8-mcq-2"],
	},
	{
		id: "rest-sandbox-production-drift",
		type: "mcq",
		concept: "Environment drift between carrier sandbox and production",
		misconception:
			"Assuming a sandbox pass guarantees production parity across credentials, rules, and data validation.",
		difficulty: "intermediate",
		tags: ["rest", "sandbox", "production"],
		legacyDrillIds: ["rest10-mcq-1", "rest10-mcq-2"],
	},
	{
		id: "soap-wsdl-contract-reading",
		type: "mcq",
		concept: "Reading WSDLs as the contract source",
		misconception:
			"Treating the WSDL as optional documentation instead of the generated contract source.",
		difficulty: "beginner",
		tags: ["soap", "wsdl", "contracts"],
		legacyDrillIds: ["soap2-mcq-1"],
	},
	{
		id: "detect-breaking-carrier-contract-changes",
		type: "mcq",
		concept: "Detecting and responding to carrier contract drift",
		misconception:
			"Trying to patch around carrier WSDL changes without regenerating and diffing the contract.",
		difficulty: "intermediate",
		tags: ["soap", "wsdl", "change-management"],
		legacyDrillIds: ["soap2-mcq-2"],
	},
	{
		id: "soap-fault-detail-extraction",
		type: "mcq",
		concept: "Extracting useful detail from SOAP faults",
		misconception:
			"Stopping at the human-readable faultstring instead of parsing structured fault detail.",
		difficulty: "beginner",
		tags: ["soap", "faults", "debugging"],
		legacyDrillIds: ["soap3-mcq-1"],
	},
	{
		id: "repair-xsd-type-mismatches",
		type: "mcq",
		concept:
			"Repairing schema and type mismatches before they become carrier faults",
		misconception:
			"Assuming the carrier will coerce enum, numeric, and required-field mismatches instead of enforcing the XSD contract exactly.",
		difficulty: "intermediate",
		tags: ["soap", "xsd", "schema-validation"],
		legacyDrillIds: ["soap4-mcq-1", "soap4-mcq-2"],
	},
	{
		id: "incident-evidence-logging",
		type: "cloze",
		concept: "Logging the evidence required for escalation and recovery",
		misconception:
			"Capturing incomplete logs that cannot reconstruct the carrier interaction during an incident.",
		difficulty: "intermediate",
		tags: ["soap", "logging", "incident-response"],
		legacyDrillIds: ["soap3-cloze-1"],
	},
];
