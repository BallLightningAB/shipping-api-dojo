import * as Sentry from "@sentry/tanstackstart-react";

/**
 * Server-side Sentry bootstrap for TanStack Start.
 *
 * Loaded by Node via `--import ./instrument.server.mjs` before the rest of
 * the app code, as required by the OpenTelemetry integrations that Sentry
 * installs automatically. When `SENTRY_DSN` is unset this file is a no-op,
 * which keeps local development, CI, and preview deployments Sentry-free by
 * default.
 *
 * Why this file is `.mjs` instead of TypeScript:
 *
 * Node's `--import` flag only accepts native ESM modules. The rest of the
 * application is written in TypeScript and bundled by Vite + TanStack Start
 * at build time, but this bootstrap needs to run before any bundling has
 * happened, so it stays in plain `.mjs`. That means we duplicate a very
 * small amount of privacy-safe scrubbing logic here. The full scrubber lives
 * in `src/lib/observability/sentry-scrubber.ts` and is exercised through the
 * application-level `captureException` wrapper, which is what fires for the
 * errors this project actually cares about (entitlement fallback, auth,
 * billing webhook, and lifecycle email failures).
 *
 * The inline `beforeSend` below is defensive: it strips fields that the
 * Sentry SDK's own integrations can populate automatically (user identity,
 * request headers, extras) so even an unexpected SDK-originated event keeps
 * the Free-tier privacy posture defined by issue #26.
 */

const dsn = process.env.SENTRY_DSN;

if (dsn) {
	const tracesSampleRateRaw = process.env.SENTRY_TRACES_SAMPLE_RATE;
	const parsedTracesSampleRate =
		typeof tracesSampleRateRaw === "string"
			? Number.parseFloat(tracesSampleRateRaw)
			: Number.NaN;

	Sentry.init({
		beforeSend: (event) => {
			if (event && typeof event === "object") {
				event.user = undefined;
				event.extra = undefined;
				// Mirror the breadcrumb stripping from `sentry-scrubber.ts`: auto
				// breadcrumbs (console, fetch/XHR, UI clicks) can carry emails,
				// auth tokens, or seeded query params that issue #26 forbids.
				event.breadcrumbs = undefined;

				if (event.request && typeof event.request === "object") {
					const request = event.request;
					const nextRequest = {};
					if (typeof request.method === "string") {
						nextRequest.method = request.method;
					}
					if (typeof request.url === "string") {
						try {
							const parsedUrl = new URL(request.url);
							nextRequest.url = `${parsedUrl.origin}${parsedUrl.pathname}`;
						} catch {
							const [pathWithoutQuery] = request.url.split("?");
							const [pathWithoutHash] = (pathWithoutQuery ?? request.url).split(
								"#"
							);
							nextRequest.url = pathWithoutHash ?? request.url;
						}
					}
					event.request = nextRequest;
				}

				if (event.contexts && typeof event.contexts === "object") {
					event.contexts = {};
				}
			}

			return event;
		},
		dsn,
		enableLogs: false,
		environment: process.env.SENTRY_ENVIRONMENT ?? "development",
		release: process.env.SENTRY_RELEASE,
		sendDefaultPii: false,
		tracesSampleRate: Number.isNaN(parsedTracesSampleRate)
			? 0
			: parsedTracesSampleRate,
	});
}
