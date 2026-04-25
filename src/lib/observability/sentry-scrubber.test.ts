import { describe, expect, it } from "vitest";

import { scrubSentryEvent } from "./sentry-scrubber";

describe("scrubSentryEvent", () => {
	it("strips user, extra, and sensitive request fields", () => {
		const event = {
			contexts: { os: { name: "macOS" } },
			exception: { values: [{ type: "Error" }] },
			extra: { token: "bearer abc" },
			message: "boom",
			request: {
				cookies: { session: "s" },
				data: { password: "secret" },
				env: { REMOTE_ADDR: "127.0.0.1" },
				headers: { authorization: "Bearer abc" },
				method: "POST",
				query_string: "token=abc",
				url: "https://shipping.apidojo.app/settings?email=alice@example.com#fragment",
			},
			tags: {
				route: "/settings",
				user_agent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537",
			},
			user: { email: "alice@example.com", ip_address: "127.0.0.1" },
		};

		const scrubbed = scrubSentryEvent(event);

		expect(scrubbed.user).toBeUndefined();
		expect(scrubbed.extra).toBeUndefined();
		expect(scrubbed.request).toStrictEqual({
			method: "POST",
			url: "https://shipping.apidojo.app/settings",
		});
		expect(scrubbed.tags).toStrictEqual({ route: "/settings" });
		expect(scrubbed.contexts).toStrictEqual({});
		// The SDK discriminants we preserve should still round-trip.
		expect(scrubbed.exception).toStrictEqual({ values: [{ type: "Error" }] });
		expect(scrubbed.message).toBe("boom");
	});

	it("strips query and hash from non-absolute URLs", () => {
		const event = {
			request: {
				method: "GET",
				url: "/lesson/abc?seed=123#fragment",
			},
		};

		const scrubbed = scrubSentryEvent(event);

		expect(scrubbed.request).toStrictEqual({
			method: "GET",
			url: "/lesson/abc",
		});
	});

	it("returns a new object so callers cannot accidentally mutate Sentry input", () => {
		const event = { user: { email: "alice@example.com" } };

		const scrubbed = scrubSentryEvent(event);

		expect(scrubbed).not.toBe(event);
		expect(event.user).toStrictEqual({ email: "alice@example.com" });
	});

	it("strips breadcrumbs to prevent PII leakage from auto-captured console/fetch/UI events", () => {
		const event = {
			breadcrumbs: [
				{
					category: "console",
					level: "log",
					message: "user logged in alice@example.com",
				},
				{
					category: "fetch",
					data: {
						method: "POST",
						url: "https://api.example.com/login?token=abc",
					},
				},
				{ category: "ui.click", message: "clicked button" },
			],
			message: "boom",
		};

		const scrubbed = scrubSentryEvent(event);

		expect(scrubbed.breadcrumbs).toBeUndefined();
		expect(scrubbed.message).toBe("boom");
	});

	it("drops tags when no allow-listed keys remain", () => {
		const scrubbed = scrubSentryEvent({
			tags: { session_id: "abc", user_agent: "Mozilla" },
		});

		expect(scrubbed.tags).toBeUndefined();
	});
});
