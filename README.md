# Carrier API-Trainer

Interactive carrier-integration learning for REST and SOAP interview prep and troubleshooting. A Nicolas Brulay / [Ball Lightning AB](https://balllightning.cloud) project.

## What is this?

A free, browser-based learning tool for developers who work with carrier APIs (FedEx, UPS, DHL, USPS, etc.). It covers:

- **REST Track** — HTTP semantics, auth, error mapping, pagination & webhooks
- **SOAP Track** — envelopes, namespaces, WSDL/XSD, fault handling
- **Incident Arena** — realistic troubleshooting scenarios
- **Wiki** — quick-reference articles on integration patterns
- **Directory** — curated links to specs, tools, and carrier portals

Progress is stored locally in your browser — no account needed.

## Tech Stack

- **TanStack Start** (React 19, file-based routing, SSR)
- **TailwindCSS v4** + shadcn/ui + Lucide icons
- **@tanstack/react-store** for client-side progress state
- **Zod** for runtime validation
- **Biome** + Ultracite for linting/formatting
- **Vite** for bundling, deployed to **Vercel**

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Project Structure

```
src/
├── content/          # TypeScript data files (lessons, drills, scenarios, wiki, directory)
├── components/
│   ├── arena/        # Scenario player
│   ├── drill/        # MCQ, cloze, builder drill components
│   ├── lesson/       # Lesson reader
│   ├── progress/     # XP badge, streak, continue banner, hydrator
│   ├── wiki/         # Wiki article renderer
│   ├── layout/       # Header, Footer, Layout
│   └── ui/           # shadcn/ui primitives
├── lib/
│   ├── progress/     # Schema, storage, store, actions
│   └── seo/          # Meta tags, structured data
├── routes/           # TanStack file-based routes
└── styles.css        # Global styles + TailwindCSS
```

## Security Baseline

- **Local pre-commit hooks**: `detect-private-key` and `gitleaks protect` via `.pre-commit-config.yaml`.
- **CI secret scanning**: `.github/workflows/secret-scan.yml` runs Gitleaks on pushes/PRs to `main`.

## Domain

https://api-trainer.balllightning.cloud

## License & Funding

- License: see [LICENSE](LICENSE)
- Funding: see [FUNDING.yml](FUNDING.yml)

 2026 Nicolas Brulay / Ball Lightning AB