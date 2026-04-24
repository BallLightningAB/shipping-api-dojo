/**
 * Privacy-safe event scrubbing for Sentry events.
 *
 * Shipping API Dojo intentionally keeps its Sentry Free-tier footprint as
 * small as possible. Issue #26 explicitly forbids sending PII, auth tokens,
 * request headers, full subscription payloads, or email addresses. Instead of
 * relying on `sendDefaultPii: false` alone, we also install a `beforeSend`
 * hook that strips any leftover fields the SDK might populate automatically,
 * plus any fields that application-level code might attach through context.
 *
 * This file stays free of `@sentry/*` imports so it can be unit tested in
 * isolation against plain JSON-shaped input. The Sentry-facing wrapper in
 * `sentry-init.ts` adapts the scrubber signature to the SDK's.
 */

export interface ScrubbableUser {
	email?: unknown;
	id?: unknown;
	ip_address?: unknown;
	username?: unknown;
	[key: string]: unknown;
}

export interface ScrubbableRequest {
	cookies?: unknown;
	data?: unknown;
	env?: unknown;
	headers?: unknown;
	method?: unknown;
	query_string?: unknown;
	url?: unknown;
	[key: string]: unknown;
}

export interface ScrubbableEvent {
	contexts?: Record<string, unknown>;
	exception?: unknown;
	extra?: Record<string, unknown>;
	level?: unknown;
	message?: unknown;
	request?: ScrubbableRequest;
	tags?: Record<string, unknown>;
	user?: ScrubbableUser;
	[key: string]: unknown;
}

const SAFE_TAG_KEYS = new Set([
	"environment",
	"fallbackTier",
	"operation",
	"release",
	"route",
	"side",
	"tier",
]);

/**
 * Sanitize a URL by preserving only origin and pathname.
 *
 * Query strings and hash fragments on shipping-api-dojo routes can carry
 * practice seeds, search params, or other state we would rather not ship to
 * Sentry. Stripping them keeps the event useful (you still know _which_ route
 * failed) without leaking user-specific payload data.
 */
function stripUrl(url: unknown): string | undefined {
	if (typeof url !== "string" || url.length === 0) {
		return undefined;
	}

	try {
		const parsed = new URL(url);
		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		// Non-absolute paths (loader URLs on the server can be path-only) are
		// passed through after dropping any `?` / `#` suffix. We prefer truncating
		// to throwing so the event still makes it to Sentry.
		const withoutQuery = url.split("?")[0] ?? url;
		return withoutQuery.split("#")[0] ?? withoutQuery;
	}
}

function pickSafeTags(
	tags: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
	if (!tags) {
		return undefined;
	}

	const safe: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(tags)) {
		if (SAFE_TAG_KEYS.has(key)) {
			safe[key] = value;
		}
	}

	return Object.keys(safe).length > 0 ? safe : undefined;
}

/**
 * Remove PII and request-shape fields from a Sentry event in place-safe form.
 *
 * The returned object is always a new reference so Sentry cannot observe a
 * mutation-induced timing hazard in downstream integrations, and we never
 * leak the original request/user/extra trees. Callers that want to drop the
 * event entirely should still return `null` from their own `beforeSend`.
 */
export function scrubSentryEvent(event: ScrubbableEvent): ScrubbableEvent {
	const scrubbed: ScrubbableEvent = { ...event };

	// Biome prefers assigning `undefined` over `delete`. The two are
	// semantically equivalent for the downstream Sentry transport, which
	// ignores `undefined` fields on serialization.
	scrubbed.user = undefined;
	scrubbed.extra = undefined;

	if (scrubbed.request) {
		const request = scrubbed.request;
		const nextRequest: ScrubbableRequest = {};
		if (typeof request.method === "string") {
			nextRequest.method = request.method;
		}
		const strippedUrl = stripUrl(request.url);
		if (strippedUrl) {
			nextRequest.url = strippedUrl;
		}
		scrubbed.request = nextRequest;
	}

	const safeTags = pickSafeTags(scrubbed.tags);
	scrubbed.tags = safeTags;

	// Contexts often contain full subscription payloads or DB rows. We keep the
	// block present for Sentry SDK compatibility but replace it with an empty
	// object so the SDK does not auto-populate anything sensitive downstream.
	if (scrubbed.contexts) {
		scrubbed.contexts = {};
	}

	return scrubbed;
}
