# Issue 26 Sentry Observability Plan

Issue: [#26](https://github.com/BallLightningAB/shipping-api-dojo/issues/26)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Status: planned

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

- Sentry can be enabled by environment variables without breaking local development when unset.
- Existing entitlement fallback paths use the observability wrapper rather than direct route-level console logging.
- Server-only and client-safe contexts are separated so sensitive request data is not captured by default.
- Documentation explains Free-tier limits, privacy posture, and how to verify a test event.
- The v2 validation workflow passes.

## Notes

This issue follows the PR review feedback on issue #21 that direct `console.error` calls in route loaders are too easy to miss in production. The issue #21 PR should keep only the lightweight wrapper fix; full Sentry integration belongs here.
