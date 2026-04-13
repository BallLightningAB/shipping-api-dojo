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
	{
		id: "lesson-soap-schema-validation",
		slug: "soap-4-schema-validation-before-send",
		objectives: [
			"Validate outbound SOAP payloads against XSD constraints before the carrier receives them.",
			"Treat enums, numeric types, and required elements as operational contract rules.",
			"Use schema-validation failures to shorten incident feedback loops and reduce queue churn.",
		],
		drillFamilyIds: [
			"soap-wsdl-contract-reading",
			"repair-xsd-type-mismatches",
		],
	},
	{
		id: "lesson-soap-headers-auth",
		slug: "soap-5-headers-auth-correlation-ids",
		objectives: [
			"Place SOAP auth and transaction metadata in the correct header contract.",
			"Keep namespaces, auth blocks, and correlation IDs consistent across environments and retries.",
			"Treat SOAP headers as operational evidence, not implementation trivia.",
		],
		drillFamilyIds: ["soap-envelope-builder", "incident-evidence-logging"],
	},
	{
		id: "lesson-soap-version-drift",
		slug: "soap-6-version-drift-wsdl-monitoring-regeneration",
		objectives: [
			"Detect WSDL and schema drift before production traffic breaks.",
			"Regenerate SOAP clients from the contract instead of patching templates by hand.",
			"Roll out contract-driven changes through diff review, tests, and canary traffic.",
		],
		drillFamilyIds: [
			"detect-breaking-carrier-contract-changes",
			"soap-wsdl-contract-reading",
		],
	},
	{
		id: "lesson-soap-fault-taxonomy",
		slug: "soap-7-fault-taxonomy-internal-error-mapping",
		objectives: [
			"Classify SOAP faults into internal categories that drive the right operational response.",
			"Map carrier-specific fault detail into retry, fast-fail, and escalation decisions.",
			"Preserve the evidence required to explain SOAP failures outside the XML layer.",
		],
		drillFamilyIds: [
			"soap-fault-detail-extraction",
			"incident-evidence-logging",
		],
	},
	{
		id: "lesson-rest-idempotency-keys",
		slug: "rest-5-idempotency-keys-deduplication",
		objectives: [
			"Choose an idempotency strategy when a carrier supports keys natively and when it does not.",
			"Use client references and lookup-ledger patterns to prevent duplicate writes after ambiguous outcomes.",
			"Treat deduplication as a product and operations concern, not just a transport detail.",
		],
		drillFamilyIds: [
			"rest-http-method-classification",
			"rest-timeout-recovery",
		],
	},
	{
		id: "lesson-rest-timeout-taxonomy",
		slug: "rest-6-timeout-taxonomy-ambiguous-outcomes",
		objectives: [
			"Separate connect, read, upstream, and worker timeouts before you automate retries.",
			"Treat write timeouts as ambiguous outcomes until evidence resolves them.",
			"Close the loop with idempotent recovery paths and explicit timeout runbooks.",
		],
		drillFamilyIds: ["rest-timeout-recovery", "rest-retry-policy-cloze"],
	},
	{
		id: "lesson-rest-rate-limits",
		slug: "rest-7-rate-limits-quotas-backpressure",
		objectives: [
			"Honor carrier rate-limit signals instead of blindly retrying until the queue melts down.",
			"Use throttling and backpressure to protect both the carrier and your downstream workers.",
			"Differentiate burst control, sustained quota management, and dead-letter escalation.",
		],
		drillFamilyIds: [
			"rest-rate-limits-backpressure",
			"rest-retry-policy-cloze",
		],
	},
	{
		id: "lesson-rest-partial-success",
		slug: "rest-8-partial-success-bulk-compensation",
		objectives: [
			"Recognize partial-success responses before they poison internal state.",
			"Choose compensation strategies that preserve idempotency and auditability.",
			"Treat bulk operations as distributed workflows, not single all-or-nothing calls.",
		],
		drillFamilyIds: [
			"rest-partial-success-compensation",
			"rest-error-classification",
		],
	},
	{
		id: "lesson-rest-webhook-signatures",
		slug: "rest-9-webhook-signatures-replay-ordering",
		objectives: [
			"Verify webhook signatures against the raw request body before trusting the event.",
			"Use event IDs and timestamps to survive replay and out-of-order delivery.",
			"Keep webhook handlers fast, deterministic, and independently observable.",
		],
		drillFamilyIds: [
			"rest-webhook-receiver-behavior",
			"incident-evidence-logging",
		],
	},
	{
		id: "lesson-rest-observability",
		slug: "rest-10-observability-health-checks-runbooks",
		objectives: [
			"Define the minimum telemetry set required to debug carrier incidents quickly.",
			"Use health checks and synthetic probes to separate carrier outage symptoms from local regressions.",
			"Turn correlation IDs, traces, and runbooks into repeatable operational tooling.",
		],
		drillFamilyIds: [
			"rest-sandbox-production-drift",
			"incident-evidence-logging",
		],
	},
];
