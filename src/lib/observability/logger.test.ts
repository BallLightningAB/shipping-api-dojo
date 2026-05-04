import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Sentry SDK as a whole because ESM module namespaces are not
// spy-able in Vitest. `vi.hoisted` defers the mock state to the hoisted
// scope so it is available when `vi.mock` runs at module init time.
const mockState = vi.hoisted(() => ({
	client: undefined as unknown,
	captureException: vi.fn(),
	setTag: vi.fn(),
}));

vi.mock("@sentry/tanstackstart-react", () => ({
	captureException: (...args: unknown[]) => mockState.captureException(...args),
	getClient: () => mockState.client,
	init: vi.fn(),
	withScope: (cb: unknown) => {
		(cb as (scope: { setTag: (k: string, v: unknown) => void }) => void)({
			setTag: mockState.setTag,
		});
	},
}));

import { captureException } from "./logger";

describe("captureException", () => {
	beforeEach(() => {
		mockState.client = undefined;
		mockState.captureException = vi.fn();
		mockState.setTag = vi.fn();
	});

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

	it("does not call Sentry when no Sentry client is initialized", () => {
		vi.spyOn(console, "error").mockImplementation(() => {
			// Suppress expected logger output in this unit test.
		});

		captureException(new Error("offline"), { route: "/arena" });

		expect(mockState.captureException).not.toHaveBeenCalled();
		expect(mockState.setTag).not.toHaveBeenCalled();
	});

	it("forwards to Sentry with safe tag context when the client is live", () => {
		vi.spyOn(console, "error").mockImplementation(() => {
			// Suppress expected logger output in this unit test.
		});
		mockState.client = {};

		captureException(new Error("entitlement lookup failed"), {
			fallbackTier: "free",
			operation: "resolve_entitlements",
			route: "/arena",
			unused: undefined,
		});

		expect(mockState.setTag).toHaveBeenCalledWith("fallbackTier", "free");
		expect(mockState.setTag).toHaveBeenCalledWith(
			"operation",
			"resolve_entitlements"
		);
		expect(mockState.setTag).toHaveBeenCalledWith("route", "/arena");
		expect(mockState.setTag).not.toHaveBeenCalledWith(
			"unused",
			expect.anything()
		);
		expect(mockState.captureException).toHaveBeenCalledTimes(1);
		const [capturedError] = mockState.captureException.mock.calls[0];
		expect(capturedError).toBeInstanceOf(Error);
		expect((capturedError as Error).message).toBe("entitlement lookup failed");
	});

	it("normalizes null context values to strings for Sentry tags", () => {
		vi.spyOn(console, "error").mockImplementation(() => {
			// Suppress expected logger output in this unit test.
		});
		mockState.client = {};

		captureException(new Error("null tier"), {
			fallbackTier: null,
		});

		expect(mockState.setTag).toHaveBeenCalledWith("fallbackTier", "null");
	});
});
