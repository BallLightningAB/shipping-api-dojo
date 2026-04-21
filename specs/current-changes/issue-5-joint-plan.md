# Issue 5 Joint Plan

Date: 2026-04-12
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Scope: Coordination plan for the full Shipping API Dojo web-v2 program anchored by `#5`, with core execution across `#7`, `#11`, `#8`, `#9`, `#10`, `#12`, `#15`, `#21`, `#26`, `#27`, and `#28`.

## Goal

Deliver issue `#5` through a strict sequence that separates:

- technical scoping
- auth, billing, email, and domain foundations
- a narrow proof of concept
- the full 20/20/20 content migration
- later higher-value randomization and certificate work
- launch-readiness privacy/compliance work
- deeper wiki expansion beyond the core curriculum
- paid tiers, entitlement-aware content gating, premium access surfaces, and upgrade behavior
- production-grade hosted error reporting
- development-only tiered auth and billing-state fixtures for browser validation
- server-authoritative seed security for certificate-safe randomized practice

Issue `#5` provides the global instructions and guardrails for the whole web-v2 implementation chain. Subplans should not reinterpret its product boundary, testing standard, or SEO posture independently.

## Locked Decisions

- Production domain target is `shipping.apidojo.app` under the `apidojo.app` umbrella.
- The `apidojo.app` purchase and subdomain/DNS setup are required work, not a launch footnote.
- API Trainer gets a fresh dedicated Resend account and sending domain.
- Hosted access follows `anonymous sample -> signed-in free -> Pro -> Enterprise`.
- Local-only progress remains anonymous-only.
- Signed-in progress becomes server-backed.
- The public repo stays open core.
- Issue `#5` stays minimum viable randomization only.
- `#10` is outline-only for higher-value randomization, certificates, and premium challenge surfaces; it does not complete the paid-tier implementation.
- Native app delivery and mobile-readiness strategy stay outside `#5` completion criteria and are tracked separately in `#13`.
- Public-repo licensing is `AGPL-3.0-only`; trademarks remain reserved and private premium materials stay outside the public repo.
- Lessons, wiki, and directory surfaces are SEO-critical and must remain crawlable, SSR-visible, and internally linked throughout v2.
- Every implementation issue must add or update automated tests wherever the behavior can be covered mechanically, then use browser-control validation for route and auth flows that still require end-to-end confirmation.
- Broad carrier-reference expansion belongs in `#15`, not `#9`, and remains inside the `#5` v2 umbrella.
- Paid tiers, content gating, upgrade UX, and premium access behavior belong in `#21` because `#10` only documented the future direction and `#11` only shipped foundations.
- Hosted v2 observability belongs in `#26`; issue `#21` may add a lightweight wrapper but full Sentry setup should stay separate.
- Dev-only tiered auth and billing-state fixtures belong in `#27` so Free/Pro/Enterprise/canceled states can be exercised without polluting production data.
- Seed-security hardening belongs in `#28`; deterministic randomization was proven in `#8/#9`, but URL-visible seeds must be removed before certificate-bearing or competitive paid practice flows launch.
- EDI should be treated as a sibling-product strategy issue in `#16`, not as a third track inside Shipping API Dojo and not as a `#5` blocker.

## Current Execution Notes

- The public product identity is now `Shipping API Dojo`, with `API Dojo` treated as the umbrella brand for future sibling products.
- Public SEO copy should prefer keyword phrases like `shipping API training`, `carrier APIs`, and `carrier integrations` instead of reviving the old `API Trainer` product label.
- Issues `#10`, `#12`, `#19`, and `#20` are complete, but `#10` was outline-only and does not mean paid tiers/content gating are implemented.
- Issue `#5` remains open until `#15` and `#21` complete.
- Issues `#26`, `#27`, and `#28` are now in-scope v2 support sub-issues under `#5`.
- Issues `#13` and `#16` are still useful strategy work, but they are not blockers for `#5`.
- During future implementation issues, keep GitHub, the issue-local plan artifact, and `active-context.yaml` aligned so resumability does not depend on terminal history.

## Execution Order

Do not start the next branch until the previous one is completed, reviewed, and merged or documented as the current active branch.

1. `#7` on `codex/issue-7-scoping`
2. `#11` on `codex/issue-11-auth-foundation`
3. `#8` on `codex/issue-8-poc`
4. `#9` on `codex/issue-9-migration`
5. `#10` on `codex/issue-10-outline`

Additional v2 support issues:

- `#12` must complete before production auth and paid features are enabled.
- `#15` is an in-scope v2 sub-issue for the deep wiki and directory expansion after issue `#9` completes the curriculum-linked wiki surface.
- `#21` is an in-scope v2 sub-issue for paid tiers, entitlement-aware content gating, and premium access surfaces.
- `#26` is an in-scope v2 sub-issue for Sentry Free-tier observability on hosted error paths.
- `#27` is an in-scope v2 sub-issue for dev-only tiered seed users and Playwright auth states.
- `#28` is an in-scope critical v2 sub-issue for server-authoritative seed security before certificates or challenge-validity claims.
- `#13` is follow-on mobile-readiness/native strategy work outside `#5`.
- `#16` is follow-on EDI sibling-product strategy work outside `#5`.

## Issue Graph

`#5` is the umbrella.

- `#7` defines the architecture, boundaries, and decision-complete contracts.
- `#11` implements the platform foundation chosen in `#7`.
- `#8` proves the family model, seeded randomization, and SSR-safe behavior on a narrow slice.
- `#9` scales the approved approach to the full content set.
- `#10` stays follow-on and outline-only for now.
- `#12` covers EU privacy/storage/launch compliance before hosted auth and paid rollout.
- `#15` expands the wiki beyond curriculum-linked support pages into a vendor/business-unit/region/protocol library.
- `#21` implements the paid-tier/content-gating and premium access behavior that `#10` outlined and `#11` made possible.
- `#26` adds Sentry-backed observability so hosted auth, billing, entitlement, webhook, and route-loader failures are visible without relying on console output.
- `#27` adds development-only seeded users and browser auth states for exercising tiered access through production-like resolver paths.
- `#28` removes URL-visible seed exposure from protected randomized practice by moving seed ownership into server-authoritative state.
- `#13` and `#16` are separate strategy follow-ons and do not block `#5`.

## SEO And Knowledge-Surface Guardrails

- Keep lesson, wiki, and directory content server-rendered where search users need the actual content in initial HTML.
- Do not push primary lesson or directory content behind `ClientOnly` or post-hydration fetches.
- Preserve stable slugs, canonical URLs, sitemap coverage, and internal-link hubs while the content-family migration is underway.
- Treat the domain cutover to `shipping.apidojo.app` as a controlled site move: prefer one major variable at a time and avoid coupling it to avoidable information-architecture churn.
- Avoid spawning large numbers of thin indexable pages; any new filter, credential, or low-content page type should default to conservative indexation until it proves real user value.
- In issue `#9`, keep wiki and directory work narrowly tied to the curriculum and SEO support needs of the 20/20/20 rollout.
- In issue `#15`, expand the documentation taxonomy by vendor, business unit, region, and protocol instead of writing generic “carrier” summaries.

## Deliverable Mapping

| Parent deliverable | Delivery issue | Notes |
| --- | --- | --- |
| `I5D1` MCQ answer-order randomization | `#8`, then `#9` | Prove once, then roll out broadly. |
| `I5D2` Lesson drill-order randomization | `#8`, then `#9` | Same seeded execution model as `I5D1`. |
| `I5D3` Arena scenario-order randomization | `#8`, then `#9` | Start with card ordering, then expand to family variants later. |
| `I5D4` 20 lessons | `#9` | Editorial lessons remain authored, not AI-generated. |
| `I5D5` 20 drill families | `#9` | Existing drills are regrouped into the family taxonomy. |
| `I5D6` 20 scenario families | `#9` | Existing scenarios are absorbed into the family taxonomy. |
| `I5D7` linked sub-issue execution plan | `#7`, `#11`, `#8`, `#9`, `#15`, `#21`, `#26`, `#27`, `#28` | Satisfied when the in-scope issue graph and plan set are in place. |
| `I5D8` separate higher-value randomization track | `#10` | Outline only in this phase. |
| `I5D9` paid tiers, content gating, and premium access surfaces | `#21` | Implementation work remains open. |
| `I5D10` deep wiki and directory reference expansion | `#15` | In-scope v2 knowledge-surface expansion remains open. |
| `I5D11` hosted error observability | `#26` | Add Sentry Free-tier reporting with privacy-safe context. |
| `I5D12` tiered dev auth fixtures | `#27` | Add seeded Free/Pro/Enterprise/canceled states and Playwright auth helpers. |
| `I5D13` server-authoritative seed security | `#28` | Remove URL-visible seeds from protected randomized practice flows before certificate launch. |

## Rough Estimates

| Issue | Focus | Dev | Test/validation |
| --- | --- | --- | --- |
| `#7` | decision-complete scoping | 12h | 6h |
| `#11` | auth, billing, email, domain, progress foundation | 30h | 16h |
| `#8` | representative proof of concept | 10h | 6h |
| `#9` | full migration and content authoring | 42h | 22h |
| `#10` | higher-value follow-on outline | 6h | 2h |
| `#12` | EU privacy/storage/launch compliance | 8h | 4h |
| `#15` | deep wiki expansion | 14h | 6h |
| `#21` | paid tiers, entitlement gating, and premium access surfaces | 18h | 10h |
| `#26` | Sentry Free-tier observability | 4h | 2h |
| `#27` | dev-only tiered seed users and Playwright auth states | 6h | 4h |
| `#28` | seed-security hardening | 8h | 5h |
| Core chain total | `#5` umbrella rollup (`#7/#11/#8/#9/#10`) | 100h | 52h |
| Full `#5` web-v2 total | core chain plus `#12/#15/#21/#26/#27/#28` | 158h | 83h |
| Separate strategy follow-ons | `#13` mobile-readiness and `#16` EDI sibling-product strategy | 14h | 6h |

## Dependencies

### Hard prerequisites before `#11`

- Purchase `apidojo.app`.
- Confirm registrar and DNS access.
- Provision the `shipping.apidojo.app` production subdomain.
- Create a dedicated Resend account for API Trainer.
- Create or confirm a Creem merchant account with test/live mode access.
- Create or confirm a Neon project for API Trainer.

### Hard prerequisites before `#8`

- `#7` must define the final family model, seed strategy, and progress ownership.
- `#11` must provide working auth/progress contracts and environment plumbing.

### Hard prerequisites before `#9`

- `#8` must validate the content-family and seeded-randomization approach.
- Phase 0 documentation sync must complete so the umbrella issue, local plan, and memory-bank reflect the current execution state.

## Risks and Dependency Handling

| Risk | Impact | Handling |
| --- | --- | --- |
| Domain purchase is delayed | `#11` Phase 7 blocks | Continue `#11` Phases 1-6 on preview URLs and cut over later. |
| Resend domain verification is delayed | production email blocked | Finish auth/billing code behind feature flags and hold production sends until the domain is verified. |
| Creem product/pricing setup is delayed | Pro checkout blocks | Finish entitlement plumbing with stubs and validate in test mode first. |
| Schema/progress migration is harder than expected | `#8` and `#9` slip | Lock v1-to-v2 migration rules in `#7` before coding begins. |
| Scenario authoring scope grows faster than expected | `#9` expands materially | Deliver in waves and validate each wave before opening the next. |
| Carrier wiki scope expands inside `#9` | `#9` loses focus | Defer the broader taxonomy and reference-library work to `#15`. |
| Paid tiers remain foundation-only | v2 launch lacks upgrade behavior and content gating | Complete `#21` before treating `#5` as done. |
| Hosted failures remain console-only | production entitlement or billing failures are missed | Complete `#26` before enabling paid hosted rollout. |
| Paid-tier QA depends on ad hoc accounts | regressions slip across Free/Pro/Enterprise/canceled states | Complete `#27` before relying on browser validation for paid access. |
| URL-visible seeds remain in protected flows | copied URLs can reproduce randomized attempts and undermine future certificate validity | Complete `#28` before certificates or challenge-validity claims launch. |

## Shared Product Boundaries

### Public/open-core surface

- public marketing and educational shell
- baseline lesson, drill, and scenario engine
- anonymous sample experience
- baseline free signed-in experience

### Hosted/premium surface

- durable progress and account history
- entitlement-aware content access
- premium variant banks and review modes
- certificates and shareable credential pages
- team and enterprise reporting

### Sibling-product surface

- future EDI product strategy stays outside Shipping API Dojo’s lesson-track model
- product-specific SEO and curriculum boundaries should stay separate even when shared systems are reused

## Future Platform Guardrails

The current implementation stays web-first, but it should not hard-code browser-only assumptions into the product core.

- keep content-family definitions, scoring rules, progress semantics, and entitlement logic in platform-neutral modules
- keep server contracts reusable by future native clients
- treat local browser storage as a client detail, not the long-term source of truth
- keep certificate and challenge-run outputs stable enough to be reused across web and native surfaces
- keep the future EDI sibling-product direction in mind when deciding which systems stay shared and which remain SEO or curriculum specific

## Validation Rule

Every implementation issue in this chain must include iterative validation, not just a final test pass.

- validate at the end of each phase or wave
- rerun the relevant automated checks before moving on
- push automated coverage as close to 100% as practical for deterministic logic, migrations, entitlement rules, and route-level regressions
- use browser control for auth, progress, and UI behavior when route-level behavior matters
- fix and retest within the same issue until the acceptance criteria are actually satisfied

## Exit Criteria

This planning package is complete when:

- the v2 issue plans and follow-on outline artifacts exist in `specs/current-changes`
- GitHub issues `#5`, `#7`, `#11`, `#8`, `#9`, `#10`, `#12`, `#15`, `#21`, `#26`, `#27`, and `#28` match this structure
- `#13` and `#16` are explicitly marked as separate strategy follow-ons outside `#5`
- the memory-bank reflects the new order and scope
- the repo is ready to execute work in branch order without inventing architecture mid-stream
- the SEO, licensing, privacy, mobile-readiness, wiki-expansion, and sibling-product guardrails are explicit enough that later issues do not accidentally undermine them
