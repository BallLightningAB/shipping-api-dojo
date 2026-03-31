# Shipping API Dojo

Shipping API Dojo is a web-first, open-core learning product for shipping and carrier API integrations. This repository contains the public core application and content engine for the hosted product at `shipping.apidojo.app`.

## Current Product State

The current public build includes:

- **REST lessons** covering semantics, auth, error handling, pagination, and webhooks
- **SOAP lessons** covering envelopes, namespaces, WSDL/XSD, and faults
- **Incident Arena** scenario drills for troubleshooting shipping integration failures
- **Wiki** reference content for shipping/API concepts
- **Directory** curated links to specs, tools, and carrier resources
- **Anonymous local progress** stored in the browser today

## V2 Direction

The active v2 plan is tracked in [`specs/current-changes`](specs/current-changes) and centers on:

- 20 lessons, 20 drill families, and 20 scenario families
- deterministic content families and seeded randomization
- signed-in server-backed progress with Better Auth + Neon/Drizzle
- hosted access tiers: anonymous sample -> signed-in free -> Pro -> Enterprise
- Creem billing, Resend transactional email, and `shipping.apidojo.app` as the target production domain under the `apidojo.app` umbrella
- stronger SEO-first knowledge architecture around lessons, wiki, and directory surfaces

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

## Tech Stack

### Current implementation

- **TanStack Start** (React 19, file-based routing, SSR)
- **Tailwind CSS v4** + shadcn/ui + Lucide icons
- **@tanstack/react-store** for anonymous/local progress state
- **Zod** for runtime validation
- **Biome** + Ultracite for formatting/linting
- **Vite** for bundling, deployed to **Vercel**

### Planned v2 additions

- **Better Auth** for hosted accounts and sessions
- **Neon Postgres** + **Drizzle ORM** for durable progress and entitlements
- **Creem** for subscriptions and billing
- **Resend** for transactional email

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

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
│   ├── progress/     # Progress schema, storage, store, actions
│   └── seo/          # Meta tags, structured data, sitemap helpers
├── routes/           # TanStack file-based routes
└── styles.css        # Global styles
```

## Security Baseline

- Local secret scanning via `.pre-commit-config.yaml`
- CI secret scanning via `.github/workflows/secret-scan.yml`

## Funding

- See [FUNDING.yml](FUNDING.yml)

2026 Nicolas Brulay / Ball Lightning AB
