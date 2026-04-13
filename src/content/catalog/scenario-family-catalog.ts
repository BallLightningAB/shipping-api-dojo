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
	{
		id: "carrier-maintenance-window-breaks-scheduled-jobs",
		sourceScenarioId: "carrier-maintenance-window-breaks-scheduled-jobs",
		title: "Carrier Maintenance Window Breaks Scheduled Jobs",
		summary:
			"A quiet carrier maintenance window changed the SOAP contract and now scheduled jobs are failing before business hours.",
		concept:
			"Contract monitoring, maintenance-window fallout, and controlled SOAP recovery",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"Nightly shipment jobs started failing minutes after the carrier maintenance window ended.",
				"Your generated client checksum no longer matches the live WSDL download.",
				"No application deploy occurred on your side overnight.",
			],
			[
				"Health checks show the endpoint is reachable, but production jobs return unexpected-element faults.",
				"The carrier status page only mentions 'planned maintenance complete' with no schema details.",
				"Queue depth is rising because the scheduler keeps releasing new work into the failing job class.",
			],
		],
	},
	{
		id: "soap-header-auth-mismatch",
		sourceScenarioId: "soap-header-auth-mismatch",
		title: "SOAP Header/Auth Mismatch",
		summary:
			"A SOAP request reaches the carrier, but the auth and transaction headers are structured incorrectly.",
		concept:
			"Header contracts, WS-Security placement, and correlation metadata discipline",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"HTTP transport succeeds, but the carrier returns a MustUnderstand fault for the auth block.",
				"Recent refactor moved transaction metadata out of the shared SOAP header builder.",
				"Support cannot locate the failing request because the transaction ID never arrived in their logs.",
			],
			[
				"Carrier responses alternate between auth failure and header-validation faults.",
				"The outbound XML shows a UsernameToken in the wrong namespace prefix.",
				"Operations reports that REST integrations still work with the same underlying credentials.",
			],
		],
	},
	{
		id: "carrier-enum-change-causes-validation-failure",
		sourceScenarioId: "carrier-enum-change-causes-validation-failure",
		title: "Carrier Enum Change Causes Validation Failure",
		summary:
			"A schema-backed enum change broke outbound SOAP payloads even though the business meaning stayed the same.",
		concept:
			"Schema validation, enum drift, and preflight contract enforcement",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"SOAP faults started citing an invalid ServiceLevel value after a quiet contract refresh.",
				"The UI still displays the same shipping option names as before.",
				"Only one enum-backed request path is failing; other payloads still validate.",
			],
			[
				"Generated client types were refreshed in one service but not in another.",
				"The carrier's XSD now expects EXPRESS_SAVER while your mapper still emits EXPRESS-SAVER.",
				"Support confirms the service is healthy and points to request validation only.",
			],
		],
	},
	{
		id: "stale-token-cache-across-multiple-workers",
		sourceScenarioId: "stale-token-cache-across-multiple-workers",
		title: "Stale Token Cache Across Multiple Workers",
		summary:
			"Different worker pools are sending different SOAP auth headers because one cache shard still serves an expired token.",
		concept:
			"Shared auth lifecycle, multi-worker cache skew, and controlled recovery under load",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"One worker pool keeps sending an expired token in the SOAP header while newer workers succeed.",
				"Token-refresh logs show two independent cache namespaces for the same carrier credential set.",
				"Replaying failed jobs on a healthy worker succeeds without changing the payload body.",
			],
			[
				"401 failures cluster by region even though all workers hit the same carrier endpoint.",
				"The SOAP header builder reads auth state from a regional in-memory cache instead of the shared store.",
				"Operations can trace the failure to one stale credential shard rather than a carrier-wide outage.",
			],
		],
	},
	{
		id: "legacy-api-sunset-cutover",
		sourceScenarioId: "legacy-api-sunset-cutover",
		title: "Legacy API Sunset Cutover",
		summary:
			"The carrier turned off a legacy SOAP binding and you need to cut traffic to the regenerated client without creating a second outage.",
		concept:
			"Deprecation readiness, staged cutover, and rollback-aware client migration",
		ladderLevel: 4,
		evidenceOptions: [
			[
				"The legacy SOAP binding now returns deprecation faults while the new binding is live but not fully exercised in production.",
				"Your regenerated client passed staging tests, but downstream systems still assume some old field names.",
				"The carrier's sunset deadline already passed, so the old path is not coming back.",
			],
			[
				"Canary traffic through the new client succeeds for rate checks but not yet for shipment creation.",
				"Feature flags exist for client selection, but the rollback playbook was never finalized.",
				"Business stakeholders want the cutover completed before the next scheduled pickup batch starts.",
			],
		],
	},
	{
		id: "sandbox-works-but-production-rejects-the-request",
		sourceScenarioId: "sandbox-works-but-production-rejects-the-request",
		title: "Sandbox Works but Production Rejects the Request",
		summary:
			"The same integration path passes in sandbox but fails in production because the environments do not actually share one contract.",
		concept:
			"Environment drift, production-readiness evidence, and controlled rollout assumptions",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"Sandbox accepts the shipment request, but production returns a validation fault for the same order flow.",
				"The production account recently enabled a new carrier product with stricter required fields.",
				"Support asks for a production transaction ID that your sandbox probes never emitted.",
			],
			[
				"The production WSDL checksum differs from the one sandbox still serves.",
				"Sandbox credentials belong to a different account tier than the production tenant.",
				"Operations confirms only live traffic is affected; replaying the same request in sandbox still passes.",
			],
		],
	},
	{
		id: "pagination-cursor-lost-mid-sync",
		sourceScenarioId: "pagination-cursor-lost-mid-sync",
		title: "Pagination Cursor Lost Mid-Sync",
		summary:
			"A carrier sync lost its cursor state partway through a moving dataset and now records are missing or duplicated.",
		concept:
			"Cursor durability, sync resumability, and evidence-driven reconciliation on changing result sets",
		ladderLevel: 2,
		evidenceOptions: [
			[
				"The sync restarted after a worker crash and resumed from an older cursor snapshot.",
				"Downstream reports show missing tracking updates for only one time window.",
				"Carrier responses still expose a valid next cursor, but your last durable checkpoint is stale.",
			],
			[
				"Two sync workers processed overlapping pages after a retry storm.",
				"The carrier dataset changed while the backfill was still running.",
				"Your metrics show duplicate page fetches but an incomplete internal reconciliation count.",
			],
		],
	},
	{
		id: "bulk-shipment-job-restarts-mid-run",
		sourceScenarioId: "bulk-shipment-job-restarts-mid-run",
		title: "Bulk Shipment Job Restarts Mid-Run",
		summary:
			"A batch shipment job restarted in the middle of a partial run and now risks replaying writes without item-level checkpoints.",
		concept:
			"Bulk job resumability, idempotent checkpoints, and partial-run recovery",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"A worker restart occurred after 120 of 300 parcel writes completed.",
				"Some labels already exist at the carrier, but the batch ledger only marks the overall job as 'processing'.",
				"The queue is about to replay the full job payload from the first item.",
			],
			[
				"The batch controller stores one status row for the whole job and no per-item completion markers.",
				"Operations can see duplicate candidate labels for parcels processed just before the restart.",
				"A retry window is open now, but voiding duplicates later would create extra manual cleanup.",
			],
		],
	},
	{
		id: "dead-letter-queue-triage-after-permanent-failures",
		sourceScenarioId: "dead-letter-queue-triage-after-permanent-failures",
		title: "Dead-Letter Queue Triage After Permanent Failures",
		summary:
			"Permanent carrier failures have accumulated in the DLQ and now need structured triage instead of blind replay.",
		concept:
			"Permanent-failure classification, DLQ evidence quality, and operational replay discipline",
		ladderLevel: 3,
		evidenceOptions: [
			[
				"DLQ entries cluster around 422 address-validation failures for one carrier product.",
				"The messages preserve the request fingerprint and carrier field-level errors.",
				"Operations wants to replay the queue immediately to clear the alert volume.",
			],
			[
				"Some entries look retryable, but most contain stable validation faults that already exhausted safe retries.",
				"The DLQ alert does not separate permanent failures from transient outage leftovers.",
				"The runbook is unclear about when to replay versus when to escalate to manual correction.",
			],
		],
	},
	{
		id: "carrier-created-the-label-but-internal-save-failed",
		sourceScenarioId: "carrier-created-the-label-but-internal-save-failed",
		title: "Carrier Created the Label but Internal Save Failed",
		summary:
			"The external label exists and is billable, but your internal workflow lost the write before persistence completed.",
		concept:
			"Split-brain shipment recovery, compensation boundaries, and replay keyed to one logical write",
		ladderLevel: 4,
		evidenceOptions: [
			[
				"The carrier response includes a tracking number and label artifact, but the internal transaction rolled back.",
				"A retry worker is scheduled to resend the create request within minutes.",
				"Support can confirm one live label exists for the client reference at the carrier.",
			],
			[
				"Billing already reflects the external label, but no internal shipment record was persisted.",
				"The queue only knows the original operation ID and last error as 'database timeout'.",
				"Operations needs a safe answer now: replay the save, void the label, or hold the job for manual recovery.",
			],
		],
	},
];
