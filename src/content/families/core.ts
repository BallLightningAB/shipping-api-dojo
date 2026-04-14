import { deriveChildSeed, pickDeterministic } from "../../lib/randomization";
import type {
	DrillFamilyDefinition,
	LessonDefinition,
	ScenarioFamilyDefinition,
	ScenarioStep,
} from "../types";

const lessonDefinitions: LessonDefinition[] = [
	{
		id: "lesson-rest-http-semantics",
		slug: "rest-1-http-semantics",
		title: "HTTP Semantics: Safe, Idempotent & Retries",
		track: "rest",
		order: 1,
		summary:
			"Understand which HTTP methods are safe and idempotent, and why this matters for retry logic in carrier integrations.",
		objectives: [
			"Differentiate safe, idempotent, and unsafe carrier operations.",
			"Choose the safest recovery path after ambiguous shipment-creation failures.",
			"Apply retry rules that reduce duplicate-shipment risk.",
		],
		sections: [
			{
				id: "safe-vs-idempotent",
				heading: "Safe vs Idempotent",
				body: "A safe method doesn't modify server state (GET, HEAD, OPTIONS). An idempotent method can be called multiple times with the same effect as calling it once (GET, PUT, DELETE). POST is neither safe nor idempotent — calling it twice may create two shipments.",
			},
			{
				id: "why-retries-need-idempotency",
				heading: "Why Retries Need Idempotency",
				body: "Network timeouts are common with carrier APIs. If your POST /shipments times out, did it succeed? Without an idempotency key, retrying might create a duplicate. PUT with a client-generated ID is naturally idempotent. For POST endpoints, send an Idempotency-Key header if the carrier supports it.",
				carrierReality:
					"FedEx's REST API supports idempotency keys on shipment creation. UPS does not — you must implement your own deduplication by querying recent shipments before retrying.",
			},
			{
				id: "retry-strategy",
				heading: "Retry Strategy",
				body: "Use exponential backoff with jitter. Start at 1s, double each retry, add random jitter up to 50% of the delay. Cap at 5 retries. Never retry 4xx errors (except 429). Always retry 502, 503, 504.",
			},
		],
		drillFamilyIds: [
			"rest-http-method-classification",
			"rest-timeout-recovery",
			"rest-retry-policy-cloze",
		],
	},
	{
		id: "lesson-soap-envelope-namespaces",
		slug: "soap-1-envelope-namespaces",
		title: "SOAP Envelope & Namespaces",
		track: "soap",
		order: 11,
		summary:
			"Understand the SOAP envelope structure, XML namespaces, and how to construct valid SOAP requests.",
		objectives: [
			"Recognize which SOAP elements are structural versus carrier-specific.",
			"Identify namespace mistakes that cause hard-to-diagnose carrier faults.",
			"Build a valid SOAP shipment request from a deterministic family template.",
		],
		sections: [
			{
				id: "soap-envelope",
				heading: "The SOAP Envelope",
				body: "Every SOAP message is an XML document wrapped in an Envelope element. The Envelope contains an optional Header and a required Body. The Header carries metadata (auth tokens, transaction IDs). The Body carries the actual request or response payload.",
			},
			{
				id: "namespaces-matter",
				heading: "Namespaces Matter",
				body: "XML namespaces prevent element name collisions. The SOAP envelope uses http://schemas.xmlsoap.org/soap/envelope/ (SOAP 1.1) or http://www.w3.org/2003/05/soap-envelope (SOAP 1.2). The carrier's service uses its own namespace. Get the namespace wrong and you'll get cryptic 'element not found' faults.",
				carrierReality:
					"UPS's SOAP API uses different namespaces for different service versions. Upgrading from v1 to v2 means updating every namespace URI — miss one and the request silently fails.",
			},
			{
				id: "building-a-soap-request",
				heading: "Building a SOAP Request",
				body: "Start with the Envelope, declare namespaces on it, add auth in the Header, and construct the Body with the operation element. Use the carrier's WSDL to find the correct operation name, namespace, and parameter types. Don't hand-build SOAP — use a library, but understand the structure so you can debug.",
			},
		],
		drillFamilyIds: ["soap-envelope-structure", "soap-envelope-builder"],
	},
];

const drillFamilies: DrillFamilyDefinition[] = [
	{
		id: "rest-http-method-classification",
		type: "mcq",
		concept: "HTTP semantics and retry safety",
		misconception:
			"Treating any successful-looking write operation as safe to retry.",
		difficulty: "beginner",
		tags: ["rest", "idempotency", "http"],
		buildVariant: (seed) => {
			const variants = [
				{
					key: "put-replace-shipment",
					question:
						"A carrier supports PUT /shipments/{clientReference} to replace a shipment payload. Which statement is correct?",
					options: [
						"PUT is unsafe to retry because it always creates a duplicate shipment.",
						"PUT is idempotent when the same client reference and payload are resent.",
						"PUT is safe because it never changes server state.",
						"PUT should only be used after a GET confirms the shipment already exists.",
					],
					correctIndex: 1,
					explanation:
						"PUT is idempotent when the same target resource and payload are repeated. It still changes state, so it is not safe, but retrying the same request should converge on one final representation.",
				},
				{
					key: "delete-cancel-shipment",
					question:
						"Your shipment-cancel endpoint uses DELETE /shipments/{shipmentId}. Why is DELETE usually a safer retry candidate than POST /shipments?",
					options: [
						"DELETE is idempotent, so repeating the same cancel request should not create extra side effects once the shipment is gone.",
						"DELETE is safe, so it cannot change state.",
						"DELETE is faster than POST, so retries are cheaper.",
						"DELETE automatically adds an idempotency key at the HTTP layer.",
					],
					correctIndex: 0,
					explanation:
						"DELETE is not safe because it changes state, but it is usually idempotent: after the shipment is canceled, repeating the same request should not create additional shipments or duplicate charges.",
				},
				{
					key: "post-create-shipment",
					question:
						"Why is blindly retrying POST /shipments after a timeout dangerous?",
					options: [
						"POST is safe but not idempotent, so the retry will be ignored.",
						"POST is neither safe nor idempotent, so the original request may already have created a shipment.",
						"POST retries are blocked by HTTP clients unless the status code is 500.",
						"POST can only be retried when the body is JSON.",
					],
					correctIndex: 1,
					explanation:
						"POST shipment creation is often non-idempotent. After a timeout, you must treat the outcome as ambiguous and check for an existing shipment or use an idempotency key before retrying.",
				},
			];
			const variant = pickDeterministic(
				variants,
				deriveChildSeed(seed, "rest-http-method-classification")
			);

			return {
				variantId: variant.key,
				drill: {
					id: variant.key,
					type: "mcq",
					familyId: "rest-http-method-classification",
					progressKey: "rest-http-method-classification",
					question: variant.question,
					options: variant.options,
					correctIndex: variant.correctIndex,
					explanation: variant.explanation,
				},
			};
		},
	},
	{
		id: "rest-timeout-recovery",
		type: "mcq",
		concept: "Ambiguous timeout recovery",
		misconception:
			"Assuming a timeout guarantees that shipment creation failed.",
		difficulty: "beginner",
		tags: ["rest", "timeout", "incident-response"],
		buildVariant: (seed) => {
			const variants = [
				{
					key: "query-then-retry",
					question:
						"Your POST /shipments request timed out after 30 seconds. What is the safest next step?",
					options: [
						"Retry the POST immediately to minimize customer wait time.",
						"Query recent shipments or search by client reference before deciding whether to retry.",
						"Create the shipment with a new order ID so duplicates are easier to see later.",
						"Wait for the carrier's nightly reconciliation job to finish.",
					],
					correctIndex: 1,
					explanation:
						"A timeout on shipment creation is ambiguous. Checking for an existing shipment or using a client reference/idempotency key prevents duplicate labels and duplicate billing.",
				},
				{
					key: "idempotency-ledger",
					question:
						"The carrier does not support an Idempotency-Key header. Which recovery pattern best reduces duplicate labels after a timeout?",
					options: [
						"Send the same POST every five seconds until the carrier responds.",
						"Persist a client-side shipment reference, query by that reference, and only retry when no prior shipment exists.",
						"Switch the request to GET so the retry becomes safe.",
						"Increase the timeout to 60 seconds and skip all retry logic.",
					],
					correctIndex: 1,
					explanation:
						"If the carrier lacks native idempotency support, you still need a deduplication ledger or query strategy keyed by your own reference so ambiguous retries do not create extra shipments.",
				},
			];
			const variant = pickDeterministic(
				variants,
				deriveChildSeed(seed, "rest-timeout-recovery")
			);

			return {
				variantId: variant.key,
				drill: {
					id: variant.key,
					type: "mcq",
					familyId: "rest-timeout-recovery",
					progressKey: "rest-timeout-recovery",
					question: variant.question,
					options: variant.options,
					correctIndex: variant.correctIndex,
					explanation: variant.explanation,
				},
			};
		},
	},
	{
		id: "rest-retry-policy-cloze",
		type: "cloze",
		concept: "Retry policy structure",
		misconception:
			"Backoff alone is enough without jitter, cap, or status-code classification.",
		difficulty: "beginner",
		tags: ["rest", "retries", "backoff"],
		buildVariant: (seed) => {
			const variants = [
				{
					key: "exponential-jitter",
					template:
						"Use ___ backoff with ___ to avoid retry stampedes. Start at ___s, cap at ___ retries. Never retry ___ errors except 429.",
					answers: ["exponential", "jitter", "1", "5", "4xx"],
					explanation:
						"Exponential backoff with jitter spreads retries over time. A small initial delay and capped retries reduce pressure on the carrier while avoiding endless retry loops.",
				},
				{
					key: "retry-after-aware",
					template:
						"When a carrier returns 429 with Retry-After, honor the ___ header, resume with ___ plus jitter, and stop retrying after ___ attempts for repeated ___ failures.",
					answers: ["Retry-After", "backoff", "5", "429"],
					explanation:
						"429 handling should respect the carrier's stated wait time, then re-enter controlled backoff with jitter. Even rate-limit handling needs a cap and observability.",
				},
			];
			const variant = pickDeterministic(
				variants,
				deriveChildSeed(seed, "rest-retry-policy-cloze")
			);

			return {
				variantId: variant.key,
				drill: {
					id: variant.key,
					type: "cloze",
					familyId: "rest-retry-policy-cloze",
					progressKey: "rest-retry-policy-cloze",
					template: variant.template,
					answers: variant.answers,
					explanation: variant.explanation,
				},
			};
		},
	},
	{
		id: "soap-envelope-structure",
		type: "mcq",
		concept: "SOAP envelope structure",
		misconception:
			"Treating SOAP metadata and payload elements as interchangeable.",
		difficulty: "beginner",
		tags: ["soap", "envelope", "namespaces"],
		buildVariant: (seed) => {
			const variants = [
				{
					key: "header-body",
					question:
						"What are the two main child elements inside a SOAP Envelope?",
					options: [
						"Request and Response",
						"Header and Body",
						"Schema and Namespace",
						"Payload and Metadata",
					],
					correctIndex: 1,
					explanation:
						"SOAP wraps messages in an Envelope whose main children are the optional Header and the required Body. Carrier-specific operations live inside the Body, not beside it.",
				},
				{
					key: "namespace-fault",
					question:
						"Why does a SOAP request often fail with an 'element not found' fault after a carrier version upgrade?",
					options: [
						"Because SOAP only supports one namespace per message.",
						"Because namespace URIs or prefixes no longer match the operation contract expected by the carrier.",
						"Because SOAPAction headers are ignored in production.",
						"Because the XML declaration must be removed in SOAP 1.1.",
					],
					correctIndex: 1,
					explanation:
						"Carrier upgrades often change service namespaces or operation bindings. If the request still uses the old namespace, the payload can look well-formed but still miss the contract target.",
				},
				{
					key: "header-auth-placement",
					question:
						"A carrier expects WS-Security credentials and a transaction ID in the SOAP header. Why can putting them in the Body still fail even when the XML parses?",
					options: [
						"Because SOAP headers are optional, so the carrier ignores all metadata unless it is duplicated in the Body.",
						"Because the contract binds auth and metadata to the Header namespace and processing rules, not to arbitrary payload fields.",
						"Because SOAP bodies cannot contain strings that look like tokens.",
						"Because the HTTP status code is computed before the body is parsed.",
					],
					correctIndex: 1,
					explanation:
						"SOAP treats metadata placement as part of the contract. Auth tokens and transaction IDs often have to appear in the Header with the right namespaces so the carrier stack processes them before the business payload.",
				},
			];
			const variant = pickDeterministic(
				variants,
				deriveChildSeed(seed, "soap-envelope-structure")
			);

			return {
				variantId: variant.key,
				drill: {
					id: variant.key,
					type: "mcq",
					familyId: "soap-envelope-structure",
					progressKey: "soap-envelope-structure",
					question: variant.question,
					options: variant.options,
					correctIndex: variant.correctIndex,
					explanation: variant.explanation,
				},
			};
		},
	},
	{
		id: "soap-envelope-builder",
		type: "builder.soap",
		concept: "SOAP request construction",
		misconception:
			"Treating namespaces and typed request fields as cosmetic rather than contract-bearing.",
		difficulty: "beginner",
		tags: ["soap", "builder", "xml"],
		buildVariant: (seed) => {
			const variants: Array<{
				bodyFields: Record<string, string>;
				carrierNamespace: string;
				expectedEnvelope: string;
				key: string;
				operation: string;
				soapAction: string;
			}> = [
				{
					key: "create-shipment-v1",
					carrierNamespace: "http://carrier.com/shipping/v1",
					soapAction: "http://carrier.com/shipping/v1/CreateShipment",
					operation: "CreateShipment",
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
				},
				{
					key: "rate-shop-v2",
					carrierNamespace: "http://carrier.com/rating/v2",
					soapAction: "http://carrier.com/rating/v2/GetRates",
					operation: "GetRates",
					bodyFields: {
						OriginPostalCode: "30301",
						DestinationPostalCode: "10001",
						WeightKg: "2.4",
					},
					expectedEnvelope: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:car="http://carrier.com/rating/v2">
  <soap:Header/>
  <soap:Body>
    <car:GetRates>
      <car:OriginPostalCode>30301</car:OriginPostalCode>
      <car:DestinationPostalCode>10001</car:DestinationPostalCode>
      <car:WeightKg>2.4</car:WeightKg>
    </car:GetRates>
  </soap:Body>
</soap:Envelope>`,
				},
				{
					key: "shipment-with-security-header",
					carrierNamespace: "http://carrier.com/shipping/v2",
					soapAction: "http://carrier.com/shipping/v2/CreateShipment",
					operation: "CreateShipment",
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
				},
			];
			const variant = pickDeterministic(
				variants,
				deriveChildSeed(seed, "soap-envelope-builder")
			);

			return {
				variantId: variant.key,
				drill: {
					id: variant.key,
					type: "builder.soap",
					familyId: "soap-envelope-builder",
					progressKey: "soap-envelope-builder",
					prompt: `Build a SOAP 1.1 envelope for ${variant.operation} in the carrier namespace ${variant.carrierNamespace}.`,
					soapAction: variant.soapAction,
					namespace: variant.carrierNamespace,
					bodyFields: variant.bodyFields,
					expectedEnvelope: variant.expectedEnvelope,
					explanation:
						"The SOAP envelope must declare the carrier namespace on the Envelope, then use that namespace for the operation and typed child elements inside the Body.",
				},
			};
		},
	},
];

const timeoutChoice = (
	id: string,
	label: string,
	nextStepId: string | null,
	feedback: string,
	isCorrect: boolean
) => ({ id, label, nextStepId, feedback, isCorrect });

const timeoutScenarioFamily: ScenarioFamilyDefinition = {
	id: "timeout-create-shipment",
	concept: "Ambiguous shipment-creation timeout recovery",
	ladderLevel: 2,
	difficulty: "beginner",
	summary:
		"Investigate an ambiguous shipment-creation timeout, use evidence before retrying, and close the loop with an idempotency fix.",
	title: "Timeout on Create Shipment",
	buildRun: (seed) => {
		const carrier = pickDeterministic(
			[
				{ name: "CarrierX", path: "/v1/shipments", order: "ORD-123" },
				{ name: "ParcelStream", path: "/api/shipments", order: "ORD-784" },
				{ name: "Atlas Freight", path: "/shipments/create", order: "ORD-445" },
			],
			deriveChildSeed(seed, "carrier")
		);
		const evidenceBank = pickDeterministic(
			[
				[
					"App log: timeout after 30s waiting for carrier response.",
					"Outbound correlation ID: corr-ship-7f31.",
					"No delivery receipt from the carrier yet.",
				],
				[
					"Queue metadata shows this was the first attempt for the order.",
					"The worker emitted a warning just before the timeout boundary.",
					"Support chat says the customer is waiting for a label right now.",
				],
			],
			deriveChildSeed(seed, "evidence")
		);
		const queryPath = `${carrier.path}?order_id=${carrier.order}`;
		const steps: ScenarioStep[] = [
			{
				id: "start",
				text: `Monitoring fires: POST ${carrier.path} to ${carrier.name} timed out after 30 seconds while creating shipment ${carrier.order}. What do you do first?`,
				choices: [
					timeoutChoice(
						"retry-blind",
						"Retry the POST immediately",
						"duplicate-risk",
						"Risky — the original request may already have created a shipment, so a blind retry can produce duplicate labels and charges.",
						false
					),
					timeoutChoice(
						"inspect-evidence",
						"Inspect the evidence you already have before retrying",
						"evidence-review",
						"Correct — use correlation IDs, queue metadata, and recent shipment lookups before deciding whether another write is safe.",
						true
					),
					timeoutChoice(
						"customer-wait",
						"Tell the customer to try again later",
						null,
						"Poor recovery. You should investigate the ambiguous state instead of pushing the uncertainty back to the customer.",
						false
					),
				],
			},
			{
				id: "duplicate-risk",
				text: `You retried without checking state. ${carrier.name} returned 201 Created, but support now sees two shipments for ${carrier.order}. What do you do next?`,
				choices: [
					timeoutChoice(
						"void-duplicate",
						"Void the duplicate shipment and record the missing idempotency guardrail",
						"system-fix",
						"Correct — clean up the duplicate first, then fix the workflow so the same ambiguity cannot create another extra label.",
						true
					),
					timeoutChoice(
						"ignore-duplicate",
						"Ignore the duplicate because the customer only needs one label",
						null,
						"Wrong — duplicate shipments still create billing, tracking, and operational reconciliation problems.",
						false
					),
				],
			},
			{
				id: "evidence-review",
				text: `Current evidence:\n\n- ${evidenceBank.join("\n- ")}\n\nWhat is the best next move?`,
				choices: [
					timeoutChoice(
						"query-existing",
						`Query ${queryPath} and search by the client reference before retrying`,
						"query-result",
						"Correct — check whether the original shipment already exists before sending another write request.",
						true
					),
					timeoutChoice(
						"queue-retry",
						"Send the request back to the queue immediately with no additional checks",
						null,
						"That repeats the same ambiguity. Investigate the carrier state first.",
						false
					),
				],
			},
			{
				id: "query-result",
				text: `The shipment lookup at ${queryPath} shows an existing label for ${carrier.order}. What do you do now?`,
				choices: [
					timeoutChoice(
						"return-existing",
						"Return the existing shipment result and make the create flow idempotent for future retries",
						"system-fix",
						"Correct — the safest outcome is to use the existing shipment and improve the retry path so the next timeout is not ambiguous.",
						true
					),
					timeoutChoice(
						"create-anyway",
						"Create a second shipment because the first lookup might be stale",
						null,
						"Wrong — the lookup resolved the ambiguity. Creating another shipment reintroduces the duplicate risk you just avoided.",
						false
					),
				],
			},
			{
				id: "system-fix",
				text: "You recovered the incident. Which systemic fix best prevents the same timeout from turning into duplicate shipments later?",
				choices: [
					timeoutChoice(
						"idempotency-fix",
						"Store a client reference or Idempotency-Key, query by that key, and reuse the original shipment outcome on retries",
						null,
						"Perfect — explicit idempotency and evidence-based recovery eliminate the blind-retry path that caused the incident.",
						true
					),
					timeoutChoice(
						"longer-timeout",
						"Increase the timeout and keep the current retry behavior",
						null,
						"Longer timeouts may reduce noise, but they do not solve ambiguous writes. You still need an idempotent recovery path.",
						false
					),
				],
			},
		];

		return {
			runId: `timeout-create-shipment-${seed}`,
			scenario: {
				id: "timeout-create-shipment",
				scenarioFamilyId: "timeout-create-shipment",
				progressKey: "timeout-create-shipment",
				runSeed: seed,
				title: "Timeout on Create Shipment",
				summary:
					"Use evidence before retrying an ambiguous shipment-creation timeout, then close the loop with an idempotency fix.",
				difficulty: "beginner",
				evidence: evidenceBank,
				steps,
			},
		};
	},
};

const scenarioFamilies: ScenarioFamilyDefinition[] = [timeoutScenarioFamily];

export function getLessonDefinitionBySlug(
	slug: string
): LessonDefinition | undefined {
	return lessonDefinitions.find((lesson) => lesson.slug === slug);
}

export function getDrillFamilyById(
	id: string
): DrillFamilyDefinition | undefined {
	return drillFamilies.find((family) => family.id === id);
}

export function getScenarioFamilyById(
	id: string
): ScenarioFamilyDefinition | undefined {
	return scenarioFamilies.find((family) => family.id === id);
}

export { drillFamilies, lessonDefinitions, scenarioFamilies };
