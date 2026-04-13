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
];
