# Fresh-Thread Prompt — Issue #13 Mobile Readiness and Native App Strategy

Use this prompt to start a brand-new conversation. Run in a dedicated worktree so it can execute in parallel with issue #15.

## Worktree setup (run once before starting the new thread)

```bash
# From the main repo at c:/Users/nicol/CascadeProjects/BallLightning/shipping-api-dojo
git fetch origin
git worktree add ../shipping-api-dojo-issue-13 -b codex/issue-13-mobile-readiness origin/main
```

Open the new worktree as the workspace for the fresh thread:
`c:/Users/nicol/CascadeProjects/BallLightning/shipping-api-dojo-issue-13`

## Prompt to paste into the fresh thread

> Implement issue [#13 Mobile Readiness and Native App Strategy](https://github.com/BallLightningAB/shipping-api-dojo/issues/13) on branch `codex/issue-13-mobile-readiness` in this worktree.
>
> **This is a strategy + light-touch refactor issue, not a feature build.** No native app code is shipped here. The deliverables are:
>
> - a written strategy document
> - small, surgical refactors that protect platform-neutral domain boundaries in the existing web codebase
>
> **Context to read first (in full, up to 1000 lines per file):**
>
> - `specs/memory-bank/active-context.yaml`
> - `specs/memory-bank/memory-bank-usage.yaml`
> - `specs/memory-bank/CHANGELOG.yaml`
> - `specs/current-changes/issue-13-mobile-readiness-outline.md`
> - `specs/shipping-api-dojo-pdd.yaml`
> - Domain-shaped modules: `src/lib/randomization.ts`, `src/lib/practice/*`, `src/lib/progress/*`, `src/lib/entitlements/*`, `src/content/*`, `src/lib/auth/*`, `src/lib/billing/*`.
>
> Also apply the workflow at `%USERPROFILE%\.codeium\windsurf\global_workflows\initiate-memorybank.md` and check for relevant skills.
>
> **Goal:** Define how Shipping API Dojo can become a future native product without forcing premature complexity into the current web-first implementation. Protect platform-neutral domain logic so a future React Native (Expo) client can reuse it.
>
> **Deliverables (`I13D1`–`I13D5`):**
>
> 1. **`I13D1` — review v2 architecture for mobile blockers.** Audit the modules listed above and produce a written list of:
>    - functions that already touch browser-only APIs (`window`, `document`, `localStorage`, `IntersectionObserver`, etc.) and whether each one belongs in the domain layer or the route layer.
>    - functions that depend on TanStack Router/Start internals that a native client could not call.
>    - any place where IDs, certificate URLs, or premium capability names are derived from URL state instead of stable domain values.
> 2. **`I13D2` — platform-neutral boundaries.** Where the audit finds leakage of browser-only code into shared domain modules, perform small, surgical refactors to extract the domain logic into platform-neutral helpers (no `window`, no React, no router imports). Keep web behavior identical; cover with unit tests. **Do not** introduce a separate package or workspace — keep everything inside `src/` for now.
> 3. **`I13D3` — likely native stack and app strategy.** Document the recommendation (default: React Native + Expo) with concrete justification: how much TS / domain code can realistically be shared, how routing differs, what stays web-only. Cover both "thin native shell that reuses the API" and "fully native client" options.
> 4. **`I13D4` — future auth/session approach for native clients.** Document how Better Auth would be configured for native (token storage, refresh strategy, deep-link callback URLs, biometric gate, device-bound sessions). No code changes — strategy only.
> 5. **`I13D5` — API, deep-linking, offline, and app-store follow-up.** Document the future contracts: which endpoints must be public-API-shaped, deep-link URL scheme, offline cache + sync conflict rules, push-notification surface, and app-store billing vs hosted-web billing strategy.
>
> Output the strategy in a new `specs/current-changes/issue-13-mobile-readiness-plan.md` (long-form plan; keep the existing outline as the high-level source of truth).
>
> **Out of scope:**
>
> - shipping any actual native app code or React Native dependencies
> - introducing pnpm workspaces, Turbo, Nx, or any monorepo tooling
> - changing user-visible web behavior
> - issue #15 wiki expansion work
>
> **Validation:** `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test --run`. Any refactor must keep the existing test suite green and add tests for the extracted domain helpers.
>
> **Workflow expectations:**
>
> - Use the `tanstack-start-best-practices` and `tanstack-router-best-practices` skills when reasoning about which logic belongs in route layers vs domain layers.
> - Use the `Context7 MCP` for current TanStack Start / Router / Query / Better Auth docs before introducing new APIs.
> - Keep edits incremental and commit-prep only at the end via the `commitprocess` workflow; bump `meta.release` to `1.3.3` (patch — strategy + small refactor, no user-visible change) and add a CHANGELOG entry.
>
> When the strategy doc + refactors are complete and validation is green, prepare a commit + PR description and stop. Do not auto-merge. Do not start issue #15 from this thread.
