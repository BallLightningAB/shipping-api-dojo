/**
 * Static Resource Directory — curated links for carrier integration learning
 */

import type { DirectoryEntry } from "./types";

export const directoryEntries: DirectoryEntry[] = [
	{
		title: "RFC 9110 — HTTP Semantics",
		url: "https://www.rfc-editor.org/rfc/rfc9110",
		description:
			"The definitive reference for HTTP methods, status codes, and semantics.",
		category: "spec",
	},
	{
		title: "RFC 9457 — Problem Details for HTTP APIs",
		url: "https://www.rfc-editor.org/rfc/rfc9457",
		description: "Standard format for machine-readable error responses.",
		category: "spec",
	},
	{
		title: "RFC 6749 — OAuth 2.0 Authorization Framework",
		url: "https://www.rfc-editor.org/rfc/rfc6749",
		description:
			"Baseline OAuth 2.0 reference for carrier auth flows, token expiry, and refresh behavior.",
		category: "spec",
	},
	{
		title: "RFC 9331 — RateLimit Header Fields for HTTP",
		url: "https://www.rfc-editor.org/rfc/rfc9331",
		description:
			"Defines standard HTTP rate-limit fields that pair well with Retry-After and backpressure design.",
		category: "spec",
	},
	{
		title: "W3C SOAP 1.2 Specification",
		url: "https://www.w3.org/TR/soap12/",
		description:
			"Official SOAP 1.2 specification for understanding envelope, header, and fault structure.",
		category: "spec",
	},
	{
		title: "W3C WSDL 1.1 Specification",
		url: "https://www.w3.org/TR/wsdl.html",
		description:
			"Web Services Description Language specification for reading carrier service contracts.",
		category: "spec",
	},
	{
		title: "W3C XML Schema Primer",
		url: "https://www.w3.org/TR/xmlschema-0/",
		description:
			"Introductory XML Schema reference for type constraints, enums, and request validation in SOAP integrations.",
		category: "spec",
	},
	{
		title: "OASIS WS-Security SOAP Message Security 1.1.1",
		url: "http://docs.oasis-open.org/wss-m/wss/v1.1.1/os/wss-SOAPMessageSecurity-v1.1.1-os.html",
		description:
			"Canonical SOAP message security reference for header-level auth and related metadata handling.",
		category: "spec",
	},
	{
		title: "OASIS UsernameToken Profile 1.1.1",
		url: "http://docs.oasis-open.org/wss-m/wss/v1.1.1/os/wss-UsernameTokenProfile-v1.1.1-os.html",
		description:
			"WS-Security profile reference for UsernameToken-based SOAP auth flows still used by legacy carrier stacks.",
		category: "spec",
	},
	{
		title: "Postman",
		url: "https://www.postman.com/",
		description:
			"API development and testing platform. Essential for exploring carrier APIs manually.",
		category: "tool",
	},
	{
		title: "SoapUI",
		url: "https://www.soapui.org/",
		description:
			"Dedicated SOAP and REST testing tool. Import WSDLs to auto-generate test requests.",
		category: "tool",
	},
	{
		title: "Wireshark",
		url: "https://www.wireshark.org/",
		description:
			"Network protocol analyzer for inspecting raw HTTP/SOAP traffic during debugging.",
		category: "tool",
	},
	{
		title: "httpbin.org",
		url: "https://httpbin.org/",
		description:
			"HTTP request/response testing service. Great for testing retry logic and error handling.",
		category: "tool",
	},
	{
		title: "OpenTelemetry Documentation",
		url: "https://opentelemetry.io/docs/",
		description:
			"Official observability guidance for traces, metrics, and logs that support carrier incident runbooks.",
		category: "tool",
	},
	{
		title: "Kubernetes Probe Documentation",
		url: "https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/",
		description:
			"Reference for separating liveness, readiness, and deeper dependency checks in production systems.",
		category: "tool",
	},
	{
		slug: "fedex-developer-portal-rest",
		title: "FedEx Developer Portal (REST APIs)",
		url: "https://developer.fedex.com/",
		description:
			"Modern FedEx REST surface for Ship, Rate, Track, and Address Validation. OAuth 2.0 client_credentials.",
		category: "carrier",
		vendor: "FedEx",
		businessUnit: "Express",
		apiName: "FedEx REST APIs",
		region: "us",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Sandbox uses apis-sandbox.fedex.com with separate API keys; some FedEx Ground operations require additional production credentials.",
		},
		tooling: {
			openApiUrl: "https://developer.fedex.com/api/en-us/catalog.html",
		},
		carrierSlug: "fedex-express-us-rest",
	},
	{
		slug: "fedex-web-services-soap",
		title: "FedEx Web Services (SOAP, legacy)",
		url: "https://www.fedex.com/en-us/developer/web-services.html",
		description:
			"Legacy FedEx SOAP/WSDL surface. Still operational at last review but new integrations should target the FedEx REST APIs.",
		category: "carrier",
		vendor: "FedEx",
		businessUnit: "Express",
		apiName: "FedEx Web Services",
		region: "global",
		protocols: ["soap"],
		status: "legacy",
		sandbox: {
			available: true,
			notes:
				"Sandbox at wsbeta.fedex.com:443/web-services with separate test credentials.",
		},
		tooling: {
			wsdlUrl: "https://www.fedex.com/en-us/developer/web-services.html",
		},
		deprecation: {
			notes:
				"FedEx is steering new integrations to the REST APIs. No final SOAP sunset date had been published at last review.",
			replacement: "https://developer.fedex.com/",
		},
		carrierSlug: "fedex-express-global-soap-legacy",
	},
	{
		slug: "ups-developer-portal-rest",
		title: "UPS Developer Portal (REST + OAuth 2.0)",
		url: "https://developer.ups.com/",
		description:
			"Modern UPS REST surface for Shipping, Rating, Tracking, Address Validation, and Time in Transit. Replaces the legacy UPS XML/SOAP web services that were sunset on 2024-06-03.",
		category: "carrier",
		vendor: "UPS",
		businessUnit: "Developer APIs",
		apiName: "UPS Developer APIs",
		region: "global",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"UPS Customer Integration Environment (CIE) at wwwcie.ups.com. Negotiated rates are typically only correct in production.",
		},
		tooling: {
			openApiUrl: "https://developer.ups.com/api/reference",
		},
		deprecation: {
			notes:
				"UPS sunset legacy XML/SOAP web services on 2024-06-03. Migrate to the REST APIs to avoid scheduled-failure outages.",
			effectiveDate: "2024-06-03",
		},
		carrierSlug: "ups-global-rest-oauth",
	},
	{
		slug: "dhl-developer-portal-mydhl",
		title: "DHL Developer Portal — MyDHL API (Express)",
		url: "https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
		description:
			"DHL Express MyDHL API REST reference. Distinct product from DHL eCommerce and DHL Parcel DE. HTTP Basic over TLS.",
		category: "carrier",
		vendor: "DHL",
		businessUnit: "Express",
		apiName: "MyDHL API",
		region: "global",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Mock sandbox with a fixed test account; production credentials require a country-specific DHL Express account number.",
			url: "https://api-mock.dhl.com/mydhlapi",
		},
		tooling: {
			openApiUrl:
				"https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
		},
		carrierSlug: "dhl-express-global-mydhl-rest",
	},
	{
		slug: "dhl-ecommerce-americas-portal",
		title: "DHL eCommerce Solutions Americas API",
		url: "https://docs.api.dhlecs.com/",
		description:
			"REST API for DHL's domestic and cross-border parcel network in the Americas. Token-based auth, separate from MyDHL Express.",
		category: "carrier",
		vendor: "DHL",
		businessUnit: "eCommerce Solutions",
		apiName: "DHL eCommerce Solutions Americas API",
		region: "americas",
		protocols: ["rest", "webhook"],
		status: "active",
		sandbox: {
			available: true,
			notes: "Sandbox at api-sandbox.dhlecs.com with separate credentials.",
		},
		tooling: {
			openApiUrl: "https://docs.api.dhlecs.com/",
		},
		carrierSlug: "dhl-ecommerce-americas-rest",
	},
	{
		slug: "dhl-developer-portal-parcel-de",
		title: "DHL Post & Parcel Germany API (Parcel DE)",
		url: "https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany",
		description:
			"REST API for DHL Paket, Päckchen, and Warenpost shipments originating in Germany. Replaces the legacy Geschäftskundenversand SOAP/XML services.",
		category: "carrier",
		vendor: "DHL",
		businessUnit: "Post & Parcel Germany",
		apiName: "DHL Post & Parcel Germany API",
		region: "de",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Requires both a developer-portal API key and a German Geschäftskundenportal test account.",
		},
		tooling: {
			openApiUrl:
				"https://developer.dhl.com/api-reference/parcel-de-shipping-post-parcel-germany",
		},
		carrierSlug: "dhl-parcel-de-rest",
	},
	{
		slug: "dhl-freight-sweden-api-farm",
		title: "DHL Freight Sweden — API Farm",
		url: "https://dhlpaket.se/dashboard/services/api-farm/",
		description:
			"DHL Freight's Sweden-specific REST hub for booking, pricing, validation, and shipping documents on Sweden domestic and Sweden-originating international road freight. Separate portal, base URLs, and credentials from MyDHL Express, DHL eCommerce Americas, and DHL Parcel DE.",
		category: "carrier",
		vendor: "DHL",
		businessUnit: "Freight (Sweden)",
		apiName: "DHL Freight API Farm",
		region: "se",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			url: "https://test-api.freight-logistics.dhl.com",
			notes:
				"Register at test-admin.freight-logistics.dhl.com; the GUID client-key is shown exactly once. Production access requires a separate registration plus an Implementation Request.",
		},
		tooling: {
			postmanCollectionUrl:
				"https://dhlpaket.se/dashboard/wp-content/uploads/sites/2/2026/01/103-DHL-SERVICEPOINT-B2C-1.zip",
		},
		carrierSlug: "dhl-freight-se-rest",
	},
	{
		slug: "usps-developer-portal-rest",
		title: "USPS Developer Portal (USPS APIs)",
		url: "https://developer.usps.com/",
		description:
			"Modern USPS REST surface for label creation, rate calculation, tracking, and address validation. OAuth 2.0 client_credentials. Replaces USPS Web Tools.",
		category: "carrier",
		vendor: "USPS",
		businessUnit: "USPS APIs",
		apiName: "USPS APIs",
		region: "us",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"USPS Customer Acceptance Test (CAT) environment at api-cat.usps.com with separate credentials.",
		},
		tooling: {
			openApiUrl: "https://developer.usps.com/apis",
		},
		carrierSlug: "usps-us-apis-rest",
	},
	{
		slug: "usps-web-tools-legacy",
		title: "USPS Web Tools (XML, deprecated)",
		url: "https://www.usps.com/business/web-tools-apis/",
		description:
			"USPS's pre-OAuth XML-over-HTTP API. Deprecated in favor of the modern REST USPS APIs.",
		category: "carrier",
		vendor: "USPS",
		businessUnit: "Web Tools",
		apiName: "USPS Web Tools",
		region: "us",
		protocols: ["xml-rpc"],
		status: "deprecated",
		sandbox: {
			available: false,
			notes:
				"Web Tools does not provide a separate sandbox environment; testing happens against the live UserID with non-billable test parameters.",
		},
		deprecation: {
			notes:
				"USPS is migrating customers off Web Tools to developer.usps.com. Check the USPS Developer Portal for the current sunset schedule.",
			replacement: "https://developer.usps.com/",
		},
		carrierSlug: "usps-us-webtools-legacy",
	},
	{
		slug: "royal-mail-developer-portal",
		title: "Royal Mail Developer Documentation (Shipping API V3)",
		url: "https://developer.royalmail.net/",
		description:
			"Royal Mail's REST shipping surface for UK origin shipments. Bearer-token auth issued through the Royal Mail Customer Portal.",
		category: "carrier",
		vendor: "Royal Mail",
		businessUnit: "Shipping API",
		apiName: "Royal Mail Shipping API V3",
		region: "uk",
		protocols: ["rest"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Sandbox availability varies by product and customer agreement; confirm in the Royal Mail Customer Portal.",
		},
		tooling: {
			openApiUrl: "https://developer.royalmail.net/",
		},
		carrierSlug: "royal-mail-uk-shipping-v3-rest",
	},
	{
		slug: "la-poste-colissimo-portal",
		title: "La Poste Colissimo — Web Services Documentation",
		url: "https://www.colissimo.entreprise.laposte.fr/fr/api-colissimo",
		description:
			"La Poste Colissimo SOAP/WSDL surface for parcel shipments originating in France. French-language documentation primary.",
		category: "carrier",
		vendor: "La Poste",
		businessUnit: "Colissimo",
		apiName: "Colissimo Web Service",
		region: "fr",
		protocols: ["soap"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Test account issued on request through the La Poste Entreprise customer portal.",
		},
		tooling: {
			wsdlUrl: "https://ws.colissimo.fr/sls-ws/SlsServiceWS?wsdl",
		},
		carrierSlug: "la-poste-colissimo-fr-soap",
	},
	{
		slug: "australia-post-developer-centre",
		title: "Australia Post Developer Centre (Shipping & Tracking)",
		url: "https://developers.auspost.com.au/",
		description:
			"REST surface for shipments originating in Australia on the Australia Post and StarTrack networks. API key plus account-number authentication.",
		category: "carrier",
		vendor: "Australia Post",
		businessUnit: "Shipping & Tracking",
		apiName: "Australia Post Shipping & Tracking API",
		region: "au",
		protocols: ["rest", "webhook"],
		status: "active",
		sandbox: {
			available: true,
			notes:
				"Sandbox base path under digitalapi.auspost.com.au/test with separate API keys; some commercial features require production enablement.",
		},
		tooling: {
			openApiUrl: "https://developers.auspost.com.au/apis",
		},
		carrierSlug: "australia-post-au-shipping-rest",
	},
	{
		title: "Martin Fowler — Circuit Breaker",
		url: "https://martinfowler.com/bliki/CircuitBreaker.html",
		description:
			"Foundational article on the circuit breaker resilience pattern.",
		category: "community",
	},
	{
		title: "AWS — Exponential Backoff and Jitter",
		url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
		description:
			"Deep dive into retry strategies with exponential backoff and jitter algorithms.",
		category: "community",
	},
	{
		title: "Stripe — Idempotent Requests",
		url: "https://stripe.com/docs/api/idempotent_requests",
		description:
			"Best-in-class example of idempotency key implementation in a production API.",
		category: "community",
	},
	{
		title: "Stripe — Webhook Signature Verification",
		url: "https://docs.stripe.com/webhooks/signature",
		description:
			"Concrete reference for raw-body signature verification, replay handling, and webhook troubleshooting.",
		category: "community",
	},
	{
		title: "XMLUnit",
		url: "https://www.xmlunit.org/",
		description:
			"XML diff and assertion tooling that is useful for SOAP contract tests and generated-envelope comparisons.",
		category: "community",
	},
];
