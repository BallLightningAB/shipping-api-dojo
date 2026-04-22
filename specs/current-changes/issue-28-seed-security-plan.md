# Issue 28 Seed Security Plan

Issue: [#28](https://github.com/BallLightningAB/shipping-api-dojo/issues/28)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Status: in-progress
Priority: critical

## Execution Progress

- [x] Start from merged `main` on `codex/issue-28-seed-security`.
- [x] Read the memory-bank and current-changes artifacts through the memory-bank workflow.
- [x] Review issue `#28`, parent issue `#5`, and the completed `#8/#9/#10` planning artifacts.
- [x] Map current seed-bearing routes and client paths.
- [x] Implement the first seed-security slice for lesson and arena practice flows.
- [x] Add regression coverage for search-param stripping and seed-free client-facing run payloads.
- [x] Run the full repo validation workflow.
- [x] Open draft PR [#29](https://github.com/BallLightningAB/shipping-api-dojo/pull/29).
- [x] Address PR review feedback by adding explicit reroll remount nonces, centralizing legacy seed-param cleanup, using database-native update timestamps, and documenting the seed-security boundary in `README.md`.
- [x] Address the follow-up PR review by replacing delimiter-composed practice seed row IDs with random IDs and preserving signed-in Free scenario shuffles as local, non-authoritative practice behavior.
- [x] Address the third PR review by adding cascade ownership from `practice_seeds.user_id` to `user.id` and making local Free arena shuffles use fresh local seeds.

## Goal

Remove URL-visible randomization seeds from production-grade hosted flows so users cannot share exact randomized practice paths or weaken future certificate validity.

## Problem

The current v2 randomization model can expose seeds in route search params such as lesson or arena URLs. That was acceptable for proving deterministic randomization mechanics, but it is not acceptable for certificate-bearing or competitive paid practice flows because copied URLs can reproduce the same randomized path for another user.

## Scope

- Move seed generation for protected practice flows to server-authoritative logic.
- Store seed ownership server-side, tied to the user/session/progress record that owns the practice attempt.
- Remove seed values from shareable URLs and client-controlled search params where certificate or premium validity depends on uniqueness.
- Preserve SEO/public educational crawlability by keeping lesson/wiki/directory content visible while protecting user-specific randomized attempt state.
- Add tests that verify seeds are not present in URLs, client-extractable route state, or public page markup for protected flows.
- Document the replay, reset, and share-link rules for anonymous sample, signed-in free, Pro, Enterprise, and future certificate flows.

## Out Of Scope

- Issuing certificates.
- Building shareable credential pages.
- Adding new randomization dimensions beyond the existing content-family runtime.
- Rewriting public lesson content routes as authenticated-only pages.

## Acceptance Criteria

- Seeds are never exposed in URLs for protected randomized practice flows.
- Seeds are generated server-side.
- Seeds are stored server-side in session-backed or database-backed state.
- Seed-to-user mapping is not reusable by another user through a copied URL.
- Tests verify seed values cannot be extracted from client-side URLs or public markup where protected flow security matters.
- Existing public educational pages remain crawlable and SSR-visible.

## Implementation Notes

Treat this as a security and product-integrity prerequisite before certificates or any claim of unique randomized challenge validity. The first implementation pass should map every current seed-bearing route/search param, decide which flows remain anonymous/demo-only, and then move signed-in and premium practice attempts behind server-authoritative state.

## Current Seed Surface Map

Before this branch:

- `/lesson/$slug` accepted `?seed=` and `?exclude=`, used them in loader dependencies, returned `seed` to loader data, and wrote both values back to the URL when the Pro `New Challenge` action rerolled drills.
- `/arena` accepted `?seed=`, `?runSeed=`, and `?scenario=`, returned the arena card `seed` from the loader, wrote `seed` during scenario shuffles, wrote `runSeed` when opening or rerolling a scenario, and materialized scenario runs client-side from the URL seed.
- `src/content/runtime.ts` and the family builders still require numeric seeds internally; that is acceptable as long as the seed remains server-owned or anonymous-demo-only and is not exposed through shareable route state.

After this branch:

- `/lesson/$slug` no longer has seed-bearing route search state. Legacy `seed` and `exclude` query params are stripped from the browser URL, and the route returns only materialized lesson/drill data.
- `/arena` keeps `?scenario=` as the only shareable practice selector. Legacy `seed`, `runSeed`, and `exclude` params are stripped from the browser URL, and active scenarios are materialized by the loader or server function without returning `runSeed`.
- Signed-in lesson, arena-card, and arena-scenario seeds are stored in the new `practice_seeds` table under `(user_id, surface, scope)`.
- Pro reroll actions now call server functions that rotate the signed-in user's owned seed and return materialized drills/cards/scenarios without exposing the seed.
- Anonymous public/demo practice still uses deterministic internal seeds so public educational pages stay SSR-visible and crawlable, but those seeds are not written to route search params and are not certificate-bearing.

## First Slice Summary

- Added a database-backed `practice_seeds` ownership table and generated migration `0002_perpetual_cloak.sql`.
- Split pure practice-run materialization from server-owned seed issuance so tests can assert that client-facing payloads do not include seeds.
- Reworked lesson and arena routes to derive signed-in seeds server-side, preserve public content rendering, and remove legacy seed query params from visible URLs.
- Added unit coverage for stripped search state and seed-free run payloads.
- Added browser smoke coverage proving legacy seed params are removed from practice URLs and seed values do not appear in public page markup.

## Review Follow-Up

- Added explicit lesson and arena reroll nonces so removing URL seed changes does not preserve stale drill or scenario component state across protected rerolls.
- Centralized legacy seed-param stripping in `src/lib/practice/use-strip-legacy-seed-params.ts` for lesson and arena routes.
- Switched practice-seed update timestamps to database `now()` for consistency with the Neon/Postgres clock.
- Updated `README.md` to describe server-owned signed-in practice seeds, stripped legacy seed params, crawlable public surfaces, and anonymous/demo practice as non-certificate-bearing.
- Replaced colon-concatenated practice seed row IDs with random row IDs; `(user_id, surface, scope)` remains the ownership and upsert key.
- Kept signed-in Free scenario-order shuffles available as local, non-authoritative practice behavior while Pro continues to use server-backed rerolls.
- Added a cascade foreign key from `practice_seeds.user_id` to `user.id` in the Drizzle schema, migration SQL, and snapshot metadata.
- Changed local Free arena shuffles to use a fresh browser-local seed per click instead of the fixed anonymous route seed.
- Stabilized the checkpoint smoke suite by making `/settings` privacy, access, entitlement, and retention surfaces visible in the `ClientOnly` fallback, so slow hydration no longer hides the review validation assertions.
- Defensively stripped seed-like fields from arena card payloads, centralized practice seed/id generation in shared pure helpers, reused that seed helper for Free local arena shuffles, and changed legacy seed-param cleanup to use Router navigation replacement instead of direct history mutation.
- Updated legacy seed-param cleanup to observe Router search-string changes so internal navigations that reintroduce `seed`, `runSeed`, or `exclude` are stripped without a full remount.
- Replaced read-then-write get-or-create seed issuance with an atomic insert-or-read upsert that preserves the first generated seed on conflicts and returns the persisted seed to concurrent callers.
- Refactored `/settings` so the SSR fallback and hydrated settings panel share storage, privacy/support, paid-access, and account-rights sections instead of duplicating compliance and tier copy.
- Hardened the latest review edge cases by removing `window.location.origin` from legacy seed-param cleanup, using an explicit Postgres `"seed"` column reference for the no-op insert-or-read upsert, and clearing stale `?scenario=` state after local Free arena shuffles.
- Final review pass: aligned `ArenaScenarioCard` type with runtime behavior by changing `extends Scenario` to `extends Omit<Scenario, "runSeed" | "seed">`; verified `sql.identifier` is incompatible with drizzle-orm 0.45.1 `onConflictDoUpdate` set clauses and kept `sql.raw('"seed"')` as the correct no-op upsert pattern.
- Follow-up review pass: stripped seed and runSeed from `overlayArenaCardAccess` in Free practice flows to align with the `ArenaScenarioCard` type and prevent seed leakage in client-side state and markup.
