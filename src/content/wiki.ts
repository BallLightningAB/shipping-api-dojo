/**
 * Wiki Entries — 12+ reference articles for carrier integration concepts
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
