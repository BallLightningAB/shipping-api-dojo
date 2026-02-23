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
		title: "FedEx Developer Portal",
		url: "https://developer.fedex.com/",
		description:
			"FedEx REST and SOAP API documentation, sandbox, and integration guides.",
		category: "carrier",
	},
	{
		title: "UPS Developer Kit",
		url: "https://developer.ups.com/",
		description:
			"UPS API documentation including SOAP and REST endpoints for shipping and tracking.",
		category: "carrier",
	},
	{
		title: "DHL Developer Portal",
		url: "https://developer.dhl.com/",
		description:
			"DHL Express, eCommerce, and Parcel API documentation and sandbox.",
		category: "carrier",
	},
	{
		title: "USPS Web Tools",
		url: "https://www.usps.com/business/web-tools-apis/",
		description:
			"USPS XML-based APIs for address validation, shipping, and tracking.",
		category: "carrier",
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
];
