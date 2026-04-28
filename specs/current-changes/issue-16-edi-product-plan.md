# Issue 16 — EDI Sibling Product Strategy (long-form plan)

Date: 2026-04-28
Issue: [#16](https://github.com/BallLightningAB/shipping-api-dojo/issues/16)
Branch (planned, not yet created): `codex/issue-16-edi-product`
Blocked by: `#39` (monorepo rename + restructure), which is in turn blocked by `#36` / PR `#38`
Related: `#13` (mobile readiness), `#5` (web v2 umbrella, scheduled to close after `#36`)
Scope: Strategy. Companion implementation plan in `specs/current-changes/issue-16-edi-product-implementation-plan.md`.

## Goal

Launch **EDI API Dojo** as a sibling product at `edi.apidojo.app` under the API Dojo umbrella, sharing platform/auth/billing/observability with Shipping API Dojo while keeping product-specific SEO, IA, content, and curriculum boundaries clean enough to support cross-sell, bundle pricing, and future siblings without duplication or thin-content sprawl.

This document is strategy only. The execution sequence is `#36` → `#39` → `#16`. The companion implementation plan defines the wave breakdown that runs after `#39` merges.

## Locked decisions

- EDI is a **sibling product**, not a third track inside Shipping API Dojo, and lives at its own subdomain `edi.apidojo.app`.
- Product name: **EDI API Dojo**.
- Repo name post-`#39`: `apidojo-app` with the layout described in `specs/current-changes/issue-39-monorepo-rename-plan.md`. EDI lands as `apps/edi/` inside that repo.
- Single Better Auth user across all sibling products. `crossSubDomainCookies` already targets `apidojo.app`, so SSO across `shipping.apidojo.app` and `edi.apidojo.app` is essentially free.
- Single Creem customer across products. Per-product Pro tiers plus a cross-product **API Dojo Pro Bundle** at a discount.
- Shared infra: Better Auth, Neon Postgres + Drizzle, Creem, Resend, Sentry. All live in the umbrella `packages/shared-*` after `#39`.
- Shared UI: shadcn primitives, content-type-driven renderers (drill, lesson, arena, wiki, progress), and a configurable layout shell. Per-product theming through CSS variables and a Tailwind preset.
- Shared content schema + runtime engine: lives in `@apidojo/shared-domain`. Per-product content **data** lives entirely inside each app's `src/content/`.
- EDI launch is web-first. Native (`#13`) follows after both products run in production.
- Public/SSR-visible educational content stays crawlable on both products. No paywall on lessons, wiki, or directory.
- Public-repo licensing remains `AGPL-3.0-only`. Trademarks reserved. Premium-only assets stay out of the public repo.

## Brand and IA

### Naming

| Surface | Name | Notes |
| --- | --- | --- |
| Umbrella | API Dojo | Domain `apidojo.app`. Long-term neutral landing at the apex; the apex is reserved for an umbrella landing page (later issue) and **must not 301 to a single product**. |
| Sibling 1 | Shipping API Dojo | Subdomain `shipping.apidojo.app`. Already shipped. |
| Sibling 2 | EDI API Dojo | Subdomain `edi.apidojo.app`. New in this issue. |
| Future | TBD | Pattern: `{product}.apidojo.app`. |

### Information architecture per product

Each product owns its own copy of the proven Shipping API Dojo IA shape:

- `/` — product landing.
- `/learn/{track}` — track hubs.
- `/lesson/{slug}` — lessons.
- `/arena` and `/arena/{scenarioId}` — scenario arena.
- `/wiki` and `/wiki/{slug}` — concept wiki.
- `/wiki/carriers` and `/wiki/carriers/{slug}` — vendor surface library (Shipping). EDI mirrors this with `/wiki/standards/...`, `/wiki/transports/...`, `/wiki/integrations/...` (see wiki inventory doc).
- `/directory` — sandbox + tooling directory.
- `/plans` — public pricing/plans.
- `/privacy`, `/cookies` — legal.
- `/settings` — account/entitlements (signed-in only, noindex).

### Umbrella surfaces (later)

- Apex landing page at `https://apidojo.app/` describing the family of products. Lightweight, no learning content, links into each product.
- Shared `/about`, `/support`, `/legal/*` may eventually live at the apex; until then, each product owns its own copies and links across.

## Cross-sell, bundle pricing, and cross-promo

### Pricing model

| SKU | Where it lives | Capability bundle granted | Discount vs. à la carte |
| --- | --- | --- | --- |
| Shipping API Dojo Pro Monthly | `prod_3jDZfwYMV4z7s0yyzLMGtp` (existing) | `shipping.pro` | — |
| Shipping API Dojo Pro Annual | `prod_2UKovfLiNB4uUAdlQrN2TD` (existing) | `shipping.pro` | — |
| EDI API Dojo Pro Monthly | new Creem product | `edi.pro` | — |
| EDI API Dojo Pro Annual | new Creem product | `edi.pro` | — |
| **API Dojo Pro Bundle Monthly** | new Creem product | `shipping.pro` + `edi.pro` | ~25% off the sum of monthlies |
| **API Dojo Pro Bundle Annual** | new Creem product | `shipping.pro` + `edi.pro` | ~30% off the sum of annuals |

Discount targets are direction only — final pricing is locked in `#16` Wave 3 after a willingness-to-pay review.

Enterprise stays inquiry-only (no Creem product) on both products until a real Enterprise SKU exists. The `/plans` page on each product carries an Enterprise contact CTA.

### Capability resolution

After `#39`, `@apidojo/shared-domain/entitlements` gains a `product` axis. Each product surface calls `getCurrentEntitlements({ product: "shipping" })` or `{ product: "edi" }`. The bundle SKU's webhook handler grants both bundles in one subscription row.

Implementation lands in `#16` Wave 2; design contract (today):

```ts
type ProductKey = "shipping" | "edi";

type CapabilityBundleId =
  | "shipping.pro" | "shipping.enterprise"
  | "edi.pro"      | "edi.enterprise";

type ResolvedEntitlements = {
  userId: string;
  product: ProductKey;
  tier: "free" | "pro" | "enterprise";
  capabilities: ReadonlySet<string>;     // namespaced, e.g. "shipping.lesson.reroll"
  bundles: ReadonlySet<CapabilityBundleId>;
  source: "anonymous" | "manual" | "creem.subscription" | "creem.bundle";
};

function getCurrentEntitlements(opts: {
  product: ProductKey;
}): Promise<ResolvedEntitlements>;
```

### Cross-promo channels

- **Footer "API Dojo family" block** on every page of every product: small, links to sibling product home + `/plans`.
- **In-content cross-links** only where genuinely relevant. A Shipping wiki page on EDI-vs-API integration links to the EDI wiki entry on EDI standards, and vice versa. The cross-product overlap matrix in `issue-16-edi-wiki-inventory.md` is the source of truth for which topics get cross-links.
- **Lifecycle email** (Resend): a Shipping Pro user who is not yet on the bundle gets a single, well-timed nudge ("EDI API Dojo is live; bundle Pro for X% off") at most once per quarter. Triggered from `shared-email/resend/lifecycle.ts`, gated by entitlement state, never by anonymous tracking. CASL/CAN-SPAM/GDPR rules apply (`#12` already covers the legal posture).
- **`/plans` cross-CTA** on each product: a card showing the bundle price with a one-click upgrade for an existing Pro user (entitlement-aware UI; the Pro upgrade flow uses Creem's customer portal swap rather than a separate purchase).

## SEO posture

### Independence per product

- Each product is a separate crawlable site at its own subdomain with its own `sitemap.xml`, `robots.txt`, OG art, `<title>` / `<meta>` / canonical chain, JSON-LD identity (Organization / WebSite / Article / BreadcrumbList / FAQPage).
- **No cross-domain canonicals.** A Shipping page never canonicalises to an EDI URL or vice versa.
- Each product registers a separate Google Search Console property and a separate Sentry environment (already independent post-`#39`).

### Duplicate content avoidance

Topics that are genuinely the same on both products (e.g. HTTP status taxonomy, retry semantics, idempotency keys, observability primitives) get a single canonical home on one product. The other product links to it from a contextual mention; **no duplicated full article**. The cross-product overlap matrix in `issue-16-edi-wiki-inventory.md` enumerates every overlap and assigns canonical ownership.

### Indexation discipline

- New thin landing pages are not allowed. Every wiki/directory entry must have real content.
- Sunset/legacy surfaces stay indexed (mirrors the `#15` rule for UPS XML/SOAP and USPS Web Tools).
- Sitemap drift regression test (already in place via `#15`) extends per-product after `#39`.

### Hreflang

Both products are English-only at launch. Hreflang annotations are not added; revisit when localisation lands.

### Schema.org identity

Each product publishes its own `Organization` JSON-LD with the product brand. The umbrella `API Dojo` `Organization` lives only on the future apex landing page; until that page exists, each product publishes its own.

## Cross-product overlap

Five-bucket assignment for every Shipping topic (full matrix lives in `issue-16-edi-wiki-inventory.md`):

| Bucket | Meaning | Where it renders |
| --- | --- | --- |
| `shipping-only` | Carrier APIs, REST/SOAP carrier surfaces, scenarios specific to API integration | Only on `shipping.apidojo.app`. |
| `edi-only` | X12/EDIFACT standards, AS2/SFTP/VAN/OFTP2, IDoc/EDI bridges, ACK semantics | Only on `edi.apidojo.app`. |
| `shared-canonical-on-shipping` | Topic that has a single canonical home on shipping; EDI may link in | Canonical on shipping; EDI links contextually. |
| `shared-canonical-on-edi` | Topic that has a single canonical home on EDI; shipping may link in | Canonical on EDI; shipping links contextually. |
| `genuinely-duplicated-context` | Same topic, different framing per product, justified case-by-case | Authored separately with explicit framing diff documented inline. |

The matrix governs lesson copy, drill explanations, scenario evidence, wiki articles, and directory entries.

## Shared platform boundaries

After `#39`, the boundary becomes:

- `apps/shipping/src/content/` and `apps/edi/src/content/` — per-product **data**: lesson definitions, drill families, scenario families, wiki entries, directory entries, carrier/standard surface data, legal copy.
- `apps/{product}/src/components/` — per-product page composition only (home hero, `/plans` CTAs, marketing copy, OG art).
- `apps/{product}/src/routes/` — per-product TanStack Start route tree.
- `@apidojo/shared-domain` — schema, runtime engine, randomization, progress, practice, entitlements, SEO helpers.
- `@apidojo/shared-db` — canonical user/account/session/subscription/entitlement tables. Both apps point at the same Neon database.
- `@apidojo/shared-auth` — Better Auth server config and client factories. Trusted origins cover both subdomains.
- `@apidojo/shared-billing` — Creem webhook signature, plan resolution, subscription upsert. Webhook handler dispatches by product key derived from Creem product metadata.
- `@apidojo/shared-email` — Resend lifecycle, React Email templates, Svix verification. Templates accept a `product` prop so subject lines and copy reflect the right product.
- `@apidojo/shared-observability` — Sentry init + scrubber + logger. Sentry tags include `product` so the dashboard can filter per product.
- `@apidojo/shared-ui` — primitives, schema-typed renderers, layout shell. Each app applies its own Tailwind theme.

## Compatibility with `#13` (mobile)

- The `apps/native/` slot is reserved by `#39`'s target shape.
- The native app consumes `@apidojo/shared-domain` (and Better Auth via `better-auth/react-native`) and re-implements UI in React Native; it does **not** consume `@apidojo/shared-ui` (web-only Tailwind primitives).
- The single-user / single-customer / per-product capability resolution model in this plan is what the native app needs as well; nothing in `#16` should be designed in a way that forces native to refactor it later.
- `specs/current-changes/issue-13-mobile-readiness-{outline,plan}.md` stay where they are — explicitly **not** archived. They describe a not-yet-implemented program.

## Authoring constraints (carried over from Shipping)

- Editorial lessons stay human-authored.
- Drills follow the family + parameter-bank + deterministic-variant-builder pattern.
- Scenarios follow the family + run-builder + evidence-axis pattern.
- Wiki entries cite official source documents; standards work cites ASC X12, UN/CEFACT EDIFACT, RFCs (AS2/AS4), and named vendor docs.
- Every drill family has at least four authored variants (mirrors the `#19/#20` floor).
- Every lesson has at least 12 distinct challenge outcomes across 400 seeds (mirrors the `#19` regression).
- Direct misconception explanations (mirrors `#5` research synthesis).
- Public/SSR content stays crawlable. No premium-only article on the public site.

## What this issue's branch will produce

When `#16` actually starts (after `#39` merges), `codex/issue-16-edi-product` lands the artifacts described in the companion implementation plan. None of those changes happen in this PR (PR `#38`); this PR only ships the planning + GitHub bookkeeping.

## Stop condition for this branch (PR `#38`)

This branch ships:

- This long-form plan.
- The companion implementation plan.
- The first-wave curriculum draft.
- The wiki + directory inventory and overlap matrix.
- The fresh-thread prompt for the future `#16` worktree.
- The companion `#39` umbrella refactor plan.
- Updated `specs/memory-bank/active-context.yaml` and a new `CHANGELOG.yaml` entry at `1.4.1.8`.
- A new GitHub issue `#39` with a body lifted from the umbrella refactor plan, and an updated GitHub `#16` body referencing the locked decisions.
- An updated PR `#38` description noting the planning-doc additions.

It does **not** ship: any worktree creation, any code change, any DNS/Vercel/Creem/Resend/Auth change, any restructure, any EDI runtime code, any UI extraction. All of that runs later, in `#39` first and then `#16`.
