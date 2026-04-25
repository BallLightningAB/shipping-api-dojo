import * as Sentry from "@sentry/tanstackstart-react";

import { initServerSentryOnce } from "./sentry-init";
import { SAFE_TAG_KEYS } from "./sentry-scrubber";

// Initialize server-side Sentry at module load time so the first captured
// exception on Vercel Functions or local dev already has a live Sentry
// client to forward to. This is a no-op in the browser (handled by
// `src/instrument.client.ts`) and a no-op when `SENTRY_DSN` is absent.
initServerSentryOnce();

export type ObservabilityContext = Record<
	string,
	boolean | number | string | null | undefined
>;

/**
 * Capture an exception with privacy-safe context.
 *
 * Writes a structured `console.error` line that is easy to grep for in local
 * logs (`[observability] exception`), and additionally forwards the error to
 * Sentry when a Sentry client is initialized. Sentry is initialized by
 * `instrument.server.mjs` on the server and by `src/instrument.client.ts` on
 * the client; both are no-ops when their respective DSN env vars are absent,
 * so this function degrades cleanly to console-only behavior in local dev,
 * CI, and preview deploys.
 *
 * Callers are expected to pass only non-PII tag-shaped context (see the
 * `SAFE_TAG_KEYS` allow-list in `sentry-scrubber.ts`). Emails, auth tokens,
 * request headers, and full subscription payloads must not be placed in
 * `context`; the server `beforeSend` hook is a last-line defense, not the
 * first.
 */
export function captureException(
	error: unknown,
	context: ObservabilityContext = {}
) {
	const normalizedError =
		error instanceof Error
			? error
			: new Error(String(error ?? "Unknown error"));

	const cleanContext = removeUndefinedValues(context);

	console.error("[observability] exception", {
		context: cleanContext,
		error: {
			message: normalizedError.message,
			name: normalizedError.name,
		},
	});

	if (!isSentryInitialized()) {
		return;
	}

	Sentry.withScope((scope) => {
		// Filter at the source against the same allow-list the scrubber enforces
		// (`SAFE_TAG_KEYS` in `sentry-scrubber.ts`). The scrubber remains the
		// authoritative compliance boundary, but applying the allow-list here
		// avoids serializing tags we are guaranteed to drop downstream and keeps
		// the tag surface visible in the source rather than only at scrub time.
		for (const [key, value] of Object.entries(cleanContext)) {
			if (!SAFE_TAG_KEYS.has(key)) {
				continue;
			}
			scope.setTag(key, toTagValue(value));
		}
		Sentry.captureException(normalizedError);
	});
}

function isSentryInitialized(): boolean {
	// `Sentry.getClient()` returns `undefined` until `Sentry.init` has run, so
	// we treat its presence as the single source of truth for "Sentry is live".
	// This keeps local dev and CI free of Sentry calls without needing a
	// separate env check in every caller.
	return Boolean(Sentry.getClient());
}

function toTagValue(
	value: boolean | number | string | null
): boolean | number | string {
	// Sentry tag values must be primitives but do not accept `null`. We
	// normalize `null` to the string "null" so the tag is still searchable in
	// the Sentry UI instead of silently dropping the key.
	return value === null ? "null" : value;
}

function removeUndefinedValues(
	context: ObservabilityContext
): Record<string, boolean | number | string | null> {
	return Object.fromEntries(
		Object.entries(context).filter(
			(entry): entry is [string, boolean | number | string | null] =>
				entry[1] !== undefined
		)
	);
}
