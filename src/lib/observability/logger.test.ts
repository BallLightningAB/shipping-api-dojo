import { afterEach, describe, expect, it, vi } from "vitest";

import { captureException } from "./logger";

describe("captureException", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("centralizes exception reporting with safe route context", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
			// Suppress expected logger output in this unit test.
		});

		captureException(new Error("entitlement lookup failed"), {
			fallbackTier: "free",
			operation: "resolve_entitlements",
			route: "/arena",
		});

		expect(consoleSpy).toHaveBeenCalledWith("[observability] exception", {
			context: {
				fallbackTier: "free",
				operation: "resolve_entitlements",
				route: "/arena",
			},
			error: {
				message: "entitlement lookup failed",
				name: "Error",
			},
		});
	});

	it("normalizes non-error throws", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
			// Suppress expected logger output in this unit test.
		});

		captureException("string failure", {
			route: "/lesson/$slug",
			unused: undefined,
		});

		expect(consoleSpy).toHaveBeenCalledWith("[observability] exception", {
			context: {
				route: "/lesson/$slug",
			},
			error: {
				message: "string failure",
				name: "Error",
			},
		});
	});
});
