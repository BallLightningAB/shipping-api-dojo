# Issue 16 — EDI API Dojo Implementation Plan (waves)

Date: 2026-04-28
Issue: [#16](https://github.com/BallLightningAB/shipping-api-dojo/issues/16)
Branch (planned, not yet created): `codex/issue-16-edi-product`
Blocked by: `#39` (monorepo rename + restructure)
Companion strategy: `specs/current-changes/issue-16-edi-product-plan.md`
Companion curriculum: `specs/current-changes/issue-16-edi-curriculum-draft.md`
Companion wiki inventory: `specs/current-changes/issue-16-edi-wiki-inventory.md`

## Goal

Implement EDI API Dojo at `edi.apidojo.app` as a sibling product inside the post-`#39` `apidojo-app` monorepo, using the platform-neutral packages established by `#39` and the curriculum + wiki drafts produced under this issue's planning artifacts.

This plan covers **only** the EDI implementation. The umbrella rename + monorepo refactor is `#39`. None of the work below starts until `#39` is merged to `main` and the production deploy of `apps/shipping/` is confirmed healthy.

## Wave breakdown

Each wave is one PR, validated end-to-end before the next wave opens. Estimates assume sequential solo work.

### Wave 1 — App scaffolding and public shell

Goal: a deployable `apps/edi/` with the public shell, branding, plans page, and shared-package wiring, but with placeholder content. SEO-safe ("coming soon" content marked `noindex` per route until real content lands in Wave 2).

Sub-issues / GitHub: open one issue per wave, e.g. `Wave 1 — EDI app scaffolding`.

Deliverables:

- `apps/edi/` workspace under the new monorepo, with TanStack Start + Vite + Tailwind + Vitest + Playwright config mirroring `apps/shipping/`.
- Per-product brand: name "EDI API Dojo", colour palette (CSS variables, distinct from Shipping), OG art, favicon, theme-color.
- Routes scaffolded: `/`, `/learn/{track}`, `/lesson/{slug}`, `/arena`, `/arena/{scenarioId}`, `/wiki`, `/wiki/{slug}`, `/wiki/standards`, `/wiki/standards/{slug}`, `/wiki/transports`, `/wiki/transports/{slug}`, `/wiki/integrations`, `/wiki/integrations/{slug}`, `/directory`, `/plans`, `/privacy`, `/cookies`, `/settings`. `noindex` on real-content-pending pages.
- Shared package wiring: imports `@apidojo/shared-domain`, `@apidojo/shared-db`, `@apidojo/shared-auth`, `@apidojo/shared-billing`, `@apidojo/shared-email`, `@apidojo/shared-observability`, `@apidojo/shared-ui`. App-level Tailwind extends the shared preset.
- Header/Footer composed from `@apidojo/shared-ui` layout primitives, using EDI brand props. Footer "API Dojo family" cross-links to `https://shipping.apidojo.app`.
- Better Auth client wired with `baseURL = "https://edi.apidojo.app"`, trusted-origins extended on the server, cookie domain still `apidojo.app` (already covers both subdomains).
- Sentry environment `edi-production` / `edi-preview` distinct from Shipping, project unchanged.
- Sitemap, robots, structured data (`Organization` + `WebSite`) for `edi.apidojo.app`.
- `/plans` placeholder with bundle CTA pointing to a not-yet-active Creem product (rendered as "coming soon" until Wave 3).
- Vercel project `apidojo-app-edi` set up with root directory `apps/edi`, custom domain `edi.apidojo.app`, environment variables sourced from the same secret store as Shipping (DATABASE_URL, BETTER_AUTH_*, CREEM_*, RESEND_*, SENTRY_DSN per-product).
- DNS: CNAME for `edi.apidojo.app` to Vercel.
- Browser smoke for the public surface (mirror the Shipping checkpoint suite).

Validation: `pnpm -r typecheck`, `pnpm -r lint`, `pnpm -r test --run`, `pnpm --filter @apidojo/edi-app test:checkpoint`, `pnpm --filter @apidojo/edi-app build`, Vercel preview deploy verified.

Estimated dev: 12h. Test/validation: 6h.

### Wave 2 — MVP curriculum, drills, scenarios, wiki, and directory

Goal: real, indexable EDI educational content matching the Shipping launch shape (8 lessons, ≥15 drill families, ≥8 scenario families, vendor + standards wiki surfaces, directory entries).

Sub-issues / GitHub: open `Wave 2 — EDI MVP content` plus one sub-issue per content cluster (standards, transports, mapping, ops, integrations, carriers, directory).

Deliverables:

- Lesson definitions (8) under `apps/edi/src/content/lessons.ts` per the curriculum draft.
- Drill families (≥15) under `apps/edi/src/content/drills.ts` plus `apps/edi/src/content/families/drills/*.ts`. Each family ≥4 authored variants. Family IDs prefixed `edi.*`.
- Scenario families (≥8) under `apps/edi/src/content/scenarios.ts` plus `apps/edi/src/content/families/scenarios/*.ts`.
- Wiki entries: standards (X12 + EDIFACT transaction sets), transports (AS2, SFTP, VAN, OFTP2, AS4), mapping concepts, ops concepts.
- Carrier EDI surfaces under `apps/edi/src/content/carriers.ts` and `/wiki/carriers/{slug}` (DHL Freight Sweden via `dhldashboard.se` first, plus the launch list in the wiki inventory doc).
- Integration surfaces under `apps/edi/src/content/integrations.ts` and `/wiki/integrations/{slug}` (SAP IDoc, Oracle, NetSuite, Dynamics 365 BC/F&O, Manhattan, Blue Yonder, Körber, SAP EWM, Oracle TMS, Blue Yonder TMS, MercuryGate, Alpega, SPS Commerce, TrueCommerce).
- Directory entries (sandbox URLs, free validators, AS2 Drummond cert authorities, partner directories).
- JSON-LD `Article` + `BreadcrumbList` on every wiki/integration/carrier page; `FAQPage` where FAQs exist.
- Sitemap regenerated to include all new routes; drift regression test extended.
- Browser smoke covering home, `/learn/standards`, `/learn/transports`, a representative lesson, `/arena`, `/wiki`, `/wiki/standards/{slug}`, `/wiki/integrations/{slug}`, `/directory`, `/plans`.
- Cross-product overlap matrix applied: any topic marked `shared-canonical-on-shipping` in the inventory matrix renders only as a teaser + link to shipping; same in reverse.
- Indexability lifted on the routes that now have real content.

Validation: same as Wave 1, plus the `12-outcome challenge depth` regression and `4-variant-per-family` floor regressions extended to the EDI families.

Estimated dev: 28h. Test/validation: 12h.

### Wave 3 — Paid tier and bundle pricing

Goal: live EDI Pro and the cross-product API Dojo Pro Bundle.

Sub-issues / GitHub: `Wave 3 — EDI paid tier and bundle pricing`.

Deliverables:

- Creem products created in the Creem dashboard:
  - EDI Pro Monthly + Annual.
  - API Dojo Pro Bundle Monthly + Annual.
- Storefront URLs configured per product through `CREEM_EDI_PRO_MONTHLY_STOREFRONT_URL`, `CREEM_EDI_PRO_ANNUAL_STOREFRONT_URL`, `CREEM_BUNDLE_PRO_MONTHLY_STOREFRONT_URL`, `CREEM_BUNDLE_PRO_ANNUAL_STOREFRONT_URL`. Webhook product IDs configured separately.
- `@apidojo/shared-domain/entitlements` extended with the `product` axis and the new `edi.*` capability bundle. Bundle SKU webhook handler grants both `shipping.pro` and `edi.pro` in one row.
- Capability gating in `apps/edi/`:
  - Lesson reroll on EDI mirrors Shipping's `lesson.reroll` semantics.
  - Arena advanced-depth on EDI mirrors `scenario.advancedDepth`.
  - Locked-content UX uses `@apidojo/shared-ui` lock primitives.
- Plans page on EDI shows Free, EDI Pro Monthly, EDI Pro Annual, the bundle (cross-CTA), and Enterprise inquiry.
- Plans page on Shipping updated to show the bundle alongside the existing Pro tiers (this single edit lands in `apps/shipping/src/routes/plans.tsx`; Shipping otherwise unchanged in this wave).
- Settings on each product reads `getCurrentEntitlements({ product })` and displays the right tier.
- Webhook tests: monthly active, annual active, canceled, past-due, bundle-active, bundle-canceled. All exercise the existing `practice_seeds`, subscription rows, and entitlement upsert code.
- Resend lifecycle email: bundle-eligible upsell email, canceled-bundle downgrade email. Templates accept a `product` prop.
- Browser smoke updated for tier-gated flows on EDI (uses the dev-seeded users from `#27`'s tooling, extended to seed EDI Pro + bundle fixtures).
- README + `/plans` copy updated to reflect the bundle.

Validation: `pnpm test --run`, `pnpm test:checkpoint`, `pnpm test:e2e` with seeded tiered users, manual Creem webhook replay for all six events on a preview deploy, manual Resend lifecycle confirmation.

Estimated dev: 16h. Test/validation: 10h.

### Wave 4 — Cross-product polish

Goal: the cross-product experience is coherent and the umbrella story reads end-to-end.

Sub-issues / GitHub: `Wave 4 — Cross-product polish` plus optional `Apex landing` sub-issue if the apex page lands here.

Deliverables:

- Apex `apidojo.app/` landing page (decision: ship as a third Vercel project under `apps/marketing/`, or as a static page under one of the existing apps with a custom Vercel rewrite). Default: new `apps/marketing/` workspace.
- Cross-domain SSO smoke verified end-to-end on a preview deploy.
- Cross-product upgrade nudges in lifecycle email, gated by entitlement state and frequency capping.
- Footer "API Dojo family" cross-link block consistent on every product.
- Cross-product overlap matrix audit: every topic marked `shared-canonical-*` actually renders on the canonical product and is linked-but-not-duplicated on the other.
- Sitemap drift regression covers both products.
- Documentation pass: README at the monorepo root explains the family, per-app READMEs explain product-specific concerns.

Validation: `pnpm -r test --run`, browser smoke on both products, preview deploy of all three Vercel projects healthy.

Estimated dev: 10h. Test/validation: 6h.

## GitHub issue layout

Issues to open at the start of `#16` work (after `#39` merges):

| Wave | Title (suggested) |
| --- | --- |
| 1 | Wave 1 — EDI app scaffolding under `apps/edi/` |
| 2 | Wave 2 — EDI MVP curriculum (8 lessons, ≥15 drill families, ≥8 scenario families) |
| 2 | Wave 2.1 — EDI standards wiki (X12 + EDIFACT transaction sets) |
| 2 | Wave 2.2 — EDI transports wiki (AS2/SFTP/VAN/OFTP2/AS4) |
| 2 | Wave 2.3 — EDI carrier surfaces (DHL Freight Sweden first) |
| 2 | Wave 2.4 — EDI integration surfaces (ERP, WMS, TMS, retail compliance) |
| 2 | Wave 2.5 — EDI directory entries |
| 3 | Wave 3 — EDI paid tier and API Dojo Pro Bundle |
| 4 | Wave 4 — Cross-product polish and apex umbrella landing |

Each wave issue links back to `#16` and references this implementation plan. The wave issues are opened lazily at the start of the wave to avoid noisy backlog while `#39` is in flight.

## Validation rules

Same as the rest of the v2 program:

- Iterative validation per wave. No "validate at the end" passes.
- Automated coverage as close to 100% as practical for deterministic logic, capability resolution, sitemap, and route-level regressions.
- Browser smoke for auth, progress, paid-tier, and route-level UX.
- Provider dashboard verification on a preview deploy before promoting to production.
- Public/SSR-visible educational content stays crawlable.

## Estimated totals

| Wave | Dev (h) | Test (h) |
| --- | --- | --- |
| 1 | 12 | 6 |
| 2 | 28 | 12 |
| 3 | 16 | 10 |
| 4 | 10 | 6 |
| **Total** | **66** | **34** |

## Out of scope for `#16`

- Native (Expo) implementation — `#13`.
- Apex `apidojo.app/` landing if Wave 4 elects to defer it.
- Additional sibling products beyond EDI.
- Localisation (English only at launch).
- Certificates and shareable credential pages — still future work for `#10`.

## Stop condition for the EDI program

- Both products run in production on their own subdomains.
- Single Better Auth user works on both.
- Single Creem customer pays for either Pro tier or the bundle.
- Cross-product overlap matrix is enforced and indexed.
- Bundle Pro upgrades from a Shipping-Pro user complete cleanly via Creem customer-portal flow.
- Resend lifecycle email respects entitlement state and frequency capping.
- Sentry distinguishes events per product.
- Sitemaps + structured data are independent and complete.
- README + memory-bank reflect the family of products.
