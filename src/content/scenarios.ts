/**
 * Incident Arena Scenarios — 5 realistic carrier integration incidents
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
];

export function getScenarioById(id: string): Scenario | undefined {
	return scenarios.find((s) => s.id === id);
}
