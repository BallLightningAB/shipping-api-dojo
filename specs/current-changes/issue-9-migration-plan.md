# Issue 9 Migration Plan

Date: 2026-04-12
Issue: [#9](https://github.com/BallLightningAB/shipping-api-dojo/issues/9)
Branch: `codex/issue-9-migration`
Scope: Full migration from the mixed legacy/family runtime to the final 20/20/20 content-family model, plus targeted wiki and directory support required by that curriculum.
Status: In progress. Phase 0 and Wave 1 completed on 2026-04-12. Wave 2 is the next coding slice.

## Deliverable Mapping

- `I9D1`: expand the editorial lesson set to 20 total lessons
- `I9D2`: expand the drill catalog to 20 authored drill families and regroup current drills into that taxonomy
- `I9D3`: expand the scenario catalog to 20 total scenario families and regroup current scenarios into that taxonomy
- `I9D4`: migrate the current lessons, drills, and scenarios to the new content-family model and retire the legacy shapes
- `I9D5`: review and revise the full content set so it matches the new quality rules, data model, scenario structure, and SEO guardrails

## Rough Estimate

- Dev: 42h
- Test/validation: 22h

## Phase 0: Documentation Sync

Before coding the curriculum waves:

- update this file, the issue-5 joint plan, and `specs/memory-bank/active-context.yaml`
- sync GitHub issues `#5`, `#9`, `#10`, `#12`, and `#13` to the current execution state
- create and document follow-on issues `#15` and `#16`
- record end-of-wave status updates in GitHub issue `#9`, this file, and `active-context.yaml` so the issue remains resumable if work pauses mid-stream

## Current Wave Status

### Wave 1 completed on 2026-04-12

- moved the issue-8 family definitions into canonical family modules under `src/content/families/*` and added supporting catalogs under `src/content/catalog/*`
- migrated all 8 current lessons onto canonical lesson definitions while preserving the existing issue-8 family IDs for `rest-1-http-semantics`, `soap-1-envelope-namespaces`, and `timeout-create-shipment`
- regrouped the current lesson drills into 16 canonical drill families and the current arena incidents into 5 canonical scenario families
- switched the lesson/track/continue surfaces to the runtime lesson catalog so the canonical lesson IDs now drive navigation and progress lookups
- implemented local progress remapping from legacy drill and scenario IDs to canonical family IDs, then covered the migration path with progress-schema and merge tests
- validated the wave with `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `pnpm build`

### Wave 2 next

- add the six new REST lessons
- expand the REST-heavy drill and scenario families beyond the migrated baseline set
- add the targeted REST-supporting wiki and directory entries
- rerun the same validation suite plus route-level/browser checks after the new curriculum content lands

## Locked Alignment With Issue 8

Issue `#9` extends the completed proof of concept from `#8`. It does not recreate the runtime architecture.

Keep:

- route-seeded deterministic lesson and arena randomization
- canonical family progress keys
- the current lesson and arena reroll pattern
- the mixed-model runtime only as a temporary transition layer
- the current family-model primitives (`LessonDefinition`, `DrillFamilyDefinition.buildVariant`, `ScenarioFamilyDefinition.buildRun`)

Do not:

- redesign the seed strategy
- replace the canonical family-progress semantics
- invent a second family model parallel to the issue-8 shape

## Goal

Ship the full authored content expansion with:

- 20 total lessons
- 20 total drill families
- 20 total scenario families
- a dedicated `cross-track` lesson hub
- targeted wiki and directory additions that directly support the migrated curriculum
- SSR-visible, crawlable lesson and wiki surfaces that strengthen the site knowledge graph instead of weakening it

The migration should use the archived `#7` handoff in `specs/archived/completed/issue-7-scoping-plan.md` as the contract source for family IDs, seeded randomization, and progress boundaries.

## Final Lesson Target

### Existing lessons to migrate and upgrade

1. Intro: What Carrier Integrations Get Wrong
2. REST: HTTP Semantics, Idempotency, and Retries
3. REST: Auth, Headers, and Correlation IDs
4. REST: Error Mapping and Problem Details
5. REST: Pagination and Webhooks Basics
6. SOAP: Envelope and Namespaces
7. SOAP: WSDL and XSD Mental Model
8. SOAP: Fault Handling and Logging

### New lessons to add

9. REST: Idempotency Keys and Deduplication Patterns
10. REST: Timeout Taxonomy and Ambiguous Outcomes
11. REST: Rate Limits, Quotas, and Backpressure
12. REST: Partial Success, Bulk Operations, and Compensation
13. REST: Webhook Signatures, Replay Defense, and Ordering
14. REST: Observability, Health Checks, and Incident Runbooks
15. SOAP: Schema Validation Before Send
16. SOAP: SOAP Headers, Auth Tokens, and Correlation IDs
17. SOAP: Version Drift, WSDL Monitoring, and Regeneration
18. SOAP: Fault Taxonomy and Internal Error Mapping
19. Cross-track: Sandbox vs Production Behavior
20. Cross-track: Carrier Capability Matrix and Integration Architecture

## Final Drill Family Target

The current static drills are regrouped into these 20 canonical families.

1. Detect body-level errors despite HTTP 200
2. Classify safe, idempotent, and unsafe operations
3. Choose the safest next step after timeout ambiguity
4. Repair retry and backoff policy
5. Cache and refresh OAuth tokens correctly
6. Send required headers and correlation IDs
7. Normalize carrier errors into Problem Details
8. Classify retryable, permanent, and ambiguous failures
9. Diagnose pagination drift
10. Validate webhook receiver behavior
11. Build a valid SOAP envelope
12. Repair namespace usage
13. Read WSDL service and operation contracts
14. Repair XSD and type mismatches
15. Extract actionable SOAP fault detail
16. Log the right incident evidence
17. Handle rate limits and backpressure
18. Reconcile partial-success responses
19. Diagnose sandbox versus production drift
20. Detect breaking carrier contract changes

## Final Scenario Family Target

The current 5 scenarios are absorbed and expanded into these 20 canonical families.

1. Timeout on Create Shipment
2. 429 Rate Limiting Storm
3. SOAP Fault with Cryptic Detail
4. WSDL Change Breaks Client
5. HTTP 200 with Error Payload
6. Auth Token Expires Over Weekend
7. Duplicate Webhook Replay
8. Out-of-Order Tracking Events
9. Partial Label Generation with Downstream Persistence Failure
10. Sandbox Works but Production Rejects the Request
11. Legacy API Sunset Cutover
12. Carrier Maintenance Window Breaks Scheduled Jobs
13. Pagination Cursor Lost Mid-Sync
14. Missing Correlation ID During Support Escalation
15. SOAP Header/Auth Mismatch
16. Carrier Enum Change Causes Validation Failure
17. Bulk Shipment Job Restarts Mid-Run
18. Stale Token Cache Across Multiple Workers
19. Dead-Letter Queue Triage After Permanent Failures
20. Carrier Created the Label but Internal Save Failed

## Targeted Wiki and Directory Scope

Issue `#9` does not attempt a broad vendor documentation encyclopedia. It adds only the support surfaces required by the migrated curriculum and SEO.

### Wiki additions in scope

- `oauth-token-lifecycle`
- `retry-after-and-backpressure`
- `webhook-signatures`
- `webhook-replay-and-ordering`
- `partial-success-and-compensation`
- `health-checks`
- `dead-letter-queues`
- `schema-validation`
- `soap-headers-and-auth`
- `contract-testing`
- `wsdl-diff-monitoring`
- `sandbox-vs-production`

### Wiki rules

- keep the teaching carrier-agnostic by default
- use named carrier callouts only where they materially improve realism
- never describe “DHL” as one unified surface when the relevant behavior belongs to a specific business unit, country, or protocol
- prefer explicit references like `DHL Express`, `DHL Freight`, `DHL eCommerce`, or a named API/doc surface

### Directory rules

- add official provider docs only when they directly support a lesson or wiki page in this issue
- favor official standards docs and official carrier docs over generic commentary
- the deeper vendor/business-unit/region library belongs in follow-on issue `#15`

## Migration Rules

- keep canonical family IDs stable
- regroup current drills into the 20 target families
- regroup current scenarios into the 20 target families
- migrate lesson references from fixed drill IDs to family IDs
- migrate existing local progress from legacy drill/scenario IDs to canonical family IDs
- retire legacy static-only shapes once the new family model is complete
- keep family outputs and progression semantics stable enough that a future native client can consume the same content taxonomy
- keep lesson slugs stable unless there is a strong SEO reason to change them
- update wiki and directory cross-links where relevant so the new lessons strengthen the crawlable hub-and-spoke structure

## Authoring Rules

- each lesson section maps to a clear learning objective
- each drill family targets one primary misconception
- distractors remain plausible and specific
- explanations address why wrong answers look tempting
- builder drills use realistic headers, payload fragments, and SOAP elements
- scenarios reward the safest operational decision, not trivia recall
- every scenario family includes logging, retry, and escalation expectations

## Production Order

### Wave 1 (`I9D4`)

- restructure content into canonical family modules and catalogs
- migrate the 8 current lessons into the existing issue-8 runtime shape
- regroup the current drills and scenarios into canonical family IDs
- implement the v1-to-v2 local progress migration for legacy drill and scenario IDs
- update GitHub issue `#9`, this file, and `active-context.yaml`

### Wave 2 (`I9D1`, `I9D2`, `I9D3`)

- add the six new REST lessons
- expand supporting drill families and scenario families around REST reliability
- add the targeted REST-supporting wiki and directory entries
- update GitHub issue `#9`, this file, and `active-context.yaml`

### Wave 3 (`I9D1`, `I9D2`, `I9D3`)

- add the four new SOAP lessons
- expand SOAP drill families and SOAP-heavy incident ladders
- add the targeted SOAP-supporting wiki and directory entries
- update GitHub issue `#9`, this file, and `active-context.yaml`

### Wave 4 (`I9D1`, `I9D3`, `I9D5`)

- add the two cross-track lessons and the `/learn/cross-track` hub
- add the final cross-track and enterprise-relevant scenario families
- remove the remaining mixed-model compatibility paths
- run a full quality, taxonomy, migration, and SEO pass across the whole set
- update GitHub issue `#9`, this file, and `active-context.yaml`

## Content Review Process

- use a manual review checklist for objectives, misconception coverage, distractor quality, explanation quality, and operational realism
- add lightweight validation scripts where practical for duplicate IDs, missing family references, and track ordering
- validate sitemap coverage, canonical targets, and internal-link integrity for the expanded lesson set
- do not treat the content set as done until the checklist and validation scripts both pass

## Acceptance Criteria

- the app ships 20 lessons, 20 drill families, and 20 scenario families
- issue `#9` remains structurally aligned with the completed issue-8 proof of concept
- targeted wiki and directory additions directly support the curriculum without expanding into the broader vendor-documentation program
- legacy drill and scenario shapes are retired or reduced to temporary compatibility adapters only
- existing content is visibly absorbed into one coherent taxonomy
- the content quality rules are applied across migrated and new content
- lesson and wiki pages remain crawlable and internally linked after the migration

## Validation And Iteration

- validate each wave before starting the next one
- add or update automated tests and validation scripts in each wave rather than saving all coverage work for the end
- use browser control at the end of each wave to verify lesson playback, drill progression, scenario progression, progress persistence, and internal-link integrity
- inspect SSR HTML and sitemap outputs at the end of each wave to catch SEO regressions early
- rerun the progress migration tests whenever canonical family IDs or mapping tables change
