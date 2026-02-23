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
		slug: "soap-1-envelope-namespaces",
		title: "SOAP Envelope & Namespaces",
		track: "soap",
		order: 5,
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
		order: 6,
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
		order: 7,
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
];

export function getLessonBySlug(slug: string): Lesson | undefined {
	return lessons.find((l) => l.slug === slug);
}

export function getLessonsByTrack(track: string): Lesson[] {
	return lessons
		.filter((l) => l.track === track)
		.sort((a, b) => a.order - b.order);
}
