import * as Sentry from "@sentry/tanstackstart-react";

import { sentryBeforeSend } from "./lib/observability/sentry-init";

/**
 * Client-side Sentry bootstrap.
 *
 * Imported as a side effect from `src/router.tsx`. Installs Sentry only when
 * `VITE_SENTRY_DSN` is defined at build time AND the module is running in a
 * browser environment, otherwise it is a no-op. That double gate keeps local
 * development, CI, and preview environments Sentry-free by default and
 * prevents a duplicate init on the server where `instrument.server.mjs` is
 * the canonical bootstrap path.
 *
 * Tracing defaults to 0 and Session Replay is disabled, per the issue #26
 * Free-tier posture.
 */

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isBrowser = typeof window !== "undefined";

if (dsn && isBrowser) {
	const environmentFromEnv = import.meta.env.VITE_SENTRY_ENVIRONMENT;
	const releaseFromEnv = import.meta.env.VITE_SENTRY_RELEASE;
	const tracesSampleRateFromEnv = import.meta.env
		.VITE_SENTRY_TRACES_SAMPLE_RATE;
	const parsedTracesSampleRate =
		typeof tracesSampleRateFromEnv === "string"
			? Number.parseFloat(tracesSampleRateFromEnv)
			: undefined;

	Sentry.init({
		beforeSend: sentryBeforeSend,
		dsn,
		enableLogs: false,
		environment:
			typeof environmentFromEnv === "string"
				? environmentFromEnv
				: "development",
		integrations: [],
		release: typeof releaseFromEnv === "string" ? releaseFromEnv : undefined,
		sendDefaultPii: false,
		tracesSampleRate:
			typeof parsedTracesSampleRate === "number" &&
			!Number.isNaN(parsedTracesSampleRate)
				? parsedTracesSampleRate
				: 0,
	});
}
