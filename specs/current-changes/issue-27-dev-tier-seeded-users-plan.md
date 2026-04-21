# Issue 27 Dev Tier Seeded Users Plan

Issue: [#27](https://github.com/BallLightningAB/shipping-api-dojo/issues/27)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Status: planned

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
