# Issue 8 PoC Plan

Date: 2026-03-17
Issue: [#8](https://github.com/BallLightningAB/shipping-api-dojo/issues/8)
Branch: `codex/issue-8-poc`
Scope: Prove the content-family and seeded-randomization approach on one narrow slice.

## Deliverable Mapping

- `I8D1`: prove minimum viable randomization for answer order, drill order, and arena scenario order
- `I8D2`: convert one REST lesson and one SOAP lesson to the family model
- `I8D3`: convert one scenario into a scenario-family ladder exemplar
- `I8D4`: validate stable progress mapping and SSR-safe behavior

## Rough Estimate

- Dev: 10h
- Test/validation: 6h

## Goal

Validate that the architecture from `#7` and the foundation from `#11` are workable before the full migration in `#9`.

## Locked Slice

### Lesson exemplar 1

- upgrade the current REST lesson `rest-1-http-semantics`
- prove:
  - family-based drill references
  - seeded drill ordering
  - seeded MCQ option ordering

### Lesson exemplar 2

- upgrade the current SOAP lesson `soap-1-envelope-namespaces`
- prove:
  - family-based SOAP builder drill generation
  - stable progress mapping despite shuffled order

### Scenario exemplar

- upgrade the current `timeout-create-shipment` scenario into a scenario family ladder
- prove:
  - stable `scenarioFamilyId`
  - one deeper, deterministic run assembled from a seed
  - future-ready room for alternate evidence or branch details

## Implementation Tasks

### Data and content

- add the family model types chosen in `#7`
- implement the REST and SOAP exemplar family definitions
- implement one scenario family definition
- add explicit compatibility adapters so legacy lessons, drills, and scenarios can still render through the same runtime API during the mixed-model period

### Seeded randomization

- add one deterministic PRNG helper
- derive lesson and arena run seeds from route loaders or server-safe boundaries
- apply deterministic shuffle to:
  - MCQ options
  - lesson drill order
  - arena scenario card order

### Progress validation

- confirm progress keys use canonical IDs, not order indexes
- confirm anonymous mode still works
- confirm signed-in mode uses the server-backed contracts from `#11`

### SSR and hydration validation

- verify no hydration mismatch from randomized order
- verify one render path under SSR and one under client navigation
- verify the "new challenge" or rerun action can regenerate a new seed safely

### SEO and route integrity

- keep the instructional lesson body SSR-visible while only randomizing the parts that actually need runtime seeds
- verify canonical tags, route titles, and crawlable lesson content still render correctly after the family-model conversion
- keep the arena page functional without letting its randomization strategy leak hydration-risk patterns into lesson and directory surfaces

## Specific Test Cases

- the same seed produces the same order across refreshes
- a different seed produces a different order
- progress is stored against canonical family IDs rather than legacy drill IDs
- the adapter layer can render both migrated and unmigrated content in the same build

## Non-Goals

- do not expand billing, email, or domain work here
- do not migrate the whole content set here
- do not implement higher-value randomized payload mutation here

## Acceptance Criteria

- one REST lesson runs on the new family model
- one SOAP lesson runs on the new family model
- one scenario family ladder runs on the new family model
- MCQ option order, lesson drill order, and arena scenario order are randomized without hydration errors
- progress remains stable across refreshes and revisits

## Validation And Iteration

- validate each exemplar independently before combining them in one build
- add automated tests for deterministic shuffle helpers, seed derivation, and compatibility adapters
- use browser control to verify the lesson routes and arena route under real navigation
- rerun the same-seed and different-seed checks after every content-model or loader change
- inspect SSR HTML for the exemplar lesson routes to confirm the instructional content remains indexable
