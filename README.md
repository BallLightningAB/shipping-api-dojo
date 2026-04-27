# Shipping API Dojo

Shipping API Dojo is a web-first, open-core learning product for shipping and carrier API integrations. This repository contains the public core application and content engine for the hosted product at `shipping.apidojo.app`.

## Current Product State

The current public build includes:

- **REST lessons** covering semantics, auth, error handling, pagination, and webhooks
- **SOAP lessons** covering envelopes, namespaces, WSDL/XSD, and faults
- **Cross-track lessons** covering environment drift and carrier integration architecture
- **Incident Arena** scenario drills for troubleshooting shipping integration failures
- **Wiki** reference content for shipping/API concepts
- **Directory** curated links to specs, tools, and carrier resources
- **Anonymous local progress** stored in the browser today
- **Signed-in server-backed progress** through Better Auth and Neon/Drizzle
- **Tier-aware gating** for premium challenge depth while keeping public educational pages crawlable
- **Server-owned practice seeds** for signed-in randomized practice flows
- **Creem webhook-based entitlement sync** for Pro subscription state
- **Resend transactional email plumbing** for auth and lifecycle messages
- **Sentry-ready observability** that stays off until DSNs are configured

## V2 Completion State

The v2 platform work is implemented and tracked in
[`specs/current-changes`](specs/current-changes):

- 20 lessons, 20 drill families, and 20 scenario families
- deterministic content families and seeded randomization
- signed-in server-backed progress with Better Auth + Neon/Drizzle
- hosted access tiers: anonymous sample -> signed-in free -> Pro, with Enterprise reserved for inquiry-only future work
- Creem billing webhooks, Resend transactional email, and `shipping.apidojo.app` as the target production domain under the `apidojo.app` umbrella
- stronger SEO-first knowledge architecture around lessons, wiki, and directory surfaces

The remaining v2 launch-readiness gap is tracked in
[#36](https://github.com/BallLightningAB/shipping-api-dojo/issues/36): a
public plans/product page, visible sign-in/account entry points, Creem
Storefront CTAs for Pro monthly and annual products, explicit Enterprise
inquiry-only messaging, and a target-environment acceptance pass for auth,
billing, email, observability, database, and browser flows.

## Hosted Access Matrix

- **Free**
  - Public lessons, wiki, and directory
  - Core lesson drills and standard incident-arena scenarios
  - Signed-in server-backed progress
- **Pro**
  - All Free surfaces
  - Premium lesson and arena challenge rerolls
  - Advanced review-depth scenario access
  - Available as monthly and annual Pro products in Creem
- **Enterprise inquiries**
  - Not implemented as a checkout product today
  - No Team or Enterprise plan is currently live
  - Support handles Enterprise, team, procurement, or custom-access questions manually

The current implementation gates premium actions and depth (for example rerolls and advanced arena ladders) instead of hiding public SEO-critical pages.

### Creem Pro Products

The two configured product IDs are both Pro products:

- Monthly Pro: `CREEM_PRO_MONTHLY_PRODUCT_ID=prod_3jDZfwYMV4z7s0yyzLMGtp`
- Annual Pro: `CREEM_PRO_ANNUAL_PRODUCT_ID=prod_2UKovfLiNB4uUAdlQrN2TD`

Storefront URLs are intentionally separate runtime configuration from product
IDs. Product IDs drive webhook plan resolution; public CTAs should point to
Creem's customer-facing Storefront URLs once issue `#36` implements the public
plans flow.

## Practice Seed Security

Protected lesson and arena practice flows no longer expose randomization seeds in URLs or public markup. Signed-in practice runs use server-generated seeds stored in the `practice_seeds` table and scoped to the user, surface, and lesson or scenario. Legacy `seed`, `runSeed`, and `exclude` search params are stripped from lesson and arena URLs when encountered.

Public lessons, wiki, and directory pages remain crawlable and SSR-visible. Anonymous/demo practice stays explicit as local, non-certificate-bearing behavior; it can randomize for learning value, but it is not treated as authoritative challenge state.

## Architectural Caveat

`user_entitlements` currently stores both manual/admin grants and Creem-derived webhook state in the same row. That is acceptable for the current implementation, but if the product later adds true manual grants or admin overrides, the read path should become source-aware or the models should be split so webhook updates cannot mask separately managed entitlements.

## Open-Core Boundary

- The code and public-core materials in this repository are licensed under [`AGPL-3.0-only`](LICENSE).
- Trademarks, logos, and brand identifiers remain reserved under [`TRADEMARKS.md`](TRADEMARKS.md).
- Hosted premium features, private operational configuration, billing integrations, private content packs, and other non-public materials are not granted through this repository unless separately provided.

## SEO and Directory Priority

Search visibility is a first-class product concern. During v2 work:

- lesson, wiki, and directory content should remain SSR-visible and crawlable
- canonical URLs, sitemap output, and structured data should stay aligned with route content
- internal linking should keep the directory and knowledge surfaces usable as a hub-and-spoke system
- route migrations and the eventual domain cutover should avoid unnecessary URL churn

### Wiki structure

Two parallel wiki subtrees, intentionally split:

- `/wiki/$slug` — concept articles (idempotency, retry strategies, SOAP envelope, WSDL, etc.).
- `/wiki/carriers/$slug` — vendor-specific surfaces. Slugs follow the immutable `{vendor}-{businessunit}-{region}-{protocol}` pattern (for example `dhl-express-global-mydhl-rest`, `ups-global-rest-oauth`, `usps-us-webtools-legacy`). Sunset and legacy surfaces stay published and indexed because they remain the canonical answer to "is this API still supported?" search intent. The taxonomy is documented in [`specs/current-changes/issue-15-wiki-expansion-plan.md`](specs/current-changes/issue-15-wiki-expansion-plan.md).

Each carrier surface page emits Article + BreadcrumbList JSON-LD, plus FAQPage when it carries FAQs. Concept pages emit Article + BreadcrumbList.

### Sitemap

`public/sitemap.xml` is generated deterministically from the canonical content modules:

```bash
pnpm tsx scripts/generate-sitemap.ts
```

The generator reads `src/content/families` (lessons), `src/content/wiki` (concept articles), and `src/content/carriers` (carrier surfaces). A regression test in `src/lib/seo/sitemap.test.ts` parses the published `public/sitemap.xml` and fails the suite if it drifts from the generator output, so you cannot accidentally merge a stale sitemap.

## Tech Stack

### Current implementation

- **TanStack Start** (React 19, file-based routing, SSR)
- **Tailwind CSS v4** + shadcn/ui + Lucide icons
- **@tanstack/react-store** for anonymous/local progress state
- **Better Auth** for hosted accounts and sessions
- **Neon Postgres** + **Drizzle ORM** for durable progress, auth-adjacent state, billing events, and entitlements
- **Creem** webhook handling for subscription and entitlement sync
- **Resend** for transactional email rendering, sending, and webhook ingestion
- **Sentry** SDK wrappers for opt-in hosted error reporting
- **Zod** for runtime validation
- **Biome** + Ultracite for formatting/linting
- **Vite** for bundling, deployed to **Vercel**

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Dev-Only Tiered Auth Users

For testing entitlement-gated surfaces locally, the repo ships a guarded
seed command that creates deterministic Free/Pro/Enterprise/canceled/
past-due users via Better Auth plus billing-shaped `subscriptions` rows.
The entitlement resolver uses the same code path as production when
reading these rows — the seed never bypasses resolution with manual
grants.

```bash
# .env.local
ENABLE_DEV_SEED=true
DATABASE_URL=postgres://...   # local dev database only

pnpm seed:dev-users
```

Outputs:

- `.playwright-auth/credentials.json` — seeded user credentials (gitignored)
- Playwright tiered-auth tests in `tests/browser/tiered-auth.spec.ts`
  automatically pick up the file and run; they skip cleanly if it is
  missing (e.g. CI without a seeded database).

The seed command refuses to run unless `NODE_ENV` is `development` or
`test`, `VERCEL_ENV` is not `production`/`preview`, `ENABLE_DEV_SEED=true`,
and `DATABASE_URL` is set. The fixture definitions live in
`src/lib/dev/seed-fixtures.ts` and include one Free, one Pro, one
Enterprise, one canceled, and one past-due user. Canceled and past-due
fixtures assert that the resolver falls back to Free instead of masking
the state.

## Testing

- `pnpm test` runs the Vitest unit and integration suite.
- `pnpm test:e2e` runs the low-cost Playwright Chromium smoke suite against a local dev server.
- `pnpm test:checkpoint` runs `pnpm test` followed by `pnpm test:e2e` for issue checkpoint validation.
- `pnpm test:e2e:headed` opens the smoke suite in a visible browser for local debugging.
- `pnpm test:e2e:ui` opens Playwright UI mode for targeted reruns and trace inspection.

Install the Playwright browser once per machine with:

```bash
pnpm exec playwright install chromium
```

The browser suite is intentionally narrow: it smoke-tests the home page, the learning hubs, a representative lesson route, the arena, wiki content, and the directory. Keep broader logic coverage in Vitest and grow the browser suite only when a route-level regression risk justifies it.

### Production Readiness Acceptance

Before enabling paid production access, issue
[#36](https://github.com/BallLightningAB/shipping-api-dojo/issues/36) requires
one targeted acceptance pass beyond the normal unit/lint/build checks:

- Run `pnpm test:checkpoint`.
- Seed dev users and run `pnpm test:e2e` with `.playwright-auth/credentials.json`
  present so tiered auth states execute instead of skipping.
- Verify sign-up, sign-in, sign-out, session persistence, account settings, and
  account export on the target deployment.
- Verify Neon schema/migration state against the target database.
- Replay or send Creem test events for active, canceled, and past-due Pro
  subscriptions and confirm entitlement transitions.
- Verify monthly and annual Pro Storefront CTAs from the deployed site.
- Verify Resend transactional send plus webhook delivery.
- Verify a Sentry test event with DSN configured and privacy scrubbing intact.
- Smoke test the deployed home, plans, learning hubs, representative lesson,
  arena, wiki, directory, privacy, cookies, and settings routes.

## Domains

- Current hosted domain: [https://shipping.apidojo.app](https://shipping.apidojo.app)
- Planned umbrella/domain strategy: `apidojo.app` as the network root, with topic-specific subdomains

## Email Handling

- The temporary public contact address is `info@balllightning.cloud` until product-domain inbox routing is in place.
- A low-cost next step is Cloudflare Email Routing for inbound aliases on `shipping.apidojo.app`, forwarding addresses like `hello@shipping.apidojo.app` to an existing inbox.
- Cloudflare Email Routing is suitable for inbound forwarding, but it does not provide full mailbox hosting or true outbound sending as the product-domain address.

## Project Structure

```text
src/
├── content/          # Current lessons, drills, scenarios, wiki, and directory data
├── components/
│   ├── arena/        # Scenario player
│   ├── drill/        # MCQ, cloze, builder drill components
│   ├── lesson/       # Lesson reader
│   ├── progress/     # XP badge, streak, continue banner, hydrator
│   ├── wiki/         # Wiki article renderer
│   ├── layout/       # Header, Footer, Layout
│   └── ui/           # Shared UI primitives
├── lib/
│   ├── practice/     # Seed-safe practice run helpers and route contracts
│   ├── progress/     # Progress schema, storage, store, actions
│   └── seo/          # Meta tags, structured data, sitemap helpers
├── routes/           # TanStack file-based routes
└── styles.css        # Global styles
```

## Observability

Server and client error reporting flows through
`@/src/lib/observability/logger.ts` as `captureException(error, context)`. The
wrapper always writes a structured `[observability] exception` line to
`console.error` and additionally forwards to Sentry when the Free-tier SDK is
configured with a DSN.

Sentry is off by default: the SDK is installed, but no events are sent until
the env vars below are configured. That keeps local development, CI, and
preview deploys Sentry-free unless a maintainer explicitly opts in.

- **Server DSN**: `SENTRY_DSN` — initializes Sentry on Vercel Functions and
  local Node processes the first time `@/src/lib/observability/logger.ts` is
  imported. Self-hosted deployments can alternatively use
  `--import ./instrument.server.mjs` for earlier coverage.
- **Client DSN**: `VITE_SENTRY_DSN` — initializes Sentry in the browser via
  the side-effect import in `@/src/router.tsx` → `@/src/instrument.client.ts`.
- **Environment / release / tracing**: `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`,
  `SENTRY_TRACES_SAMPLE_RATE` (mirrored on the client as `VITE_SENTRY_*`).
  Tracing defaults to `0` because issue `#26` scopes performance tracing to a
  conservative disabled baseline.
- **Source maps**: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. The
  Vite plugin in `@/vite.config.ts` stays disabled unless all three are
  present, so the default `pnpm build` path never tries to upload source maps
  or contact Sentry.

Privacy posture (issue `#26`): the wrapper only accepts non-PII tag-shaped
context (`route`, `operation`, `tier`, `fallbackTier`, `environment`). The
`beforeSend` hook in `@/src/lib/observability/sentry-init.ts` strips the
user block, request headers, query strings, and any `extra` fields as a
last-line defense. Session Replay and PII forwarding are explicitly
disabled (`sendDefaultPii: false`).

To verify a test event after configuring a DSN:

```bash
# In a Node REPL or a throwaway script under scripts/
node --import ./instrument.server.mjs -e "throw new Error('sentry-verify')"
```

Then confirm the event arrives in the Sentry project dashboard. The first
real error in `/api/webhooks/creem`, `/api/webhooks/resend`, or any route
that calls `captureException` should also appear automatically.

## Security Baseline

- Local secret scanning via `.pre-commit-config.yaml`
- CI secret scanning via `.github/workflows/secret-scan.yml`

## Funding

- See [FUNDING.yml](FUNDING.yml)

2026 Nicolas Brulay / Ball Lightning AB
