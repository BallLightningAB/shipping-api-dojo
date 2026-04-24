# Issue 21 Paid Tier Content Gating Plan

Date: 2026-04-20
Issue: [#21](https://github.com/BallLightningAB/shipping-api-dojo/issues/21)
Parent: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Branch: `codex/issue-21-paid-tier-gating`
Scope: Implement the hosted/premium v2 surface that remains after the auth, billing, entitlement, and compliance foundations.

## Execution Progress

- [x] Align scope with `#5`: keep this issue focused on paid tiers and entitlement gating, keep `#15` separate, and keep `#13/#16` out of scope.
- [x] Define and ship a concrete Free/Pro/Enterprise capability matrix in runtime code and settings UX.
- [x] Gate premium depth and premium reroll actions through entitlement-aware checks while keeping lesson/wiki/directory pages publicly crawlable.
- [x] Add locked-content and upgrade UX for premium lesson rerolls and advanced arena scenario depth.
- [x] Add safe fallback behavior for missing/errored entitlement fetches and verify inactive/canceled subscription downgrades remain free.
- [x] Add regression tests for access-policy helpers and entitlement downgrade behavior.
- [x] Run full validation suite and fix any regressions.
- [x] Update memory-bank release/changelog entries and open PR for review.
- [x] Address PR review feedback by routing entitlement fallback failures through a shared observability wrapper instead of route-local console logging.
- [x] Create v2 follow-up issues for full Sentry integration and dev-only tiered seed users.

## Goal

Turn the v2 paid-access direction from foundations and outline docs into user-visible, entitlement-aware product behavior.

## Why This Remains Open

- Issue `#10` documented higher-value randomization, review modes, certificates, and premium challenge direction, but it was outline-only.
- Issue `#11` shipped Better Auth, Neon/Drizzle, Creem, Resend, and entitlement foundations, but it did not finish all paid-tier user surfaces.
- Issue `#12` shipped compliance disclosures and account-rights surfaces, but it did not implement paid content gating.
- Therefore issue `#5` should stay open until this implementation issue and issue `#15` complete.

## Deliverables

- `I21D1`: Define the concrete Free, Pro, and Enterprise capability matrix for the current web product.
- `I21D2`: Wire entitlement-aware access checks into premium lessons, variant banks, review modes, challenge modes, certificates, and any reporting surfaces that are in initial v2 scope.
- `I21D3`: Implement the user-facing upgrade, locked-content, and entitlement-state UX without hiding SEO-critical public lesson/wiki/directory content from crawlers.
- `I21D4`: Connect paid access to the existing Creem-derived entitlement state and preserve safe behavior for inactive, canceled, or missing subscriptions.
- `I21D5`: Add regression coverage for entitlement gates, free-vs-paid access, inactive subscription handling, and route-level locked/unlocked states.
- `I21D6`: Update README, memory-bank, and launch checklist artifacts so the paid-tier behavior matches the implemented product.

## Guardrails

- Do not treat `#10` as paid-tier implementation-complete.
- Do not regress anonymous sample or signed-in free access.
- Keep crawlable educational surfaces SSR-visible; gate premium actions, variants, review/certificate/reporting depth, or account-specific behavior rather than blanketing public SEO pages.
- Reuse the existing Better Auth, Neon/Drizzle, Creem, and entitlement foundations from `#11`.
- Keep `#13` mobile readiness and `#16` EDI strategy outside this issue's completion criteria.

## Validation

- `pre-commit`
- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:checkpoint`
- `pnpm build`

## Follow-Up Issues

- [#26](https://github.com/BallLightningAB/shipping-api-dojo/issues/26): Add Sentry Free-tier observability for hosted v2 errors.
- [#27](https://github.com/BallLightningAB/shipping-api-dojo/issues/27): Add dev-only tiered seed users and Playwright auth states.

## Closeout Audit (2026-04-24)

Issue #21 was implemented by PR [#25](https://github.com/BallLightningAB/shipping-api-dojo/pull/25) and merged to `main` on 2026-04-21. GitHub did not auto-close the issue because the PR body used `Refs #21` rather than `Closes #21`. This closeout reconciles the mismatch between the shipped state and the open tracker.

Shipped surfaces verified on `main`:

- Capability matrix: `@/src/lib/entitlements/access-policy.ts` exposes `TIER_CAPABILITY_MATRIX`, `canUseLessonChallengeReroll`, `canUseScenarioReroll`, `canAccessScenarioRun`, `requiresPremiumScenarioDepth`, and `fallbackFreeEntitlements`.
- Server-side enforcement: `@/src/lib/practice/practice-runs.sync.ts` rejects lesson rerolls, arena-cards rerolls, and arena-scenario rerolls with `FORBIDDEN_CAPABILITY:randomization.premium.full` for uncapable sessions and resolves entitlements per request.
- Arena locked-content UX: `@/src/routes/arena/index.tsx` renders `Lock` badges, `Advanced Scenario Depth (Pro)` copy, and `Unlock advanced scenario depth` CTAs for premium-depth cards.
- Lesson upgrade UX: `@/src/routes/lesson/$slug.tsx` swaps the `New Challenge` button for a `Unlock New Challenge (Pro)` link to `/settings#paid-access` on Free.
- Settings entitlement surface: `@/src/routes/settings.tsx` renders the full tier matrix plus live tier/source/capability state and falls back to Free on resolver errors.
- Safe fallback: `resolvePracticeCapabilities` wraps `resolveEntitlementsForUserId` in try/catch and returns `fallbackFreeEntitlements().capabilities` on failure, with exceptions routed through the shared observability logger.
- Regression coverage: `@/src/lib/entitlements/access-policy.test.ts`, `@/src/lib/entitlements/entitlements.test.ts`, and `@/tests/browser/smoke.spec.ts` cover tier derivation, inactive/canceled downgrades, and locked/unlocked surfaces.
- Documentation: `README.md` documents the Free/Pro/Enterprise split; `specs/memory-bank/CHANGELOG.yaml` records v1.1.18–v1.1.20 under `Refs #21`.

Closeout actions:

- Plan archived from `specs/current-changes/` to `specs/archived/completed/`.
- `specs/memory-bank/active-context.yaml` `remaining_deliverables` for `#5` now drops `I5D9` (delivered via #21) and keeps `I5D10`/`I5D11` as the remaining umbrella deliverables.
- GitHub issue #21 is closed with `state_reason=completed` and a closeout comment cross-linking PR #25 and commits `230a792`, `40d0f63`, `3c4b101`.
