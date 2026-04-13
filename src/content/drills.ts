/**
 * Drill Content — All drills referenced by lessons
 */

import type { Drill } from "./types";

export const drills: Drill[] = [
	// === Intro drills ===
	{
		id: "intro-mcq-1",
		type: "mcq",
		question:
			"What makes carrier APIs particularly challenging compared to typical REST APIs?",
		options: [
			"They use newer HTTP versions",
			"Inconsistent error formats, undocumented limits, and partial success responses",
			"They require GraphQL knowledge",
			"They only support GET requests",
		],
		correctIndex: 1,
		explanation:
			"Carrier APIs are challenging because of inconsistent error formats across carriers, undocumented rate limits, partial success responses, and legacy SOAP endpoints.",
	},
	{
		id: "intro-mcq-2",
		type: "mcq",
		question:
			"A carrier returns HTTP 200 but the response body contains an error. What should you do?",
		options: [
			"Trust the HTTP status code — 200 means success",
			"Always parse the response body and check for error indicators regardless of status code",
			"Retry the request since 200 is ambiguous",
			"Log it and move on",
		],
		correctIndex: 1,
		explanation:
			"Some carriers return 200 for all responses, embedding errors in the body. Always parse and validate the response body, not just the HTTP status.",
	},

	// === REST-1 drills ===
	{
		id: "rest1-mcq-1",
		type: "mcq",
		question: "Which HTTP method is idempotent?",
		options: ["POST", "PATCH", "PUT", "None of the above"],
		correctIndex: 2,
		explanation:
			"PUT is idempotent — calling it multiple times with the same payload produces the same result. POST is not idempotent; each call may create a new resource.",
	},
	{
		id: "rest1-mcq-2",
		type: "mcq",
		question:
			"Your POST /shipments request times out. What is the safest next step?",
		options: [
			"Immediately retry the POST",
			"Query recent shipments to check if it was created, then retry with an idempotency key if not",
			"Assume it failed and create a new shipment",
			"Wait 24 hours and check manually",
		],
		correctIndex: 1,
		explanation:
			"A timeout on POST is ambiguous — the shipment may have been created. Query first, then retry with an idempotency key to avoid duplicates.",
	},
	{
		id: "rest1-cloze-1",
		type: "cloze",
		template:
			"Use ___ backoff with ___ to avoid thundering herd. Start at ___s, cap at ___ retries. Never retry ___ errors except 429.",
		answers: ["exponential", "jitter", "1", "5", "4xx"],
		explanation:
			"Exponential backoff with jitter prevents synchronized retries. Start at 1s, cap at 5 retries. 4xx errors (except 429) are permanent and should not be retried.",
	},

	// === REST-2 drills ===
	{
		id: "rest2-mcq-1",
		type: "mcq",
		question:
			"Why should you cache OAuth 2.0 tokens instead of requesting a new one per API call?",
		options: [
			"Tokens are expensive to generate",
			"To avoid hitting the token endpoint's rate limit",
			"OAuth tokens never expire",
			"Caching is optional and has no practical benefit",
		],
		correctIndex: 1,
		explanation:
			"Carrier token endpoints have rate limits. Requesting a new token per call wastes quota and can get you throttled. Cache tokens and refresh proactively before expiry.",
	},
	{
		id: "rest2-builder-1",
		type: "builder.rest",
		prompt:
			"Build a POST request to create a shipment at https://api.carrier.com/v1/shipments with Bearer auth, JSON content type, and a correlation ID.",
		method: "POST",
		url: "https://api.carrier.com/v1/shipments",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer <token>",
			"X-Correlation-ID": "<uuid>",
		},
		body: '{"origin": "...", "destination": "..."}',
		expectedOutput: `POST /v1/shipments HTTP/1.1
Host: api.carrier.com
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Correlation-ID: <uuid>`,
		explanation:
			"A proper carrier request includes Content-Type, Accept, Authorization, and a correlation ID for traceability. The correlation ID links your logs to the carrier's logs.",
	},

	// === REST-3 drills ===
	{
		id: "rest3-mcq-1",
		type: "mcq",
		question: "What is the RFC 9457 Problem Details format used for?",
		options: [
			"Defining API rate limits",
			"Standardizing error response format across APIs",
			"Authenticating API requests",
			"Paginating large result sets",
		],
		correctIndex: 1,
		explanation:
			"RFC 9457 Problem Details (application/problem+json) provides a standard error format with type, title, status, detail, and instance fields.",
	},
	{
		id: "rest3-cloze-1",
		type: "cloze",
		template:
			"Classify errors into three categories: ___ (503, 429), ___ (400, 404), and ___ (500, timeout on POST).",
		answers: ["retryable", "permanent", "ambiguous"],
		explanation:
			"Retryable errors (503, 429) should be queued for retry. Permanent errors (400, 404) should fail fast. Ambiguous errors (500, timeout) need investigation.",
	},

	// === REST-4 drills ===
	{
		id: "rest4-mcq-1",
		type: "mcq",
		question:
			"Why is cursor-based pagination more reliable than offset-based for carrier tracking data?",
		options: [
			"Cursors are faster",
			"New records inserted during pagination don't cause duplicates or skips",
			"Cursors use less bandwidth",
			"Offset-based pagination is deprecated",
		],
		correctIndex: 1,
		explanation:
			"With offset pagination, new records shift the dataset, causing duplicates or missed items. Cursor pagination uses a stable pointer, making it reliable for real-time data.",
	},
	{
		id: "rest4-mcq-2",
		type: "mcq",
		question:
			"What should a webhook receiver do first when it gets a carrier tracking update?",
		options: [
			"Process the tracking update and update the database",
			"Return 200 immediately, then process asynchronously",
			"Validate the payload schema",
			"Forward it to the frontend",
		],
		correctIndex: 1,
		explanation:
			"Return 200 quickly to prevent the carrier from retrying. Process the event asynchronously. If you take too long, carriers will retry and you'll get duplicates.",
	},
	{
		id: "rest7-mcq-1",
		type: "mcq",
		question:
			"A carrier is returning 429 with Retry-After: 45 during a bulk-label run. What is the best immediate response?",
		options: [
			"Retry each failed request in parallel after 45 seconds",
			"Honor Retry-After, reduce the worker send rate, and let the queue drain under a throttle",
			"Switch all requests to a different endpoint",
			"Ignore Retry-After and continue until the carrier hard-blocks the account",
		],
		correctIndex: 1,
		explanation:
			"Retry-After is a direct traffic-control signal. You need to slow the system down at the worker and queue level, not simply replay the same burst later.",
	},
	{
		id: "rest7-mcq-2",
		type: "mcq",
		question:
			"Which design best prevents a 429 incident from becoming an internal queue outage?",
		options: [
			"Unlimited queue growth plus aggressive worker retries",
			"A token bucket or similar throttle paired with queue-level backpressure and dead-letter handling",
			"One giant cron job that restarts from the beginning after every failure",
			"Disabling retries entirely so the workers fail fast",
		],
		correctIndex: 1,
		explanation:
			"Carrier throttling needs both a send-rate control and queue-level backpressure. Without both, the bottleneck just shifts and the queue keeps growing.",
	},
	{
		id: "rest8-mcq-1",
		type: "mcq",
		question:
			"A bulk shipment API created 8 labels, rejected 2 packages, and returned one overall 200 response. What should your integration do next?",
		options: [
			"Mark the entire batch successful because the HTTP status was 200",
			"Store item-level outcomes, surface the rejected packages, and run compensation or retry only where needed",
			"Retry the entire batch so every item ends in the same state",
			"Delete the successful labels because the batch was not fully clean",
		],
		correctIndex: 1,
		explanation:
			"Partial success is a workflow result, not a transport bug. You need per-item state and selective compensation instead of all-or-nothing handling.",
	},
	{
		id: "rest8-mcq-2",
		type: "mcq",
		question:
			"The carrier created a label, but your internal save failed immediately afterward. Which response is safest?",
		options: [
			"Create a second label so the database record has a fresh identifier",
			"Treat the operation as successful only if both systems committed together",
			"Use compensation or replay keyed to the original operation ID so you do not create a second carrier artifact",
			"Drop the job and let support discover it later",
		],
		correctIndex: 2,
		explanation:
			"When the carrier succeeded but your internal persistence failed, you need compensation or idempotent replay against the original operation. Creating a second label makes the split-brain state worse.",
	},
	{
		id: "rest10-mcq-1",
		type: "mcq",
		question:
			"Your shipment flow passes in sandbox but production rejects the same request body. What is the best first hypothesis?",
		options: [
			"The production carrier is definitely down",
			"Sandbox and production differ in credentials, validation rules, or data requirements even when the endpoint shape matches",
			"HTTP clients behave differently on weekdays",
			"The request body must be compressed in production only",
		],
		correctIndex: 1,
		explanation:
			"Carrier sandboxes often lag production and may skip stricter validation, permissions, or account setup rules. You need environment-specific evidence before assuming an outage.",
	},
	{
		id: "rest10-mcq-2",
		type: "mcq",
		question:
			"Which telemetry pair is most useful when diagnosing sandbox-versus-production drift?",
		options: [
			"Browser console logs and CSS source maps",
			"Correlation IDs plus environment-specific request or response evidence",
			"Only the final user-facing error string",
			"A screenshot of the carrier dashboard",
		],
		correctIndex: 1,
		explanation:
			"You need traceable evidence by environment. Correlation IDs and captured request or response detail let you compare sandbox and production behavior without guessing.",
	},

	// === SOAP-1 drills ===
	{
		id: "soap1-mcq-1",
		type: "mcq",
		question: "What are the two main child elements of a SOAP Envelope?",
		options: [
			"Request and Response",
			"Header and Body",
			"Auth and Payload",
			"Schema and Data",
		],
		correctIndex: 1,
		explanation:
			"A SOAP Envelope contains an optional Header (metadata, auth) and a required Body (the actual request/response payload).",
	},
	{
		id: "soap1-builder-1",
		type: "builder.soap",
		prompt:
			"Build a SOAP 1.1 envelope to call CreateShipment in the carrier namespace http://carrier.com/shipping/v1.",
		soapAction: "http://carrier.com/shipping/v1/CreateShipment",
		namespace: "http://carrier.com/shipping/v1",
		bodyFields: {
			Origin: "US",
			Destination: "DE",
			Weight: "5.0",
		},
		expectedEnvelope: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:car="http://carrier.com/shipping/v1">
  <soap:Header/>
  <soap:Body>
    <car:CreateShipment>
      <car:Origin>US</car:Origin>
      <car:Destination>DE</car:Destination>
      <car:Weight>5.0</car:Weight>
    </car:CreateShipment>
  </soap:Body>
</soap:Envelope>`,
		explanation:
			"The SOAP envelope declares the SOAP and carrier namespaces, uses the carrier namespace prefix for the operation and its child elements.",
	},

	// === SOAP-2 drills ===
	{
		id: "soap2-mcq-1",
		type: "mcq",
		question: "What does a WSDL file define?",
		options: [
			"Only the endpoint URL",
			"Services, ports, operations, messages, and types (the full contract)",
			"Only request schemas",
			"Database connection strings",
		],
		correctIndex: 1,
		explanation:
			"WSDL is the complete service contract: services (endpoints), ports (bindings), operations (methods), messages (shapes), and types (XSD schemas).",
	},
	{
		id: "soap2-mcq-2",
		type: "mcq",
		question: "A carrier updates their WSDL. What should you do?",
		options: [
			"Ignore it — WSDLs rarely change in meaningful ways",
			"Regenerate client code from the new WSDL and diff to find breaking changes",
			"Manually update your SOAP templates",
			"Switch to REST",
		],
		correctIndex: 1,
		explanation:
			"Regenerating from the WSDL and diffing catches breaking changes (renamed elements, new required fields, changed types) before they hit production.",
	},

	// === SOAP-3 drills ===
	{
		id: "soap3-mcq-1",
		type: "mcq",
		question:
			"Which part of a SOAP Fault contains the most actionable error information?",
		options: ["faultcode", "faultstring", "faultactor", "detail"],
		correctIndex: 3,
		explanation:
			"The detail element contains carrier-specific error codes, affected fields, and resolution hints. faultstring is often generic and not actionable.",
	},
	{
		id: "soap3-cloze-1",
		type: "cloze",
		template:
			"When logging SOAP errors, always include: your ___, the full ___ (scrub auth), the full ___, parsed ___, and the carrier ___ URL.",
		answers: [
			"correlation ID",
			"request",
			"response",
			"error codes",
			"endpoint",
		],
		explanation:
			"Complete logging of correlation ID, request, response, error codes, and endpoint URL gives you everything needed to diagnose production issues.",
	},
];

export function getDrillById(id: string): Drill | undefined {
	return drills.find((d) => d.id === id);
}

export function getDrillsByIds(ids: string[]): Drill[] {
	return ids
		.map((id) => drills.find((d) => d.id === id))
		.filter(Boolean) as Drill[];
}
