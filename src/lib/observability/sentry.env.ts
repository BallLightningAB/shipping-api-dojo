import { z } from "zod";

/**
 * Sentry environment schema.
 *
 * Every field is optional so the project ships with Sentry effectively disabled
 * by default. When `SENTRY_DSN` is absent, `resolveSentryEnv` returns `null`
 * and the rest of the observability stack stays on its console-only fallback
 * without installing the SDK. This matches the issue #26 Free-tier posture:
 * Sentry is a drop-in upgrade for hosted v2 error visibility, not a local
 * development or test dependency.
 *
 * We keep `VITE_SENTRY_DSN` separate from the server-side `SENTRY_DSN` so the
 * two environments can be configured independently. On Vercel the client DSN
 * is typically the same value as the server DSN but must be exposed through a
 * `VITE_`-prefixed variable because Vite only inlines `VITE_*` at build time.
 */
const sentryEnvSchema = z
	.object({
		SENTRY_DSN: z.string().url().optional(),
		SENTRY_ENVIRONMENT: z.string().min(1).optional(),
		SENTRY_RELEASE: z.string().min(1).optional(),
		SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
		VITE_SENTRY_DSN: z.string().url().optional(),
	})
	.partial();

export type SentryEnv = z.infer<typeof sentryEnvSchema>;

export interface ResolvedSentryConfig {
	dsn: string;
	environment: string;
	release: string | undefined;
	tracesSampleRate: number;
}

/**
 * Parse optional Sentry env vars without throwing.
 *
 * We deliberately accept any unknown input because this runs at process
 * bootstrap before other validation, and a malformed Sentry config must never
 * block the application from starting. Invalid values return an empty object
 * so `resolveSentryEnv` treats it as "Sentry disabled".
 */
export function parseSentryEnv(input: unknown): SentryEnv {
	const result = sentryEnvSchema.safeParse(input);
	return result.success ? result.data : {};
}

/**
 * Resolve the effective Sentry config or `null` when Sentry is disabled.
 *
 * The `side` parameter selects the DSN source:
 * - `"server"` reads `SENTRY_DSN` (Node-only variable).
 * - `"client"` reads `VITE_SENTRY_DSN` (inlined at build time by Vite).
 *
 * Returning `null` is the canonical "Sentry off" signal for the rest of the
 * observability stack: `instrument.server.mjs`, `instrument.client.ts`, and
 * `logger.ts` all short-circuit when this returns `null`, which keeps local
 * development and CI runs free of Sentry network traffic.
 */
export function resolveSentryEnv(
	input: unknown,
	side: "server" | "client"
): ResolvedSentryConfig | null {
	const parsed = parseSentryEnv(input);
	const dsn = side === "server" ? parsed.SENTRY_DSN : parsed.VITE_SENTRY_DSN;

	if (!dsn) {
		return null;
	}

	return {
		dsn,
		environment: parsed.SENTRY_ENVIRONMENT ?? "development",
		release: parsed.SENTRY_RELEASE,
		tracesSampleRate: parsed.SENTRY_TRACES_SAMPLE_RATE ?? 0,
	};
}

export function getServerSentryConfig(
	env: NodeJS.ProcessEnv = process.env
): ResolvedSentryConfig | null {
	return resolveSentryEnv(env, "server");
}
