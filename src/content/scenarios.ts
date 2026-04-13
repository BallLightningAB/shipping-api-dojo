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
	{
		id: "carrier-maintenance-window-breaks-scheduled-jobs",
		title: "Carrier Maintenance Window Breaks Scheduled Jobs",
		summary:
			"A carrier maintenance window changed the SOAP contract and your scheduled jobs started failing before anyone was online.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "At 05:10 the nightly shipment batch starts failing with 'Unexpected element' faults right after a carrier maintenance window ended. Your app did not deploy overnight. What is the best first move?",
				choices: [
					{
						label:
							"Download the current WSDL or schema contract, compare it with the generated version in production, and pause the failing job class",
						nextStepId: "contract-check",
						feedback:
							"Correct — treat this as potential contract drift first and stop the scheduler from amplifying the breakage.",
						isCorrect: true,
					},
					{
						label: "Restart the workers repeatedly until one batch succeeds",
						nextStepId: null,
						feedback:
							"Restarts add noise but do not address a changed external contract.",
						isCorrect: false,
					},
					{
						label:
							"Reroute the scheduled jobs to sandbox because it is usually more stable",
						nextStepId: null,
						feedback:
							"Sandbox is the wrong recovery target for production carrier work and may not match the production contract anyway.",
						isCorrect: false,
					},
				],
			},
			{
				id: "contract-check",
				text: "The live WSDL checksum changed and the generated client in production is stale. What is the safest remediation path?",
				choices: [
					{
						label:
							"Regenerate the client, run contract tests on safe probes, and resume the scheduled jobs through a controlled reopen plan",
						nextStepId: "prevention",
						feedback:
							"Correct — regenerate from the contract, validate the new client, and resume traffic deliberately instead of replaying the entire queue blindly.",
						isCorrect: true,
					},
					{
						label:
							"Patch the old XML templates in production until the faults disappear",
						nextStepId: null,
						feedback:
							"Hand-patching SOAP templates under incident pressure is brittle and skips the real contract diff review.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "The queue is draining again. What should you add to prevent the next maintenance window from breaking jobs this quietly?",
				choices: [
					{
						label:
							"Add WSDL or schema checksum monitoring, maintenance-window canaries, and scheduler controls that can isolate one failing carrier workflow",
						nextStepId: null,
						feedback:
							"Correct — contract monitoring plus operational isolation turns surprise drift into an early warning instead of a dawn outage.",
						isCorrect: true,
					},
					{
						label:
							"Keep the current generated client pinned forever so the contract never changes again",
						nextStepId: null,
						feedback:
							"Pinning only delays the next break. You need monitored regeneration, not permanent stasis.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "soap-header-auth-mismatch",
		title: "SOAP Header/Auth Mismatch",
		summary:
			"The SOAP body is valid, but the auth and transaction headers are structured incorrectly for the carrier contract.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "A new SOAP shipment integration returns MustUnderstand and auth faults even though the body payload validates against the XSD. What do you inspect first?",
				choices: [
					{
						label:
							"Compare the outbound SOAP header structure, namespaces, and auth elements with the carrier's documented header contract",
						nextStepId: "header-fix",
						feedback:
							"Correct — when the body is valid, header structure and namespace placement are the next contract boundary to inspect.",
						isCorrect: true,
					},
					{
						label:
							"Move the auth token into the SOAP Body so the carrier sees it with the business payload",
						nextStepId: null,
						feedback:
							"Auth metadata usually belongs in the Header contract, not in the body payload.",
						isCorrect: false,
					},
					{
						label: "Remove the transaction ID so the header becomes simpler",
						nextStepId: null,
						feedback:
							"That would make support and traceability worse while ignoring the actual header mismatch.",
						isCorrect: false,
					},
				],
			},
			{
				id: "header-fix",
				text: "You find a UsernameToken using the wrong namespace and a missing carrier transaction ID header. What is the correct repair?",
				choices: [
					{
						label:
							"Rebuild the shared SOAP header with the correct WS-Security namespace, required auth block, and transaction ID metadata",
						nextStepId: "prevention",
						feedback:
							"Correct — header placement and namespace accuracy are part of the integration contract.",
						isCorrect: true,
					},
					{
						label: "Disable strict header validation in the SOAP client",
						nextStepId: null,
						feedback:
							"Client-side leniency will not fix what the carrier expects to receive.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "The request is now accepted. What hardening step best prevents a repeat?",
				choices: [
					{
						label:
							"Keep one shared SOAP header builder and add contract tests that assert auth and correlation headers before deployment",
						nextStepId: null,
						feedback:
							"Correct — centralizing header construction and testing the output prevents silent drift across services.",
						isCorrect: true,
					},
					{
						label:
							"Let each service handcraft its own SOAP header so teams can move faster",
						nextStepId: null,
						feedback:
							"That increases drift and makes auth incidents harder to debug consistently.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "carrier-enum-change-causes-validation-failure",
		title: "Carrier Enum Change Causes Validation Failure",
		summary:
			"A carrier schema update changed an enum value and now otherwise-correct SOAP requests fail validation.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "SOAP requests now fail with 'Invalid ServiceLevel' even though the UI label looks unchanged. What is the best first diagnostic step?",
				choices: [
					{
						label:
							"Compare the outbound value with the current XSD enum restrictions and the mapper that turns UI options into carrier values",
						nextStepId: "mapping-fix",
						feedback:
							"Correct — enum drift is a mapping and schema-validation problem, not a transport problem.",
						isCorrect: true,
					},
					{
						label:
							"Retry the same request later because validation faults are often transient",
						nextStepId: null,
						feedback:
							"Validation faults are deterministic until the payload or contract changes.",
						isCorrect: false,
					},
					{
						label:
							"Change the SOAPAction header and keep the rest of the payload untouched",
						nextStepId: null,
						feedback:
							"The failing signal points to payload validation, not operation routing.",
						isCorrect: false,
					},
				],
			},
			{
				id: "mapping-fix",
				text: "You confirm the carrier now expects EXPRESS_SAVER while your mapper still emits EXPRESS-SAVER. What is the correct repair?",
				choices: [
					{
						label:
							"Update the mapping to the schema-defined enum, regenerate affected types, and add preflight schema validation for the outbound payload",
						nextStepId: "prevention",
						feedback:
							"Correct — fix the contract value at the mapper boundary and verify it before sending.",
						isCorrect: true,
					},
					{
						label:
							"Lowercase every enum so the carrier can normalize it automatically",
						nextStepId: null,
						feedback:
							"SOAP schema validation is not case-insensitive by default. That would create a different invalid value.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What longer-term guardrail best prevents the same enum drift from resurfacing quietly?",
				choices: [
					{
						label:
							"Add schema-diff alerts and generated contract tests that fail when the accepted enum set changes",
						nextStepId: null,
						feedback:
							"Correct — contract-aware monitoring catches enum changes before production traffic rediscovers them.",
						isCorrect: true,
					},
					{
						label:
							"Wait for carrier support tickets and update enums manually each time",
						nextStepId: null,
						feedback:
							"That turns a predictable contract-management problem into repeated production incidents.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "stale-token-cache-across-multiple-workers",
		title: "Stale Token Cache Across Multiple Workers",
		summary:
			"One worker pool still injects an expired auth token into SOAP headers while the rest of the fleet uses a fresh token.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "Only one regional worker pool is failing SOAP auth, and replaying the same job on another pool succeeds. What is the best first response?",
				choices: [
					{
						label:
							"Inspect token-cache ownership and invalidate the stale shard before replaying the failed jobs",
						nextStepId: "token-fix",
						feedback:
							"Correct — this looks like cache skew, not a carrier-wide auth outage.",
						isCorrect: true,
					},
					{
						label:
							"Make every worker refresh credentials independently right away",
						nextStepId: null,
						feedback:
							"That can turn one stale shard into a refresh storm across the fleet.",
						isCorrect: false,
					},
					{
						label: "Remove the SOAP auth header until the carrier recovers",
						nextStepId: null,
						feedback:
							"The carrier is not going to accept unauthenticated requests while you debug the cache.",
						isCorrect: false,
					},
				],
			},
			{
				id: "token-fix",
				text: "You confirm that one regional cache namespace still serves an expired token. What is the correct remediation?",
				choices: [
					{
						label:
							"Move refresh back to one shared lifecycle path with expiry buffers and gate retries on fresh token metadata",
						nextStepId: "prevention",
						feedback:
							"Correct — one authoritative refresh path prevents divergent worker behavior.",
						isCorrect: true,
					},
					{
						label: "Increase the cache TTL so workers stop refreshing as often",
						nextStepId: null,
						feedback: "A longer TTL would keep stale tokens alive even longer.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "Traffic is healthy again. What should you add next?",
				choices: [
					{
						label:
							"Centralize token lifecycle telemetry by carrier credential set and alert on shard skew or independent refresh paths",
						nextStepId: null,
						feedback:
							"Correct — shared ownership and telemetry surface the skew before it reaches production job failures.",
						isCorrect: true,
					},
					{
						label: "Clear all worker caches manually every morning",
						nextStepId: null,
						feedback:
							"Manual cache hygiene is not a durable auth-lifecycle strategy.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "legacy-api-sunset-cutover",
		title: "Legacy API Sunset Cutover",
		summary:
			"The carrier retired a legacy SOAP binding and you must cut traffic to the regenerated client without causing a broader outage.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "The carrier has turned off the legacy SOAP binding. Your regenerated client is available, but only limited production traffic has exercised it. What is the safest first move?",
				choices: [
					{
						label:
							"Identify the affected operations, shift traffic behind a feature flag, and use the regenerated client through a controlled cutover plan",
						nextStepId: "cutover-plan",
						feedback:
							"Correct — you still need staged control even when the old endpoint is gone.",
						isCorrect: true,
					},
					{
						label:
							"Wait for the carrier to restore the legacy binding temporarily",
						nextStepId: null,
						feedback:
							"The sunset already happened. Recovery depends on your cutover plan, not on the old binding coming back.",
						isCorrect: false,
					},
					{
						label:
							"Change DNS and hope the old client keeps working against the new binding",
						nextStepId: null,
						feedback:
							"The contract and binding changed. DNS alone does not solve a client mismatch.",
						isCorrect: false,
					},
				],
			},
			{
				id: "cutover-plan",
				text: "Some safe probe traffic passes with the new client, but shipment creation has downstream mapping differences. What is the best rollout approach?",
				choices: [
					{
						label:
							"Canary safe traffic first, migrate the write path incrementally, and keep an explicit rollback or isolation plan for each dependent workflow",
						nextStepId: "aftermath",
						feedback:
							"Correct — even under deadline pressure, staged rollout is how you avoid turning one sunset into a multi-system outage.",
						isCorrect: true,
					},
					{
						label:
							"Flip 100% of traffic immediately because partial rollout only delays the inevitable",
						nextStepId: null,
						feedback:
							"An all-at-once cutover hides which dependent system failed and raises the cost of rollback.",
						isCorrect: false,
					},
				],
			},
			{
				id: "aftermath",
				text: "The cutover completed. What follow-up hardening best prepares you for the next carrier sunset?",
				choices: [
					{
						label:
							"Maintain a deprecation watchlist, contract-monitoring alerts, and a runbook that treats sunset dates as operational migrations",
						nextStepId: null,
						feedback:
							"Correct — deprecations need active tracking, not just a future calendar note.",
						isCorrect: true,
					},
					{
						label:
							"Fork the integration permanently for every carrier version and never retire the old code",
						nextStepId: null,
						feedback:
							"Permanent version forks increase maintenance burden and make future sunsets harder, not easier.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "sandbox-works-but-production-rejects-the-request",
		title: "Sandbox Works but Production Rejects the Request",
		summary:
			"The same request path still passes in sandbox, but production rejects it because the environments no longer behave the same way.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "The shipment request still passes in sandbox, but production now fails for the same flow. What is the safest first response?",
				choices: [
					{
						label:
							"Compare production and sandbox evidence side by side: credentials, contract version, enabled products, and correlation data",
						nextStepId: "diff-env",
						feedback:
							"Correct — treat this as environment drift until evidence proves otherwise.",
						isCorrect: true,
					},
					{
						label:
							"Promote the sandbox request body directly into production because it already passed there",
						nextStepId: null,
						feedback:
							"A passing sandbox body does not prove the production environment shares the same rules or contract.",
						isCorrect: false,
					},
					{
						label:
							"Ignore production for now and keep validating only in sandbox until the carrier catches up",
						nextStepId: null,
						feedback:
							"Production is the live contract. Avoiding it only delays the real investigation.",
						isCorrect: false,
					},
				],
			},
			{
				id: "diff-env",
				text: "You find that production uses a different WSDL version and a stricter product entitlement than sandbox. What should you do next?",
				choices: [
					{
						label:
							"Update the production-bound integration path for the current contract, then revalidate with production-safe probes before reopening writes",
						nextStepId: "prevention",
						feedback:
							"Correct — repair against the live environment instead of assuming sandbox parity.",
						isCorrect: true,
					},
					{
						label:
							"Clone the sandbox credentials into production so both environments match exactly",
						nextStepId: null,
						feedback:
							"Credential cloning is not a realistic or safe answer to environment-specific contract drift.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What longer-term guardrail best reduces this class of incident?",
				choices: [
					{
						label:
							"Track production and sandbox contract or entitlement drift explicitly and keep environment-specific probes in the rollout checklist",
						nextStepId: null,
						feedback:
							"Correct — environment-specific evidence should be part of the rollout discipline, not an ad hoc debugging step.",
						isCorrect: true,
					},
					{
						label:
							"Rely on sandbox as the final source of truth because production should eventually converge",
						nextStepId: null,
						feedback:
							"That assumption is exactly what caused the outage to persist.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "pagination-cursor-lost-mid-sync",
		title: "Pagination Cursor Lost Mid-Sync",
		summary:
			"A carrier backfill lost cursor state halfway through the sync and now downstream records are missing or duplicated.",
		difficulty: "intermediate",
		steps: [
			{
				id: "start",
				text: "A tracking backfill crashed mid-run. When it resumed, some records duplicated and others disappeared. What is the best first move?",
				choices: [
					{
						label:
							"Inspect the last durable cursor checkpoint and compare it with the replayed pages before resuming the sync",
						nextStepId: "checkpoint",
						feedback:
							"Correct — establish where the cursor state diverged before you resume a moving dataset.",
						isCorrect: true,
					},
					{
						label:
							"Restart the whole sync from page 1 every time a worker crashes",
						nextStepId: null,
						feedback:
							"That increases duplicate risk and makes reconciliation harder on large moving datasets.",
						isCorrect: false,
					},
					{
						label:
							"Ignore duplicates because the latest event will win eventually",
						nextStepId: null,
						feedback:
							"Missing records and duplicate processing both matter in sync flows. You need deterministic recovery.",
						isCorrect: false,
					},
				],
			},
			{
				id: "checkpoint",
				text: "You confirm the resumed worker used an older cursor snapshot while the dataset kept changing. What is the safest repair?",
				choices: [
					{
						label:
							"Reconcile from the last trustworthy checkpoint, reprocess the affected window idempotently, and persist the new cursor only after the page commits",
						nextStepId: "prevention",
						feedback:
							"Correct — cursor durability and idempotent replay are what turn backfills into resumable workflows.",
						isCorrect: true,
					},
					{
						label:
							"Disable pagination and fetch the entire dataset in one request next time",
						nextStepId: null,
						feedback:
							"Large carrier datasets rarely support or tolerate that approach. Cursor discipline is the right fix.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What permanent hardening belongs in the sync design?",
				choices: [
					{
						label:
							"Durable cursor checkpoints, page-level idempotency, and reconciliation metrics that expose drift before customers see it",
						nextStepId: null,
						feedback:
							"Correct — resume state and reconciliation visibility are the main controls for cursor-based sync correctness.",
						isCorrect: true,
					},
					{
						label:
							"One giant in-memory cursor object so the sync can restart faster on the same node",
						nextStepId: null,
						feedback:
							"In-memory checkpoints vanish with the worker and do not solve replay correctness.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "bulk-shipment-job-restarts-mid-run",
		title: "Bulk Shipment Job Restarts Mid-Run",
		summary:
			"A bulk shipment job restarted after partial success and now risks replaying writes without item-level checkpoints.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "A batch worker crashed after creating some of the labels in a 300-item job. The queue is about to replay the full batch from the beginning. What do you do first?",
				choices: [
					{
						label:
							"Inspect per-item completion state and stop the replay until you know which writes already succeeded",
						nextStepId: "checkpoints",
						feedback:
							"Correct — a bulk restart is a partial-success problem first, not just a queue retry.",
						isCorrect: true,
					},
					{
						label:
							"Replay the entire batch immediately so the queue catches up before operations notices",
						nextStepId: null,
						feedback:
							"That can create duplicate labels for items that already succeeded before the crash.",
						isCorrect: false,
					},
					{
						label:
							"Mark the job as failed permanently and let support rebuild the whole batch manually",
						nextStepId: null,
						feedback:
							"You still need evidence about which items succeeded before choosing manual recovery.",
						isCorrect: false,
					},
				],
			},
			{
				id: "checkpoints",
				text: "You discover the job stores one global status row but no per-item checkpoints. What is the safest immediate recovery?",
				choices: [
					{
						label:
							"Reconstruct item-level success from carrier evidence and replay only the unresolved items with the original operation keys",
						nextStepId: "prevention",
						feedback:
							"Correct — restore item-level state and keep replays keyed to the original logical writes.",
						isCorrect: true,
					},
					{
						label:
							"Split the batch into smaller jobs only after replaying the original one unchanged",
						nextStepId: null,
						feedback:
							"Replaying unchanged is still unsafe if you do not know which items already succeeded.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What structural fix best prevents the same restart failure later?",
				choices: [
					{
						label:
							"Add durable per-item checkpoints and resume the batch from item-level state rather than one global job flag",
						nextStepId: null,
						feedback:
							"Correct — bulk resumability depends on per-item state, not on one all-or-nothing batch marker.",
						isCorrect: true,
					},
					{
						label: "Increase the worker timeout so restarts happen less often",
						nextStepId: null,
						feedback:
							"Longer runtimes do not solve the missing checkpoint model.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "dead-letter-queue-triage-after-permanent-failures",
		title: "Dead-Letter Queue Triage After Permanent Failures",
		summary:
			"Permanent carrier failures have piled up in the DLQ and now need evidence-based triage instead of blind replay.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "A DLQ alert fires with hundreds of carrier failures. Most entries show 422-style validation errors, but operations wants to replay everything to clear the queue. What is the correct first response?",
				choices: [
					{
						label:
							"Classify the entries into permanent versus retryable groups using the stored request fingerprint and carrier error detail",
						nextStepId: "triage",
						feedback:
							"Correct — replay is only safe after classification. DLQ entries are an evidence problem first.",
						isCorrect: true,
					},
					{
						label:
							"Replay the whole DLQ immediately because the primary goal is lowering alert volume",
						nextStepId: null,
						feedback:
							"That would recreate the same permanent failures and erase the chance for targeted triage.",
						isCorrect: false,
					},
					{
						label:
							"Delete the DLQ messages because permanent failures should never be retried",
						nextStepId: null,
						feedback:
							"You still need the evidence to fix root causes and decide which records need manual correction.",
						isCorrect: false,
					},
				],
			},
			{
				id: "triage",
				text: "You confirm that most entries are permanent validation failures for one carrier product, while a minority are transient leftovers. What is the safest next step?",
				choices: [
					{
						label:
							"Replay only the transient subset and route the permanent failures into a manual-fix workflow with field-level evidence attached",
						nextStepId: "prevention",
						feedback:
							"Correct — classify, replay selectively, and keep the permanent failures actionable for humans.",
						isCorrect: true,
					},
					{
						label:
							"Normalize every entry into one generic queue error so support has fewer categories to learn",
						nextStepId: null,
						feedback:
							"Hiding the distinctions makes the DLQ harder to act on, not easier.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What follow-up change makes the DLQ more useful next time?",
				choices: [
					{
						label:
							"Preserve request fingerprints, carrier error detail, and classification hints in every DLQ message and runbook",
						nextStepId: null,
						feedback:
							"Correct — a DLQ is only useful if the next action is obvious from the stored evidence.",
						isCorrect: true,
					},
					{
						label:
							"Keep only the raw payload body because the rest of the metadata is operational noise",
						nextStepId: null,
						feedback:
							"Without classification context and request identity, replay and manual correction become guesswork.",
						isCorrect: false,
					},
				],
			},
		],
	},
	{
		id: "carrier-created-the-label-but-internal-save-failed",
		title: "Carrier Created the Label but Internal Save Failed",
		summary:
			"The external label exists, but the internal workflow lost the write before persistence completed.",
		difficulty: "advanced",
		steps: [
			{
				id: "start",
				text: "The carrier response includes a valid tracking number and label artifact, but your database write timed out before the shipment record committed. A retry worker is queued. What is the safest first move?",
				choices: [
					{
						label:
							"Query by the original client reference, confirm whether the external label exists, and block blind retries until the state is resolved",
						nextStepId: "resolve-state",
						feedback:
							"Correct — treat this as a split-brain write and resolve the external state before replaying anything.",
						isCorrect: true,
					},
					{
						label:
							"Let the retry worker create a fresh label so the internal save has another chance",
						nextStepId: null,
						feedback:
							"That risks duplicating the external artifact and charges.",
						isCorrect: false,
					},
					{
						label:
							"Delete the failed internal job and assume the carrier will eventually notify you by webhook",
						nextStepId: null,
						feedback:
							"You already have enough evidence to act. Passive waiting just extends the split-brain state.",
						isCorrect: false,
					},
				],
			},
			{
				id: "resolve-state",
				text: "You confirm the label exists at the carrier and is billable. What is the correct recovery path?",
				choices: [
					{
						label:
							"Replay only the internal persistence path or run explicit compensation keyed to the original operation ID",
						nextStepId: "prevention",
						feedback:
							"Correct — reuse the original logical operation so recovery does not create a second label.",
						isCorrect: true,
					},
					{
						label:
							"Create a second label and void the first one later if support complains",
						nextStepId: null,
						feedback: "That makes the incident bigger before it gets smaller.",
						isCorrect: false,
					},
				],
			},
			{
				id: "prevention",
				text: "What permanent fix best reduces the risk of this split-brain failure?",
				choices: [
					{
						label:
							"Use one durable operation key, persist external success evidence, and make replay paths recover the original write instead of issuing a new one",
						nextStepId: null,
						feedback:
							"Correct — the workflow needs one authoritative operation identity across external and internal persistence.",
						isCorrect: true,
					},
					{
						label:
							"Shorten the database timeout and keep the rest of the workflow unchanged",
						nextStepId: null,
						feedback:
							"Timeout tuning alone does not fix split-brain recovery semantics.",
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
