/**
 * Lesson Content — 8 lessons (1 intro, 4 REST, 3 SOAP)
 */

import type { Lesson } from "./types";

export const lessons: Lesson[] = [
	{
		slug: "intro-carrier-integrations",
		title: "What Carrier Integrations Get Wrong",
		track: "intro",
		order: 0,
		summary:
			"Why carrier API integrations fail in production and what patterns separate reliable systems from brittle ones.",
		sections: [
			{
				heading: "The Integration Gap",
				body: "Most developers treat carrier APIs like any other REST endpoint. They write a happy-path integration, deploy it, and wait for the first 3 AM page. Carrier APIs are different: inconsistent error formats, undocumented rate limits, partial success responses, and SOAP endpoints that haven't been updated since 2012.",
				carrierReality:
					"A major US carrier returns HTTP 200 for every response — even errors. The actual status is buried three levels deep in an XML body. If you only check the HTTP status code, you'll mark failed shipments as successful.",
			},
			{
				heading: "What This Trainer Covers",
				body: "This tool focuses on the real-world skills you need for carrier integration work: reading HTTP semantics correctly, building idempotent retry logic, parsing SOAP faults, and diagnosing production incidents. Each lesson includes drills that test your ability to apply concepts, not just recall them.",
			},
			{
				heading: "How to Use This Tool",
				body: "Work through the REST and SOAP tracks in order. Each lesson ends with embedded drills. The Incident Arena presents realistic troubleshooting scenarios. Your progress is saved locally — no account needed.",
			},
		],
		drillIds: ["intro-mcq-1", "intro-mcq-2"],
	},
	{
		slug: "rest-1-http-semantics",
		title: "HTTP Semantics: Safe, Idempotent & Retries",
		track: "rest",
		order: 1,
		summary:
			"Understand which HTTP methods are safe and idempotent, and why this matters for retry logic in carrier integrations.",
		sections: [
			{
				heading: "Safe vs Idempotent",
				body: "A safe method doesn't modify server state (GET, HEAD, OPTIONS). An idempotent method can be called multiple times with the same effect as calling it once (GET, PUT, DELETE). POST is neither safe nor idempotent — calling it twice may create two shipments.",
			},
			{
				heading: "Why Retries Need Idempotency",
				body: "Network timeouts are common with carrier APIs. If your POST /shipments times out, did it succeed? Without an idempotency key, retrying might create a duplicate. PUT with a client-generated ID is naturally idempotent. For POST endpoints, send an Idempotency-Key header if the carrier supports it.",
				carrierReality:
					"FedEx's REST API supports idempotency keys on shipment creation. UPS does not — you must implement your own deduplication by querying recent shipments before retrying.",
			},
			{
				heading: "Retry Strategy",
				body: "Use exponential backoff with jitter. Start at 1s, double each retry, add random jitter up to 50% of the delay. Cap at 5 retries. Never retry 4xx errors (except 429). Always retry 502, 503, 504.",
			},
		],
		drillIds: ["rest1-mcq-1", "rest1-mcq-2", "rest1-cloze-1"],
	},
	{
		slug: "rest-2-auth-headers",
		title: "Auth, Headers & Correlation IDs",
		track: "rest",
		order: 2,
		summary:
			"Master carrier API authentication patterns, essential headers, and correlation ID strategies for debugging.",
		sections: [
			{
				heading: "Authentication Patterns",
				body: "Carrier APIs use OAuth 2.0 client credentials, API keys, or basic auth. OAuth tokens expire — cache them and refresh proactively. Never hardcode credentials. Use environment variables and rotate keys regularly.",
				carrierReality:
					"DHL's API uses OAuth 2.0 with short-lived tokens (30 minutes). If you don't cache and refresh, you'll hit the token endpoint on every request and get rate-limited.",
			},
			{
				heading: "Essential Headers",
				body: "Always send: Content-Type, Accept, Authorization, and a correlation/transaction ID. The correlation ID ties your request to logs on both sides. Use UUID v4 format. Include it in X-Correlation-ID or X-Transaction-ID headers.",
			},
			{
				heading: "Debugging with Correlation IDs",
				body: "When a carrier support ticket says 'we see no record of that request,' your correlation ID is your proof. Log it on your side, send it with the request, and include it in error reports. This single practice saves hours of debugging.",
			},
		],
		drillIds: ["rest2-mcq-1", "rest2-builder-1"],
	},
	{
		slug: "rest-3-error-mapping",
		title: "Error Mapping & Problem Details",
		track: "rest",
		order: 3,
		summary:
			"Learn to map carrier error responses to your domain, and use RFC 9457 Problem Details for consistent error handling.",
		sections: [
			{
				heading: "The Error Zoo",
				body: "Every carrier has a different error format. Some return { error: 'message' }, others { errors: [{ code, detail }] }, and some return HTML error pages on 500s. Your integration layer must normalize all of these into a consistent internal format.",
			},
			{
				heading: "RFC 9457 Problem Details",
				body: "Problem Details (application/problem+json) is a standard format: { type, title, status, detail, instance }. Map carrier errors to this format at the integration boundary. Your upstream services get a consistent shape regardless of which carrier caused the error.",
				carrierReality:
					"USPS returns errors in XML with codes like -2147219401. You need a mapping table to convert these to meaningful Problem Details responses for your consumers.",
			},
			{
				heading: "Error Categories",
				body: "Classify errors into: retryable (503, 429, timeout), permanent (400, 404, 422), and ambiguous (500, timeout on POST). Each category needs a different handling strategy. Retryable errors go to the retry queue. Permanent errors fail fast. Ambiguous errors need investigation before retry.",
			},
		],
		drillIds: ["rest3-mcq-1", "rest3-cloze-1"],
	},
	{
		slug: "rest-4-pagination-webhooks",
		title: "Pagination & Webhooks Basics",
		track: "rest",
		order: 4,
		summary:
			"Handle paginated carrier responses and implement webhook receivers for tracking updates.",
		sections: [
			{
				heading: "Pagination Patterns",
				body: "Carrier APIs use offset-based (page/limit), cursor-based (next_cursor), or link-header pagination. Cursor-based is most reliable for real-time data. Always drain all pages — a partial sync means missing shipments.",
			},
			{
				heading: "Webhook Fundamentals",
				body: "Carriers push tracking updates via webhooks. Your receiver must: return 200 quickly (process async), validate signatures, handle duplicates (use event IDs), and handle out-of-order delivery. Never do heavy processing in the webhook handler.",
				carrierReality:
					"FedEx webhook payloads can arrive out of order. A 'delivered' event might arrive before 'out for delivery.' Use the event timestamp, not arrival order, to determine the current status.",
			},
			{
				heading: "Webhook Security",
				body: "Verify webhook signatures using HMAC-SHA256. Compare the signature header against your computed hash of the raw body + shared secret. Reject requests with invalid or missing signatures. Use constant-time comparison to prevent timing attacks.",
			},
		],
		drillIds: ["rest4-mcq-1", "rest4-mcq-2"],
	},
	{
		slug: "rest-5-idempotency-keys-deduplication",
		title: "Idempotency Keys & Deduplication Patterns",
		track: "rest",
		order: 5,
		summary:
			"Use idempotency keys, client references, and replay-safe lookup patterns to prevent duplicate carrier writes.",
		sections: [
			{
				heading: "Native Keys vs Your Own Deduplication Ledger",
				body: "Some carriers accept an Idempotency-Key or client transaction ID and promise to replay the original result when the same logical write arrives again. Others give you no help at all. In both cases, your system still needs a durable operation key that ties the write, the expected side effects, and the observed result together.",
			},
			{
				heading: "Client References Resolve Ambiguous Writes",
				body: "When a create call times out, the safest recovery path is usually: search by your client reference, inspect the existing shipment if it exists, and only retry when you can prove the original write never landed. This is what turns a timeout from guesswork into deterministic recovery.",
				carrierReality:
					"DHL Express and similar APIs may expose shipment or pickup identifiers differently across endpoints. If your write path and your lookup path do not share the same client reference strategy, your deduplication design falls apart under pressure.",
			},
			{
				heading: "Idempotency Is Also an Operations Contract",
				body: "The operation key must show up in logs, support tooling, and incident runbooks. If support cannot search by it, or if your retry worker cannot correlate it to the original attempt, you still have a duplicate-label problem waiting to happen.",
			},
		],
		drillIds: ["rest-http-method-classification", "rest-timeout-recovery"],
	},
	{
		slug: "rest-6-timeout-taxonomy-ambiguous-outcomes",
		title: "Timeout Taxonomy & Ambiguous Outcomes",
		track: "rest",
		order: 6,
		summary:
			"Separate timeout types, identify ambiguous writes, and recover without guessing what the carrier actually did.",
		sections: [
			{
				heading: "Not All Timeouts Mean the Same Thing",
				body: "A connect timeout, TLS timeout, upstream gateway timeout, worker deadline, and carrier-side read timeout all have different meanings. You need to know whether the request never left your system, reached the carrier but not your app code, or ran long enough that the outcome became ambiguous.",
			},
			{
				heading: "Ambiguous Outcomes Are Write-Specific",
				body: "A timeout on GET tracking is annoying. A timeout on POST /shipments is operationally dangerous because the label may already exist. Treat every write timeout as an evidence-collection problem first, not a generic retry candidate.",
				carrierReality:
					"Carrier maintenance windows and edge proxies often surface as generic timeouts even when the backend actually completed the write. If you retry blindly, you create a second problem while the first one is still being diagnosed.",
			},
			{
				heading: "Document the Recovery Ladder",
				body: "The recovery path should be explicit: check telemetry, search by client reference, inspect any existing label, then decide whether retry, compensation, or escalation is the correct next move. If that ladder only lives in one engineer's head, you will relearn it during every outage.",
			},
		],
		drillIds: ["rest-timeout-recovery", "rest-retry-policy-cloze"],
	},
	{
		slug: "rest-7-rate-limits-quotas-backpressure",
		title: "Rate Limits, Quotas & Backpressure",
		track: "rest",
		order: 7,
		summary:
			"Honor carrier quotas, absorb bursts safely, and keep internal queues from turning throttling into an outage.",
		sections: [
			{
				heading: "429 Is a Traffic Signal, Not a Surprise",
				body: "Carrier throttling is part of the contract whether it is well documented or not. A 429 response, Retry-After header, or burst quota metric is the carrier telling you to slow the system down now, not after another hundred retries.",
			},
			{
				heading: "Backpressure Must Reach the Queue",
				body: "If workers slow down but the enqueue side keeps filling the queue at the same rate, you are only moving the outage around. Good backpressure propagates to schedulers, bulk-job orchestration, and the internal APIs that create work.",
				carrierReality:
					"A carrier may publish a per-minute shipment quota while silently applying lower burst limits per token, IP, or account region. If you only tune for the published quota, the real limiter still trips first.",
			},
			{
				heading: "Throttle Proactively, Retry Selectively",
				body: "A token bucket or leaky bucket keeps you under the carrier's steady-state limit. Exponential backoff handles the exceptional case. You need both. Otherwise you alternate between hammering the carrier and waiting uselessly for the queue to clear itself.",
			},
		],
		drillIds: ["rest-rate-limits-backpressure", "rest-retry-policy-cloze"],
	},
	{
		slug: "rest-8-partial-success-bulk-compensation",
		title: "Partial Success, Bulk Operations & Compensation",
		track: "rest",
		order: 8,
		summary:
			"Handle partial label creation, bulk workflows, and compensation steps without corrupting internal state.",
		sections: [
			{
				heading: "Success and Failure Can Arrive Together",
				body: "A carrier can create three labels, reject two parcels, and still return one transport-level success response. If you collapse that into a single pass/fail flag, your downstream systems will never know which parcels actually moved.",
			},
			{
				heading: "Compensation Is Part of the Write Path",
				body: "When the carrier succeeded but your database write failed, you now own a split-brain workflow. Compensation might mean voiding the carrier artifact, replaying the internal save with idempotency, or parking the job in manual review. The right answer depends on what the carrier can still reverse safely.",
				carrierReality:
					"Bulk manifest and multi-piece shipment APIs often blend accepted and rejected items in the same payload. The only safe implementation is to model each piece explicitly instead of pretending the whole batch has one status.",
			},
			{
				heading: "Bulk APIs Need Item-Level Evidence",
				body: "Store per-item identifiers, failure reasons, and compensation status. If you cannot explain which child operation succeeded and which child operation failed, the post-incident cleanup will be slow, manual, and expensive.",
			},
		],
		drillIds: [
			"rest-partial-success-compensation",
			"rest-error-classification",
		],
	},
	{
		slug: "rest-9-webhook-signatures-replay-ordering",
		title: "Webhook Signatures, Replay Defense & Ordering",
		track: "rest",
		order: 9,
		summary:
			"Verify webhook authenticity, reject replays, and survive out-of-order carrier events.",
		sections: [
			{
				heading: "Trust the Raw Body, Not the Parsed Object",
				body: "Webhook signature verification usually depends on the exact raw request body plus a shared secret. If your framework parses and rewrites the payload before verification, a valid event can fail signature validation or, worse, an invalid event can slip through if you verify the wrong bytes.",
			},
			{
				heading: "Replay and Ordering Are Separate Problems",
				body: "A replay attack resends the same event. Out-of-order delivery sends valid but differently timed events in the wrong sequence. You need an event ID ledger for replay defense and timestamp or sequence handling for ordering. One control does not solve the other.",
				carrierReality:
					"A carrier can deliver 'delivered' before 'out for delivery' because separate internal systems publish the updates. If you trust arrival order, your status model regresses in public-facing tracking.",
			},
			{
				heading: "Acknowledge Fast, Observe Deeply",
				body: "The receiver should verify, persist, and acknowledge quickly. Heavy downstream work belongs in asynchronous workers. Pair that with event-level logging so you can reconstruct replay, ordering, and deduplication behavior during an incident.",
			},
		],
		drillIds: ["rest4-mcq-2", "soap3-cloze-1"],
	},
	{
		slug: "rest-10-observability-health-checks-runbooks",
		title: "Observability, Health Checks & Incident Runbooks",
		track: "rest",
		order: 10,
		summary:
			"Use traces, health checks, and operational runbooks to separate carrier outages from your own integration failures.",
		sections: [
			{
				heading: "Telemetry Is the First Triage Tool",
				body: "Carrier incidents move faster when you can answer three questions immediately: which operation failed, which correlation IDs are affected, and whether the failures are concentrated by carrier, account, region, or deployment version. Logs alone are rarely enough; you also want request metrics and traces.",
			},
			{
				heading: "Health Checks Need Intent",
				body: "A green health endpoint only proves your app process is alive. For carrier integrations, the more useful checks validate dependencies, credential freshness, and synthetic carrier reachability without triggering expensive writes. Use lightweight probes that tell operators where to look next.",
				carrierReality:
					"Sandbox credentials often stay healthy while production credentials drift, rotate, or lose permissions. If your observability stack does not compare environments cleanly, you can waste hours debugging the wrong system.",
			},
			{
				heading: "Runbooks Should Reference Real Evidence",
				body: "A runbook should tell the responder exactly which dashboards, carrier lookup paths, dead-letter queues, and compensation levers matter for this incident class. If the runbook only says 'check logs,' you do not actually have a runbook yet.",
			},
		],
		drillIds: ["rest-sandbox-production-drift", "soap3-cloze-1"],
	},
	{
		slug: "soap-1-envelope-namespaces",
		title: "SOAP Envelope & Namespaces",
		track: "soap",
		order: 11,
		summary:
			"Understand the SOAP envelope structure, XML namespaces, and how to construct valid SOAP requests.",
		sections: [
			{
				heading: "The SOAP Envelope",
				body: "Every SOAP message is an XML document wrapped in an Envelope element. The Envelope contains an optional Header and a required Body. The Header carries metadata (auth tokens, transaction IDs). The Body carries the actual request or response payload.",
			},
			{
				heading: "Namespaces Matter",
				body: "XML namespaces prevent element name collisions. The SOAP envelope uses http://schemas.xmlsoap.org/soap/envelope/ (SOAP 1.1) or http://www.w3.org/2003/05/soap-envelope (SOAP 1.2). The carrier's service uses its own namespace. Get the namespace wrong and you'll get cryptic 'element not found' faults.",
				carrierReality:
					"UPS's SOAP API uses different namespaces for different service versions. Upgrading from v1 to v2 means updating every namespace URI — miss one and the request silently fails.",
			},
			{
				heading: "Building a SOAP Request",
				body: "Start with the Envelope, declare namespaces on it, add auth in the Header, and construct the Body with the operation element. Use the carrier's WSDL to find the correct operation name, namespace, and parameter types. Don't hand-build SOAP — use a library, but understand the structure so you can debug.",
			},
		],
		drillIds: ["soap1-mcq-1", "soap1-builder-1"],
	},
	{
		slug: "soap-2-wsdl-xsd",
		title: "WSDL & XSD Mental Model",
		track: "soap",
		order: 12,
		summary:
			"Build a mental model of WSDL and XSD so you can read carrier service definitions and diagnose contract issues.",
		sections: [
			{
				heading: "What WSDL Tells You",
				body: "WSDL (Web Services Description Language) is the contract. It defines: services (endpoints), ports (bindings), operations (methods), messages (input/output shapes), and types (XSD schemas). Think of it as the OpenAPI spec for SOAP — except it's XML and 10x more verbose.",
			},
			{
				heading: "Reading XSD Types",
				body: "XSD defines the data types used in SOAP messages. Complex types are like interfaces — they define the shape of request/response objects. Simple types constrain values (enums, patterns, ranges). When a carrier says 'invalid request,' check your data against the XSD constraints first.",
				carrierReality:
					"FedEx's WSDL defines a ShipmentType enum that must be one of: FEDEX_GROUND, FEDEX_EXPRESS, etc. Send 'FedEx Ground' instead and you'll get a validation fault with no useful message.",
			},
			{
				heading: "WSDL-First vs Code-First",
				body: "Carrier SOAP APIs are WSDL-first: the WSDL is the source of truth. Generate your client code from the WSDL. Don't hand-code SOAP types — they'll drift from the contract. When the carrier updates their WSDL, regenerate and diff to find breaking changes.",
			},
		],
		drillIds: ["soap2-mcq-1", "soap2-mcq-2"],
	},
	{
		slug: "soap-3-fault-handling",
		title: "SOAP Fault Handling & Logging",
		track: "soap",
		order: 13,
		summary:
			"Parse SOAP faults correctly, extract actionable detail, and log what matters for production debugging.",
		sections: [
			{
				heading: "SOAP Fault Structure",
				body: "A SOAP Fault has: faultcode (category), faultstring (human message), faultactor (who caused it), and detail (structured error data). The detail element is carrier-specific and contains the actually useful information — error codes, field names, and resolution hints.",
			},
			{
				heading: "Parsing Faults",
				body: "Don't just log the faultstring. Parse the detail element to extract carrier-specific error codes and affected fields. Map these to your internal error model. Many carrier faults contain nested error arrays — iterate them all.",
				carrierReality:
					"UPS SOAP faults contain a PrimaryErrorCode and an array of AdditionalErrorCodes. The primary code is often generic ('invalid request'). The additional codes tell you which field failed validation and why.",
			},
			{
				heading: "What to Log",
				body: "Log: (1) your correlation ID, (2) the full SOAP request (scrub auth), (3) the full SOAP response, (4) parsed error codes, (5) timestamp, (6) carrier endpoint URL. In production, redact sensitive fields (tracking numbers, addresses) but keep the structure. These logs are your lifeline during incidents.",
			},
		],
		drillIds: ["soap3-mcq-1", "soap3-cloze-1"],
	},
	{
		slug: "soap-4-schema-validation-before-send",
		title: "Schema Validation Before Send",
		track: "soap",
		order: 14,
		summary:
			"Catch XSD, enum, and type mismatches before a carrier turns them into cryptic SOAP faults.",
		sections: [
			{
				heading: "Validate Before the Network Boundary",
				body: "If the request already violates the contract, the carrier is the worst place to discover it. Validate generated XML against the XSD before sending so type mismatches, missing required elements, and invalid enums fail locally with faster, clearer feedback.",
			},
			{
				heading: "XSD Restrictions Are Operational Rules",
				body: "XSD simple types are not decoration. Enumerations, decimal formats, min/max ranges, and length restrictions are the actual carrier rules expressed in machine-readable form. If your mapping layer treats them as loose hints, production traffic will keep rediscovering the same avoidable validation faults.",
				carrierReality:
					"A carrier may accept ServiceLevel values like EXPRESS_SAVER and GROUND_HOME_DELIVERY exactly as defined in the schema. Sending a UI label such as 'Express Saver' can fail even though the business meaning looks identical.",
			},
			{
				heading: "Preflight Validation Speeds Recovery",
				body: "Preflight validation is not only about preventing errors. It also gives you a deterministic failure boundary, clearer internal alerts, and smaller incident blast radius. Engineers can fix a mapping bug before it reaches the carrier instead of triaging vague downstream faults after the queue backs up.",
			},
		],
		drillIds: ["soap4-mcq-1", "soap4-mcq-2"],
	},
	{
		slug: "soap-5-headers-auth-correlation-ids",
		title: "SOAP Headers, Auth Tokens, and Correlation IDs",
		track: "soap",
		order: 15,
		summary:
			"Place auth and transaction metadata in the correct SOAP header shape so the carrier can authenticate, trace, and support the request.",
		sections: [
			{
				heading: "Headers Carry the Operational Contract",
				body: "SOAP headers hold metadata that should not be mixed into the business payload: auth tokens, transaction IDs, routing hints, and sometimes WS-Security blocks. If those fields drift into the body or the wrong namespace, the request may still look valid XML while the carrier rejects it immediately.",
			},
			{
				heading: "Auth Tokens Must Live in the Right Namespace",
				body: "SOAP auth is often expressed through a header contract, not a generic HTTP bearer token alone. Some carriers expect UsernameToken, API keys, access-license data, or a transaction block in specific namespaces and specific element order. Treat that structure as part of the contract, not as incidental boilerplate.",
				carrierReality:
					"Legacy carrier SOAP stacks often keep HTTP auth, WS-Security, and carrier-specific transaction headers as separate concerns. A request can reach the endpoint successfully while still failing application auth because one header block used the wrong namespace prefix or element name.",
			},
			{
				heading: "Correlation IDs Turn Support Into Search",
				body: "Support escalations move faster when the same request identifier appears in your logs, the carrier's logs, and the SOAP header contract. If correlation IDs are optional, inconsistently named, or omitted on retries, your incident evidence becomes fragmented precisely when you need it most.",
			},
		],
		drillIds: ["soap5-mcq-1", "soap5-builder-1"],
	},
	{
		slug: "soap-6-version-drift-wsdl-monitoring-regeneration",
		title: "Version Drift, WSDL Monitoring, and Regeneration",
		track: "soap",
		order: 16,
		summary:
			"Detect contract drift early, regenerate safely, and roll out SOAP client updates without waiting for production breakage.",
		sections: [
			{
				heading: "Contract Drift Rarely Announces Itself Well",
				body: "SOAP integrations often break after a quiet carrier maintenance window, a refreshed endpoint, or a generated-client mismatch that nobody explicitly announced. The fault shows up as an unexpected element, a missing required field, or a signature error even though your own deploy pipeline never changed.",
			},
			{
				heading: "Monitor the Contract, Not Just the Endpoint",
				body: "Track WSDL downloads, checksums, generated client diffs, and endpoint metadata so you can see drift before the first live job fails. Availability checks alone are insufficient if the endpoint still responds while the contract has changed underneath your generated code.",
				carrierReality:
					"Some carriers refresh production WSDLs ahead of sandbox or documentation updates. If your contract monitoring only checks one environment, you can promote a stale generated client into a breaking production mismatch.",
			},
			{
				heading: "Regeneration Needs a Controlled Rollout",
				body: "Regenerating the client is step one, not the whole fix. Review the diff, update mapping code, run contract tests, and canary the new client against safe probes before reopening full traffic. SOAP contract changes are often operational migrations disguised as code generation chores.",
			},
		],
		drillIds: ["soap6-mcq-1", "soap6-mcq-2"],
	},
	{
		slug: "soap-7-fault-taxonomy-internal-error-mapping",
		title: "Fault Taxonomy and Internal Error Mapping",
		track: "soap",
		order: 17,
		summary:
			"Turn SOAP faults into a consistent internal error taxonomy so retry, escalation, and customer messaging follow the right path.",
		sections: [
			{
				heading: "Not Every SOAP Fault Means the Same Thing",
				body: "SOAP faults bundle validation failures, auth mismatches, policy violations, and transient backend problems under one transport shape. If your integration treats them all as generic 'carrier error' events, you lose the ability to distinguish fast-fail, retry, and escalation-worthy incidents.",
			},
			{
				heading: "Map Fault Detail to Internal Categories",
				body: "The faultcode, detail block, and any nested carrier-specific codes should resolve to your internal taxonomy: validation, authentication, contract-drift, rate-limit or dependency failure, and ambiguous carrier outage. That boundary is what lets the rest of your platform handle SOAP problems as first-class operational events instead of bespoke XML trivia.",
				carrierReality:
					"Many carrier stacks emit a generic faultstring such as 'Processing Error' while the nested codes distinguish invalid credentials from invalid weight or a temporarily unavailable rating backend. Your mapping layer has to expose that distinction.",
			},
			{
				heading: "Escalation Depends on Structured Evidence",
				body: "Once you map the fault correctly, the follow-up becomes obvious: fix the payload, rotate credentials, regenerate the client, or escalate with precise evidence. If the logs only preserve the top-level faultstring, you turn solvable SOAP faults into slow manual investigations.",
			},
		],
		drillIds: ["soap7-mcq-1", "soap7-cloze-1"],
	},
];

export function getLessonBySlug(slug: string): Lesson | undefined {
	return lessons.find((l) => l.slug === slug);
}

export function getLessonsByTrack(track: string): Lesson[] {
	return lessons
		.filter((l) => l.track === track)
		.sort((a, b) => a.order - b.order);
}
