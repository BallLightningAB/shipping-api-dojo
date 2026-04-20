# Challenge Depth Audit

Date: 2026-04-15
Scope: Audit lesson challenge depth across all tracks after the reported reroll weakness on `rest-9-webhook-signatures-replay-ordering`.
Branch: `codex/issue-12-compliance`

## Audit Method

- Enumerate every lesson from the runtime catalog.
- Materialize each lesson across 400 seeds.
- Count distinct challenge outcomes using the full ordered drill-id tuple for each lesson run.
- Treat any lesson below 12 distinct outcomes as below the acceptable floor for this pass.

## Current Result

- No lesson remains below the 12-outcome floor.
- Lessons that were previously low or medium depth were lifted by expanding reusable drill families instead of patching individual lesson routes.

## Current Lesson Depth Snapshot

| Lesson slug | Distinct outcomes across 400 seeds |
| --- | ---: |
| `rest-4-pagination-webhooks` | 12 |
| `rest-7-rate-limits-quotas-backpressure` | 12 |
| `rest-8-partial-success-bulk-compensation` | 12 |
| `rest-10-observability-health-checks-runbooks` | 12 |
| `soap-3-fault-handling` | 12 |
| `soap-4-schema-validation-before-send` | 12 |
| `soap-7-fault-taxonomy-internal-error-mapping` | 12 |
| `cross-track-1-sandbox-vs-production-behavior` | 12 |
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

## Remaining Watch List

These families are no longer causing low/medium lesson depth, but they are still only two variants deep and should be expanded in a separate thread if we want a healthier long-term floor across future lesson combinations.

| Family | Current variants | Why it still matters |
| --- | ---: | --- |
| `repair-xsd-type-mismatches` | 2 | Shared SOAP schema-validation depth is still narrow if another lesson reuses it with a low-variant partner. |
| `rest-pagination-drift` | 2 | Good enough now, but future pagination lessons will plateau quickly if they reuse it unchanged. |
| `rest-partial-success-compensation` | 2 | Bulk/compensation depth is still thin relative to the lesson importance. |
| `rest-rate-limits-backpressure` | 2 | Enough for the current lesson, but still narrow for a major operational concept. |
| `rest-sandbox-production-drift` | 2 | Cross-track and observability lessons will benefit from more environment-drift variants. |
| `soap-fault-detail-extraction` | 2 | SOAP fault diagnosis is still shallow if reused in more than one lesson. |

## Separate Thread Instructions

Use a dedicated follow-up thread for the families in the watch list above.

### Goal

- Raise every watch-list family from 2 variants to at least 4 authored variants.
- Keep the family ids stable.
- Do not change lesson slugs, progress keys, or route contracts.

### Files to update

- `src/content/drills.ts`
- `src/content/catalog/drill-family-catalog.ts`
- `src/content/runtime.test.ts`

### Exact implementation steps

1. Add 2 new authored drill variants for each watch-list family in `src/content/drills.ts`.
2. Extend the matching `legacyDrillIds` arrays in `src/content/catalog/drill-family-catalog.ts` so each target family references all 4 variants.
3. Keep each new variant focused on the same family concept and misconception rather than drifting into a new topic.
4. Prefer realistic operational examples:
   - pagination drift: inserts during polling, cursor invalidation, replay-safe resumption
   - partial success: split commits, compensating writes, audit gaps
   - rate limits: Retry-After handling, burst limits, worker throttles, dead-letter pressure
   - sandbox drift: credential mismatch, entitlement mismatch, stricter production validation, missing production setup
   - SOAP fault detail: field-level detail extraction, carrier codes, nested detail parsing
   - XSD mismatches: enums, decimals, required elements, namespace-bound types
5. Add or adjust runtime assertions in `src/content/runtime.test.ts` if the new depth materially changes expected challenge counts.
6. Recompute the lesson-depth matrix over 400 seeds and record the before/after counts in the thread summary.

### Validation

- `pnpm exec vitest run src/content/runtime.test.ts --config vitest.config.ts`
- `pnpm typecheck`
- If the thread touches broader lesson/runtime behavior, also run:
  - `pnpm test`
  - `pnpm test:checkpoint`
