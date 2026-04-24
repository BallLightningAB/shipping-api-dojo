import { describe, expect, it } from "vitest";

import { parseSentryEnv, resolveSentryEnv } from "./sentry.env";

describe("parseSentryEnv", () => {
	it("returns an empty object when the input is malformed", () => {
		expect(parseSentryEnv({ SENTRY_DSN: "not-a-url" })).toStrictEqual({});
	});

	it("accepts a fully-specified env", () => {
		const parsed = parseSentryEnv({
			SENTRY_DSN: "https://key@ingest.example.com/123",
			SENTRY_ENVIRONMENT: "production",
			SENTRY_RELEASE: "v1.2.6",
			SENTRY_TRACES_SAMPLE_RATE: "0.2",
			VITE_SENTRY_DSN: "https://pub@ingest.example.com/123",
		});
		expect(parsed.SENTRY_DSN).toBe("https://key@ingest.example.com/123");
		expect(parsed.SENTRY_ENVIRONMENT).toBe("production");
		expect(parsed.SENTRY_RELEASE).toBe("v1.2.6");
		expect(parsed.SENTRY_TRACES_SAMPLE_RATE).toBeCloseTo(0.2);
		expect(parsed.VITE_SENTRY_DSN).toBe("https://pub@ingest.example.com/123");
	});
});

describe("resolveSentryEnv", () => {
	it("returns null when the DSN for the requested side is missing", () => {
		expect(
			resolveSentryEnv(
				{ VITE_SENTRY_DSN: "https://k@ingest.example/1" },
				"server"
			)
		).toBeNull();
		expect(
			resolveSentryEnv({ SENTRY_DSN: "https://k@ingest.example/1" }, "client")
		).toBeNull();
	});

	it("resolves server-side config with sensible defaults", () => {
		const resolved = resolveSentryEnv(
			{ SENTRY_DSN: "https://server@ingest.example/1" },
			"server"
		);
		expect(resolved).toStrictEqual({
			dsn: "https://server@ingest.example/1",
			environment: "development",
			release: undefined,
			tracesSampleRate: 0,
		});
	});

	it("resolves client-side config and honors explicit traces rate", () => {
		const resolved = resolveSentryEnv(
			{
				SENTRY_ENVIRONMENT: "production",
				SENTRY_TRACES_SAMPLE_RATE: "0.1",
				VITE_SENTRY_DSN: "https://client@ingest.example/1",
			},
			"client"
		);
		expect(resolved).toStrictEqual({
			dsn: "https://client@ingest.example/1",
			environment: "production",
			release: undefined,
			tracesSampleRate: 0.1,
		});
	});
});
