# Issue 17 Browser Smoke Suite Plan

Date: 2026-04-13
Issue: [#17](https://github.com/BallLightningAB/shipping-api-dojo/issues/17)
Branch: `codex/issue-9-migration`
Scope: Add a cost-efficient browser smoke suite that protects key SSR/browser-visible routes during issue checkpoints and remains lightweight enough to carry into future mirror sites.
Status: Completed locally on 2026-04-13.

## Goal

Add a browser-level regression layer that is:

- easy to run locally at issue checkpoints
- cheap in compute and maintenance cost
- small enough to evolve alongside issue `#9`
- reusable as a baseline for future sibling products under `apidojo.app`

## Constraints

- keep the default runner to one Chromium project
- prefer route-level smoke checks over deep multi-step end-to-end orchestration
- avoid screenshot-golden maintenance costs
- keep traces and screenshots failure-oriented
- do not make browser automation the primary validation layer; unit/integration coverage remains the default

## Deliverables

- `I17D1`: add Playwright Test and a minimal browser smoke config
- `I17D2`: add easy local scripts for headless and headed smoke runs
- `I17D3`: cover the current checkpoint surfaces: home, learn hubs, one lesson, arena, wiki, and directory
- `I17D4`: keep the layout simple enough to extend to future mirror sites without cloning a large suite
- `I17D5`: document the suite in `README.md` and update the memory-bank artifacts

## Proposed Shape

- use `playwright.config.ts` with `webServer` so the app boots automatically for test runs
- use Chromium only by default
- use `trace: on-first-retry`, `screenshot: only-on-failure`, and no default video capture
- add a small `tests/browser` directory with route-focused smoke specs
- keep selectors semantic and user-visible to reduce maintenance churn

## Checkpoint Coverage

- home page renders and links to learning surfaces
- REST hub renders expected lesson list
- representative lesson page renders and shows drills
- arena landing page renders and scenario links open
- wiki page renders structured content
- directory page renders curated resources

## Validation

- `pnpm test:e2e` passes against the current Wave 2 app state
- `pnpm test:checkpoint` is the documented checkpoint runner for combined Vitest plus browser smoke validation
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` remain passing after the Playwright setup lands

## Follow-On Notes

- future auth/billing browser flows can be separate targeted suites instead of inflating the smoke layer
- mirror sites such as the planned EDI sibling product should reuse the same config and helper layout where practical
