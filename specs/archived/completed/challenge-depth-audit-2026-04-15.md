# Challenge Depth Audit

Date: 2026-04-15
Scope: Audit lesson challenge depth across all tracks after the reported reroll weakness on `rest-9-webhook-signatures-replay-ordering`.
Branch: `codex/issue-12-compliance`

## Audit Method

- Enumerate every lesson from the runtime catalog.
- Materialize each lesson across 400 seeds.
- Count distinct challenge outcomes using the full ordered drill-id tuple for each lesson run.
- Treat any lesson below 12 distinct outcomes as below the acceptable floor for this pass.

## Issue #19 Result

- No lesson remains below the 12-outcome floor.
- Lessons that were previously low or medium depth were lifted by expanding reusable drill families instead of patching individual lesson routes.

## Issue #20 Follow-Up Result

- The remaining watch-list families were expanded from 2 to 4 authored variants each.
- Family IDs, lesson slugs, progress keys, and route contracts stayed stable.
- The lessons that were at the 12-outcome floor after issue #19 now report 24 distinct outcomes across 400 seeds.
- Runtime coverage now protects both the lesson-depth floor and the expanded watch-list family pool size.

## Current Lesson Depth Snapshot

| Lesson slug | Distinct outcomes across 400 seeds |
| --- | ---: |
| `intro-carrier-integrations` | 18 |
| `rest-2-auth-headers` | 18 |
| `rest-3-error-mapping` | 18 |
| `rest-5-idempotency-keys-deduplication` | 18 |
| `rest-6-timeout-taxonomy-ambiguous-outcomes` | 18 |
| `rest-9-webhook-signatures-replay-ordering` | 18 |
| `soap-1-envelope-namespaces` | 18 |
| `soap-2-wsdl-xsd` | 18 |
| `soap-5-headers-auth-correlation-ids` | 18 |
| `soap-6-version-drift-wsdl-monitoring-regeneration` | 18 |
| `cross-track-2-carrier-capability-matrix-integration-architecture` | 18 |
| `rest-4-pagination-webhooks` | 24 |
| `rest-7-rate-limits-quotas-backpressure` | 24 |
| `rest-8-partial-success-bulk-compensation` | 24 |
| `rest-10-observability-health-checks-runbooks` | 24 |
| `soap-3-fault-handling` | 24 |
| `soap-4-schema-validation-before-send` | 24 |
| `soap-7-fault-taxonomy-internal-error-mapping` | 24 |
| `cross-track-1-sandbox-vs-production-behavior` | 24 |
| `rest-1-http-semantics` | 151 |

## Families Expanded In This Pass

- `detect-body-errors-despite-http-200`
- `rest-oauth-token-lifecycle`
- `rest-required-headers-correlation-ids`
- `rest-problem-details-normalization`
- `rest-error-classification`
- `rest-pagination-drift`
- `rest-webhook-receiver-behavior`
- `detect-breaking-carrier-contract-changes`
- `soap-fault-detail-extraction`
- `incident-evidence-logging`
- `rest-timeout-recovery`
- `rest-retry-policy-cloze`

## Resolved Watch List

These families were the remaining 2-variant pools after issue #19. Issue #20 expanded each one to 4 authored variants.

| Family | Current variants | Why it still matters |
| --- | ---: | --- |
| `repair-xsd-type-mismatches` | 4 | Shared SOAP schema-validation depth is protected if another lesson reuses it with a low-variant partner. |
| `rest-pagination-drift` | 4 | Future pagination lessons now have cursor invalidation and deduplication examples beyond offset drift. |
| `rest-partial-success-compensation` | 4 | Bulk/compensation depth now includes split outcome modeling and rejected-item evidence preservation. |
| `rest-rate-limits-backpressure` | 4 | Rate-limit practice now includes quota-aware dispatch and synchronized retry-burst prevention. |
| `rest-sandbox-production-drift` | 4 | Environment-drift practice now includes entitlement, validation, and production-readiness examples. |
| `soap-fault-detail-extraction` | 4 | SOAP fault diagnosis now includes structured codes, field paths, and nested detail parsing. |

### Validation

- `pnpm exec vitest run src/content/runtime.test.ts --config vitest.config.ts`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:checkpoint`
- `pnpm build`
