export interface ScenarioFamilyCatalogEntry {
	id: string;
	sourceScenarioId: string;
	title: string;
	summary: string;
	concept: string;
	ladderLevel: 1 | 2 | 3 | 4;
	evidenceOptions: string[][];
}

export const scenarioFamilyCatalog: ScenarioFamilyCatalogEntry[] = [
	{
		id: "rate-limiting-storm",
		sourceScenarioId: "rate-limit-429",
		title: "429 Rate Limiting Storm",
		summary:
			"Recover from carrier throttling without dropping queued shipment work.",
		concept:
			"Rate limits, backpressure, and queue safety under carrier pressure",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"Retry-After headers cluster at 30 seconds across the failing batch.",
				"Queue depth is rising while worker concurrency stays flat.",
				"Carrier dashboard shows no outage, only account throttling.",
			],
			[
				"Batch workers are hammering one shipment-create endpoint in parallel.",
				"Recent deploy increased concurrency but not rate limiting.",
				"Support already has delayed-label complaints from operations.",
			],
		],
	},
	{
		id: "soap-fault-with-cryptic-detail",
		sourceScenarioId: "soap-fault-detail",
		title: "SOAP Fault with Cryptic Detail",
		summary:
			"Parse a vague SOAP fault into a concrete schema or payload repair plan.",
		concept: "Fault parsing, schema awareness, and precise corrective action",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"faultstring = Processing Error",
				"detail.ErrorCode = 1234",
				"detail.Field = Weight",
			],
			[
				"faultstring = Validation Failure",
				"detail.ErrorCode = FIELD_MISMATCH",
				"detail.Field = PackageWeight",
			],
		],
	},
	{
		id: "wsdl-change-breaks-client",
		sourceScenarioId: "wsdl-change-breaks",
		title: "WSDL Change Breaks Client",
		summary:
			"A carrier changed its SOAP contract and your generated client is now out of sync.",
		concept:
			"Contract diffing, regeneration, and staged rollout after WSDL drift",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"Production requests started failing right after a carrier maintenance window.",
				"Latest fault reports mention an unexpected element name.",
				"No application deploy happened on your side over the weekend.",
			],
			[
				"Carrier sandbox still works, but production rejects the old operation contract.",
				"Your cached WSDL checksum no longer matches the live download.",
				"Support email references a silent schema refresh without details.",
			],
		],
	},
	{
		id: "http-200-with-error-payload",
		sourceScenarioId: "200-with-error-payload",
		title: "HTTP 200 with Error Payload",
		summary:
			"Detect a hidden carrier failure when the transport layer still returns success.",
		concept:
			"Body-level error detection and response validation beyond status codes",
		ladderLevel: 1,
		evidenceOptions: [
			[
				"Carrier responses all show HTTP 200 in logs.",
				"Body payload includes status=error for failed label requests.",
				"Customers report missing labels even though metrics show no transport errors.",
			],
			[
				"Alert volume is low because only transport status is monitored.",
				"Carrier payload message says Invalid account credentials.",
				"Internal success metrics are inflated by body-level failures.",
			],
		],
	},
	{
		id: "auth-token-expires-over-weekend",
		sourceScenarioId: "auth-token-expires-over-weekend",
		title: "Auth Token Expires Over Weekend",
		summary:
			"Recover from weekend auth expiry without stampeding the carrier token endpoint.",
		concept:
			"Token lifecycle management, shared-cache invalidation, and controlled refresh under load",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"Carrier writes started failing with 401 invalid_token at 02:13 Saturday.",
				"Token refresh logs stopped shortly before the first production failures.",
				"Workers on three nodes are all reusing the same cached bearer token.",
			],
			[
				"Token endpoint latency is climbing because every worker started refreshing independently.",
				"Last successful shipment write used a token minted 59 minutes ago.",
				"Operations reports that sandbox still works because it uses a separate client ID.",
			],
		],
	},
	{
		id: "duplicate-webhook-replay",
		sourceScenarioId: "duplicate-webhook-replay",
		title: "Duplicate Webhook Replay",
		summary:
			"Stop carrier webhook retries from replaying the same business action twice.",
		concept:
			"Webhook signature checks, event-id ledgers, and idempotent consumers",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"One tracking event ID appears 14 times in five minutes.",
				"Carrier delivery logs show retries after your endpoint exceeded its timeout budget.",
				"The same shipment note was appended multiple times in your internal timeline.",
			],
			[
				"Webhook acknowledgements spike above 8 seconds during queue pressure.",
				"Payload hashes match even though requests arrived from different source IPs.",
				"Support can reproduce the duplicate state transition on demand with a replayed event.",
			],
		],
	},
	{
		id: "out-of-order-tracking-events",
		sourceScenarioId: "out-of-order-tracking-events",
		title: "Out-of-Order Tracking Events",
		summary:
			"Project a stable shipment state when valid carrier events arrive in the wrong sequence.",
		concept:
			"Event ordering, monotonic status projection, and timeline reconstruction",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"'Delivered' reached your webhook before 'Out for delivery' for the same package.",
				"Carrier payloads include event timestamps that do not match arrival order.",
				"Customers briefly saw the public tracking page move backward in status.",
			],
			[
				"Your event consumer processes messages concurrently across partitions.",
				"Carrier docs warn that tracking webhooks are eventually consistent.",
				"Support screenshots show the same shipment bouncing between two statuses.",
			],
		],
	},
	{
		id: "partial-label-generation-downstream-persistence-failure",
		sourceScenarioId: "partial-label-generation-downstream-persistence-failure",
		title: "Partial Label Generation with Downstream Persistence Failure",
		summary:
			"A carrier created the label, but your internal save failed before the workflow completed.",
		concept:
			"Partial-success recovery, compensation, and replay keyed to one logical operation",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"Carrier response includes a tracking number and label URL, but your database transaction rolled back.",
				"Operations sees one paid label in the carrier portal with no matching internal record.",
				"A retry worker is about to replay the same create request from the top of the queue.",
			],
			[
				"Bulk job metrics show one item stuck in 'processing' while the carrier already billed the label.",
				"Client reference search returns exactly one existing label at the carrier.",
				"Your audit log stops after the outbound request because persistence failed on the callback path.",
			],
		],
	},
	{
		id: "missing-correlation-id-support-escalation",
		sourceScenarioId: "missing-correlation-id-support-escalation",
		title: "Missing Correlation ID During Support Escalation",
		summary:
			"Handle a live carrier incident when the one identifier support needs was never logged.",
		concept:
			"Incident evidence quality, correlation discipline, and runbook hardening",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"Carrier support asked for a transaction ID, but your error logs only contain the order number.",
				"Alert payloads show a spike in 422 responses with no request fingerprint attached.",
				"The integration middleware does not enforce correlation IDs on outbound requests.",
			],
			[
				"Two separate shipments failed in the same minute and support cannot tell them apart.",
				"Runbook steps reference correlation IDs, but the structured logs never stored them.",
				"A hotfix added debug logs, but the original failed requests are already gone from the short-retention sink.",
			],
		],
	},
];
