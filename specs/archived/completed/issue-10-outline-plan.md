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
- [x] Wave 2: finish `I10D3` and `I10D4` in the local plan with premium, analytics, and certificate details
- [x] Wave 2: sync GitHub issue `#10`, `active-context.yaml`, and the checkpoint changelog entry
- [x] Wave 2: run commitprocess checks, then stage, commit, and push the checkpoint
- [x] Wave 3: finish `I10D5`, add the future implementation breakdown, archive the completed local plan, and mark the issue done
- [x] Wave 3: sync GitHub issue `#10`, `active-context.yaml`, and the final changelog entry
- [x] Wave 3: run commitprocess checks, then stage, commit, push, and close GitHub issue `#10`

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

## Wave 2: Premium Hooks, Analytics Taxonomy, And Certificate Contracts

Wave 2 owns `I10D3` and `I10D4`.

### Premium and enterprise entitlement mapping

The current placeholder capability names should evolve later with this intent:

| Capability placeholder | Free later | Pro later | Enterprise later | Notes |
| --- | --- | --- | --- | --- |
| `randomization.premium.full` | no change to current baseline rerolls | unlock authored premium variant banks and challenge-bank breadth | same as Pro plus private packs | keep the current free reroll path distinct from premium-run generation |
| `review.mode.full` | limited or no access beyond any future signed-in daily challenge | unlock weak-area review, timed exam, and end-of-track assessment | same as Pro plus team overlays | do not split this into multiple capability keys until real implementation forces it |
| `certificate.basic` | no | unlock self-serve completion and challenge certificates | yes | aligned to self-serve user issuance |
| `certificate.branded` | no | no | unlock branded templates and enterprise cohort issuance | reserved for team/admin flows |
| `reporting.team` | no | no | unlock cohort and assignment reporting | stays Enterprise-only |

### Packaging stance

| Tier | Randomization stance | Review-mode stance | Certificate stance |
| --- | --- | --- | --- |
| Anonymous sample | current baseline public sample only | none | none |
| Signed-in free | current baseline rerolls plus any future narrow daily challenge if retained for activation | no weak-area or exam surfaces | none |
| Pro | premium variant-bank breadth and challenge-run generation | weak-area review, timed exam, end-of-track assessment, and Pro-only recurring challenge surfaces | self-serve completion and challenge certificates |
| Enterprise | Pro capabilities plus private content packs and branded runs | cohort overlays and assignment/reporting workflows | branded cohort certificates and admin-managed issuance |

### Content-gating rules

- Keep the current free lesson and arena rerolls public.
- Gate future premium value through breadth, tracking, credential issuance, and reporting rather than by removing the current free baseline.
- Treat saved challenge history, certificate eligibility, and weak-area review as hosted-account features even if some future recurring challenge remains free-signed-in.
- Keep enterprise value concentrated in branding, reporting, assignment, and custom content packs.

### Analytics taxonomy

This issue defines event names and checkpoints only. It does not authorize implementation before issue `#12` confirms a compliant path for any non-essential tracking.

| Event family | Example event names | Purpose later | Privacy gate |
| --- | --- | --- | --- |
| Challenge discovery | `challenge_daily_viewed`, `challenge_weekly_viewed`, `review_mode_seen` | see which review surfaces attract attention | do not ship before issue `#12` |
| Challenge run lifecycle | `challenge_run_started`, `challenge_run_completed`, `challenge_run_abandoned` | measure run completion and friction | do not ship before issue `#12` |
| Review quality | `weak_area_queue_generated`, `weak_area_item_mastered`, `exam_mode_passed` | measure whether review tooling improves retention | do not ship before issue `#12` |
| Certificate lifecycle | `certificate_earned`, `certificate_viewed`, `certificate_shared` | measure certificate value and sharing behavior | do not ship before issue `#12` |
| Upgrade pressure | `paywall_challenge_seen`, `paywall_certificate_seen`, `upgrade_cta_clicked` | see where premium value converts | do not ship before issue `#12` |

### Analytics checkpoints

Future implementation should answer these questions:

- do recurring challenges increase signed-in activation and return rate
- do weak-area and exam surfaces improve completion of lessons and tracks
- do certificate surfaces drive social sharing or upgrade behavior
- which premium gates create useful conversion pressure without harming the free baseline

Until issue `#12` authorizes a compliant analytics path, these remain documentation only.

### Certificate and badge surface matrix

Certificates remain non-authoritative proof-of-completion or proof-of-proficiency signals. They are not accredited credentials.

| Surface | Audience | Award trigger later | Capability gate |
| --- | --- | --- | --- |
| Course completion certificate | individual learner | complete a defined lesson or track path | `certificate.basic` |
| Challenge-pass certificate | individual learner | pass a scored challenge or assessment threshold | `certificate.basic` |
| Track mastery badge | individual learner | meet a higher proficiency threshold across a track | `certificate.basic` |
| Enterprise cohort certificate | managed team/cohort | admin-issued or rules-based cohort completion | `certificate.branded` |

### Credential data contract

Every future certificate should keep these fields stable:

- certificate title
- issuing organization
- issue date
- optional expiry date
- certificate type
- human-readable credential ID
- public credential URL
- share slug for the public credential page
- visibility state

The human-readable credential ID and the public share slug should remain distinct so LinkedIn/manual entry and public page routing do not depend on the same identifier.

### Credential URL and indexation policy

- Public credential pages should use stable share-slug URLs under the main product domain later.
- Credential pages should default to conservative indexation and should be treated as `noindex` until they prove enough standalone user value to justify search exposure.
- Social-preview metadata is useful even when the page remains `noindex`.
- Certificate pages should not become thin SEO surfaces whose only value is a claim badge.

### LinkedIn-compatible manual certification details

Future certificate issuance should provide a copyable detail block for the user to paste manually into LinkedIn's `Licenses & certifications` UI:

- certification name
- issuing organization
- issue month and year
- optional expiry month and year
- credential ID
- credential URL

Do not assume any native LinkedIn provider integration or automated profile write access.

### Certificate notification surfaces

Future email surfaces should stay limited to:

- certificate issued
- share your certificate
- enterprise cohort completion notification

These remain later implementation work and should use the existing email/delivery foundations from issue `#11` rather than inventing a separate notification system.

### README impact

Wave 2 does not require a README change unless the public roadmap text starts implying that issue `#10` already shipped runtime certificate or challenge features. The current README remains accurate enough and should stay unchanged in this wave.

## Wave 3: AI Reservation And Future Implementation Breakdown

Wave 3 owns `I10D5` and the final wrap-up.

### AI-only later work

Reserve all of the following for a separate future issue. None belong in the current non-AI outline implementation track:

- generated troubleshooting branches
- adaptive difficulty tuned per user
- open-ended answer grading
- generated logs, payloads, or incident narratives
- free-form evaluation of written operational responses

The current issue should leave the non-AI architecture clean enough that a future AI tier can layer onto:

- stable concept IDs
- stable family IDs
- stable run and variant semantics
- stable certificate and entitlement boundaries

### Future implementation breakdown

This outline should hand off into later implementation issues rather than trying to absorb those builds here.

| Future issue slice | Scope later | Depends on |
| --- | --- | --- |
| Challenge and review runtime | daily/weekly runs, weak-area queue generation, timed exam flows, end-of-track assessment rules, server-authored seeds | issue `#11` foundations already shipped, issue `#12` if tracking or extra storage changes are needed |
| Certificate and credential pages | certificate issuance rules, shareable credential pages, metadata, email sends, account surfaces | issue `#11` email/data foundation, issue `#12` privacy/indexation review |
| Premium gating and reporting | paywalls, upgrade prompts, challenge history, enterprise reporting, cohort overlays | issue `#11` entitlements and billing, issue `#12` compliance guardrails |
| AI challenge layer | generated payloads, logs, adaptive practice, open-ended scoring | all non-AI surfaces above should exist first |

### Follow-on sequencing recommendation

The recommended follow-on order after issue `#10` is:

1. complete issue `#12` so any future analytics, credential visibility, and user-data disclosures have a compliant foundation
2. choose whether the next product build is the challenge/review runtime or certificate/share surfaces
3. defer any AI-specific track until the non-AI premium surfaces prove enough user value to justify it

### Final wrap-up rules

- mark issue `#10` done in `active-context.yaml`
- clear `remaining_deliverables` for issue `#10`
- archive this local plan to `specs/archived/completed/issue-10-outline-plan.md`
- update `specs/current-changes/issue-5-joint-plan.md` so its next-issue note no longer points at issue `#10`
- close GitHub issue `#10` after the final checkpoint push
