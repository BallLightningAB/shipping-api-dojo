# Issue 26 Sentry Observability Plan

Issue: [#26](https://github.com/BallLightningAB/shipping-api-dojo/issues/26)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Branch: `codex/issue-26-sentry-observability`
Status: shipped-pending-dsn

## Execution Progress

- [x] Install `@sentry/tanstackstart-react` and run `pnpm dedupe` to resolve the Sentry-introduced drizzle-orm peer drift.
- [x] Add `src/lib/observability/sentry.env.ts` with a Zod-parsed optional schema that returns `null` when the DSN is missing, so Sentry stays disabled by default.
- [x] Add `src/lib/observability/sentry-scrubber.ts` with an allow-list-based PII scrubber (`route`, `operation`, `tier`, `fallbackTier`, `environment`) that strips `user`, `extra`, request headers, query strings, and unrecognized tags.
- [x] Add `src/lib/observability/sentry-init.ts` with `sentryBeforeSend` and `initServerSentryOnce` (idempotent via `Sentry.getClient()`), used by `logger.ts` at module load time.
- [x] Extend `src/lib/observability/logger.ts` to forward captured exceptions to Sentry via `Sentry.withScope` + `Sentry.captureException`, keeping the existing `console.error` fallback for local dev.
- [x] Add `src/instrument.client.ts` with double gating (DSN present AND `typeof window !== 'undefined'`), side-effect imported from `src/router.tsx`.
- [x] Add `instrument.server.mjs` in the project root for self-hosted `--import` flows, with inline `beforeSend` scrubbing that matches the TS scrubber.
- [x] Wire `ProgressHydrator` and the Creem + Resend webhook handlers through `captureException`; webhooks now catch errors, return `500`, and forward to Sentry so non-2xx retries from the providers stay intact.
- [x] Gate the Sentry Vite plugin (`sentryTanstackStart`) on `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` so source-map upload only runs on trusted builds.
- [x] Document `SENTRY_DSN`, `VITE_SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in `.env.example` and add a new README `Observability` section.
- [x] Add regression coverage: `sentry-scrubber.test.ts` (4 tests), `sentry.env.test.ts` (5 tests), and extended `logger.test.ts` (5 tests, including Sentry forwarding + no-client short-circuit + null-tag normalization).
- [x] Run validation suite: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (105 tests passing across 24 files), `pnpm build`.
- [x] Address PR #32 Gemini review comments (v1.3.1): extend Creem subscriptions `onConflictDoUpdate` set clause with `productId` + `provider`; drop `integrations: []` from all three `Sentry.init` call sites (`instrument.server.mjs`, `src/instrument.client.ts`, `src/lib/observability/sentry-init.ts`) so default auto-capture integrations run while `beforeSend` scrubbing remains the compliance boundary.
- [x] Address second-round PR #32 Gemini review comments (v1.3.2): strip Sentry `breadcrumbs` in `scrubSentryEvent` and the inline `instrument.server.mjs` `beforeSend` so auto-captured console/fetch/UI events cannot leak PII; refactor `initServerSentryOnce` to delegate env parsing to `getServerSentryConfig` (eliminating duplicated Zod/default logic); export `SAFE_TAG_KEYS` from `sentry-scrubber` and apply the allow-list at the source in `captureException` so the wrapper only forwards tags the scrubber would keep. Added a 5th scrubber test asserting breadcrumb removal (now 106 tests / 24 files).

## Goal

Add production-grade error reporting for hosted v2 surfaces, starting with Sentry Free tier, so entitlement, auth, billing, webhook, and route-loader failures are visible to maintainers without relying on local console output.

## Scope

- Configure Sentry for the TanStack Start runtime with environment-aware enablement.
- Capture server-side and client-side exceptions through a small app-level observability wrapper.
- Route entitlement fallback failures, auth/session failures, billing webhook failures, and lifecycle email failures through the wrapper.
- Add privacy-safe context tags such as route, operation, tier fallback, and environment.
- Explicitly avoid sending PII, auth tokens, request headers, full subscription payloads, or email addresses.
- Document required Sentry environment variables and local/preview behavior.
- Add regression coverage for wrapper behavior and fallback-safe error capture.

## Out Of Scope

- Session Replay.
- Performance tracing beyond a conservative disabled or near-zero baseline.
- User-level analytics.
- Alert-routing automation beyond Sentry default project notifications.
- Paid Sentry usage or high-cardinality event enrichment.

## Acceptance Criteria

- Sentry can be enabled by environment variables without breaking local development when unset. ✅
- Existing entitlement fallback paths use the observability wrapper rather than direct route-level console logging. ✅ (already true after `#21`; now the wrapper itself forwards to Sentry when configured.)
- Server-only and client-safe contexts are separated so sensitive request data is not captured by default. ✅ (server = `SENTRY_DSN`, client = `VITE_SENTRY_DSN`; both gated through the scrubber.)
- Documentation explains Free-tier limits, privacy posture, and how to verify a test event. ✅ (README `Observability` section.)
- The v2 validation workflow passes. ✅

## Notes

This issue followed the PR review feedback on issue `#21` that direct `console.error` calls in route loaders are too easy to miss in production. The issue `#21` PR kept only the lightweight wrapper fix; this issue ships the full SDK integration behind it.

## DSN-Activation Checklist (for the maintainer, post-merge)

1. Create a Sentry Free-tier project (org, project slug).
2. Set `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) in Vercel Environment Variables.
3. Optionally set `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `VITE_SENTRY_*` mirrors, and `SENTRY_TRACES_SAMPLE_RATE`.
4. For source-map upload on Vercel: create a Sentry Org Auth Token (scoped `project:releases`) and set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` as Vercel build-time env vars.
5. Redeploy. The first captured exception on either side should appear in the Sentry project feed.
6. For local verification, follow the `node --import ./instrument.server.mjs -e "throw new Error('sentry-verify')"` snippet in the README.

## Known Next Steps After DSN Activation

- Consider raising `SENTRY_TRACES_SAMPLE_RATE` once the Free-tier transaction budget is understood.
- Consider adding an OpenTelemetry-based Nitro plugin for earlier server bootstrap coverage beyond the logger's lazy init.
- Consider routing `sentry-cli` sourcemap uploads through GitHub Actions if Vercel build-time uploads become noisy.
