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
	{
		id: "intro-mcq-3",
		type: "mcq",
		question:
			"A carrier returns HTTP 202 Accepted for shipment creation, but the body contains a rejection code and no tracking identifier. What should your integration conclude?",
		options: [
			"The shipment definitely succeeded because 202 is a success-range status",
			"The transport signal is not enough; inspect the body and treat the operation as failed or ambiguous until the carrier state is confirmed",
			"202 responses can be ignored because the carrier will always send a webhook later",
			"The only correct action is to retry immediately with a different payload",
		],
		correctIndex: 1,
		explanation:
			"Transport-level success signals do not override business-level error content. Carrier APIs often require you to inspect the body and downstream evidence before deciding whether the shipment exists.",
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
		id: "rest2-mcq-2",
		type: "mcq",
		question:
			"Your OAuth access token expires every 30 minutes, but your workers can process long queues for hours. Which design is safest?",
		options: [
			"Refresh the token only after the carrier rejects a request with 401",
			"Store token expiry metadata, reuse cached tokens, and refresh slightly before expiry under a shared lock or cache discipline",
			"Generate one permanent token per worker at startup and never rotate it",
			"Attach the refresh token directly to every carrier API request",
		],
		correctIndex: 1,
		explanation:
			"Production workers need a shared token lifecycle strategy. Waiting for 401s increases avoidable failures, while proactive refresh under coordination avoids token stampedes and stale-token races.",
	},
	{
		id: "rest2-mcq-3",
		type: "mcq",
		question:
			"Several workers notice the same token is near expiry at once. What failure mode are you trying to prevent with coordinated refresh?",
		options: [
			"Browsers automatically deleting local storage",
			"A token refresh stampede that hammers the auth endpoint and can create inconsistent token state across workers",
			"Problem Details errors becoming invalid JSON",
			"Webhook retries from the carrier",
		],
		correctIndex: 1,
		explanation:
			"When many workers refresh simultaneously, they can overload the auth endpoint or race on which token version is current. Shared caching or a refresh lock prevents self-inflicted auth instability.",
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
	{
		id: "rest2-builder-2",
		type: "builder.rest",
		prompt:
			"Build a GET request to https://api.carrier.com/v1/shipments/abc123 that uses Bearer auth, Accept: application/json, and a correlation ID for traceability.",
		method: "GET",
		url: "https://api.carrier.com/v1/shipments/abc123",
		headers: {
			Accept: "application/json",
			Authorization: "Bearer <token>",
			"X-Correlation-ID": "<uuid>",
		},
		body: "",
		expectedOutput: `GET /v1/shipments/abc123 HTTP/1.1
Host: api.carrier.com
Accept: application/json
Authorization: Bearer <token>
X-Correlation-ID: <uuid>`,
		explanation:
			"Even read calls should carry the auth token and correlation ID needed for traceability. GET requests typically omit the JSON content-type header because there is no request body.",
	},
	{
		id: "rest2-builder-3",
		type: "builder.rest",
		prompt:
			"Build a POST request to https://api.carrier.com/v1/tokens/refresh that sends JSON, accepts JSON, and includes a correlation ID without reusing the stale access token in the Authorization header.",
		method: "POST",
		url: "https://api.carrier.com/v1/tokens/refresh",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-Correlation-ID": "<uuid>",
		},
		body: '{"refreshToken": "<refresh-token>"}',
		expectedOutput: `POST /v1/tokens/refresh HTTP/1.1
Host: api.carrier.com
Content-Type: application/json
Accept: application/json
X-Correlation-ID: <uuid>`,
		explanation:
			"Refresh flows still need clear request structure and traceability. They should not blindly reuse an expired access token in the request headers when the refresh token or refresh payload is the real credential path.",
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
		id: "rest3-mcq-2",
		type: "mcq",
		question:
			"A carrier returns `{ code: 'BAD_WEIGHT', message: 'Invalid parcel weight' }` with HTTP 400. What should your integration boundary do?",
		options: [
			"Expose the raw carrier payload directly to every upstream caller",
			"Translate it once into your normalized error contract with stable category, status, and actionable detail",
			"Retry automatically because the payload is not already in Problem Details format",
			"Convert every carrier error into HTTP 500 to keep the contract simple",
		],
		correctIndex: 1,
		explanation:
			"Your integration boundary should normalize carrier-specific error shapes into one internal contract. That keeps upstream systems stable even when carriers disagree on field names or formatting.",
	},
	{
		id: "rest3-mcq-3",
		type: "mcq",
		question:
			"Why is one normalized problem taxonomy better than passing through each carrier's native error shape?",
		options: [
			"Because normalization lets you delete the original carrier evidence immediately",
			"Because upstream retry, UX, and alerting rules can key off stable categories instead of reverse-engineering every carrier payload",
			"Because normalized errors are always shorter than carrier payloads",
			"Because HTTP clients cannot parse arbitrary JSON error bodies",
		],
		correctIndex: 1,
		explanation:
			"Normalization gives the rest of your system a stable contract for retry logic, user messaging, and observability. You can still retain the original carrier payload as evidence without forcing every caller to understand it.",
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
	{
		id: "rest3-cloze-2",
		type: "cloze",
		template:
			"Classify a carrier timeout on POST as ___ until you confirm state, treat malformed input as ___, and treat a transient upstream 503 as ___.",
		answers: ["ambiguous", "permanent", "retryable"],
		explanation:
			"Timeouts on write operations are ambiguous because the carrier may already have acted. Validation failures are permanent, while upstream outages such as 503 are retryable under controlled backoff.",
	},
	{
		id: "rest3-cloze-3",
		type: "cloze",
		template:
			"When normalizing carrier failures, separate ___ decisions, ___ decisions, and ___ decisions so every upstream caller is not forced to reinterpret raw payloads.",
		answers: ["retry", "fail-fast", "investigation"],
		explanation:
			"A useful error taxonomy drives action. By splitting retry, fail-fast, and investigation paths once at the integration boundary, you stop error handling from becoming a carrier-by-carrier guessing game.",
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
		id: "rest4-mcq-3",
		type: "mcq",
		question:
			"A polling job paginates through tracking events using `offset=0,100,200...` while new events are inserted continuously. What is the main risk?",
		options: [
			"Offset pagination becomes more secure because the dataset is active",
			"Records can shift between pages, causing duplicates or skipped events during the same sync run",
			"New events are automatically sorted into the final page only",
			"Offset pagination stops working only when the HTTP status is 206",
		],
		correctIndex: 1,
		explanation:
			"When the underlying dataset changes during an offset-based scan, page boundaries drift. That can duplicate records or skip events that move between offsets while the sync is in flight.",
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
		id: "rest9-mcq-1",
		type: "mcq",
		question:
			"A carrier webhook includes a valid signature and a stable event ID, but the same event arrives again 90 seconds later. What should your receiver do first?",
		options: [
			"Re-run the full business workflow because a valid signature means the event is new",
			"Check the event ID against a deduplication store, acknowledge quickly, and skip duplicate side effects if it was already processed",
			"Reject the webhook with 401 so the carrier stops sending retries",
			"Forward the event to the frontend before you decide whether it is a replay",
		],
		correctIndex: 1,
		explanation:
			"Signature verification only proves authenticity. Replay safety still depends on event-ID deduplication and a fast acknowledgement path that prevents duplicate downstream work.",
	},
	{
		id: "rest9-mcq-2",
		type: "mcq",
		question:
			"Your webhook handler verifies the signature, writes directly to three downstream systems, and only then returns 200. What is the main operational risk?",
		options: [
			"The signature becomes invalid once the body is parsed",
			"The carrier may time out and retry, causing replay pressure or duplicate side effects while your slow inline work is still running",
			"Returning 200 after downstream writes makes the webhook invisible to observability tools",
			"Carriers require every webhook to be processed synchronously before acknowledgement",
		],
		correctIndex: 1,
		explanation:
			"Even valid events should be acknowledged quickly. Slow inline fan-out increases retry pressure and makes replay or duplicate-processing incidents much more likely.",
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
		id: "soap2-mcq-3",
		type: "mcq",
		question:
			"Why should a SOAP client treat the WSDL as the contract source instead of copying one sample XML request from documentation?",
		options: [
			"Because the WSDL captures operations, bindings, and types that a single sample request does not cover",
			"Because WSDL files automatically generate production credentials",
			"Because carriers reject any SOAP request not pasted directly from their docs",
			"Because the WSDL is only needed for local development and not for production integrations",
		],
		correctIndex: 0,
		explanation:
			"A sample request is only one illustration. The WSDL defines the actual contract surface: operations, bindings, messages, and types that your generated client and validation logic should follow.",
	},
	{
		id: "soap2-mcq-4",
		type: "mcq",
		question:
			"Which WSDL detail most directly tells you how a SOAP operation is exposed on the wire?",
		options: [
			"The binding and port definitions that connect an operation to a protocol and endpoint",
			"The carrier support email address",
			"The HTTP cache headers returned by the last response",
			"The XML comments at the top of the file",
		],
		correctIndex: 0,
		explanation:
			"The WSDL binding and port sections tell you how an operation is actually exposed, including the protocol details and endpoint association that your client must call correctly.",
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
	{
		id: "soap2-mcq-5",
		type: "mcq",
		question:
			"A carrier adds a new required element to the WSDL but your manually maintained XML template still validates locally against nothing. What is the safest response?",
		options: [
			"Keep sending the old template until the carrier rejects enough requests to prove the change matters",
			"Regenerate from the updated WSDL or XSD, diff the new contract, and update validation before production traffic depends on the stale template",
			"Copy only the new element name from the docs into the old template and skip regeneration",
			"Switch the failing operation to REST because SOAP contract drift is unavoidable",
		],
		correctIndex: 1,
		explanation:
			"Contract drift needs a contract-driven response. Regeneration and diff review expose new required fields and type changes before they turn into production faults.",
	},
	{
		id: "soap2-mcq-6",
		type: "mcq",
		question:
			"Which signal most strongly suggests the carrier contract changed rather than the network simply flaking?",
		options: [
			"Repeated parser or validation faults against the same operation after a documented WSDL update",
			"A single 504 timeout during peak traffic",
			"One delayed webhook from another system",
			"A frontend user refreshing the page twice",
		],
		correctIndex: 0,
		explanation:
			"Consistent schema or parser failures after a WSDL update usually point to contract drift. Timeouts and unrelated delivery delays are operational signals, not strong evidence that the contract changed.",
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
		id: "soap3-mcq-2",
		type: "mcq",
		question:
			"A SOAP fault returns `faultstring='Validation error'` and a `detail` block that names `PackageWeight` as invalid. Which field should drive the first repair step?",
		options: [
			"The generic faultstring because it is always the most human readable",
			"The `detail` block because it identifies the concrete field or carrier code that failed",
			"The HTTP status line because SOAP faults never include useful body detail",
			"The XML declaration because version mismatches cause all validation errors",
		],
		correctIndex: 1,
		explanation:
			"SOAP fault detail is where the actionable evidence lives. Generic faultstrings may tell you the class of failure, but the `detail` block is what identifies which field, type, or contract rule actually broke.",
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
	{
		id: "rest9-cloze-1",
		type: "cloze",
		template:
			"When investigating webhook replay or ordering incidents, log the carrier ___ ID, your internal ___ ID, the signature-verification ___, the event ___, and the queue or worker ___ that handled it.",
		answers: ["event", "correlation", "result", "timestamp", "attempt"],
		explanation:
			"Replay analysis needs both the carrier event identity and your internal processing trail. Without signature results, timestamps, and attempt metadata, you cannot reconstruct whether the replay was authentic, delayed, or duplicated internally.",
	},
	{
		id: "rest9-cloze-2",
		type: "cloze",
		template:
			"For asynchronous webhook handlers, log the raw-body hash, validated ___, downstream ___ status, deduplication ___, and the final acknowledgement ___ sent back to the carrier.",
		answers: ["signature", "enqueue", "decision", "code"],
		explanation:
			"Webhook troubleshooting depends on the exact trust and processing path: whether the signature was valid, whether async handoff succeeded, whether deduplication suppressed the event, and what acknowledgement went back to the carrier.",
	},
	{
		id: "soap4-mcq-1",
		type: "mcq",
		question:
			"A generated SOAP payload uses ServiceLevel='Express Saver', but the XSD only allows EXPRESS_SAVER. What is the best fix?",
		options: [
			"Retry the same payload because enum faults are often transient",
			"Normalize the outbound value to the schema-defined enum before sending and validate it in preflight",
			"Move ServiceLevel into the SOAP header so the body stays simpler",
			"Strip the element and let the carrier choose a default",
		],
		correctIndex: 1,
		explanation:
			"Schema enums are strict contract values. Normalize your internal representation to the XSD-defined enum and validate before sending so the mismatch fails locally instead of at the carrier boundary.",
	},
	{
		id: "soap4-mcq-2",
		type: "mcq",
		question:
			"A carrier expects PackageWeight as an XSD decimal, but your XML contains '5 lbs'. Which repair is correct?",
		options: [
			"Keep the same field and rely on the carrier to coerce the value",
			"Send a plain decimal value such as 5.0 and express units in the schema-defined unit field",
			"Wrap the weight in CDATA so the carrier ignores type validation",
			"Base64-encode the field to avoid XML parser issues",
		],
		correctIndex: 1,
		explanation:
			"Type restrictions still apply inside XML. Decimal content belongs in the typed element, while units belong in the separate contract field if the schema defines one.",
	},
	{
		id: "soap5-mcq-1",
		type: "mcq",
		question:
			"Where should SOAP auth tokens and transaction IDs usually live when the carrier contract defines them explicitly?",
		options: [
			"In the SOAP Header using the namespaces and element names required by the contract",
			"Inline inside the shipment body payload so everything is in one place",
			"In XML comments so they do not affect schema validation",
			"Only in local application logs, not in the request",
		],
		correctIndex: 0,
		explanation:
			"SOAP metadata such as auth and transaction identifiers belongs in the header contract. If you place it in the body or omit the namespace contract, the carrier can reject the request even though the XML is otherwise well formed.",
	},
	{
		id: "soap5-builder-1",
		type: "builder.soap",
		prompt:
			"Build a SOAP 1.1 envelope for CreateShipment with a WS-Security UsernameToken header and a carrier transaction ID header.",
		soapAction: "http://carrier.com/shipping/v2/CreateShipment",
		namespace: "http://carrier.com/shipping/v2",
		bodyFields: {
			Origin: "SE",
			Destination: "NL",
			ServiceLevel: "EXPRESS_SAVER",
		},
		expectedEnvelope: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:car="http://carrier.com/shipping/v2" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soap:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>api-user</wsse:Username>
        <wsse:Password>token-or-secret</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
    <car:TransactionId>corr-12345</car:TransactionId>
  </soap:Header>
  <soap:Body>
    <car:CreateShipment>
      <car:Origin>SE</car:Origin>
      <car:Destination>NL</car:Destination>
      <car:ServiceLevel>EXPRESS_SAVER</car:ServiceLevel>
    </car:CreateShipment>
  </soap:Body>
</soap:Envelope>`,
		explanation:
			"When a carrier defines auth and transaction metadata in SOAP headers, the namespace and element placement are part of the contract. The business payload stays in the Body while auth and traceability stay in the Header.",
	},
	{
		id: "soap6-mcq-1",
		type: "mcq",
		question:
			"Monday morning SOAP calls fail right after a carrier maintenance window, and your own app did not deploy. What should you do first?",
		options: [
			"Download the current WSDL or schema contract and diff it against the version your client was generated from",
			"Roll back your app immediately because a hidden deploy must have happened",
			"Disable all alerting until the carrier posts an incident note",
			"Switch the integration from SOAP to REST the same day",
		],
		correctIndex: 0,
		explanation:
			"When the external contract may have changed, contract diffing is the fastest way to confirm whether the failure is caused by drift rather than your runtime or infrastructure.",
	},
	{
		id: "soap6-mcq-2",
		type: "mcq",
		question:
			"After regenerating a SOAP client from an updated WSDL, what is the safest rollout strategy?",
		options: [
			"Deploy globally as soon as the code generator succeeds",
			"Run contract tests against the regenerated client, then canary safe traffic before reopening the full workload",
			"Keep the new client only in staging and never compare it with production",
			"Hand-edit the generated code until it matches the old runtime behavior",
		],
		correctIndex: 1,
		explanation:
			"Generated-code success does not prove contract compatibility. Contract tests and a controlled canary reduce the blast radius if the carrier changed more than the obvious schema names.",
	},
	{
		id: "soap7-mcq-1",
		type: "mcq",
		question:
			"Which mapping is most useful when normalizing SOAP faults into your internal error model?",
		options: [
			"Map every fault to one generic upstream 500 because SOAP is legacy anyway",
			"Separate validation, auth, contract-drift, and transient dependency failures based on fault detail and carrier codes",
			"Preserve only the faultstring because nested detail is too carrier-specific",
			"Use the HTTP status code only and ignore the SOAP body",
		],
		correctIndex: 1,
		explanation:
			"SOAP faults need semantic classification. Distinguishing validation, auth, contract, and transient faults is what drives correct retry, escalation, and customer-facing behavior.",
	},
	{
		id: "soap7-cloze-1",
		type: "cloze",
		template:
			"Map SOAP faults into internal categories such as ___, ___, and ___ so retry logic and escalation paths stay consistent.",
		answers: ["validation", "authentication", "transient dependency failure"],
		explanation:
			"SOAP fault handling works best when the XML-specific details collapse into stable internal categories that the rest of the system already understands.",
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
