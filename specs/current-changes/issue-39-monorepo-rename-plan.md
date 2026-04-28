# Issue 39 — Rename to apidojo-app and convert to pnpm-workspaces monorepo

Date: 2026-04-28
Issue: [#39](https://github.com/BallLightningAB/shipping-api-dojo/issues/39) (number assigned at issue creation)
Branch (planned): `codex/issue-39-monorepo`
Blocked by: `#36` / PR `#38`
Blocks: `#16` (EDI product implementation), `#13` (native app implementation)
Scope: Pure mechanical refactor + repo rename. No EDI content. No feature work. No logic changes.

## Goal

Rename the GitHub repository and local working folder from `shipping-api-dojo` to **`apidojo-app`** to match the umbrella domain (`apidojo.app`), the Creem store name (`APIDojo`, slug `apidojo`), and the brand intent already documented in `specs/memory-bank/active-context.yaml` and `specs/current-changes/issue-5-joint-plan.md`.

Convert the single-app repository into a **pnpm-workspaces monorepo** so it can host:

- the existing Shipping API Dojo web product,
- the planned EDI sibling product (`#16`),
- the future Expo + React Native client (`#13`),
- and additional `apidojo.app` siblings,

without forcing a second migration later.

## Why now

- Native (`#13`) and EDI (`#16`) are both already on the roadmap. The "wait for a real second consumer" heuristic that justified keeping a flat `src/` no longer applies.
- The `#13` audit already identified ~40–50% of source as platform-neutral, naming the seams (`randomization`, `progress.*`, `practice/*`, `entitlements/*`, `seo/*`). That makes the extraction mechanical.
- The infra is already umbrella-branded: domain `apidojo.app`, Better Auth `crossSubDomainCookies` scoped to `apidojo.app`, Creem store `APIDojo`. The repo name is the outlier.
- Doing the refactor once, alone, with no concurrent feature work, on top of a freshly-released main, is strictly cheaper than retrofitting a monorepo while shipping EDI content and standing up the native app.

## Hard prerequisites

- `#36` is merged to `main` (PR `#38` closed).
- External acceptance pass on the `#36` deploy is recorded in the changelog or current-changes.
- A clean `main` HEAD with no in-flight feature branches that touch broad swaths of `src/`.
- Working `pnpm` ≥ 10, Node ≥ 20.

## Out of scope

- Any EDI runtime code, content, routes, copy, OG art, or sitemap entries.
- Any native app code or React Native dependency.
- Any user-visible UX change. The shipping site renders identically before and after.
- Any new product purchase, DNS change, Creem product change, Resend domain change, or Better Auth trusted-origin change. Existing settings already cover `*.apidojo.app`.
- pnpm workspaces tooling beyond pnpm itself. **No** Turborepo, Nx, Rush, Lerna, or syncpack at this stage. They can be added later if the repo grows out of plain pnpm.
- Splitting per-product Tailwind themes. The existing tokens stay; per-product theming lands in `#16` Wave 1.

## Target repo shape

```
apidojo-app/                                    # repo + local folder name
  apps/
    shipping/                                   # current Shipping API Dojo
      package.json                              # name: "@apidojo/shipping-app"
      vite.config.ts                            # current vite config (rebased)
      vitest.config.ts
      playwright.config.ts
      tsconfig.json                             # extends ../../tsconfig.base.json
      drizzle.config.ts                         # uses @apidojo/shared-db schema
      public/                                   # current public/ as-is
      src/
        content/                                # Shipping-only data:
                                                #   lessons.ts, drills.ts, scenarios.ts,
                                                #   wiki.ts, directory.ts, carriers.ts,
                                                #   legal.ts, families/core.ts,
                                                #   families/{drills,lessons,scenarios}/,
                                                #   catalog/*
        routes/                                 # full TanStack Start route tree
        components/                             # Shipping-only page composition
        lib/                                    # Shipping-only adapters (initially empty)
        styles/                                 # Tailwind entry, app-level CSS
        instrument.client.ts                    # Sentry client init (uses shared-observability)
        router.tsx
    # edi/                                      # added in #16, deploys to edi.apidojo.app
    # native/                                   # added in #13, Expo + React Native
  packages/
    shared-domain/                              # @apidojo/shared-domain
      package.json
      src/
        randomization.ts
        progress/{schema,merge,actions,hydration,store}.ts
        practice/{practice-runs,seed-search}.ts
        entitlements/{entitlements,access-policy}.ts
        seo/{site,sitemap,structured-data}.ts
        content/{types,runtime,families-loader,progress-migration}.ts
                                                # the schema + runtime engine,
                                                # but NOT per-product content data
    shared-db/                                  # @apidojo/shared-db
      package.json
      src/
        schema/                                 # canonical Drizzle tables
        client.ts                               # postgres-js client
        env.ts                                  # DB env parser
      drizzle/                                  # migrations
      drizzle.config.ts                         # canonical drizzle-kit config
    shared-auth/                                # @apidojo/shared-auth
      package.json
      src/
        server/{index,session,server,email,config,env}.ts
                                                # Better Auth server config + helpers
        client/{index,native}.ts                # Web + native client factories
    shared-billing/                             # @apidojo/shared-billing
      package.json
      src/
        creem/{webhook,plans,subscriptions}.ts  # Webhook signature + plan resolution
        env.ts
    shared-email/                               # @apidojo/shared-email
      package.json
      src/
        resend/{client,lifecycle,webhook}.ts
        templates/                              # React Email templates
        env.ts
    shared-observability/                       # @apidojo/shared-observability
      package.json
      src/
        sentry/{init,scrubber,env}.ts
        logger.ts                               # captureException with Sentry forwarding
    shared-ui/                                  # @apidojo/shared-ui
      package.json
      src/
        primitives/                             # shadcn/ui (current src/components/ui)
        kibo/                                   # current src/components/kibo-ui
        motion/                                 # current src/components/motion-primitives
        drill/                                  # renders Drill schema
        lesson/                                 # renders Lesson schema
        arena/                                  # renders Scenario schema
        wiki/                                   # renders WikiEntry schema
        progress/                               # ProgressHydrator + bind to shared progress store
        layout/                                 # Header/Footer/Shell with brand props
        theme/                                  # Tailwind preset, base CSS vars
      tailwind.preset.cjs                       # exported preset apps extend
  specs/                                        # memory-bank + current-changes stay at repo root
  scripts/                                      # repo-wide scripts (sitemap drift, dev-seed)
  pnpm-workspace.yaml
  package.json                                  # workspace root, name "apidojo-app"
  tsconfig.base.json                            # path aliases @apidojo/*
  biome.json                                    # root config used by every workspace
  .github/workflows/                            # CI updated to run --filter per workspace
  .changeset/                                   # optional, not added in this issue
  README.md
  TRADEMARKS.md
  LICENSE
```

Each shared package exports through its own `src/index.ts` and is imported by apps as `@apidojo/shared-*`. Path aliases live in `tsconfig.base.json` and are inherited by every app and package.

## Why content schema is rolled into `shared-domain`

`src/content/types.ts`, `runtime.ts`, and the `families.ts` loader pattern are tightly coupled to `randomization.ts` and `progress.*`. They share the same audience (any app rendering learning content) and release cadence. A separate `shared-content-schema` package would force unnecessary version-bump coupling without a real ownership boundary. Per-product content **data** (`lessons.ts`, `drills.ts`, `scenarios.ts`, `wiki.ts`, `directory.ts`, `carriers.ts`, `legal.ts`, `families/core.ts`, `families/{drills,lessons,scenarios}/`, `catalog/*`) lives entirely inside each app's `src/content/`. The shared loader composes whatever family modules each app passes in.

## Why `shared-ui` is in the initial split

Almost all of `src/components/` is content-type-driven, not Shipping-specific:

- `ui/` (shadcn primitives), `kibo-ui/`, `motion-primitives/` — generic.
- `drill/`, `lesson/`, `arena/`, `wiki/` — render schema-typed objects, no Shipping-specific knowledge.
- `progress/` — binds to the shared progress store (`ProgressHydrator`, etc.).
- `layout/` — Header/Footer/Shell, parametrised on brand/copy props.

The only product-specific UI is page composition: home hero copy, `/plans` CTAs, marketing-only components, OG art. Those stay inside `apps/{product}/src/components/`. Per-product theming uses CSS variables via the standard shadcn pattern and a shared Tailwind preset; each app sets its own palette without duplicating components.

`shared-ui` is **web-only**. Native (`#13`) consumes `shared-domain` (and the other shared backend-side packages over HTTPS) and builds its own native UI layer.

## Mechanical refactor steps

Wave A — Repo rename and workspace skeleton

1. On post-`#36` `main`, create branch `codex/issue-39-monorepo`.
2. Add `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`.
3. Add `tsconfig.base.json` with path aliases for every shared package.
4. Add `package.json` workspace-root `name: "apidojo-app"`, `private: true`.
5. Move existing TypeScript / Vite / Vitest / Playwright config so the root keeps only workspace-wide concerns; per-app config moves under `apps/shipping/`.
6. `git mv` `src/` → `apps/shipping/src/`, `public/` → `apps/shipping/public/`, all per-app config files. Use `git mv` so blame survives and `git log --follow` works post-rename.
7. Add a thin `apps/shipping/package.json` with name `@apidojo/shipping-app`, dependencies copied from the current root `package.json`, scripts mirrored.
8. Reduce the root `package.json` `dependencies` to workspace-wide tooling only (Biome, TypeScript, Drizzle Kit, etc.).
9. Sanity check: `pnpm -r install`, `pnpm --filter @apidojo/shipping-app dev` boots locally, no behavioural drift.

Wave B — Extract the seven shared packages

For each `packages/shared-*`:

1. Create the package directory with `package.json` (`name: "@apidojo/shared-<name>"`, `main`, `module`, `types` pointing at `src/index.ts`, `private: true`).
2. `git mv` source files into the package. **No code rewrites.** Adjust only relative imports.
3. Add `src/index.ts` re-exporting the package's public surface.
4. Replace consumer imports in `apps/shipping/src/...` from relative (`../lib/randomization`) to package (`@apidojo/shared-domain`).
5. Run `pnpm --filter @apidojo/shipping-app typecheck` after each package extraction. Stop and fix before moving on.
6. Order matters because of dependency direction:
   - `shared-db` first (no other shared deps).
   - `shared-observability` (depends only on Sentry).
   - `shared-domain` (depends on nothing in our packages).
   - `shared-auth` (depends on `shared-db`, `shared-email` peer-imports for hooks).
   - `shared-billing` (depends on `shared-db`).
   - `shared-email` (depends on nothing in our packages; templates are React Email).
   - `shared-ui` last (depends on `shared-domain` for types and `shared-observability` for logger).

Wave C — Tooling rewire

1. Update `biome.json` to a single root config; ensure each workspace inherits.
2. Update `pre-commit` hooks to run via `pnpm -r --parallel` or `pnpm --filter` as appropriate.
3. Update `.github/workflows/*` if any exist; otherwise add `pnpm install --frozen-lockfile && pnpm -r typecheck && pnpm -r lint && pnpm -r test --run`.
4. Update `drizzle-kit` config so migrations live next to `shared-db` and `pnpm db:*` scripts route through the workspace.
5. Update `playwright.config.ts` to live under `apps/shipping/` and use the app's port/server config.
6. Update `og` image generation scripts to either move to `apps/shipping/scripts/` or stay in repo `scripts/` if the generator becomes shared (default: stay in `apps/shipping/scripts/`).

Wave D — External integrations

1. **GitHub repo rename** via the GitHub UI: `BallLightningAB/shipping-api-dojo` → `BallLightningAB/apidojo-app`. GitHub auto-redirects existing URLs and PR/issue links.
2. Update local Git remote: `git remote set-url origin https://github.com/BallLightningAB/apidojo-app.git`.
3. **Vercel project**: edit the project's "Root Directory" to `apps/shipping`. Verify install command (`pnpm install`), build command (`pnpm --filter @apidojo/shipping-app build`), output directory match the new path. Confirm framework preset (TanStack Start / Vite) detection still works. **Project name unchanged** for now to avoid altering the production deploy URL during the refactor.
4. **Sentry**: update `release` and source-map upload paths to point at the new build output. Sentry project name and DSN unchanged.
5. **Creem webhook URL**: unchanged (still hits `https://shipping.apidojo.app/api/...`). No reconfiguration needed.
6. **Resend webhook URL**: unchanged. No reconfiguration needed.
7. **Better Auth**: trusted origins and `crossSubDomainCookies` already cover `apidojo.app`. No change.

Wave E — Documentation + memory-bank

1. Update `README.md` to describe the monorepo layout, the package roster, and `pnpm --filter` workflows.
2. Update `TRADEMARKS.md` for the new repo name.
3. Update `specs/shipping-api-dojo-pdd.yaml` references to point at `apps/shipping/`. Rename to `specs/products/shipping-api-dojo-pdd.yaml` if the per-product PDD pattern lands here (recommended) or defer to `#16`.
4. Update `specs/memory-bank/active-context.yaml` `meta.repo` to `github.com/BallLightningAB/apidojo-app`. Bump `meta.release` (e.g. `1.5.0` — minor, structural).
5. Update every `specs/current-changes/*.md` and `specs/archived/**/*.md` reference to `src/` paths to use `apps/shipping/src/` where it changes meaning, but keep historical entries as-is.
6. Add a new `specs/current-changes/issue-39-monorepo-rename-progress.md` capturing the actual PR-by-PR walkthrough as the work proceeds.

## Validation matrix

Each must pass on `codex/issue-39-monorepo` before merging to `main`:

Local

- `pnpm install --frozen-lockfile` from a clean clone.
- `pnpm -r typecheck`.
- `pnpm -r lint`.
- `pnpm -r test --run`. Existing `153/153` tests must remain green; no test deletions.
- `pnpm --filter @apidojo/shipping-app test:checkpoint` (Playwright). All current browser smoke checks pass.
- `pnpm --filter @apidojo/shipping-app build`.
- `pnpm exec drizzle-kit check` (against the new `shared-db` config).
- `pnpm audit --json` zero advisories.
- `pre-commit` clean.

Preview deploy

- Vercel preview build succeeds.
- `shipping.apidojo.app` preview URL renders home, `/plans`, `/learn/*`, `/lesson/*`, `/arena`, `/arena/*`, `/wiki`, `/wiki/$slug`, `/wiki/carriers`, `/wiki/carriers/$slug`, `/directory`, `/privacy`, `/cookies`, `/settings` identically to the current main deploy.
- Sitemap `/sitemap.xml` byte-equivalent to the current production output (or differs only in `<lastmod>` timestamps).
- Sentry DSN test event flows through with privacy scrubbing intact.
- Creem webhook test event reaches the handler and resolves the entitlement upsert.
- Resend transactional send works.
- Better Auth sign-up + sign-in + sign-out + session persistence works on the preview origin.

Diff hygiene

- Every commit on the branch is a `git mv`, a config edit, or a small import-rewrite. No business-logic edits.
- `git log --follow apps/shipping/src/lib/randomization.ts` shows the full pre-rename history.
- No file was rewritten from scratch; all moves preserve blame.

## Rollback plan

- Branch lands as a single squash merge to `main`. If the production deploy regresses post-merge:
  - Revert the merge commit on `main`.
  - Roll the Vercel project's "Root Directory" back to repo root (the pre-refactor state stays building from the revert).
  - GitHub repo rename can be reverted in the GitHub UI within minutes; auto-redirects continue to work.
- Rename of the GitHub repo is reversible by renaming again in the UI; the auto-redirect persists.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Vite path aliases mis-resolve under workspace | dev/build break | Validate `pnpm --filter @apidojo/shipping-app dev` after each package extraction. |
| Sentry source-map upload broken by new build path | source maps missing in prod | Validate Sentry symbolication on a preview deploy before merging. |
| Drizzle-kit cannot find migrations from new path | `drizzle-kit check` fails | Place migrations next to `shared-db/drizzle.config.ts`; update scripts. |
| TanStack Start picks up stale generated route tree | `Routes.gen.ts` mismatch | Delete generated route artifacts before re-running dev. |
| Long-running open feature branches conflict with the rename | merge conflicts | No concurrent feature work permitted; queue any unrelated PRs after the rename PR merges. |
| Solo maintainer overhead | future friction | Keep the package roster minimal — seven packages, no Turbo, no Nx — and add tooling only when concrete pain emerges. |

## Stop condition

When the validation matrix is fully green on a Vercel preview, the rename is staged in GitHub, and the rollback plan is documented, the branch is ready for merge. Merge as a single squash commit. Do not start `#16` Wave 1 EDI scaffolding until this issue is fully closed and the production deploy is confirmed healthy.
