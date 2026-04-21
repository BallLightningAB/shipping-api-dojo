# Issue 28 Seed Security Plan

Issue: [#28](https://github.com/BallLightningAB/shipping-api-dojo/issues/28)
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Milestone: v2
Status: planned
Priority: critical

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
