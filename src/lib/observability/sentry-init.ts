import * as Sentry from "@sentry/tanstackstart-react";
import type { ErrorEvent, EventHint } from "@sentry/tanstackstart-react";

import { scrubSentryEvent, type ScrubbableEvent } from "./sentry-scrubber";

/**
 * Adapt the plain-JSON `scrubSentryEvent` helper to Sentry's `beforeSend`
 * signature. Sentry's `ErrorEvent` type is structurally similar to our
 * `ScrubbableEvent` but carries extra discriminants (`type`, transaction
 * fields) that the scrubber does not need to know about. The cast through
 * `unknown` preserves those extra fields intact while letting the scrubber
 * operate on the subset it cares about.
 */
export function sentryBeforeSend(
	event: ErrorEvent,
	_hint: EventHint
): ErrorEvent {
	const scrubbed = scrubSentryEvent(event as unknown as ScrubbableEvent);
	return scrubbed as unknown as ErrorEvent;
}

function parseTracesSampleRate(raw: string | undefined): number {
	if (typeof raw !== "string" || raw.length === 0) {
		return 0;
	}
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Initialize server-side Sentry if a DSN is configured and the SDK is not
 * already initialized.
 *
 * This function is safe to call repeatedly: `Sentry.getClient()` returns the
 * already-initialized client on the second call, so we short-circuit
 * without re-running the init. The lazy-init pattern lets us cover Vercel
 * Function invocations (which never run `pnpm start`) while still allowing
 * self-hosted Node deployments to use the canonical
 * `--import ./instrument.server.mjs` flag for earlier coverage.
 */
export function initServerSentryOnce(env: NodeJS.ProcessEnv = process.env) {
	if (typeof window !== "undefined") {
		// Server-side only. In the browser, `src/instrument.client.ts` handles
		// init; calling this path would double-install Sentry.
		return;
	}

	if (Sentry.getClient()) {
		return;
	}

	const dsn = env.SENTRY_DSN;
	if (!dsn) {
		return;
	}

	Sentry.init({
		beforeSend: sentryBeforeSend,
		dsn,
		enableLogs: false,
		environment: env.SENTRY_ENVIRONMENT ?? "development",
		integrations: [],
		release: env.SENTRY_RELEASE,
		sendDefaultPii: false,
		tracesSampleRate: parseTracesSampleRate(env.SENTRY_TRACES_SAMPLE_RATE),
	});
}
