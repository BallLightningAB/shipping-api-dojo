/**
 * Wiki Entries — reference articles for carrier integration concepts
 */

import type { WikiEntry } from "./types";

export const wikiEntries: WikiEntry[] = [
	{
		slug: "idempotency",
		title: "Idempotency",
		summary:
			"A property of operations where performing them multiple times produces the same result as performing them once.",
		body: "In carrier integrations, idempotency prevents duplicate shipments when retrying failed requests. HTTP methods GET, PUT, and DELETE are naturally idempotent. POST is not — you need an Idempotency-Key header or client-side deduplication.\n\nImplementation: generate a UUID for each logical operation, send it as a header, and store it server-side. If the carrier sees the same key twice, it returns the original response instead of creating a duplicate.",
		sources: [
			{
				label: "RFC 9110 — HTTP Semantics",
				url: "https://www.rfc-editor.org/rfc/rfc9110",
			},
			{
				label: "Stripe Idempotency Guide",
				url: "https://stripe.com/docs/api/idempotent_requests",
			},
		],
		relatedSlugs: ["retry-strategies", "http-methods"],
	},
	{
		slug: "retry-strategies",
		title: "Retry Strategies",
		summary:
			"Patterns for automatically retrying failed carrier API requests without causing harm.",
		body: "Exponential backoff with jitter is the standard retry strategy. Start with a 1-second delay, double it each retry, and add random jitter (0–50% of the delay) to prevent thundering herd.\n\nKey rules:\n- Never retry 4xx errors (except 429 Too Many Requests)\n- Always retry 502, 503, 504\n- Cap retries at 5 attempts\n- Use a circuit breaker to stop retrying if the carrier is consistently failing\n- For POST requests, always use an idempotency key when retrying",
		sources: [
			{
				label: "AWS Error Retries",
				url: "https://docs.aws.amazon.com/general/latest/gr/api-retries.html",
			},
			{
				label: "Google Cloud — Retry Strategy",
				url: "https://cloud.google.com/storage/docs/retry-strategy",
			},
		],
		relatedSlugs: ["idempotency", "circuit-breaker"],
	},
	{
		slug: "http-methods",
		title: "HTTP Methods",
		summary:
			"Understanding safe, idempotent, and unsafe HTTP methods in the context of carrier APIs.",
		body: "Safe methods (GET, HEAD, OPTIONS) don't modify state. Idempotent methods (GET, PUT, DELETE) produce the same result when called multiple times. POST and PATCH are neither safe nor idempotent.\n\nFor carrier APIs:\n- GET: fetch shipment status, tracking info\n- POST: create shipments (use idempotency keys)\n- PUT: update shipment details (naturally idempotent)\n- DELETE: cancel/void shipments",
		sources: [
			{
				label: "MDN — HTTP Methods",
				url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
			},
		],
		relatedSlugs: ["idempotency", "rest-api"],
	},
	{
		slug: "problem-details",
		title: "RFC 9457 Problem Details",
		summary:
			"A standard format for machine-readable error responses in HTTP APIs.",
		body: "Problem Details (application/problem+json) defines a consistent error shape:\n\n- type: URI identifying the error type\n- title: short human-readable summary\n- status: HTTP status code\n- detail: human-readable explanation\n- instance: URI for this specific occurrence\n\nUse this as your internal error format. Map carrier-specific errors to Problem Details at the integration boundary so upstream services get a consistent shape.",
		sources: [
			{ label: "RFC 9457", url: "https://www.rfc-editor.org/rfc/rfc9457" },
		],
		relatedSlugs: ["error-handling", "rest-api"],
	},
	{
		slug: "soap-envelope",
		title: "SOAP Envelope",
		summary: "The XML wrapper structure for all SOAP messages.",
		body: "Every SOAP message is an XML document with this structure:\n\n1. Envelope (root element) — declares SOAP and service namespaces\n2. Header (optional) — carries metadata: auth tokens, transaction IDs, WS-Security\n3. Body (required) — contains the operation request or response\n\nSOAP 1.1 uses namespace http://schemas.xmlsoap.org/soap/envelope/\nSOAP 1.2 uses namespace http://www.w3.org/2003/05/soap-envelope\n\nThe Body contains exactly one child element: the operation (e.g., CreateShipment) using the carrier's namespace.",
		sources: [
			{
				label: "W3C SOAP 1.1",
				url: "https://www.w3.org/TR/2000/NOTE-SOAP-20000508/",
			},
			{ label: "W3C SOAP 1.2", url: "https://www.w3.org/TR/soap12/" },
		],
		relatedSlugs: ["soap-fault", "wsdl", "xml-namespaces"],
	},
	{
		slug: "soap-fault",
		title: "SOAP Fault",
		summary: "The standard error response format in SOAP web services.",
		body: "A SOAP Fault contains:\n\n- faultcode: error category (Client, Server, VersionMismatch, MustUnderstand)\n- faultstring: human-readable message (often generic)\n- faultactor: who caused the fault\n- detail: carrier-specific structured error data\n\nThe detail element is where the useful information lives. It contains carrier error codes, affected field names, and sometimes resolution hints. Always parse detail — never rely solely on faultstring.",
		sources: [
			{
				label: "W3C SOAP Faults",
				url: "https://www.w3.org/TR/2000/NOTE-SOAP-20000508/#_Toc478383507",
			},
		],
		relatedSlugs: ["soap-envelope", "error-handling"],
	},
	{
		slug: "wsdl",
		title: "WSDL",
		summary:
			"Web Services Description Language — the contract definition for SOAP services.",
		body: "WSDL defines the complete SOAP service contract:\n\n- types: XSD schemas for request/response data\n- message: named input/output message shapes\n- portType: grouped operations (like an interface)\n- binding: maps operations to SOAP protocol details\n- service: the actual endpoint URL\n\nAlways generate client code from the WSDL rather than hand-coding SOAP. When the carrier updates their WSDL, regenerate and diff to catch breaking changes.",
		sources: [
			{ label: "W3C WSDL 1.1", url: "https://www.w3.org/TR/wsdl.html" },
		],
		relatedSlugs: ["soap-envelope", "xsd", "xml-namespaces"],
	},
	{
		slug: "xml-namespaces",
		title: "XML Namespaces",
		summary:
			"How XML namespaces prevent element name collisions in SOAP messages.",
		body: "XML namespaces use URIs to uniquely identify element groups. In SOAP:\n\n- The SOAP envelope has its own namespace\n- The carrier service has its own namespace\n- Each can have elements with the same local name without conflict\n\nNamespaces are declared with xmlns:prefix=\"URI\" on the root element. Use the prefix throughout the document. Getting the namespace wrong causes 'element not found' faults that are hard to debug.",
		sources: [
			{
				label: "W3C Namespaces in XML",
				url: "https://www.w3.org/TR/xml-names/",
			},
		],
		relatedSlugs: ["soap-envelope", "wsdl"],
	},
	{
		slug: "correlation-id",
		title: "Correlation IDs",
		summary:
			"Unique identifiers that trace a request through distributed systems.",
		body: "A correlation ID (or transaction ID) is a UUID attached to every carrier API request. It appears in:\n\n- Your outgoing request header (X-Correlation-ID)\n- Your application logs\n- The carrier's logs (if they support it)\n\nWhen debugging production issues, the correlation ID links your logs to the carrier's logs. Without it, carrier support can't find your request in their system. Always generate a UUID v4 and include it in every request.",
		sources: [
			{
				label: "Microsoft — Correlation IDs",
				url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/monitoring#correlation-ids",
			},
		],
		relatedSlugs: ["error-handling", "rest-api"],
	},
	{
		slug: "circuit-breaker",
		title: "Circuit Breaker Pattern",
		summary:
			"A resilience pattern that prevents cascading failures when a carrier API is down.",
		body: "The circuit breaker has three states:\n\n1. Closed (normal): requests flow through\n2. Open (tripped): all requests fail fast without calling the carrier\n3. Half-Open (testing): one request goes through to test recovery\n\nTrip the breaker after N consecutive failures. In Open state, return a cached response or queue the request. After a cooldown, enter Half-Open and test with one request. If it succeeds, close the breaker.",
		sources: [
			{
				label: "Martin Fowler — Circuit Breaker",
				url: "https://martinfowler.com/bliki/CircuitBreaker.html",
			},
		],
		relatedSlugs: ["retry-strategies", "error-handling"],
	},
	{
		slug: "rest-api",
		title: "REST API Basics",
		summary:
			"Foundational REST concepts as they apply to carrier integrations.",
		body: "REST (Representational State Transfer) uses HTTP methods on resources:\n\n- Resources are identified by URLs (/v1/shipments/123)\n- Methods indicate the action (GET, POST, PUT, DELETE)\n- Status codes indicate the result (2xx success, 4xx client error, 5xx server error)\n- Content negotiation via Accept and Content-Type headers\n\nCarrier REST APIs vary widely in adherence to REST principles. Some use POST for everything, return 200 for errors, or nest resources inconsistently. Adapt to each carrier's actual behavior, not the REST ideal.",
		sources: [{ label: "REST API Tutorial", url: "https://restfulapi.net/" }],
		relatedSlugs: ["http-methods", "problem-details", "correlation-id"],
	},
	{
		slug: "error-handling",
		title: "Error Handling Patterns",
		summary: "Strategies for classifying and handling carrier API errors.",
		body: "Classify carrier errors into three categories:\n\n1. Retryable: 429, 502, 503, 504, timeouts — queue for retry with backoff\n2. Permanent: 400, 401, 403, 404, 422 — fail fast, alert, don't retry\n3. Ambiguous: 500, timeout on POST — investigate before retry\n\nAt the integration boundary, map all carrier errors to your internal format (e.g., Problem Details). Log the full request and response for debugging. Never expose raw carrier errors to end users.",
		sources: [
			{
				label: "RFC 9110 — Status Codes",
				url: "https://www.rfc-editor.org/rfc/rfc9110#section-15",
			},
		],
		relatedSlugs: ["retry-strategies", "problem-details", "circuit-breaker"],
	},
	{
		slug: "oauth-token-lifecycle",
		title: "OAuth Token Lifecycle",
		summary:
			"How to cache, refresh, and invalidate carrier access tokens without creating an auth outage.",
		body: "Carrier OAuth flows are usually simple client-credentials exchanges, but the operational risk is in the lifecycle. Cache the token centrally, refresh with an expiry buffer, and prevent every worker from refreshing at once. A single-flight refresh path plus token-expiry metrics turns auth from a hidden dependency into something you can observe and control.\n\nWhen a token expires unexpectedly, treat the incident as both an auth failure and a traffic problem. Uncoordinated refresh storms can rate-limit the token endpoint and widen the outage.",
		sources: [
			{
				label: "RFC 6749 — OAuth 2.0 Authorization Framework",
				url: "https://www.rfc-editor.org/rfc/rfc6749",
			},
		],
		relatedSlugs: ["correlation-id", "retry-after-and-backpressure"],
	},
	{
		slug: "retry-after-and-backpressure",
		title: "Retry-After & Backpressure",
		summary:
			"How to translate carrier throttling signals into queue-safe system behavior.",
		body: "Retry-After is not just a retry timer. It is feedback that your system must slow down now. Honor the carrier's guidance, reduce worker throughput, and propagate backpressure to the code paths that enqueue new work. Without that propagation, the queue becomes the real outage even if the carrier is recovering.\n\nUse proactive throttles such as token buckets for steady-state control, then use exponential backoff only for exceptional failures. Dead-letter queues belong at the end of that flow, not in place of it.",
		sources: [
			{
				label: "RFC 9110 — Retry-After",
				url: "https://www.rfc-editor.org/rfc/rfc9110#name-retry-after",
			},
			{
				label: "RFC 9331 — RateLimit Header Fields for HTTP",
				url: "https://www.rfc-editor.org/rfc/rfc9331",
			},
		],
		relatedSlugs: ["retry-strategies", "dead-letter-queues"],
	},
	{
		slug: "webhook-signatures",
		title: "Webhook Signatures",
		summary:
			"Verify webhook authenticity against the raw request body before you trust the event.",
		body: "Webhook signature verification depends on exact bytes. Capture the raw body before parsing, compute the HMAC or signing payload the carrier specifies, and compare with a constant-time check. If verification happens after middleware rewrites the body, your signature logic is already untrustworthy.\n\nSignature validation only proves the carrier sent the event. It does not solve replays, ordering, or idempotent processing. Those need separate controls.",
		sources: [
			{
				label: "RFC 2104 — HMAC",
				url: "https://www.rfc-editor.org/rfc/rfc2104",
			},
			{
				label: "Stripe — Resolve Webhook Signature Verification Errors",
				url: "https://docs.stripe.com/webhooks/signature",
			},
		],
		relatedSlugs: ["webhook-replay-and-ordering", "correlation-id"],
	},
	{
		slug: "webhook-replay-and-ordering",
		title: "Webhook Replay & Ordering",
		summary:
			"Protect webhook consumers against duplicate delivery and out-of-order carrier events.",
		body: "Replay defense and ordering control are different jobs. Replays are handled with event IDs, deduplication ledgers, and idempotent consumers. Ordering is handled with timestamps, versions, sequence numbers, or a monotonic status projection. One control does not replace the other.\n\nCarrier webhooks are often eventually consistent, so your downstream state machine must tolerate valid status updates arriving late. Preserve the raw timeline for debugging even if your public shipment state stays monotonic.",
		sources: [
			{
				label: "Postmark — How to Handle Duplicate Events in Your Code",
				url: "https://postmarkapp.com/blog/why-idempotency-is-important",
			},
		],
		relatedSlugs: ["webhook-signatures", "partial-success-and-compensation"],
	},
	{
		slug: "partial-success-and-compensation",
		title: "Partial Success & Compensation",
		summary:
			"Recover safely when the carrier completed part of the workflow and your system did not.",
		body: "Partial success means the workflow is now distributed. A carrier may create the label while your persistence layer fails, or may accept some parcels in a bulk request and reject others. The fix is not 'retry everything.' The fix is item-level state, one logical operation key, and explicit compensation rules.\n\nCompensation can mean voiding the external artifact, replaying the internal save against the original operation ID, or parking the workflow for manual review. Choose one based on reversibility, billing exposure, and auditability.",
		sources: [
			{
				label: "Azure Architecture Center — Compensating Transaction Pattern",
				url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction",
			},
		],
		relatedSlugs: ["idempotency", "dead-letter-queues"],
	},
	{
		slug: "health-checks",
		title: "Health Checks",
		summary:
			"Use health checks and synthetic probes to tell carrier failures apart from your own regressions.",
		body: "A good health check does more than confirm the process is alive. For carrier integrations, it should separate local health, dependency reachability, credential validity, and critical-path readiness. Lightweight synthetic probes against the safest carrier endpoints can reveal auth or routing failures before customers find them.\n\nDo not overload one endpoint with every possible dependency test. Split liveness, readiness, and deeper diagnostic probes so deploy systems and humans get the right signal.",
		sources: [
			{
				label: "Kubernetes — Liveness, Readiness, and Startup Probes",
				url: "https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/",
			},
			{
				label: "OpenTelemetry Documentation",
				url: "https://opentelemetry.io/docs/",
			},
		],
		relatedSlugs: ["correlation-id", "sandbox-vs-production"],
	},
	{
		slug: "dead-letter-queues",
		title: "Dead-Letter Queues",
		summary:
			"Route permanently failing carrier work into a queue built for inspection and recovery.",
		body: "A dead-letter queue is where work goes when the automated path has exhausted its safe retries. That makes it an operations tool, not a bin for forgotten messages. Preserve the request fingerprint, operation key, carrier error detail, and last retry reason so an engineer can tell whether the next action is replay, compensation, or escalation.\n\nIf the DLQ entry does not contain enough evidence to act, the queue is only hiding the outage. Pair it with runbooks and alerts that explain when to replay and when to stop.",
		sources: [
			{
				label: "Amazon SQS Dead-Letter Queues",
				url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html",
			},
		],
		relatedSlugs: [
			"retry-after-and-backpressure",
			"partial-success-and-compensation",
		],
	},
	{
		slug: "sandbox-vs-production",
		title: "Sandbox vs Production",
		summary:
			"Why a carrier integration that passes in sandbox can still fail on the first real shipment.",
		body: "Carrier sandboxes often drift from production. Credentials, data validation, enabled products, account entitlements, and even the freshness of the API contract can differ. A green sandbox test proves your code can speak to one environment, not that the production account is ready.\n\nCompare environments with explicit evidence: correlation IDs, captured requests, response detail, and contract versions. Runbooks should assume drift is possible until production behavior has been observed directly.",
		sources: [
			{
				label: "Stripe — Testing vs Live Mode",
				url: "https://docs.stripe.com/testing-use-cases",
			},
		],
		relatedSlugs: ["health-checks", "oauth-token-lifecycle"],
	},
	{
		slug: "xsd",
		title: "XSD (XML Schema Definition)",
		summary:
			"The type system for SOAP messages — defines the shape of request and response data.",
		body: "XSD defines data types used in SOAP messages:\n\n- Simple types: string, decimal, integer, dateTime, enumerations\n- Complex types: structured objects with child elements and attributes\n- Restrictions: patterns, min/max values, required fields\n\nValidate your outgoing SOAP payloads against the XSD before sending. This catches type mismatches (e.g., sending '5 lbs' when a decimal is expected) with clear error messages instead of cryptic carrier faults.",
		sources: [
			{ label: "W3C XML Schema", url: "https://www.w3.org/TR/xmlschema-0/" },
		],
		relatedSlugs: ["wsdl", "soap-envelope"],
	},
];

export function getWikiBySlug(slug: string): WikiEntry | undefined {
	return wikiEntries.find((w) => w.slug === slug);
}
