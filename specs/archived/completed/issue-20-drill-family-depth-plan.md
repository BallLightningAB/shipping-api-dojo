# Issue 20 Drill Family Depth Plan

Date: 2026-04-20
Issue: [#20](https://github.com/BallLightningAB/shipping-api-dojo/issues/20)
Branch: `codex/issue-12-compliance`
Status: Completed

## Goal

Expand the remaining two-variant drill-family pools from the challenge-depth audit to at least four authored variants each while keeping stable family IDs, lesson slugs, progress keys, and route contracts.

## Deliverables

- `I20D1`: Add two new authored drill variants for each watch-list family.
- `I20D2`: Extend the matching catalog `legacyDrillIds` arrays so every watch-list family references four variants.
- `I20D3`: Add or adjust runtime regression coverage for the expanded family floor.
- `I20D4`: Recompute and record the lesson-depth matrix across 400 seeds.
- `I20D5`: Validate the broader content/runtime checkpoint and close the issue.

## Completed Implementation

- Added new authored variants for `repair-xsd-type-mismatches`, `rest-pagination-drift`, `rest-partial-success-compensation`, `rest-rate-limits-backpressure`, `rest-sandbox-production-drift`, and `soap-fault-detail-extraction`.
- Updated `src/content/catalog/drill-family-catalog.ts` so each target family now has four stable drill IDs.
- Added a runtime regression test that fails if any watch-list family drops below four variants or references a missing drill ID.
- Recomputed the 400-seed lesson-depth matrix and updated the audit artifact with the final counts.

## Before And After

| Lesson slug | After issue #19 | After issue #20 |
| --- | ---: | ---: |
| `cross-track-1-sandbox-vs-production-behavior` | 12 | 24 |
| `rest-10-observability-health-checks-runbooks` | 12 | 24 |
| `rest-4-pagination-webhooks` | 12 | 24 |
| `rest-7-rate-limits-quotas-backpressure` | 12 | 24 |
| `rest-8-partial-success-bulk-compensation` | 12 | 24 |
| `soap-3-fault-handling` | 12 | 24 |
| `soap-4-schema-validation-before-send` | 12 | 24 |
| `soap-7-fault-taxonomy-internal-error-mapping` | 12 | 24 |

## Validation

- `pnpm exec vitest run src/content/runtime.test.ts --config vitest.config.ts`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:checkpoint`
- `pnpm build`
