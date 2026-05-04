import { describe, expect, it } from "vitest";

import {
	buildAuthBaseURLConfig,
	getCrossSubdomainCookieConfig,
	shouldUseSecureCookies,
} from "./config";
import type { AuthEnv } from "./env";

const BASE_ENV: AuthEnv = {
	APP_BASE_URL: "https://shipping.apidojo.app",
	BETTER_AUTH_SECRET: "12345678901234567890123456789012",
	BETTER_AUTH_TRUSTED_ORIGINS:
		"https://shipping-apidojo-git-main.vercel.app,https://shipping.apidojo.app",
	BETTER_AUTH_URL: "https://shipping.apidojo.app",
	RESEND_API_KEY: "re_123",
	RESEND_FROM_EMAIL: "auth@mail.apidojo.app",
	RESEND_WEBHOOK_SECRET: "whsec_123",
	SESSION_COOKIE_DOMAIN: ".apidojo.app",
};

describe("buildAuthBaseURLConfig", () => {
	it("collects hostnames from app, auth, and trusted origins", () => {
		const config = buildAuthBaseURLConfig(BASE_ENV);

		expect(config.allowedHosts).toContain("shipping.apidojo.app");
		expect(config.allowedHosts).toContain(
			"shipping-apidojo-git-main.vercel.app"
		);
		expect(config.fallback).toBe("https://shipping.apidojo.app");
	});
});

describe("cookie and security helpers", () => {
	it("returns cross-subdomain cookie config when SESSION_COOKIE_DOMAIN is set", () => {
		expect(getCrossSubdomainCookieConfig(BASE_ENV)).toEqual({
			domain: ".apidojo.app",
			enabled: true,
		});
	});

	it("uses secure cookies for https URLs", () => {
		expect(shouldUseSecureCookies(BASE_ENV)).toBe(true);
		expect(
			shouldUseSecureCookies({
				...BASE_ENV,
				BETTER_AUTH_URL: "http://127.0.0.1:3000",
			})
		).toBe(false);
	});
});
