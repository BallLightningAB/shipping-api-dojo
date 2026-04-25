# Fresh-Thread Prompt — Issue #15 Wiki Expansion

Use this prompt to start a brand-new conversation. Run in a dedicated worktree so it can execute in parallel with issue #13.

## Worktree setup (run once before starting the new thread)

```bash
# From the main repo at c:/Users/nicol/CascadeProjects/BallLightning/shipping-api-dojo
git fetch origin
git worktree add ../shipping-api-dojo-issue-15 -b codex/issue-15-wiki-expansion origin/main
```

Open the new worktree as the workspace for the fresh thread:
`c:/Users/nicol/CascadeProjects/BallLightning/shipping-api-dojo-issue-15`

## Prompt to paste into the fresh thread

> Implement issue [#15 Wiki Expansion](https://github.com/BallLightningAB/shipping-api-dojo/issues/15) on branch `codex/issue-15-wiki-expansion` in this worktree.
>
> **Context to read first (in full, up to 1000 lines per file):**
>
> - `specs/memory-bank/active-context.yaml`
> - `specs/memory-bank/memory-bank-usage.yaml`
> - `specs/memory-bank/CHANGELOG.yaml`
> - `specs/current-changes/issue-15-wiki-expansion-outline.md`
> - `specs/shipping-api-dojo-pdd.yaml`
> - The existing wiki/directory surfaces: `src/content/directory.ts`, `src/content/families.ts`, and any vendor pages already scaffolded by issue #9.
>
> Also apply the workflow at `%USERPROFILE%\.codeium\windsurf\global_workflows\initiate-memorybank.md` and check for relevant skills (especially `programmatic-seo`, `seo-audit`, `schema-markup`, and `tanstack-router-best-practices`).
>
> **Goal:** Expand the wiki from curriculum-supporting pages into a durable carrier-reference library organized by vendor, business unit / product line, country / region, and protocol / documentation surface — without duplicating issue #9's curriculum-only scope.
>
> **Deliverables (`I15D1`–`I15D5`):**
>
> 1. **Taxonomy and URL conventions** — define the long-term wiki taxonomy (vendor → business unit → region → protocol) and a stable URL convention that survives future reorganization. Document it in a new `specs/current-changes/issue-15-wiki-expansion-plan.md` (the long-form plan; keep the existing outline as the high-level source of truth).
> 2. **Highest-value carrier surfaces** — identify and prioritize the first 8–12 carrier surfaces to document (DHL Express vs DHL eCommerce vs DHL Parcel, UPS, FedEx Express vs FedEx Ground, USPS, Royal Mail, La Poste / Colissimo, Australia Post, Japan Post, regional consolidators). Justify the ordering against issue #5 acquisition value.
> 3. **Precise vendor / business-unit / region / protocol pages** — implement the new wiki pages following the taxonomy. Avoid generic "DHL" summary pages; each page must be specific (business unit, country, protocol family). Use the content-family direction established in issue #5; do not bolt onto issue #9's drill-supporting pages.
> 4. **Directory expansion** — extend the directory with official docs URLs, deprecation notices, sandbox/test-mode notes, and protocol-specific tooling (SOAP WSDL, REST OpenAPI, EDI X12 / EDIFACT, GraphQL where applicable). Keep the schema in `src/content/directory.ts` source-of-truth and add tests for any new validators.
> 5. **SEO and internal-linking rules** — define canonical, sitemap, internal-link, and `schema.org` rules so the expanded wiki stays indexable and useful. Apply the `schema-markup` skill for FAQ / Article / BreadcrumbList JSON-LD on the new pages.
>
> **Out of scope:** mobile native readiness (issue #13), additional curriculum content beyond what already exists, paywall changes, randomization changes.
>
> **Validation:** `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm build`. Add regression tests for any new content schema, SEO meta, and structured-data helpers.
>
> **Workflow expectations:**
>
> - Use `tanstack-start-best-practices`, `tanstack-router-best-practices`, `tanstack-query-best-practices`, and `tanstack-integration-best-practices` skills for any new routes or loaders.
> - Use the `Context7 MCP` for current TanStack Start / Router / Query docs before introducing new APIs.
> - Use the `programmatic-seo` and `schema-markup` skills for the directory and wiki page templates.
> - Keep edits incremental, commit-prep only at the end via the `commitprocess` workflow; bump `meta.release` to `1.4.0` (minor — new feature surface) and add a CHANGELOG entry.
>
> When the implementation is complete and validation is green, prepare a commit + PR description and stop. Do not auto-merge. Do not start issue #13 from this thread.
