import { describe, expect, it } from "vitest";

import { parseAuthEnv, parseTrustedOrigins } from "./env";

describe("parseAuthEnv", () => {
	it("accepts required auth env values", () => {
		const parsed = parseAuthEnv({
			APP_BASE_URL: "http://127.0.0.1:3000",
			BETTER_AUTH_SECRET: "12345678901234567890123456789012",
			BETTER_AUTH_TRUSTED_ORIGINS:
				"http://127.0.0.1:3000,http://localhost:3000",
			BETTER_AUTH_URL: "http://127.0.0.1:3000",
			RESEND_API_KEY: "re_123",
			RESEND_FROM_EMAIL: "auth@mail.apidojo.app",
		});

		expect(parsed.BETTER_AUTH_URL).toBe("http://127.0.0.1:3000");
	});

	it("throws if BETTER_AUTH_SECRET is too short", () => {
		expect(() =>
			parseAuthEnv({
				APP_BASE_URL: "http://127.0.0.1:3000",
				BETTER_AUTH_SECRET: "short",
				BETTER_AUTH_URL: "http://127.0.0.1:3000",
				RESEND_API_KEY: "re_123",
				RESEND_FROM_EMAIL: "auth@mail.apidojo.app",
			})
		).toThrowError();
	});
});

describe("parseTrustedOrigins", () => {
	it("splits a csv list and trims whitespace", () => {
		expect(
			parseTrustedOrigins("http://localhost:3000, http://127.0.0.1:3000")
		).toEqual(["http://localhost:3000", "http://127.0.0.1:3000"]);
	});

	it("returns an empty array when input is undefined", () => {
		expect(parseTrustedOrigins(undefined)).toEqual([]);
	});
});
