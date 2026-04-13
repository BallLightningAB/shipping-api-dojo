/**
 * Incident Arena Scenarios — realistic carrier integration incidents
 */

import type { Scenario } from "./types";

export const scenarios: Scenario[] = [
	{
		id: "timeout-create-shipment",
		title: "Timeout on Create Shipment",
		summary:
			"Your POST /shipments request to the carrier times out after 30 seconds. Did the shipment get created?",
		difficulty: "beginner",
		steps: [
			{
				id: "start",
				text: "Your monitoring fires: POST /v1/shipments to CarrierX timed out after 30s. The customer is waiting for a shipping label. What do you do first?",
				choices: [
					{
						label: "Retry the POST immediately",
						nextStepId: "retry-blind",
						feedback:
							"Risky — the original request may have succeeded. You could create a duplicate shipment and charge the customer twice.",
						isCorrect: false,
					},
					{
						label: "Query recent shipments to check if it was created",
						nextStepId: "query-first",
						feedback: "Correct — check before retrying to avoid duplicates.",
						isCorrect: true,
					},
					{
						label: "Tell the customer to try again later",
						nextStepId: null,
						feedback:
							"Poor UX. You should attempt recovery before involving the customer.",
						isCorrect: false,
					},
				],
			},
			{
				id: "retry-blind",
				text: "You retried and got a 201 Created. But now there are two shipments for the same order. How do you fix this?",
				choices: [
					{
						label: "Cancel the duplicate via the carrier's void endpoint",
						nextStepId: "fix-duplicate",
						feedback:
							"Correct — void the duplicate immediately. Then add idempotency keys to prevent this in the future.",
						isCorrect: true,
					},
					{
						label: "Ignore it — the customer only sees one label",
						nextStepId: null,
						feedback:
							"Wrong — you'll be billed for both shipments. Always clean up duplicates.",
						isCorrect: false,
					},
				],
			},
			{
				id: "query-first",
				text: "You query GET /shipments?order_id=ORD-123 and find the shipment was created. What's your next step?",
				choices: [
					{
						label:
							"Return the existing shipment to the customer and add idempotency keys for future requests",
						nextStepId: null,
						feedback:
							"Perfect — use the existing shipment and prevent future duplicates with idempotency keys.",
						isCorrect: true,
					},
					{
						label:
							"Create a new shipment anyway since the old one might be stale",
						nextStepId: null,
						feedback:
							"No — the existing shipment is valid. Creating another wastes money and confuses the customer.",
						isCorrect: false,
					},
				],
			},
			{
				id: "fix-duplicate",
				text: "You voided the duplicate. What systemic fix do you implement?",
				choices: [
					{
						label:
							"Add Idempotency-Key header to all shipment creation requests",
						nextStepId: null,
						feedback:
							"Correct — idempotency keys let the carrier deduplicate retries server-side.",
						isCorrect: true,
					},
					{
						label: "Increase the timeout to 60 seconds",
						nextStepId: null,
						feedback:
							"Longer timeouts help but don't prevent duplicates. Idempotency keys are the real fix.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "rate-limit-429",
		title: "429 Rate Limiting Storm",
		summary:
			"Your batch shipment creation is getting hammered with 429 responses. Hundreds of shipments are queued.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "It's Black Friday. Your batch processor is creating 500 shipments and 60% are returning 429 Too Many Requests. The Retry-After header says 30 seconds. What's your immediate action?",
				choices: [
					{
						label:
							"Pause all requests and wait 30 seconds, then resume at full speed",
						nextStepId: "pause-resume",
						feedback:
							"Pausing is good, but resuming at full speed will trigger 429s again immediately.",
						isCorrect: false,
					},
					{
						label:
							"Implement exponential backoff with a token bucket to throttle requests",
						nextStepId: "backoff-throttle",
						feedback:
							"Correct — backoff respects the carrier's limits while a token bucket controls your send rate.",
						isCorrect: true,
					},
					{
						label: "Switch to a different carrier API endpoint",
						nextStepId: null,
						feedback:
							"Rate limits are account-wide, not per-endpoint. Switching endpoints won't help.",
						isCorrect: false,
					},
				],
			},
			{
				id: "pause-resume",
				text: "You waited 30s and resumed. 429s are back within 5 seconds. What now?",
				choices: [
					{
						label:
							"Implement a token bucket rate limiter that stays under the carrier's documented limit",
						nextStepId: "backoff-throttle",
						feedback:
							"Correct — you need to control your send rate, not just react to 429s.",
						isCorrect: true,
					},
					{
						label: "Keep retrying with increasing waits",
						nextStepId: null,
						feedback:
							"Without a rate limiter, you'll oscillate between bursts and waits. Implement proactive throttling.",
						isCorrect: false,
					},
				],
			},
			{
				id: "backoff-throttle",
				text: "Your rate limiter is working. But you have 300 shipments still queued. How do you ensure they all get processed?",
				choices: [
					{
						label:
							"Use a persistent job queue with retry logic and dead-letter queue for permanent failures",
						nextStepId: null,
						feedback:
							"Perfect — a persistent queue ensures no shipment is lost, and the dead-letter queue catches permanent failures for manual review.",
						isCorrect: true,
					},
					{
						label: "Process them in-memory and hope the server doesn't restart",
						nextStepId: null,
						feedback:
							"In-memory queues lose data on restart. Use a persistent queue (Redis, SQS, etc.) for reliability.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "soap-fault-detail",
		title: "SOAP Fault with Cryptic Detail",
		summary:
			"A SOAP shipment request returns a Fault. The faultstring says 'Processing Error.' Time to dig deeper.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "Your SOAP request to create a shipment returns:\n\n<faultstring>Processing Error</faultstring>\n<detail><ErrorCode>1234</ErrorCode><Field>Weight</Field></detail>\n\nWhat do you do?",
				choices: [
					{
						label: "Parse the detail element to extract ErrorCode and Field",
						nextStepId: "parsed-detail",
						feedback:
							"Correct — the detail element has the actionable info. The faultstring alone is useless.",
						isCorrect: true,
					},
					{
						label:
							"Log the faultstring and report 'Processing Error' to the user",
						nextStepId: null,
						feedback:
							"The faultstring is generic. Always parse the detail element for carrier-specific error codes and fields.",
						isCorrect: false,
					},
					{
						label:
							"Retry the request — processing errors are usually transient",
						nextStepId: null,
						feedback:
							"This is a validation error (specific field mentioned). Retrying the same payload will fail the same way.",
						isCorrect: false,
					},
				],
			},
			{
				id: "parsed-detail",
				text: "You extracted ErrorCode=1234, Field=Weight. Your shipment weight is '5 lbs'. Checking the WSDL, the Weight element expects a decimal with no units. What's the fix?",
				choices: [
					{
						label:
							"Send '5.0' as a plain decimal and specify units in a separate UnitOfMeasure element",
						nextStepId: "fixed",
						feedback:
							"Correct — SOAP APIs typically expect strongly typed values. Units go in their own element per the XSD.",
						isCorrect: true,
					},
					{
						label: "Send '5' as an integer",
						nextStepId: null,
						feedback:
							"The XSD expects a decimal type. '5' might work but '5.0' is more explicit and matches the schema.",
						isCorrect: false,
					},
				],
			},
			{
				id: "fixed",
				text: "The fix worked. How do you prevent this class of error?",
				choices: [
					{
						label:
							"Validate outgoing SOAP payloads against the XSD before sending",
						nextStepId: null,
						feedback:
							"Perfect — client-side XSD validation catches type mismatches before they hit the carrier, giving you better error messages.",
						isCorrect: true,
					},
					{
						label: "Add more try/catch blocks",
						nextStepId: null,
						feedback:
							"Error handling doesn't prevent the error. XSD validation catches it before the request is sent.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "wsdl-change-breaks",
		title: "WSDL Change Breaks Client",
		summary:
			"After a carrier's 'maintenance window,' your SOAP integration starts failing. They didn't tell you they changed the WSDL.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "Monday morning: all SOAP requests to CarrierY are failing with 'Unexpected element: ShipmentDetails.' This worked on Friday. What happened?",
				choices: [
					{
						label:
							"Download the current WSDL and diff it against your cached version",
						nextStepId: "diff-wsdl",
						feedback:
							"Correct — diffing the WSDL reveals what changed. This is the systematic approach.",
						isCorrect: true,
					},
					{
						label: "Contact carrier support and wait for a response",
						nextStepId: null,
						feedback:
							"Support may take days. Diff the WSDL yourself first — you can often fix it faster.",
						isCorrect: false,
					},
					{
						label: "Roll back to last week's deployment",
						nextStepId: null,
						feedback:
							"Your code didn't change — the carrier's contract did. Rolling back your code won't help.",
						isCorrect: false,
					},
				],
			},
			{
				id: "diff-wsdl",
				text: "The diff shows: 'ShipmentDetails' was renamed to 'ShipmentInfo' and a new required field 'ServiceLevel' was added. What's your fix?",
				choices: [
					{
						label:
							"Regenerate the client from the new WSDL, update your mapping layer, add the new required field",
						nextStepId: "regenerate",
						feedback:
							"Correct — regenerate, update mappings, and fill in the new required field with an appropriate default.",
						isCorrect: true,
					},
					{
						label:
							"Find-and-replace ShipmentDetails → ShipmentInfo in your SOAP templates",
						nextStepId: null,
						feedback:
							"This misses the new required field 'ServiceLevel' and is fragile. Regenerate from the WSDL instead.",
						isCorrect: false,
					},
				],
			},
			{
				id: "regenerate",
				text: "You've fixed the immediate issue. How do you prevent surprise WSDL changes from causing outages?",
				choices: [
					{
						label:
							"Set up automated WSDL monitoring that alerts on diffs and run contract tests in CI",
						nextStepId: null,
						feedback:
							"Perfect — automated monitoring catches changes early, and contract tests verify compatibility before deploy.",
						isCorrect: true,
					},
					{
						label: "Cache the WSDL and never update it",
						nextStepId: null,
						feedback:
							"Caching avoids surprise breaks but means you'll miss required changes and eventually drift too far from the carrier's contract.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "200-with-error-payload",
		title: "HTTP 200 with Error Payload",
		summary:
			"The carrier returns 200 OK but shipments are failing silently. Customers are complaining about missing labels.",
		difficulty: "beginner",
		steps: [
			{
				id: "start",
				text: 'Customers report missing shipping labels. Your logs show all carrier requests returned HTTP 200. But the response bodies contain:\n\n{"status": "error", "message": "Invalid account credentials"}\n\nYour code only checks the HTTP status. What\'s the root cause?',
				choices: [
					{
						label:
							"Your code assumes HTTP 200 = success, but the carrier embeds errors in the response body",
						nextStepId: "found-root-cause",
						feedback:
							"Correct — this is one of the most common carrier integration bugs. HTTP status alone is unreliable.",
						isCorrect: true,
					},
					{
						label: "The carrier's API is broken — 200 should mean success",
						nextStepId: null,
						feedback:
							"While it's bad API design, it's common in carrier APIs. You must handle the reality, not the ideal.",
						isCorrect: false,
					},
					{
						label: "The credentials are correct since we got a 200",
						nextStepId: null,
						feedback:
							"The 200 is misleading — read the body. The carrier is telling you the credentials are invalid.",
						isCorrect: false,
					},
				],
			},
			{
				id: "found-root-cause",
				text: "You've identified the bug. Your API credentials expired over the weekend. After fixing the credentials, how do you prevent this class of bug?",
				choices: [
					{
						label:
							"Add response body validation that checks for error indicators regardless of HTTP status",
						nextStepId: "body-validation",
						feedback:
							"Correct — always validate the response body for carrier-specific error patterns.",
						isCorrect: true,
					},
					{
						label: "Add an HTTP status code check for non-200 responses",
						nextStepId: null,
						feedback:
							"You already check status codes. The problem is that this carrier returns 200 for errors. Body validation is needed.",
						isCorrect: false,
					},
				],
			},
			{
				id: "body-validation",
				text: "You've added body validation. What else should you implement?",
				choices: [
					{
						label:
							"Credential expiry monitoring with proactive renewal alerts and a health check endpoint that validates carrier connectivity",
						nextStepId: null,
						feedback:
							"Perfect — proactive monitoring prevents expired credentials from causing silent failures. A health check endpoint catches auth issues before customers do.",
						isCorrect: true,
					},
					{
						label: "Just set a calendar reminder to rotate credentials",
						nextStepId: null,
						feedback:
							"Calendar reminders are unreliable. Automated monitoring and health checks are the professional solution.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "auth-token-expires-over-weekend",
		title: "Auth Token Expires Over Weekend",
		summary:
			"Your production token cache served an expired carrier token all weekend and now every worker is failing auth.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "Saturday night shipment writes start failing with 401 invalid_token. Refresh logs stopped ten minutes earlier, and every worker is reusing the same cached bearer token. What do you do first?",
				choices: [
					{
						label:
							"Inspect the shared token cache and force one controlled refresh path before retrying writes",
						nextStepId: "refresh-path",
						feedback:
							"Correct — confirm whether the cache is stale and recover the refresh path in a controlled way before every worker hammers the token endpoint.",
						isCorrect: true,
					},
					{
						label: "Have every worker request a fresh token immediately",
						nextStepId: null,
						feedback:
							"That turns one auth failure into a refresh storm. Recover the shared lifecycle first.",
						isCorrect: false,
					},
					{
						label:
							"Retry the same shipment requests until the carrier accepts them",
						nextStepId: null,
						feedback:
							"Retrying with an expired token only adds noise. Fix auth before replaying work.",
						isCorrect: false,
					},
				],
			},
			{
				id: "refresh-path",
				text: "You confirm the cache still holds an expired token and the refresh worker died. Which remediation is safest?",
				choices: [
					{
						label:
							"Invalidate the stale token, run a single-flight refresh, and gate worker retries on the fresh expiry metadata",
						nextStepId: "system-fix",
						feedback:
							"Correct — one refresh path plus expiry-aware retry control restores traffic without creating a second outage.",
						isCorrect: true,
					},
					{
						label: "Increase the cache TTL so workers stop refreshing so often",
						nextStepId: null,
						feedback:
							"A longer TTL would keep the expired token around even longer. The issue is lifecycle control, not refresh frequency alone.",
						isCorrect: false,
					},
				],
			},
			{
				id: "system-fix",
				text: "Traffic is flowing again. What permanent fix best prevents a repeat?",
				choices: [
					{
						label:
							"Add expiry-buffer refresh logic, refresh-failure alerts, and one shared token lifecycle per carrier credential set",
						nextStepId: null,
						feedback:
							"Correct — token lifecycle needs shared ownership, expiry skew, and telemetry so auth drift shows up before a weekend incident.",
						isCorrect: true,
					},
					{
						label:
							"Move token refresh into the frontend so users trigger it naturally",
						nextStepId: null,
						feedback:
							"Carrier auth belongs in the backend integration layer, not in a user-driven flow.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "duplicate-webhook-replay",
		title: "Duplicate Webhook Replay",
		summary:
			"The carrier retried the same webhook event repeatedly and your consumer advanced the shipment state more than once.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "A tracking webhook timed out once, then the carrier replayed the same event ID 14 times. Your shipment timeline now contains duplicate status notes. What is the correct first response?",
				choices: [
					{
						label:
							"Verify the signature, look up the event ID in a deduplication ledger, and short-circuit duplicate processing",
						nextStepId: "consumer-fix",
						feedback:
							"Correct — duplicates should be acknowledged as known events, not processed as new business actions.",
						isCorrect: true,
					},
					{
						label:
							"Process every retry because the carrier would not resend valid events",
						nextStepId: null,
						feedback:
							"Carriers absolutely resend valid events. Your consumer must be idempotent.",
						isCorrect: false,
					},
					{
						label:
							"Block the carrier IP address until support resolves the incident",
						nextStepId: null,
						feedback:
							"Blocking the source hides the symptom while losing legitimate updates. Fix consumer behavior first.",
						isCorrect: false,
					},
				],
			},
			{
				id: "consumer-fix",
				text: "You confirm every retry has the same signed payload. What systemic change is now required?",
				choices: [
					{
						label:
							"Persist processed event IDs with retention, keep the consumer idempotent, and acknowledge duplicates without side effects",
						nextStepId: null,
						feedback:
							"Correct — signature verification proves authenticity, while the event ledger and idempotent consumer prevent replays from mutating state twice.",
						isCorrect: true,
					},
					{
						label:
							"Disable webhook retries by returning 500 so the carrier stops trusting your endpoint",
						nextStepId: null,
						feedback:
							"Returning failures increases retries and makes the replay problem worse.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "out-of-order-tracking-events",
		title: "Out-of-Order Tracking Events",
		summary:
			"A later shipment status reached your webhook first, and the public tracking page regressed when older events arrived afterward.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "A shipment shows Delivered at 09:01, then Out for Delivery at 09:03 because the carrier published the older event late. What should your consumer trust?",
				choices: [
					{
						label:
							"Carrier event timestamps or sequence metadata, not arrival order at your webhook",
						nextStepId: "projection",
						feedback:
							"Correct — arrival order is not a reliable source of truth for carrier webhooks.",
						isCorrect: true,
					},
					{
						label: "Whichever event your queue processed first",
						nextStepId: null,
						feedback:
							"Queue order is an infrastructure detail, not a carrier contract.",
						isCorrect: false,
					},
					{
						label: "The event with the longest payload body",
						nextStepId: null,
						feedback:
							"Payload size has nothing to do with sequencing or business truth.",
						isCorrect: false,
					},
				],
			},
			{
				id: "projection",
				text: "You have both events and their timestamps. How should the public status model behave?",
				choices: [
					{
						label:
							"Keep a monotonic projection for customer-facing status while preserving the raw event timeline for debugging",
						nextStepId: null,
						feedback:
							"Correct — customers should not see status regressions, but engineers still need the raw timeline to diagnose ordering behavior.",
						isCorrect: true,
					},
					{
						label:
							"Always overwrite the current status with the newest arriving event",
						nextStepId: null,
						feedback:
							"That would recreate the regression every time an older event arrives late.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "partial-label-generation-downstream-persistence-failure",
		title: "Partial Label Generation with Downstream Persistence Failure",
		summary:
			"The carrier created the label, but your internal write failed before the shipment record was committed.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "The carrier returned a tracking number and label URL, then your database transaction rolled back. A retry worker is about to replay the create-shipment request. What is the safest next step?",
				choices: [
					{
						label:
							"Search by the original client reference or operation key before issuing any new carrier write",
						nextStepId: "reconcile",
						feedback:
							"Correct — the carrier may already hold the successful artifact, so you need evidence before any replay.",
						isCorrect: true,
					},
					{
						label:
							"Let the retry worker run immediately so the internal record exists",
						nextStepId: null,
						feedback:
							"That risks creating a second label and billing event for the same shipment.",
						isCorrect: false,
					},
					{
						label:
							"Assume the carrier result is unusable because your database failed",
						nextStepId: null,
						feedback:
							"The carrier artifact still exists and may need to be reconciled or voided explicitly.",
						isCorrect: false,
					},
				],
			},
			{
				id: "reconcile",
				text: "You confirm there is already one label at the carrier for the original operation. What recovery path is safest?",
				choices: [
					{
						label:
							"Replay only the internal persistence step against the original operation ID, or compensate by voiding the existing label if policy requires it",
						nextStepId: null,
						feedback:
							"Correct — recovery must stay attached to the original operation so you do not create a second external artifact.",
						isCorrect: true,
					},
					{
						label:
							"Create a second label and mark the first one stale in a comment",
						nextStepId: null,
						feedback:
							"That compounds the split-brain state and increases cost exposure.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "missing-correlation-id-support-escalation",
		title: "Missing Correlation ID During Support Escalation",
		summary:
			"A live carrier incident needs support escalation, but the request logs never captured a correlation or transaction ID.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "Carrier support asks for the transaction ID tied to a failed shipment request. Your alert only contains the order number and a generic 422 response. What should you do now?",
				choices: [
					{
						label:
							"Reconstruct the request from time window, account, and payload evidence while patching the outbound path to enforce correlation IDs immediately",
						nextStepId: "runbook-fix",
						feedback:
							"Correct — you still need enough evidence to work the incident, and you should stop the observability gap from repeating on the next request.",
						isCorrect: true,
					},
					{
						label:
							"Tell support you cannot help until the carrier finds it themselves",
						nextStepId: null,
						feedback:
							"That abandons the live incident and leaves the systemic gap untouched.",
						isCorrect: false,
					},
					{
						label:
							"Retry the shipment until a new request returns a correlation ID",
						nextStepId: null,
						feedback:
							"Blind retries create more noise and may duplicate the original write.",
						isCorrect: false,
					},
				],
			},
			{
				id: "runbook-fix",
				text: "The incident is contained. Which long-term fix has the highest leverage?",
				choices: [
					{
						label:
							"Require correlation IDs on every outbound request, log them in structured events, and add them to support runbooks and alerts",
						nextStepId: null,
						feedback:
							"Correct — correlation discipline is only useful when it is enforced in code, logs, alerts, and escalation docs together.",
						isCorrect: true,
					},
					{
						label: "Add longer stack traces to the error page",
						nextStepId: null,
						feedback:
							"Longer stack traces do not replace a missing request identifier shared with the carrier.",
						isCorrect: false,
					},
				],
			},
		],
	},
];

export function getScenarioById(id: string): Scenario | undefined {
	return scenarios.find((s) => s.id === id);
}
