# Higher-Value Randomization, Review Modes, and Shareable Certificates Plan

Date: 2026-04-14
Issue: [#10](https://github.com/BallLightningAB/shipping-api-dojo/issues/10)
Branch: `codex/issue-10-outline`
Scope: Outline only. No runtime, UI, backend, or analytics implementation in this phase.

## Execution Progress

- [x] Re-read the memory-bank and current-changes artifacts, confirm the current issue `#10` scope, and create the execution branch
- [x] Wave 1: expand the local outline into an execution-ready planning artifact covering `I10D1` and `I10D2`
- [x] Wave 1: sync GitHub issue `#10`, `active-context.yaml`, and the checkpoint changelog entry
- [x] Wave 1: run commitprocess checks, then stage, commit, and push the checkpoint
- [ ] Wave 2: finish `I10D3` and `I10D4` in the local plan with premium, analytics, and certificate details
- [ ] Wave 2: sync GitHub issue `#10`, `active-context.yaml`, and the checkpoint changelog entry
- [ ] Wave 2: run commitprocess checks, then stage, commit, and push the checkpoint
- [ ] Wave 3: finish `I10D5`, add the future implementation breakdown, archive the completed local plan, and mark the issue done
- [ ] Wave 3: sync GitHub issue `#10`, `active-context.yaml`, and the final changelog entry
- [ ] Wave 3: run commitprocess checks, then stage, commit, push, and close GitHub issue `#10`

## Deliverable Mapping

- `I10D1`: outline higher-value randomized variants beyond ordering changes
- `I10D2`: outline review-mode and challenge-mode surfaces
- `I10D3`: outline premium-ready randomization, analytics hooks, and content gating
- `I10D4`: outline shareable non-authoritative certificates, credential URLs, and LinkedIn-compatible details
- `I10D5`: reserve future AI-only challenge directions

## Rough Estimate

- Dev: 6h
- Test/validation: 2h

## Goal

Define the next product-value layer after the issue `#9` 20/20/20 migration without widening this issue into partial product implementation.

This issue should leave a future implementer with:

- a locked taxonomy for higher-value randomization and review-mode surfaces
- explicit seed and replay boundaries for free, signed-in, Pro, and Enterprise use cases
- a concrete certificate and credential-sharing contract that fits the existing entitlement and schema placeholders
- a future issue breakdown that can be opened without rediscovering product intent

## Locked Non-Goals

- no new runtime routes, loaders, server functions, or UI surfaces
- no new analytics or tracking code
- no new certificate generation, email sending, or credential-page implementation
- no changes to the current free lesson and arena reroll behavior
- no widening into issue `#12`, `#13`, `#15`, or `#16`
- no assumption of native LinkedIn provider integration
- no AI-generated challenge logic in this issue

## Current Constraints From Shipped Work

- The current app already supports deterministic lesson and arena rerolls through the existing seeded runtime in `src/content/runtime.ts`, `src/lib/randomization.ts`, `src/routes/lesson/$slug.tsx`, and `src/routes/arena/index.tsx`.
- Entitlement placeholders already exist in `src/lib/entitlements/entitlements.ts`: `randomization.premium.full`, `review.mode.full`, `certificate.basic`, and `certificate.branded`.
- The current database schema already has a minimal `certificates` table in `src/lib/db/schema.ts`.
- Issue `#10` must explain how those placeholders evolve later instead of partially implementing them here.

## Wave 1: Higher-Value Randomization And Review Modes

Wave 1 owns `I10D1` and `I10D2`.

### Randomization expansion taxonomy

The current shipped randomization covers:

- MCQ option order
- lesson drill order
- arena card order
- lesson rerolls and scenario reruns

The next-value layer should expand within the existing family model through authored banks rather than AI generation.

| Dimension | What varies later | Why it matters | Authoring rule |
| --- | --- | --- | --- |
| Payload fragments | request fields, field values, missing/extra attributes | trains structural debugging instead of memorized examples | keep the canonical objective stable while swapping realistic payload details |
| Header and auth evidence | missing header, wrong namespace, stale token, absent correlation ID | covers operational failures that look valid at first glance | keep one primary misconception per variant |
| Error signaling | HTTP status, body-level error, SOAP fault detail, carrier-specific codes | forces learners to read the full evidence chain | pair each variant with the exact observable clue that should change the decision |
| Evidence snippets | logs, traces, request IDs, webhook timestamps, pagination cursors | raises realism without requiring full scenario generation | use small authored snippets that map to the learning objective |
| Misconception framing | tempting but wrong diagnosis inside the same family | improves replay value and explanation quality | rotate the misconception, not just the names |
| Context wrappers | carrier/business-unit/environment labels | simulates real operational drift | only vary context that does not change the canonical scoring rule |

### Randomization boundaries

Later implementation should preserve these boundaries:

- canonical family IDs remain the progress key
- `variantId` remains the per-run generated detail
- one run keeps a stable seed from start to finish
- free rerolls continue to regenerate from the current client-side pattern
- premium review and challenge modes move seed issuance to authenticated server-backed contracts

### Randomization decision table

| Surface | Seed owner later | Replay rule | Current issue stance |
| --- | --- | --- | --- |
| Lesson reroll | client | reroll on explicit user action only | keep current shipped behavior |
| Arena scenario rerun | client | reroll on explicit user action only | keep current shipped behavior |
| Daily challenge | server | stable for one day per user-scope policy | define only |
| Weekly challenge | server | stable for one week per user-scope policy | define only |
| Weak-area review queue | server | stable until the queued run is completed or intentionally regenerated | define only |
| Timed exam mode | server | fixed run once started; resume policy defined server-side | define only |
| End-of-track assessment | server | fixed issuance window with explicit pass/fail attempt semantics | define only |

### Review-mode surface taxonomy

Future review and challenge surfaces should use these names consistently:

- `daily challenge`
- `weekly challenge`
- `weak-area review`
- `timed exam`
- `end-of-track assessment`

Do not add extra public names until one of these is actually implemented.

### Review-mode contracts

| Surface | Primary user value | Data dependency | Access expectation |
| --- | --- | --- | --- |
| Daily challenge | repeatable daily practice with social or streak value | stable server-authored daily seed | free signed-in or Pro, to be finalized later |
| Weekly challenge | broader recurring benchmark | stable server-authored weekly seed | Pro by default |
| Weak-area review | targeted remediation from server-backed progress | signed-in mastery history | Pro by default |
| Timed exam | pressure-tested mixed run | authenticated run generation and score snapshot | Pro |
| End-of-track assessment | completion or certification gate | authenticated run generation plus pass rules | Pro, with Enterprise cohort overlays later |

### Replay and streak rules

Future implementations should follow these rules:

- free rerolls never invalidate completed lesson/scenario progress
- daily and weekly challenges should be replayable for practice, but only one canonical scored result per seed window should count toward leaderboards or certificate prerequisites
- weak-area review should allow regeneration only after the learner finishes or abandons the current queue
- timed exam and end-of-track assessment should lock their question set once started
- any future streak logic must distinguish replay-for-practice from replay-for-score

## Validation For This Branch

- Validate every wave through planning and artifact alignment, not runtime feature testing.
- End every wave with `pre-commit`, `pnpm format`, `pnpm lint`, and `pnpm typecheck`.
- Keep GitHub issue `#10`, this file, and `specs/memory-bank/active-context.yaml` aligned before each checkpoint commit.
- Update `README.md` only if the public roadmap text becomes materially stale after Wave 2 or Wave 3.

## Planned Wave 2 Additions

Wave 2 will add:

- premium and enterprise packaging hooks for `I10D3`
- analytics taxonomy and privacy-safe rollout gates for `I10D3`
- certificate, credential, and LinkedIn-compatible sharing contracts for `I10D4`
- certificate-related email and SEO/indexation rules for `I10D4`

## Planned Wave 3 Additions

Wave 3 will add:

- the explicit AI-only later-work reservation for `I10D5`
- the future implementation breakdown for follow-on issues
- final issue wrap-up, artifact archival, and closure notes
