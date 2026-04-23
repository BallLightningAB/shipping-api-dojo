# Issue 27 Dev Tier Seeded Users Plan

Issue: [#27](https://github.com/BallLightningAB/shipping-api-dojo/issues/27)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Status: implemented (pending validation)

## Goal

Provide a safe development-only way to test Free, Pro, Enterprise, canceled, and inactive paid states through real auth and billing-shaped entitlement resolution.

## Scope

- Add a development-only seed command for tiered auth users and subscription fixtures.
- Create deterministic test users for at least Free, Pro, Enterprise, and canceled or inactive subscription states.
- Seed billing-shaped subscription rows instead of bypassing the resolver with manual entitlements only.
- Guard the seed command so it cannot run against production or non-local environments accidentally.
- Document credentials, reset behavior, and expected entitlement outcomes for local development.
- Add Playwright storage-state or helper setup so browser tests can exercise each tier intentionally.
- Add regression coverage for resolver behavior across seeded fixture states.

## Proposed Dev Users

| Email | Expected state |
| --- | --- |
| `free@dev.shipping-api-dojo.local` | signed-in Free, no active paid subscription |
| `pro@dev.shipping-api-dojo.local` | signed-in Pro, active paid subscription |
| `enterprise@dev.shipping-api-dojo.local` | signed-in Enterprise, active enterprise subscription |
| `canceled@dev.shipping-api-dojo.local` | signed-in user with latest canceled subscription, falls back safely to Free unless manually granted |
| `inactive@dev.shipping-api-dojo.local` | signed-in user with inactive or past-due billing-shaped state, falls back safely to Free |

## Out Of Scope

- Production test accounts.
- Real payment-provider checkout setup.
- Seeding real customer data.
- Manual enterprise grant administration UI.

## Acceptance Criteria

- Running the seed command locally creates or updates the dev users idempotently.
- The entitlement resolver sees the seeded states through the same code path used by production.
- Playwright can authenticate as each seeded tier without duplicating fragile login steps in every test.
- Free/canceled/inactive users cannot access premium actions or advanced depth; Pro/Enterprise users can.
- The v2 validation workflow passes.

## Notes

The seed implementation should use Better Auth-supported account creation where practical and direct Drizzle writes only for billing/subscription fixtures. Manual entitlement rows must not accidentally mask canceled or inactive subscription fallback behavior.

## Implementation Summary

- `src/lib/dev/seed-guard.ts` centralizes the environment gate: requires NODE_ENV in {development, test}, blocks VERCEL_ENV in {production, preview}, requires `ENABLE_DEV_SEED=true`, and requires `DATABASE_URL`.
- `src/lib/dev/seed-fixtures.ts` defines the five canonical fixtures (`free`, `pro`, `enterprise`, `canceled`, `inactive`) plus the billing-shape resolver that maps a fixture state to a `subscriptions` row.
- `src/lib/dev/seed-dev-users.ts` performs idempotent sign-up via `auth.api.signUpEmail` and an `onConflictDoUpdate` upsert into the `subscriptions` table. Free fixtures explicitly delete stray subscription rows so the Free fallback is real, not manual.
- `scripts/seed-dev-users.ts` is the CLI entry point invoked with `pnpm seed:dev-users`. It writes credentials to `.playwright-auth/credentials.json` (gitignored).
- `tests/browser/fixtures/tiered-auth.ts` signs in via Better Auth's email/password endpoint and persists Playwright storage state files per tier.
- `tests/browser/tiered-auth.spec.ts` exercises the gated lesson-reroll surface and the `/settings` entitlement debug panel for each tier; it auto-skips when credentials are not seeded so CI without a database stays green.
- `src/lib/dev/seed-dev-users.test.ts` covers the guard reasons and asserts the resolver returns the expected tier for every fixture state.
- README documents the opt-in steps (`ENABLE_DEV_SEED=true`, `pnpm seed:dev-users`, `pnpm test:e2e`) and the fallback guarantees for canceled/past-due states.

## PR #30 Gemini Review Follow-ups (1.2.1)

- `DEV_TIER_PASSWORD` is now overridable via the `DEV_TIER_PASSWORD` env var (default kept for zero-config local use); the seed guard still blocks hosted environments regardless.
- `isDevSeedInProgress` in `@/src/lib/email/lifecycle.ts` short-circuits `sendLifecycleEmail` when `DEV_SEED_IN_PROGRESS=true`; `seedDevUsers` sets the flag around its run and restores the previous value through `Reflect.deleteProperty`. The Better Auth `databaseHooks.user.create.after` path still runs end-to-end; only the outbound Resend call is suppressed.
- `subscriptions.onConflictDoUpdate` now includes `priceId: null` in its `set` block so a stale `priceId` in a previously seeded row cannot drift from the canonical fixture shape.
- Fixture processing runs in parallel via `Promise.all(DEV_TIER_KEYS.map(seedEntryForKey))`; unique emails and unique `dev-seed-${key}` subscription ids keep the atomic upserts contention-free.
- Added 2 regression tests for the strict `"true"` exact-match contract of `isDevSeedInProgress`.
