# Issue 5 Research Paper: Higher-Quality, Higher-Volume, Randomized Content Without AI

Date: 2026-03-16
Issue: [#5](https://github.com/BallLightningAB/api-trainer/issues/5)
Scope: Research only. No implementation changes yet.

## Executive Summary

The highest-leverage path for issue #5 is not "write many more static items by hand." It is to move the content model from fixed items to authored content families with deterministic variation.

That means:

- keep lessons human-authored and editorial
- turn drills into reusable item models with parameter banks
- turn scenarios into scenario families with swappable incident details, branches, and payload variants
- randomize with stable seeds so the product feels fresh without breaking progress tracking or SSR
- improve quality by emphasizing retrieval practice, feedback, interleaving, and stronger distractors instead of just more distractors

This approach fits the current no-AI constraint, preserves a future path to premium tiers, and gives the project a better content production ratio: one authored family can yield several legitimate practice variants.

Updated direction after review:

- issue #5 should target minimum viable randomization only
- higher-value randomization should live in a separate follow-on issue
- the next content target should be 20 lessons and 20 drill families
- persistent progress should move toward auth-backed tracking so it can support paid gating

## Current Repo Audit

The current product is structurally ready for expansion, but the content model is still fully static.

Current state in the repo:

- Lessons: 8 total in [`src/content/lessons.ts`](../../src/content/lessons.ts)
- Drills: 17 total in [`src/content/drills.ts`](../../src/content/drills.ts)
- Scenarios: 5 total in [`src/content/scenarios.ts`](../../src/content/scenarios.ts)
- Lesson drill order is fixed by `lesson.drillIds` in [`src/content/lessons.ts`](../../src/content/lessons.ts)
- MCQ option order is fixed by `options[]` plus `correctIndex` in [`src/content/types.ts`](../../src/content/types.ts) and rendered directly in [`src/components/drill/McqDrill.tsx`](../../src/components/drill/McqDrill.tsx)
- Arena scenario order is fixed by the `scenarios` array in [`src/routes/arena/index.tsx`](../../src/routes/arena/index.tsx)
- Lesson routes load deterministic drill arrays in [`src/routes/lesson/$slug.tsx`](../../src/routes/lesson/$slug.tsx)

Implication:

- the product is easy to understand
- the product is not yet replayable
- the content system does not yet scale economically
- randomization cannot be safely bolted on as a last-minute UI shuffle if quality and progress tracking are meant to improve

## Research Synthesis

### 1. Retrieval practice is a core quality lever

Practice testing improves retention more reliably than re-reading alone. That supports making drills a larger share of the product, not just adding more expository lesson text.

Relevant sources:

- Roediger and Karpicke (2006), "Test-enhanced learning" [PubMed](https://pubmed.ncbi.nlm.nih.gov/16917094/)
- Karpicke and Roediger (2007), spacing retrieval practice [PubMed](https://pubmed.ncbi.nlm.nih.gov/17696615/)

Repo implication:

- quality should mean more retrieval opportunities per learning objective
- expansion should prioritize drill families and scenario replay value, not just more lesson paragraphs

### 2. Feedback quality matters as much as question quantity

Multiple-choice practice is most useful when it includes meaningful explanatory feedback. Current drill explanations are directionally correct but usually only explain the right answer, not why distractors are plausible but wrong.

Relevant source:

- Butler, Karpicke, and Roediger (2007), feedback in multiple-choice testing [PubMed](https://pubmed.ncbi.nlm.nih.gov/17470178/)

Repo implication:

- each drill family should be authored around a misconception pattern
- explanations should resolve the misconception, not just restate the rule

### 3. Interleaving and variation improve discrimination learning

Interleaving similar problem types helps learners distinguish when to use one rule versus another. For this product, that is directly relevant to retryable vs permanent errors, SOAP namespace vs schema problems, auth vs rate-limit failures, and similar near-neighbor mistakes.

Relevant source:

- Birnbaum, Kornell, Bjork, and Bjork (2013), interleaved study improves inductive learning [PubMed](https://pubmed.ncbi.nlm.nih.gov/23637110/)

Repo implication:

- drill order should not always stay grouped by the exact same subtopic
- later review sets should deliberately mix adjacent concepts

### 4. Better distractors beat more distractors

Assessment research consistently shows weak distractors are common and often waste authoring effort. A recent systematic review found 3-option MCQs can be as sound as 4- or 5-option items while reducing non-functioning distractors, though evidence certainty remains low and local validation is still advised.

Relevant sources:

- Sridharan and Sivaramakrishnan (2025), option-count systematic review [BMC](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-025-08026-5)
- Tarrant, Ware, and Mohammed (2009), functioning vs non-functioning distractors [BMC](https://bmcmededuc.biomedcentral.com/articles/10.1186/1472-6920-9-40)

Repo implication:

- higher quality does not require more answer options
- three strong options may outperform four weak ones for many items
- expansion work should prioritize distractor plausibility, not merely option count

### 5. Automatic item generation can be non-AI and still high leverage

Assessment literature supports automatic item generation through cognitive models and item models, where authors define a structured concept template and parameter sets, then systematically generate multiple valid items. This is the closest research-backed analogue to what API-Trainer needs right now.

Relevant sources:

- Falcao, Costa, and Pego (2022), review of automatic item generation [PubMed](https://pubmed.ncbi.nlm.nih.gov/35230589/)
- Franks et al. (2023), three-step model with systematic distractor generation [ScienceDirect abstract](https://www.sciencedirect.com/science/article/abs/pii/S0002945923000827)

Repo implication:

- do not introduce LLM generation yet
- do introduce authored item models, parameter banks, and deterministic assembly

### 6. Randomness in TanStack Start must be SSR-safe

TanStack Start is isomorphic by default, and route loaders run on both server and client. Its hydration guidance explicitly calls out random IDs and other unstable values as mismatch risks. Randomization is still fine, but the seed and execution boundary must be chosen deliberately.

Relevant sources:

- TanStack Start execution model [docs](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
- TanStack Start hydration errors [docs](https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors)
- TanStack Start code execution patterns [docs](https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns)

Repo implication:

- do not call `Math.random()` directly in SSR-rendered UI and expect stable output
- generate randomization from a deterministic seed
- either compute that seed in a stable loader/server boundary or keep the randomized portion inside `ClientOnly`

## What "Higher Quality" Should Mean Here

For issue #5, "higher quality" should mean:

1. More retrieval practice per learning objective
2. Better misconception coverage
3. Stronger explanations
4. More varied payloads, logs, and failure modes
5. Less predictability in item order and answer placement
6. Better transfer to real debugging situations

It should not primarily mean:

- longer lesson text
- more options per MCQ
- more static items that differ only cosmetically

## Recommended Content Architecture

### A. Keep lessons editorial, but split drills into families and variants

Recommended model:

- `lesson`
  - stable human-authored reading content
  - learning objectives
  - associated drill family IDs
- `drill family`
  - concept being tested
  - misconception being targeted
  - template type (`mcq`, `cloze`, `builder.rest`, `builder.soap`)
  - parameter bank
  - explanation templates
  - difficulty
  - tags
- `drill instance`
  - generated from one family plus one parameter set plus one seed

Why this is better:

- authors write one strong model instead of many shallow clones
- replay value rises immediately
- progress can still map to stable family IDs

### B. Replace `correctIndex` with answer semantics

Current MCQ shape is operationally fragile for randomization because correctness is tied to an array index.

Recommended future shape:

```ts
type McqDrillFamily = {
  id: string
  type: "mcq"
  stemTemplate: string
  correctOption: string
  distractors: string[]
  explanation: string
  misconceptionNotes?: Record<string, string>
  optionCount?: 3 | 4
}
```

Then:

- assemble options
- shuffle with a deterministic seed
- derive `correctIndex` from the shuffled result at runtime

This directly solves deliverable I5D1 without coupling correctness to authoring order.

### C. Build scenario families, not just scenario entries

The current scenarios are good seeds, but each one only has a single authored path. Instead, treat each incident as a scenario family with changeable payloads and branch details.

Example family axes:

- carrier name
- transport protocol
- error code
- retry header presence
- webhook order
- auth expiry timing
- partial-success response shape
- logging evidence available to the learner

That allows one authored scenario family to produce multiple valid runs while preserving the same pedagogical intent.

### D. Separate canonical identity from run identity

For progress tracking, the stable IDs should represent the learning unit, not the exact randomized instance.

Recommended identity model:

- `lessonId`: stable
- `drillFamilyId`: stable
- `scenarioFamilyId`: stable
- `variantId`: optional instance detail
- `runSeed`: per run or per session

This lets the app say:

- "you completed the retry-strategy family"
- without pretending every randomized variant is a totally new drill

## Recommended Randomization Strategy

### Minimum viable randomization

This should satisfy issue #5 quickly and safely:

1. Shuffle MCQ option order
2. Shuffle drill order within a lesson
3. Shuffle scenario cards on the arena landing page

This is worthwhile, but it is only a partial solution. It is the right implementation target for issue #5.

### Higher-value randomization

After the minimum changes, add parameterized variation in a separate follow-on issue:

1. Swap carrier names, endpoints, headers, payload fields, and error codes
2. Swap which misconception is tested first inside a lesson
3. Rotate scenario evidence snippets
4. Randomize between 2-4 variants from the same family rather than always rendering every static drill

### Seed policy

Recommended policy:

- use deterministic seeded randomization
- keep the seed stable for one lesson/scenario run
- allow regeneration on revisit or explicit "new challenge"

Good seed candidates:

- session seed
- daily seed
- lesson seed derived from `(lessonId + sessionSeed)`
- scenario seed derived from `(scenarioFamilyId + sessionSeed)`

TanStack constraint:

- if randomized content is rendered during SSR, the server and client must share the same seed
- otherwise keep the randomized subtree in `ClientOnly`

## Recommended Content Expansion Strategy

### Lesson expansion

The product should aim for 20 lessons, but still grow through strong objective coverage rather than bloated text.

Recommended additions:

- REST: Idempotency keys and deduplication
- REST: Timeout taxonomy and retry boundaries
- REST: Webhook signatures and replay defense
- REST: Observability, correlation IDs, and health checks
- SOAP: Schema validation before send
- SOAP: Version drift and WSDL monitoring
- SOAP: Fault taxonomy and mapping to internal problem models
- Cross-track: Carrier sandbox vs production behavior

### Drill expansion

Instead of manually writing 50 unrelated drills, define 20 authored drill families that can each yield several good variants.

Recommended family categories:

- classify retryable vs permanent vs ambiguous failures
- identify the most useful log field
- choose the safest next step after timeout
- repair a malformed HTTP request
- repair a malformed SOAP envelope
- detect body-level errors despite HTTP 200
- map carrier-specific errors into normalized domain errors
- interpret pagination state
- validate webhook receiver behavior
- diagnose WSDL/schema mismatches

### Scenario expansion

The scenario set should become a deeper ladder, not just a longer list.

Recommended scenario family categories:

- duplicate shipment risk after timeout
- auth token expiry over weekend
- 429 storm during batch runs
- body says error but HTTP says success
- webhook replay or out-of-order delivery
- carrier sandbox works but production fails
- WSDL changed without notice
- SOAP detail element reveals wrong field type
- partial label generation success with downstream persistence failure
- polling sync misses records due to pagination drift

## Recommended Quality Rules For Authors

When writing future content, use these rules. These are meant to guide the research and writing work done in-house for this project, not to assume a separate outside authoring team.

1. Every lesson section should map to at least one explicit learning objective.
2. Every drill family should test one primary misconception, not several at once.
3. Every MCQ should use only plausible distractors.
4. Explanations should say why the chosen wrong answer is attractive and why it fails.
5. Builder drills should include realistic field names and payload fragments, not toy syntax.
6. Scenarios should reward the safest operational decision, not trivia recall.
7. Incident content should include what to log, what to retry, and what not to assume.

## Subscription and Monetization Implications

This section is product judgment, not directly established by the cited education papers.

### Auth-backed progress and gating

Given the revised direction, persistent progress should likely require sign-in instead of staying entirely anonymous.

Recommended product stance:

- free users can still sample useful content without friction
- saved progress, gated content, and subscription status should sit behind auth
- auth should become the bridge between the free experience and the first paid tier

Recommended architecture direction:

- auth: Better Auth
- billing: Creem
- email: Resend
- data layer for users, subscriptions, and progress: Neon Postgres + Drizzle ORM

This aligns with the shared Ball Lightning architecture direction and the newer Chronomation stack choice where Creem has replaced Polar.

### What should probably remain free

- core lessons
- a useful baseline of drills
- some randomization, at least answer-order randomization and rotating drill order

Reason:

- if the free version feels too static, the product may never demonstrate value strongly enough to support conversion later
- requiring auth for durable progress does not require making the learning surface itself useless when logged out

### What could become paid without harming the core product

- larger variant banks per drill family
- advanced scenario packs
- daily or weekly challenge modes
- spaced review queue
- advanced analytics on weak areas
- exportable practice history
- "exam mode" mixes that pull from broader banks

### Future AI tier

Do not build this now. But preserve the architecture for it.

A future AI tier could add:

- open-ended troubleshooting challenges
- generated log fragments and payload mutations
- adaptive difficulty
- free-form answer evaluation

To make that future easier, the non-AI system should already separate:

- stable concept IDs
- variant generation
- scoring rules
- explanation assets

## Recommended Direction For Planning

The next planning pass should focus on this sequence:

1. Define the content-family data model
2. Define the seed strategy and SSR boundary
3. Choose which existing drills/scenarios become the first families
4. Expand one REST lesson, one SOAP lesson, and one scenario family as exemplars
5. Only then scale out the rest of the content bank

This keeps scope under control and avoids writing many new static items that will later need to be refactored into a better model.

## Bottom-Line Recommendation

The best non-AI answer to issue #5 is:

- editorial lessons
- deterministic item generation
- stronger distractors
- richer explanations
- seeded replayable variants
- scenario families instead of one-off scenarios

That will make API-Trainer feel larger, smarter, and more replayable without incurring AI cost.

## Source List

- Roediger HL, Karpicke JD. Test-enhanced learning. [https://pubmed.ncbi.nlm.nih.gov/16917094/](https://pubmed.ncbi.nlm.nih.gov/16917094/)
- Karpicke JD, Roediger HL. Repeated retrieval during learning is the key to long-term retention. [https://pubmed.ncbi.nlm.nih.gov/17696615/](https://pubmed.ncbi.nlm.nih.gov/17696615/)
- Butler AC, Karpicke JD, Roediger HL. Correcting a metacognitive error: feedback increases retention of low-confidence correct responses. [https://pubmed.ncbi.nlm.nih.gov/17470178/](https://pubmed.ncbi.nlm.nih.gov/17470178/)
- Birnbaum MS, Kornell N, Bjork EL, Bjork RA. Why interleaving enhances inductive learning. [https://pubmed.ncbi.nlm.nih.gov/23637110/](https://pubmed.ncbi.nlm.nih.gov/23637110/)
- Sridharan K, Sivaramakrishnan G. Less is more? A systematic review and network meta-analysis on MCQ option numbers. [https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-025-08026-5](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-025-08026-5)
- Tarrant M, Ware J, Mohammed AM. An assessment of functioning and non-functioning distractors in multiple-choice questions. [https://bmcmededuc.biomedcentral.com/articles/10.1186/1472-6920-9-40](https://bmcmededuc.biomedcentral.com/articles/10.1186/1472-6920-9-40)
- Falcao F, Costa P, Pego JMP. Feasibility assurance: a review of automatic item generation in medical assessment. [https://pubmed.ncbi.nlm.nih.gov/35230589/](https://pubmed.ncbi.nlm.nih.gov/35230589/)
- Franks H, et al. Using Automatic Item Generation to Create Multiple-Choice Questions for Pharmacy Assessment. [https://www.sciencedirect.com/science/article/abs/pii/S0002945923000827](https://www.sciencedirect.com/science/article/abs/pii/S0002945923000827)
- TanStack Start execution model. [https://tanstack.com/start/latest/docs/framework/react/guide/execution-model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
- TanStack Start hydration errors. [https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors](https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors)
- TanStack Start code execution patterns. [https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns](https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns)
