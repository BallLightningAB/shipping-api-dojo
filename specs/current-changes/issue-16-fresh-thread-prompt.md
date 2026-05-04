# Fresh-Thread Prompt — Issue #16 EDI API Dojo Implementation

Use this prompt to start a brand-new conversation when `#39` (umbrella rename + monorepo refactor) is fully merged to `main` and the production deploy of `apps/shipping/` is confirmed healthy. Until then, do not start `#16` implementation.

## Hard prerequisites (must all be true before opening the new thread)

- `#36` is merged to `main` and the production `shipping.apidojo.app` deploy is healthy.
- `#39` is merged to `main`. The repo is renamed to `BallLightningAB/apidojo-app`. The local working folder is `apidojo-app/`. The `apps/shipping/` deploy is healthy. All seven `packages/shared-*` exist and are imported by `apps/shipping`.
- `specs/current-changes/issue-16-edi-product-plan.md`, `issue-16-edi-product-implementation-plan.md`, `issue-16-edi-curriculum-draft.md`, and `issue-16-edi-wiki-inventory.md` exist on `main`.
- DNS for `edi.apidojo.app` is reserved (CNAME pointing at Vercel placeholder is fine).

## Worktree setup (run once before starting the new thread)

```bash
# From the renamed main repo at c:/Users/nicol/CascadeProjects/BallLightning/apidojo-app
git fetch origin
git worktree add ../apidojo-app-issue-16 -b codex/issue-16-edi-product origin/main
```

Open the new worktree as the workspace for the fresh thread:
`c:/Users/nicol/CascadeProjects/BallLightning/apidojo-app-issue-16`

## Prompt to paste into the fresh thread

> Implement issue [#16 EDI API Dojo](https://github.com/BallLightningAB/apidojo-app/issues/16) on branch `codex/issue-16-edi-product` in this worktree.
>
> **Scope.** This is a real product build. EDI API Dojo lands as a sibling product at `edi.apidojo.app` under the API Dojo umbrella. Use the four planning artifacts already on `main`:
>
> - `specs/current-changes/issue-16-edi-product-plan.md` — strategy, locked decisions, brand/IA, SEO posture, cross-sell, entitlement model.
> - `specs/current-changes/issue-16-edi-product-implementation-plan.md` — wave breakdown (Waves 1–4) and sub-issue layout.
> - `specs/current-changes/issue-16-edi-curriculum-draft.md` — 8 lessons, 18 drill family stubs, 10 scenario family stubs.
> - `specs/current-changes/issue-16-edi-wiki-inventory.md` — wiki + integration + carrier-EDI + directory inventory and the cross-product overlap matrix.
>
> Also read in full: `specs/memory-bank/active-context.yaml`, `specs/memory-bank/CHANGELOG.yaml`, `specs/current-changes/issue-13-mobile-readiness-{outline,plan}.md`. Apply `%USERPROFILE%\.codeium\windsurf\global_workflows\initiate-memorybank.md`. Check for relevant skills.
>
> **Wave 1 first.** Open a single PR for Wave 1 only:
>
> 1. `apps/edi/` workspace under the monorepo, mirroring `apps/shipping/`'s TanStack Start + Vite + Tailwind + Vitest + Playwright setup.
> 2. Per-product branding (name "EDI API Dojo", distinct CSS-variable palette extending the shared Tailwind preset, OG art, favicon, theme-color).
> 3. Routes scaffolded with `noindex` on routes that don't yet have real content: `/`, `/learn/{track}`, `/lesson/{slug}`, `/arena`, `/arena/{scenarioId}`, `/wiki`, `/wiki/{slug}`, `/wiki/standards`, `/wiki/standards/{slug}`, `/wiki/transports`, `/wiki/transports/{slug}`, `/wiki/integrations`, `/wiki/integrations/{slug}`, `/directory`, `/plans`, `/privacy`, `/cookies`, `/settings`.
> 4. Shared package wiring: `@apidojo/shared-domain`, `@apidojo/shared-db`, `@apidojo/shared-auth`, `@apidojo/shared-billing`, `@apidojo/shared-email`, `@apidojo/shared-observability`, `@apidojo/shared-ui`.
> 5. Header/Footer composed from `@apidojo/shared-ui` layout primitives, EDI brand props. Footer "API Dojo family" cross-link block.
> 6. Better Auth client wired with `baseURL = "https://edi.apidojo.app"`. Server trusted-origins extended. Cookie domain stays `apidojo.app`.
> 7. Sentry environment `edi-production` / `edi-preview`. Sentry project unchanged.
> 8. Sitemap, robots, structured data (`Organization` + `WebSite`) for `edi.apidojo.app`.
> 9. `/plans` placeholder showing Free + "EDI Pro coming soon" + "API Dojo Pro Bundle coming soon" + Enterprise inquiry CTA. No live Creem CTAs in this wave.
> 10. Vercel project `apidojo-app-edi` configured (root `apps/edi`, custom domain `edi.apidojo.app`, env vars sourced from the same store as Shipping).
> 11. Browser smoke for the public surface (mirror Shipping's checkpoint suite, scoped to EDI).
>
> **Validation:** `pnpm -r format`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test --run`, `pnpm --filter @apidojo/edi-app test:checkpoint`, `pnpm --filter @apidojo/edi-app build`, Vercel preview deploy verified end-to-end.
>
> **Out of scope for Wave 1:**
>
> - Real EDI lessons / drills / scenarios / wiki / directory content (lands in Wave 2).
> - Live Creem products or storefront URLs (lands in Wave 3).
> - Cross-product upgrade emails (lands in Wave 4).
> - Native (Expo) implementation — that's `#13`.
> - Apex `apidojo.app/` landing page — Wave 4 decision.
>
> **Workflow expectations:**
>
> - Use the `tanstack-start-best-practices`, `tanstack-router-best-practices`, `tanstack-query-best-practices`, and `tanstack-integration-best-practices` skills.
> - Use `Context7 MCP` for current TanStack Start / Router / Query / Better Auth / pnpm workspaces docs before introducing new APIs.
> - Use `react-email` skill if any new email template lands in this wave (it should not).
> - Keep edits incremental, one wave per PR. Commit-prep at the end of each wave via the `commitprocess` workflow. Bump `meta.release` per wave (suggested: Wave 1 = `1.6.0` minor; Wave 2 = `1.7.0` minor; Wave 3 = `1.8.0` minor; Wave 4 = `1.8.x` patch).
>
> When Wave 1 is complete and validation is green, prepare a commit + PR description and stop. Do not auto-merge. Do not start Wave 2 from this thread.

## Reminder

`#16` and `#39` are independent. `#16` only starts after `#39` is merged. Do not bundle `#39` and `#16` Wave 1 in a single PR — the rename + monorepo refactor must land alone, with no concurrent feature work, so that any post-merge regression on `apps/shipping/` is unambiguously attributable.
