import type { ErrorEvent, EventHint } from "@sentry/tanstackstart-react";
import * as Sentry from "@sentry/tanstackstart-react";
import { type ScrubbableEvent, scrubSentryEvent } from "./sentry-scrubber";
import { getServerSentryConfig } from "./sentry.env";

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
 *
 * Environment parsing is delegated to `getServerSentryConfig` so the Zod
 * schema, default values, and DSN-presence gating live in a single place
 * (`sentry.env.ts`).
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

	const config = getServerSentryConfig(env);
	if (!config) {
		return;
	}

	Sentry.init({
		beforeSend: sentryBeforeSend,
		dsn: config.dsn,
		enableLogs: false,
		environment: config.environment,
		release: config.release,
		sendDefaultPii: false,
		tracesSampleRate: config.tracesSampleRate,
	});
}
