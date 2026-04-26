/**
 * Carrier Surface Wiki Entries
 *
 * Each entry is precise on the four taxonomy axes defined in
 * specs/current-changes/issue-15-wiki-expansion-plan.md:
 *   vendor → business unit → region → protocol family.
 *
 * Slugs are immutable. Status changes never rewrite a slug; sunset/legacy
 * pages stay published and indexed because they are still the right answer
 * to "is this API still supported?" search intent.
 */

import type { CarrierSurface } from "./types";

export const carrierSurfaces: CarrierSurface[] = [
	{
		slug: "dhl-express-global-mydhl-rest",
		vendor: "DHL",
		vendorSlug: "dhl",
		businessUnit: "Express",
		businessUnitSlug: "express",
		region: "global",
		protocol: "rest",
		apiName: "MyDHL API",
		title: "DHL Express MyDHL API (REST, global)",
		summary:
			"Modern REST surface for DHL's international express network. OAuth-style basic-credential header, separate sandbox account, and a JSON contract that is unrelated to DHL eCommerce or DHL Parcel DE.",
		status: "active",
		authMethods: ["HTTP Basic over TLS using API username and password"],
		baseUrls: {
			production: "https://api-eu.dhl.com/mydhlapi",
			sandbox: "https://api-mock.dhl.com/mydhlapi",
		},
		officialDocs: [
			{
				label: "DHL Developer Portal — MyDHL API",
				url: "https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
			},
		],
		sandboxNotes:
			"Sandbox is a mock environment with a fixed test account. Production credentials are issued separately and require a customer account number per origin country.",
		toolingNotes: {
			openApiUrl:
				"https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
		},
		body: "MyDHL API is the JSON/REST surface for DHL Express, the time-definite international express business unit. It is the only DHL surface a developer should target for cross-border express shipments under DHL's air-network products. It is not the API for DHL eCommerce parcel delivery, DHL Parcel DE domestic Germany, or DHL Freight; each of those is a different business unit with a different developer portal, different credentials, and a different contract.\n\nAuthentication uses HTTP Basic over TLS with an API username and password issued through the DHL Developer Portal. Tokens are not refresh-rotated; treat the credentials as long-lived secrets and rotate them through the portal when staff changes. Most operations require a DHL Express account number per origin country, which is sent in the request body rather than derived from the credentials.\n\nThe most common operational gotchas are sandbox-versus-production drift on label PDFs, currency-aware rate responses that look identical but differ by surcharges, and idempotency: MyDHL API does not provide a server-managed idempotency key, so duplicate shipments are prevented at the integrator side using a deterministic correlation ID per logical operation. Webhooks for status updates are available through DHL's separate Shipment Tracking API and are not part of MyDHL itself.",
		faqs: [
			{
				question: "Is MyDHL API the same as the DHL eCommerce API?",
				answer:
					"No. MyDHL API serves DHL Express (international time-definite). DHL eCommerce Solutions has its own REST API, its own credentials, and a different shipment lifecycle.",
			},
			{
				question: "Does MyDHL API use OAuth 2.0?",
				answer:
					"No. MyDHL API uses HTTP Basic authentication with an API username and password over TLS. There is no token endpoint and no refresh flow.",
			},
			{
				question: "How do I deduplicate retries against MyDHL API?",
				answer:
					"MyDHL API does not provide a server-managed idempotency key. Generate a stable correlation ID per logical operation, store it before sending the request, and refuse to resend if the upstream response is unknown. Do not rely on the carrier to detect duplicates.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"correlation-id",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: [
			"dhl-ecommerce-americas-rest",
			"dhl-parcel-de-rest",
			"dhl-freight-se-rest",
		],
		directorySlugs: ["dhl-developer-portal-mydhl"],
		sources: [
			{
				label: "DHL Developer Portal — MyDHL API",
				url: "https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
			},
			{
				label: "RFC 7617 — The 'Basic' HTTP Authentication Scheme",
				url: "https://www.rfc-editor.org/rfc/rfc7617",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "dhl-ecommerce-americas-rest",
		vendor: "DHL",
		vendorSlug: "dhl",
		businessUnit: "eCommerce Solutions",
		businessUnitSlug: "ecommerce",
		region: "americas",
		protocol: "rest",
		apiName: "DHL eCommerce Solutions Americas API",
		title: "DHL eCommerce Solutions Americas API (REST)",
		summary:
			"REST surface for DHL's domestic and international parcel network in the Americas. Uses a token-based auth flow that is unrelated to MyDHL API and a separate developer portal.",
		status: "active",
		authMethods: [
			"Token request with client credentials, bearer token in subsequent calls",
		],
		baseUrls: {
			production: "https://api.dhlecs.com/",
			sandbox: "https://api-sandbox.dhlecs.com/",
		},
		officialDocs: [
			{
				label: "DHL eCommerce Solutions Americas — Developer Portal",
				url: "https://docs.api.dhlecs.com/",
			},
		],
		sandboxNotes:
			"Sandbox uses a separate base URL and separate credentials. Tracking-event timestamps in sandbox are simulated and should not be used to validate webhook timing assumptions.",
		toolingNotes: {
			openApiUrl: "https://docs.api.dhlecs.com/",
		},
		body: "DHL eCommerce Solutions Americas API serves DHL's parcel-delivery business unit in the Americas region. It is a separate product from DHL Express MyDHL API: different developer portal, different credentials, different shipment lifecycle, and different tracking event vocabulary. Confusing the two is one of the most common DHL integration failures because the brand is shared but the systems are not.\n\nAuthentication is a two-step token flow: the integrator posts client credentials to a token endpoint and receives a bearer token used in subsequent shipment calls. Tokens are short-lived and must be cached centrally, refreshed with a buffer before expiry, and re-issued through a single-flight refresh path. A naive per-worker refresh pattern will rate-limit the token endpoint and widen any auth-related outage.\n\nOperationally, the API exposes shipment creation, label generation, and status tracking for the Americas parcel network. Tracking events are eventually consistent, so consumers must tolerate late status updates and must not rebuild monotonic shipment state from a single most-recent webhook. Webhooks are signed; verify signatures against the raw request body before parsing. The eCommerce business unit ships through DHL's last-mile network, not the express air network, so transit times and surcharges differ from MyDHL.",
		faqs: [
			{
				question:
					"Why are my MyDHL credentials rejected by the eCommerce Solutions API?",
				answer:
					"Because the two products use different authentication systems. MyDHL API uses HTTP Basic with an API username and password. DHL eCommerce Solutions uses a token-based flow with separate client credentials issued from a separate developer portal.",
			},
			{
				question: "How short-lived are eCommerce Solutions access tokens?",
				answer:
					"Treat the token expiry as carrier-managed and refresh proactively from a central cache, with a small expiry buffer. Do not assume a fixed lifetime; the carrier portal is the source of truth for the current value.",
			},
			{
				question: "Is webhook delivery exactly-once?",
				answer:
					"No carrier promises exactly-once webhook delivery. Verify signatures against the raw body, deduplicate by event ID, and reconcile event order using the carrier's timestamps rather than your receive time.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"webhook-signatures",
			"webhook-replay-and-ordering",
		],
		relatedSurfaceSlugs: [
			"dhl-express-global-mydhl-rest",
			"dhl-parcel-de-rest",
			"dhl-freight-se-rest",
		],
		directorySlugs: ["dhl-ecommerce-americas-portal"],
		sources: [
			{
				label: "DHL eCommerce Solutions Americas — Developer Portal",
				url: "https://docs.api.dhlecs.com/",
			},
			{
				label: "RFC 6749 — OAuth 2.0 Authorization Framework",
				url: "https://www.rfc-editor.org/rfc/rfc6749",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "dhl-parcel-de-rest",
		vendor: "DHL",
		vendorSlug: "dhl",
		businessUnit: "Post & Parcel Germany",
		businessUnitSlug: "parcel-de",
		region: "de",
		protocol: "rest",
		apiName: "DHL Post & Parcel Germany API",
		title: "DHL Post & Parcel Germany API (REST, Germany)",
		summary:
			"DHL's domestic Germany parcel and post API surface. REST-based, German-language documentation primary, separate credentialing through DHL Geschäftskundenportal. Distinct from MyDHL Express.",
		status: "active",
		authMethods: [
			"HTTP Basic for the API key plus per-user OAuth-style header for the German business-customer login",
		],
		baseUrls: {
			production: "https://api-eu.dhl.com/parcel/de",
			sandbox: "https://api-sandbox.dhl.com/parcel/de",
		},
		officialDocs: [
			{
				label:
					"DHL Developer Portal — Parcel DE Shipping (Post & Parcel Germany)",
				url: "https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany",
			},
		],
		sandboxNotes:
			"Sandbox requires both the developer-portal API key and a German business-customer (Geschäftskundenportal) test account. A live API key without a Geschäftskundenportal login cannot create labels.",
		toolingNotes: {
			openApiUrl:
				"https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany",
		},
		body: "The Post & Parcel Germany API is DHL's domestic Germany parcel surface. It replaces the older Geschäftskundenversand SOAP/XML services and is the API integrators use for DHL Paket, DHL Päckchen, and Warenpost shipments originating in Germany. It is not the same API as MyDHL Express, even when both routes appear in the DHL Developer Portal: credentials are issued differently, the contract uses a different shipment vocabulary (Sendung versus shipment), and label formats are German-domestic specific.\n\nAuthentication uses an API key passed as an HTTP Basic credential, combined with a per-user header that authenticates the underlying Geschäftskundenportal account. Both are required: the API key alone authenticates the integrator, and the Geschäftskundenportal login authenticates the customer whose contract is being used to ship. Misalignment between the two is the most frequent first-time integration failure.\n\nMany operational fields are mandatory only for German domestic shipments — Sendungsnummer formats, Postnummer for Packstation deliveries, and the explicit declaration of dangerous goods (Gefahrgut) flags. Schema validation against the DHL OpenAPI document before sending requests turns vague German-language faults into precise local errors. Webhook delivery for delivery and pickup events is available through a separate tracking API.",
		faqs: [
			{
				question:
					"Can I reuse my MyDHL API credentials with the Post & Parcel Germany API?",
				answer:
					"No. The two surfaces issue separate credentials and use different authentication models. Post & Parcel Germany also requires a per-user header for the Geschäftskundenportal account that owns the shipping contract.",
			},
			{
				question: "Where do I get a Geschäftskundenportal login for sandbox?",
				answer:
					"DHL provides a separate sandbox Geschäftskundenportal account on request through the Developer Portal. Production logins are issued to your DHL business-customer relationship and are managed in the live Geschäftskundenportal.",
			},
			{
				question:
					"Is the older Geschäftskundenversand SOAP API still supported?",
				answer:
					"DHL has been migrating Post & Parcel Germany customers from the legacy SOAP/XML service onto this REST API. Treat the legacy SOAP path as deprecated and check the developer portal for the current sunset schedule.",
			},
		],
		relatedConceptSlugs: [
			"schema-validation",
			"oauth-token-lifecycle",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: [
			"dhl-express-global-mydhl-rest",
			"dhl-ecommerce-americas-rest",
			"dhl-freight-se-rest",
		],
		directorySlugs: ["dhl-developer-portal-parcel-de"],
		sources: [
			{
				label: "DHL Developer Portal — Parcel DE Shipping",
				url: "https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany",
			},
			{
				label: "DHL Geschäftskundenportal",
				url: "https://www.dhl.de/geschaeftskunden",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "dhl-freight-se-rest",
		vendor: "DHL",
		vendorSlug: "dhl",
		businessUnit: "Freight (Sweden)",
		businessUnitSlug: "freight",
		region: "se",
		protocol: "rest",
		apiName: "DHL Freight API Farm (Sweden)",
		title: "DHL Freight API Farm (REST, Sweden)",
		summary:
			"DHL Freight's Sweden-specific REST hub for booking, pricing, validation, and shipping documents on Sweden domestic and Sweden-originating international road freight. Wholly separate portal, base URLs, and credentials from MyDHL Express, DHL eCommerce Americas, and DHL Parcel DE.",
		status: "active",
		authMethods: [
			"Per-application GUID API key issued by API Farm and sent in the request header (client-key)",
		],
		baseUrls: {
			production: "https://api.freight-logistics.dhl.com",
			sandbox: "https://test-api.freight-logistics.dhl.com",
		},
		officialDocs: [
			{
				label: "DHL Freight Sweden — API Farm",
				url: "https://dhlpaket.se/dashboard/services/api-farm/",
			},
			{
				label: "API Farm — Technical Setup",
				url: "https://dhlpaket.se/dashboard/services/api-farm/get-started/",
			},
			{
				label: "API Farm — API Overview (all APIs)",
				url: "https://dhlpaket.se/dashboard/services/api-farm/api-overview/",
			},
		],
		sandboxNotes:
			"Sign up at test-admin.freight-logistics.dhl.com, create an Organisation, register an Application — the GUID client-key is shown exactly once and cannot be retrieved later. Production access requires a separate registration at admin.freight-logistics.dhl.com plus an Implementation Request, and DHL Freight will not activate production until at least one validated test request per API is on file.",
		toolingNotes: {
			postmanCollectionUrl:
				"https://dhlpaket.se/dashboard/wp-content/uploads/sites/2/2026/01/103-DHL-SERVICEPOINT-B2C-1.zip",
		},
		body: "API Farm is DHL Freight's REST hub for the Sweden market — domestic Swedish road freight plus Sweden-originating international transports. It is a wholly separate surface from MyDHL Express, DHL eCommerce Americas, and DHL Post & Parcel Germany: a different developer portal at dhlpaket.se/dashboard/services/api-farm, different base URLs (api.freight-logistics.dhl.com for production, test-api.freight-logistics.dhl.com for sandbox), and a different authentication model. The DHL Group Developer Portal at developer.dhl.com explicitly redirects Sweden traffic here for domestic and Sweden-originating international transports.\n\nAuthentication uses a per-application GUID API key (the client-key). After signing up, you create an Organisation, register an Application, and DHL shows the client-key exactly once — save it securely because it cannot be retrieved later. The key must be sent in the request header on every call. Production keys require a separate registration at admin.freight-logistics.dhl.com plus an Implementation Request; DHL Freight will not activate production access until at least one validated test request per API is recorded.\n\nThe surface is broad. TransportInstruction creates road-freight orders, PickupRequest books pickups, and Print returns labels, return labels, CMRs, and other documents as Base64-encoded PDFs. PriceQuote returns prices and supports contract pricing when combined with e-ID account-number validation. Product, AdditionalService, PostalCodes, Terminal, and TimeTable describe what is sellable, allowed, and routable on a given lane, while ServicePointLocator and HomeDeliveryLocator power last-mile UX. Tracking is intentionally out of scope here: DHL delegates tracking to the global Shipment Tracking - Unified API at developer.dhl.com. Cancellations are not API-accessible — you cancel in your own system and phone DHL Customer Service at 0771-345 345. For more than 10,000 shipments per day DHL recommends traditional EDI rather than API Farm.",
		faqs: [
			{
				question: "How do I get an API key for DHL Freight Sweden API Farm?",
				answer:
					"Register at test-admin.freight-logistics.dhl.com, confirm the email from apifarm@dhl.com, create an Organisation, register an Application, and DHL will show your GUID client-key exactly once — store it securely. A DHL customer number is not required for sandbox testing but is required before going live.",
			},
			{
				question:
					"How do I cancel a shipment booked through DHL Freight API Farm?",
				answer:
					"You cannot cancel transports via API or EDI. Cancel the order inside your own system and phone DHL Customer Service at 0771-345 345 with the booking or shipment number to cancel on the DHL side.",
			},
			{
				question:
					"When should I use traditional EDI instead of API Farm for DHL Freight Sweden?",
				answer:
					"DHL Freight recommends EDI for high-volume integrations of more than 10,000 shipments per day. For smaller-volume or interactive flows (booking from a checkout, on-demand label printing, ad-hoc price quotes) the REST APIs in API Farm are the supported path.",
			},
			{
				question: "Does API Farm cover shipment tracking too?",
				answer:
					"No. API Farm covers booking, pricing, validation, and document generation for DHL Freight Sweden. Tracking is delegated to the DHL Group Shipment Tracking - Unified API at developer.dhl.com, which covers parcels, freight, eCommerce, letters, and Express across DHL divisions.",
			},
		],
		relatedConceptSlugs: [
			"sandbox-vs-production",
			"schema-validation",
			"idempotency",
		],
		relatedSurfaceSlugs: [
			"dhl-express-global-mydhl-rest",
			"dhl-ecommerce-americas-rest",
			"dhl-parcel-de-rest",
		],
		directorySlugs: ["dhl-freight-sweden-api-farm"],
		sources: [
			{
				label: "DHL Freight Sweden — API Farm overview",
				url: "https://dhlpaket.se/dashboard/services/api-farm/",
			},
			{
				label: "DHL Freight Sweden — API Farm Technical Setup",
				url: "https://dhlpaket.se/dashboard/services/api-farm/get-started/",
			},
			{
				label: "DHL Freight APIs (Group portal, redirects Sweden traffic here)",
				url: "https://developer.dhl.com/dhl-freight",
			},
		],
		lastReviewed: "2026-04-26",
	},
	{
		slug: "ups-global-rest-oauth",
		vendor: "UPS",
		vendorSlug: "ups",
		businessUnit: "Developer APIs",
		businessUnitSlug: "developer-apis",
		region: "global",
		protocol: "rest",
		apiName: "UPS Developer APIs (REST + OAuth 2.0)",
		title: "UPS Developer APIs (REST + OAuth 2.0)",
		summary:
			"UPS's modern REST and OAuth 2.0 surface, replacing the legacy XML/SOAP web services that were sunset on 2024-06-03. Covers Shipping, Rating, Tracking, Address Validation, and Time in Transit.",
		status: "active",
		authMethods: [
			"OAuth 2.0 client_credentials grant with bearer tokens",
			"Authorization Code grant for delegated access",
		],
		baseUrls: {
			production: "https://onlinetools.ups.com/api",
			sandbox: "https://wwwcie.ups.com/api",
		},
		officialDocs: [
			{
				label: "UPS Developer Portal",
				url: "https://developer.ups.com/",
			},
		],
		sandboxNotes:
			"Sandbox base URL is the UPS Customer Integration Environment (CIE). Tokens issued in CIE are not valid in production and vice versa. Negotiated rates and account-specific products are usually only available in production.",
		toolingNotes: {
			openApiUrl: "https://developer.ups.com/api/reference",
		},
		body: "UPS Developer APIs are the modern UPS surface for shipping, rating, tracking, time-in-transit, and address validation. They use REST with JSON bodies and OAuth 2.0 for authentication. UPS sunset its legacy XML and SOAP web services on 2024-06-03; integrators that still see references to UPS XML must migrate to this REST surface to avoid scheduled-failure outages.\n\nAuthentication uses the OAuth 2.0 client_credentials grant. Cache the access token centrally, refresh with a buffer before expiry, and ensure only one refresh runs concurrently across workers — uncoordinated refreshes will rate-limit the UPS token endpoint and widen any auth incident. Authorization Code grant is also supported for partner integrations that act on behalf of an end-user account.\n\nThe sandbox endpoint (`wwwcie.ups.com`) returns deterministic test data for many tracking and rate flows, but negotiated rates and account-specific surcharges are typically only correct in production. Treat the sandbox as a contract test, not a rate-accuracy test. Webhooks for tracking events are delivered through UPS Quantum View Notify; signature validation must run against the raw request body before parsing.\n\nWhen migrating from the legacy XML/SOAP surface, expect rate response shapes, tracking-event vocabularies, and error codes to change. The migration is not a one-line endpoint swap; treat it as a contract migration with parallel running and explicit cutover.",
		faqs: [
			{
				question: "Are the legacy UPS XML/SOAP services still available?",
				answer:
					"No. UPS sunset its legacy XML/SOAP web services on 2024-06-03. The modern REST and OAuth 2.0 Developer APIs are the replacement; legacy integrators must migrate to avoid scheduled-failure outages.",
			},
			{
				question: "Are negotiated rates available in the UPS sandbox?",
				answer:
					"Generally no. The UPS Customer Integration Environment returns deterministic test data and a stable rate card. Negotiated rates and account-specific products are typically only correct in production.",
			},
			{
				question:
					"Which OAuth grant should I use for server-to-server UPS calls?",
				answer:
					"client_credentials. The Authorization Code grant exists for partner integrations that act on behalf of an end-user account and is not the right shape for a single-tenant shipping integration.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"retry-after-and-backpressure",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: ["ups-global-xml-legacy"],
		directorySlugs: ["ups-developer-portal-rest"],
		sources: [
			{
				label: "UPS Developer Portal",
				url: "https://developer.ups.com/",
			},
			{
				label: "RFC 6749 — OAuth 2.0 Authorization Framework",
				url: "https://www.rfc-editor.org/rfc/rfc6749",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "ups-global-xml-legacy",
		vendor: "UPS",
		vendorSlug: "ups",
		businessUnit: "Legacy Web Services",
		businessUnitSlug: "legacy-web-services",
		region: "global",
		protocol: "xml-rpc",
		apiName: "UPS Legacy XML/SOAP Web Services",
		title: "UPS Legacy XML/SOAP Web Services (sunset)",
		summary:
			"UPS's pre-2024 XML and SOAP web services. Sunset on 2024-06-03. Documented here so legacy integrators searching for 'UPS XML API' can land on the correct migration path rather than a 404.",
		status: "sunset",
		replacementSurfaceSlug: "ups-global-rest-oauth",
		authMethods: [
			"Access License Number plus username and password in the SOAP/XML request body",
		],
		baseUrls: {},
		officialDocs: [
			{
				label: "UPS Developer Portal — Migration Guidance",
				url: "https://developer.ups.com/",
			},
		],
		deprecationNotes:
			"UPS sunset its legacy XML and SOAP web services on 2024-06-03. Calls against the legacy endpoints fail; the only supported integration path is the modern REST/OAuth 2.0 Developer APIs.",
		body: "The UPS legacy XML/SOAP web services were sunset on 2024-06-03. They covered the same operations now served by the UPS Developer APIs (Shipping, Rating, Tracking, Address Validation, Time in Transit, Locator), but used XML payloads with credentials embedded directly in the request body and a per-service WSDL. Calls against the legacy endpoints no longer succeed.\n\nThis page exists because integrators still encounter the legacy endpoints in long-lived codebases, vendor scripts, and ERP plug-ins. The replacement is the UPS Developer APIs surface, which uses REST with JSON and OAuth 2.0 client_credentials. The migration changes more than the transport: rate-response shapes, tracking-event vocabularies, and error codes all evolved during the move. Plan the migration as a contract change, not as an endpoint swap.\n\nIf an existing integration still references the legacy endpoints, treat that as a sev-2 incident waiting to happen at the next batch run. Schedule a cutover with parallel running against the new REST endpoints, validate label formats and rate parity in the UPS Customer Integration Environment, and only retire the legacy code path after a full reconciliation cycle in production.",
		faqs: [
			{
				question: "Can I still call the UPS XML or SOAP endpoints?",
				answer:
					"No. UPS sunset the legacy XML/SOAP web services on 2024-06-03. The only supported integration path is the REST/OAuth 2.0 Developer APIs.",
			},
			{
				question: "Is the migration a transport-only change?",
				answer:
					"No. Rate response shapes, tracking-event vocabularies, and error codes changed during the migration. Treat the move as a full contract migration with parallel running and explicit cutover, not as a base-URL swap.",
			},
			{
				question: "Where do I get migration guidance from UPS?",
				answer:
					"The UPS Developer Portal hosts the official migration guidance and the OpenAPI references for the replacement REST APIs.",
			},
		],
		relatedConceptSlugs: ["wsdl", "wsdl-diff-monitoring", "contract-testing"],
		relatedSurfaceSlugs: ["ups-global-rest-oauth"],
		directorySlugs: ["ups-developer-portal-rest"],
		sources: [
			{
				label: "UPS Developer Portal",
				url: "https://developer.ups.com/",
			},
			{
				label: "W3C WSDL 1.1",
				url: "https://www.w3.org/TR/wsdl.html",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "fedex-express-us-rest",
		vendor: "FedEx",
		vendorSlug: "fedex",
		businessUnit: "Express",
		businessUnitSlug: "express",
		region: "us",
		protocol: "rest",
		apiName: "FedEx REST APIs (developer.fedex.com)",
		title: "FedEx REST APIs (Express, US, OAuth 2.0)",
		summary:
			"Modern REST surface for FedEx Express in the US, exposed through developer.fedex.com. OAuth 2.0 client_credentials, JSON payloads, sibling to the legacy FedEx Web Services SOAP product.",
		status: "active",
		authMethods: ["OAuth 2.0 client_credentials grant with bearer tokens"],
		baseUrls: {
			production: "https://apis.fedex.com/",
			sandbox: "https://apis-sandbox.fedex.com/",
		},
		officialDocs: [
			{
				label: "FedEx Developer Portal",
				url: "https://developer.fedex.com/",
			},
		],
		sandboxNotes:
			"Sandbox uses a separate hostname and separate API keys. Tokens issued in sandbox are not valid in production. Some FedEx Ground operations require additional production credentials beyond the sandbox account.",
		toolingNotes: {
			openApiUrl: "https://developer.fedex.com/api/en-us/catalog.html",
		},
		body: "The FedEx REST APIs at developer.fedex.com are the modern integration surface for FedEx Express in the US. They expose Ship, Rate, Track, Address Validation, and supporting operations as REST endpoints with JSON payloads, authenticated through OAuth 2.0 client_credentials. They are the default new-integration target and the API surface FedEx is investing in.\n\nThe REST APIs run alongside the older FedEx Web Services SOAP product. Both still work today; FedEx has not announced a final SOAP sunset date as of this page's last review, but new contracts are typically issued on the REST surface and integrators should default to it. The two surfaces are not interchangeable: the REST APIs use JSON, OAuth tokens, and an updated error vocabulary, while the SOAP services use WSDL-driven envelopes and credentials embedded in the body.\n\nOperationally, the REST surface returns paginated results for tracking lookups, supports proactive notifications through FedEx's webhook product, and surfaces multi-piece shipment errors per piece rather than collapsing them into a single fault. Schema validation against the FedEx OpenAPI document before sending requests turns vague carrier errors into precise local failures and shortens incident loops. Sandbox returns deterministic test data; verify rate parity in production with a small parallel-running window before retiring any legacy code path.",
		faqs: [
			{
				question: "Should new FedEx integrations target REST or SOAP?",
				answer:
					"REST. The FedEx Developer Portal at developer.fedex.com is FedEx's investment surface and the default new-integration target. The legacy FedEx Web Services SOAP product still works but should not be the choice for greenfield work.",
			},
			{
				question: "How do I authenticate the FedEx REST APIs?",
				answer:
					"OAuth 2.0 client_credentials. Post your API key and secret to the FedEx token endpoint, cache the bearer token centrally, and refresh proactively before expiry. Do not embed credentials in the request body.",
			},
			{
				question: "Are FedEx Ground and FedEx Express on the same API?",
				answer:
					"They are accessed through the same FedEx REST surface, but the products have distinct operations, surcharges, and account requirements. Treat them as different shipping services that share an API base, not as identical interchangeable services.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"schema-validation",
			"webhook-replay-and-ordering",
		],
		relatedSurfaceSlugs: ["fedex-express-global-soap-legacy"],
		directorySlugs: ["fedex-developer-portal-rest"],
		sources: [
			{
				label: "FedEx Developer Portal",
				url: "https://developer.fedex.com/",
			},
			{
				label: "RFC 6749 — OAuth 2.0 Authorization Framework",
				url: "https://www.rfc-editor.org/rfc/rfc6749",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "fedex-express-global-soap-legacy",
		vendor: "FedEx",
		vendorSlug: "fedex",
		businessUnit: "Express",
		businessUnitSlug: "express",
		region: "global",
		protocol: "soap",
		apiName: "FedEx Web Services (SOAP)",
		title: "FedEx Web Services (SOAP, legacy)",
		summary:
			"FedEx's legacy SOAP/WSDL surface for Ship, Rate, and Track operations. Still in production at this page's last review but explicitly the older surface; new integrations should target the FedEx REST APIs.",
		status: "legacy",
		replacementSurfaceSlug: "fedex-express-us-rest",
		authMethods: [
			"WS-Security-style credentials embedded in the SOAP request body (key, password, account, meter)",
		],
		baseUrls: {
			production: "https://ws.fedex.com:443/web-services",
			sandbox: "https://wsbeta.fedex.com:443/web-services",
		},
		officialDocs: [
			{
				label: "FedEx Developer Portal — Web Services",
				url: "https://www.fedex.com/en-us/developer/web-services.html",
			},
		],
		deprecationNotes:
			"FedEx has not published a final sunset date for Web Services as of this page's last review, but the FedEx Developer Portal directs new integrations to the REST APIs. Treat SOAP as a maintenance-only target.",
		toolingNotes: {
			wsdlUrl: "https://www.fedex.com/en-us/developer/web-services.html",
		},
		body: "FedEx Web Services is the legacy SOAP and WSDL surface for FedEx Express. Each service (Ship, Rate, Track, Address Validation, Country, Locator) is published as a separate WSDL document, and integrators generate clients per service. Authentication uses a WS-Security-style block carrying API key, password, account number, and meter number directly in the SOAP request body, so credentials must be treated as live secrets that ride with every call.\n\nThe most operationally important rule with FedEx Web Services is contract observability. Capture a checksum or canonical diff of the live WSDL and any imported schemas, compare it with the version your generated client was built against, and alert when the contract changes outside your planned deployment flow. WSDL drift is the most common root cause of a sudden FedEx SOAP outage that is not actually a code regression on the integrator side.\n\nFedEx is directing new integrations to the REST APIs at developer.fedex.com. Web Services still works at this page's last review, but the investment surface is REST. Plan any greenfield integration on REST and treat existing SOAP integrations as maintenance-only — keep the WSDL diff monitor running, keep the generated client up to date with each contract change, and budget a future migration window rather than rebuilding on SOAP.",
		faqs: [
			{
				question: "Are FedEx Web Services being sunset?",
				answer:
					"FedEx has not published a final sunset date as of this page's last review. Treat Web Services as a legacy surface in maintenance mode and target the FedEx REST APIs for new work.",
			},
			{
				question:
					"How do I detect a FedEx WSDL contract change before it breaks production?",
				answer:
					"Run WSDL diff monitoring: capture a checksum of the live WSDL and imported schemas on a schedule, compare against the version your generated client was built from, and alert on unplanned drift.",
			},
			{
				question: "Where do I put FedEx Web Services credentials?",
				answer:
					"In the SOAP request body, inside the FedEx-specific WS-Security-like header structure (key, password, account, meter). Treat them as long-lived secrets and rotate through the developer portal.",
			},
		],
		relatedConceptSlugs: [
			"wsdl",
			"wsdl-diff-monitoring",
			"soap-headers-and-auth",
		],
		relatedSurfaceSlugs: ["fedex-express-us-rest"],
		directorySlugs: ["fedex-web-services-soap"],
		sources: [
			{
				label: "FedEx Developer Portal — Web Services",
				url: "https://www.fedex.com/en-us/developer/web-services.html",
			},
			{
				label: "W3C WSDL 1.1",
				url: "https://www.w3.org/TR/wsdl.html",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "usps-us-apis-rest",
		vendor: "USPS",
		vendorSlug: "usps",
		businessUnit: "USPS APIs",
		businessUnitSlug: "usps-apis",
		region: "us",
		protocol: "rest",
		apiName: "USPS APIs (developer.usps.com)",
		title: "USPS APIs (REST, OAuth 2.0)",
		summary:
			"The modern USPS REST surface at developer.usps.com. OAuth 2.0 client_credentials, JSON payloads, replacing the legacy USPS Web Tools XML services.",
		status: "active",
		authMethods: ["OAuth 2.0 client_credentials grant with bearer tokens"],
		baseUrls: {
			production: "https://api.usps.com/",
			sandbox: "https://api-cat.usps.com/",
		},
		officialDocs: [
			{
				label: "USPS Developer Portal",
				url: "https://developer.usps.com/",
			},
		],
		sandboxNotes:
			"Sandbox is the USPS Customer Acceptance Test (CAT) environment, accessed through a separate hostname and separate credentials. Live tracking events are simulated; do not treat sandbox event timing as production-realistic.",
		toolingNotes: {
			openApiUrl: "https://developer.usps.com/apis",
		},
		body: "USPS APIs at developer.usps.com are the modern USPS surface for label creation, rate calculation, tracking, address validation, and pickup scheduling. They are REST-based with JSON payloads and use OAuth 2.0 client_credentials for authentication. They replace the legacy Web Tools XML services and are the integration target USPS is investing in.\n\nAuthentication is a standard OAuth 2.0 client_credentials grant. Cache the bearer token centrally, refresh with a buffer before expiry, and consolidate concurrent refresh attempts so the token endpoint is not rate-limited during a token-storm. Many USPS APIs operations require both an authenticated OAuth call and a USPS account-tied identifier (CRID, MID, or permit number) provided in the request body — the OAuth credentials authenticate the integrator, while the identifier authorizes the specific shipping account.\n\nOperationally, USPS APIs return more structured error detail than Web Tools and provide better-shaped problem responses for invalid addresses, unsupported services, and rate disqualifications. Tracking events are eventually consistent. Webhooks for tracking are available through a separate USPS Informed Visibility product, not through the core developer portal. Sandbox returns deterministic test data and is the right environment for contract testing; rate accuracy and account-tied entitlements should be verified in production with a small parallel-running window.",
		faqs: [
			{
				question: "Is USPS Web Tools still required for any USPS operations?",
				answer:
					"USPS has been migrating customers from Web Tools to the modern REST APIs. Treat Web Tools as deprecated; integrators should default to developer.usps.com for all new work and check the USPS portal for the current sunset schedule.",
			},
			{
				question:
					"Why does my USPS APIs call fail with an account-not-found error after OAuth succeeds?",
				answer:
					"OAuth authenticates the integrator. Most USPS APIs operations also require a USPS account-tied identifier (CRID, MID, or permit number) in the request. Both must be valid — a successful token does not by itself authorize a shipping account.",
			},
			{
				question: "Where are USPS APIs webhooks documented?",
				answer:
					"Webhooks for tracking are not part of the core developer portal contract. They are delivered through USPS Informed Visibility, which has its own enrollment and integration flow.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"problem-details",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: ["usps-us-webtools-legacy"],
		directorySlugs: ["usps-developer-portal-rest"],
		sources: [
			{
				label: "USPS Developer Portal",
				url: "https://developer.usps.com/",
			},
			{
				label: "RFC 6749 — OAuth 2.0 Authorization Framework",
				url: "https://www.rfc-editor.org/rfc/rfc6749",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "usps-us-webtools-legacy",
		vendor: "USPS",
		vendorSlug: "usps",
		businessUnit: "Web Tools",
		businessUnitSlug: "web-tools",
		region: "us",
		protocol: "xml-rpc",
		apiName: "USPS Web Tools (XML)",
		title: "USPS Web Tools (XML, deprecated)",
		summary:
			"USPS's pre-OAuth XML-over-HTTP API. Documented here so integrators searching for USPS Web Tools land on the correct migration path to the modern REST USPS APIs.",
		status: "deprecated",
		replacementSurfaceSlug: "usps-us-apis-rest",
		authMethods: ["UserID query parameter passed in the URL"],
		baseUrls: {
			production: "https://secure.shippingapis.com/ShippingAPI.dll",
		},
		officialDocs: [
			{
				label: "USPS Web Tools — Documentation",
				url: "https://www.usps.com/business/web-tools-apis/",
			},
		],
		deprecationNotes:
			"USPS Web Tools is deprecated and being replaced by the modern REST USPS APIs. Check the USPS Developer Portal for the current sunset schedule before relying on Web Tools for new work.",
		body: "USPS Web Tools is the pre-OAuth USPS API surface. Integrators issue HTTP GET or POST requests with an XML payload encoded into a query parameter (`API=<name>&XML=<payload>`), and authenticate using a UserID passed in the URL. There is no token, no rotation, and no account-scoped authorization beyond the UserID. The contract is XML-only and predates RFC 9457 problem details, so error responses are XML elements rather than structured problem objects.\n\nUSPS has been migrating customers off Web Tools onto the modern REST USPS APIs at developer.usps.com. Web Tools still works for many operations at this page's last review, but it is the deprecated surface and integrators should not target it for greenfield work. Existing Web Tools integrations should plan a migration window with parallel running against the REST APIs, because the field shapes, error vocabularies, and account-identifier requirements differ between the two.\n\nThis page exists primarily to redirect search traffic. Integrators searching for `USPS Web Tools` should land on a clear explanation of the deprecation and the replacement surface, not on a 404 or on outdated marketing copy. Treat any new Web Tools-only requirement as a sev-3 to investigate, on the assumption that the REST APIs already cover the operation under a different name.",
		faqs: [
			{
				question: "Can I still create new accounts on USPS Web Tools?",
				answer:
					"USPS is steering integrators to the modern REST APIs. Treat Web Tools as deprecated and start any new work on developer.usps.com.",
			},
			{
				question: "Is the UserID-in-URL authentication safe to keep?",
				answer:
					"It is the only authentication Web Tools supports, but it is materially weaker than the OAuth 2.0 model on the modern USPS APIs. Anything carrying a UserID should be limited to maintenance traffic until migrated.",
			},
			{
				question:
					"Will my existing Web Tools fields map one-to-one to the new USPS APIs?",
				answer:
					"No. Field shapes, error vocabularies, and account-identifier requirements differ. Plan a migration window with parallel running and explicit parity checks rather than a base-URL swap.",
			},
		],
		relatedConceptSlugs: [
			"problem-details",
			"schema-validation",
			"contract-testing",
		],
		relatedSurfaceSlugs: ["usps-us-apis-rest"],
		directorySlugs: ["usps-web-tools-legacy"],
		sources: [
			{
				label: "USPS Web Tools — Documentation",
				url: "https://www.usps.com/business/web-tools-apis/",
			},
			{
				label: "USPS Developer Portal",
				url: "https://developer.usps.com/",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "royal-mail-uk-shipping-v3-rest",
		vendor: "Royal Mail",
		vendorSlug: "royal-mail",
		businessUnit: "Shipping API",
		businessUnitSlug: "shipping-api",
		region: "uk",
		protocol: "rest",
		apiName: "Royal Mail Shipping API V3",
		title: "Royal Mail Shipping API V3 (REST, UK)",
		summary:
			"Royal Mail's REST shipping surface for UK origin shipments. Bearer-token authentication issued through the Royal Mail Customer Portal, separate from any Click & Drop UI session.",
		status: "active",
		authMethods: ["Bearer API token issued through Royal Mail Customer Portal"],
		baseUrls: {
			production: "https://api.royalmail.net/shipping/v3",
		},
		officialDocs: [
			{
				label: "Royal Mail Developer Documentation",
				url: "https://developer.royalmail.net/",
			},
		],
		sandboxNotes:
			"Royal Mail's sandbox availability varies by product and customer agreement. Confirm sandbox access in your Royal Mail customer portal; treat any rate or label generated outside production as non-authoritative.",
		toolingNotes: {
			openApiUrl: "https://developer.royalmail.net/",
		},
		body: "Royal Mail Shipping API V3 is the REST surface for shipments originating in the UK on Royal Mail's network. It covers shipment creation, label retrieval, manifest closing, and tracking-event lookup. Authentication is a static bearer API token issued through the Royal Mail Customer Portal — not OAuth. The token rides on every request in an `Authorization: Bearer <token>` header and must be treated as a long-lived secret.\n\nThe most common first-time integration confusion is treating the API as a programmatic mirror of the Click & Drop web UI. They are related but not identical: Click & Drop sessions and Shipping API V3 tokens are separate credentials, and some operations available in Click & Drop (like complex multi-leg returns) require additional Royal Mail-side configuration before they are available through the API.\n\nOperationally, Shipping API V3 returns label artifacts as base64-encoded payloads embedded in the JSON response. Label-format negotiation (PDF, ZPL, EPL) happens via request parameters, and printer drift between sandbox-style proofs and production printers is a recurring incident category. Manifesting is explicit: shipments must be added to a manifest and the manifest closed before the carrier handover, and missed manifest closes are a frequent cause of unexpected shipment-status drift downstream.",
		faqs: [
			{
				question: "Does Royal Mail Shipping API V3 use OAuth 2.0?",
				answer:
					"No. It uses a static bearer API token issued through the Royal Mail Customer Portal. Treat the token as a long-lived secret, store it server-side, and rotate it through the portal when staff changes.",
			},
			{
				question:
					"Is a Click & Drop session the same as a Shipping API V3 token?",
				answer:
					"No. Click & Drop is the web UI and uses session credentials. Shipping API V3 uses a separate bearer token. They are not interchangeable.",
			},
			{
				question: "Why are my labels missing after a successful create call?",
				answer:
					"The most common cause is a missed manifest close. Royal Mail requires shipments to be added to a manifest and the manifest closed before carrier handover; otherwise downstream tracking and billing can drift. Verify the manifest workflow in your integration.",
			},
		],
		relatedConceptSlugs: [
			"oauth-token-lifecycle",
			"correlation-id",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: [],
		directorySlugs: ["royal-mail-developer-portal"],
		sources: [
			{
				label: "Royal Mail Developer Documentation",
				url: "https://developer.royalmail.net/",
			},
			{
				label: "RFC 6750 — OAuth 2.0 Bearer Token Usage",
				url: "https://www.rfc-editor.org/rfc/rfc6750",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "la-poste-colissimo-fr-soap",
		vendor: "La Poste",
		vendorSlug: "la-poste",
		businessUnit: "Colissimo",
		businessUnitSlug: "colissimo",
		region: "fr",
		protocol: "soap",
		apiName: "Colissimo Web Service",
		title: "La Poste Colissimo Web Service (SOAP, France)",
		summary:
			"La Poste's SOAP and WSDL surface for Colissimo parcel shipments originating in France. Account number and password embedded in the SOAP envelope, French-language documentation primary.",
		status: "active",
		authMethods: [
			"Account number and password embedded in the SOAP request body",
		],
		baseUrls: {
			production: "https://ws.colissimo.fr/sls-ws/SlsServiceWS",
		},
		officialDocs: [
			{
				label: "La Poste Colissimo — Documentation Web Services",
				url: "https://www.colissimo.entreprise.laposte.fr/fr/api-colissimo",
			},
		],
		sandboxNotes:
			"Colissimo issues a separate test account on request through the La Poste Entreprise customer portal. Production credentials are tied to a Colissimo contract and are not interchangeable with test credentials.",
		toolingNotes: {
			wsdlUrl: "https://ws.colissimo.fr/sls-ws/SlsServiceWS?wsdl",
		},
		body: "Colissimo Web Service is La Poste's SOAP and WSDL surface for Colissimo parcel shipments originating in France. It exposes label generation, return-label generation, document retrieval, and supporting lookups through a single WSDL. Authentication is account-number plus password embedded in the SOAP request body — the credentials ride inside every envelope, so credential hygiene is a per-call concern, not a session concern.\n\nDocumentation is primarily in French and many operational fields (such as the Colissimo product code, signature options, and customs declarations for non-EU destinations) are validated server-side against rules that are easier to read in the official French-language guide than in any English secondary source. Schema validation against the WSDL and imported XSDs before sending the request turns vague server-side faults into precise local errors.\n\nOperationally, label artifacts are returned as base64-encoded payloads in the SOAP response body, and the most common first-incident is mishandling the binary payload during XML parsing — particularly when the response includes both PDF labels and CN23 customs documents. Treat WSDL drift as a real risk: La Poste publishes updated WSDLs when product rules change, and integrators that miss the diff will hit silent contract regressions on the next batch run. Pair the integration with WSDL diff monitoring and a generated-client refresh workflow.",
		faqs: [
			{
				question: "Where do I send Colissimo authentication credentials?",
				answer:
					"Inside the SOAP request body. Colissimo Web Service authenticates with an account number and password embedded in the envelope; there is no separate token endpoint or OAuth flow.",
			},
			{
				question: "Is the documentation only in French?",
				answer:
					"Primary documentation is French. Treat the official French guide as authoritative for product codes, customs rules, and signature-option semantics; English secondary sources can drift.",
			},
			{
				question: "How do I detect a Colissimo WSDL contract change?",
				answer:
					"Run WSDL diff monitoring against the live WSDL and any imported XSDs, compare against the version your generated client was built from, and alert on unplanned drift before the next scheduled batch.",
			},
		],
		relatedConceptSlugs: ["wsdl", "wsdl-diff-monitoring", "schema-validation"],
		relatedSurfaceSlugs: [],
		directorySlugs: ["la-poste-colissimo-portal"],
		sources: [
			{
				label: "La Poste Colissimo — Documentation Web Services",
				url: "https://www.colissimo.entreprise.laposte.fr/fr/api-colissimo",
			},
			{
				label: "W3C WSDL 1.1",
				url: "https://www.w3.org/TR/wsdl.html",
			},
		],
		lastReviewed: "2026-04-25",
	},
	{
		slug: "australia-post-au-shipping-rest",
		vendor: "Australia Post",
		vendorSlug: "australia-post",
		businessUnit: "Shipping & Tracking",
		businessUnitSlug: "shipping-tracking",
		region: "au",
		protocol: "rest",
		apiName: "Australia Post Shipping & Tracking API",
		title: "Australia Post Shipping & Tracking API (REST, Australia)",
		summary:
			"Australia Post's REST surface for domestic and international shipments originating in Australia. API key plus account-number authentication, separate from MyPost Business consumer flows.",
		status: "active",
		authMethods: [
			"API key in the Authorization header plus Australia Post account number on each request",
		],
		baseUrls: {
			production: "https://digitalapi.auspost.com.au/",
			sandbox: "https://digitalapi.auspost.com.au/test/",
		},
		officialDocs: [
			{
				label: "Australia Post Developer Centre",
				url: "https://developers.auspost.com.au/",
			},
		],
		sandboxNotes:
			"Australia Post provides a sandbox base path under the same hostname. Sandbox API keys are issued separately and are not valid in production. Some commercial-account features require explicit production enablement.",
		toolingNotes: {
			openApiUrl: "https://developers.auspost.com.au/apis",
		},
		body: "The Australia Post Shipping & Tracking API is the REST surface for shipments originating in Australia on the Australia Post and StarTrack networks. It exposes shipment creation, label generation, manifest management, and tracking-event lookup as JSON over HTTPS. Authentication uses an API key passed in the `Authorization` header, paired with an Australia Post account number that scopes the call to a specific contract.\n\nThe API is distinct from the consumer-facing MyPost Business product and from any logistics-aggregator surface. Australia Post issues commercial credentials through the Developer Centre, and many features (such as international rate calculation, signature-on-delivery options, and StarTrack road-freight services) require explicit production enablement on the underlying account before they appear in the API responses.\n\nOperationally, the most common gotchas are rate parity between sandbox and production for international destinations, label-format negotiation (PDF, ZPL) tied to per-account printer configuration, and tracking-event vocabulary that is more granular than most northern-hemisphere carriers — for example, separate events for road-freight handovers and depot transfers. Webhooks for tracking are available through a separate enrollment; signature validation must run against the raw request body, and consumers must tolerate eventual consistency in the carrier's status timeline.",
		faqs: [
			{
				question:
					"Is MyPost Business the same API as the Shipping & Tracking API?",
				answer:
					"No. MyPost Business is the consumer-facing product. The Shipping & Tracking API issued through the Australia Post Developer Centre is the commercial REST surface, with separate credentials and separate enablement steps.",
			},
			{
				question:
					"Why do international rates differ between sandbox and production?",
				answer:
					"Sandbox returns deterministic test data and a stable rate card. Many international rate calculations and account-specific surcharges only apply in production. Treat sandbox as contract testing, not rate verification.",
			},
			{
				question: "How do I receive Australia Post tracking webhooks?",
				answer:
					"Webhooks are enrolled separately from the core Shipping & Tracking API. Verify signatures against the raw request body, deduplicate by event ID, and tolerate eventual consistency in event order.",
			},
		],
		relatedConceptSlugs: [
			"webhook-signatures",
			"webhook-replay-and-ordering",
			"sandbox-vs-production",
		],
		relatedSurfaceSlugs: [],
		directorySlugs: ["australia-post-developer-centre"],
		sources: [
			{
				label: "Australia Post Developer Centre",
				url: "https://developers.auspost.com.au/",
			},
			{
				label: "RFC 6750 — OAuth 2.0 Bearer Token Usage",
				url: "https://www.rfc-editor.org/rfc/rfc6750",
			},
		],
		lastReviewed: "2026-04-25",
	},
];

export function getCarrierSurfaceBySlug(
	slug: string
): CarrierSurface | undefined {
	return carrierSurfaces.find((surface) => surface.slug === slug);
}

export function getCarrierSurfacesByVendor(
	vendorSlug: string
): CarrierSurface[] {
	return carrierSurfaces.filter((surface) => surface.vendorSlug === vendorSlug);
}
