# Security Alert Follow-ups

Date: 2026-04-27
Branch: `codex/security-alert-followups`
Scope: Follow-up handling for Dependabot alerts `#13`, `#1`, and CodeQL alert `#1`.

## Changes

- Updated `resend` from `6.5.2` to `6.12.2`.
- Added a targeted `resend>svix` override to `1.92.2` so the vulnerable transitive `uuid@10.0.0` dependency is removed.
- Added a targeted `@esbuild-kit/core-utils>esbuild` override to `0.25.12` so the stale vulnerable `esbuild@0.18.20` path from Drizzle tooling is removed.
- Reworked OG title rendering in `scripts/generate-og-images.mjs` so the script only preserves deliberate `<br/>` title breaks and escapes all title text before HTML insertion.

## Validation Results

- `pnpm audit --json` — passed, zero advisories.
- `pnpm format` — passed.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm test --run` — passed, 151 tests across 27 files.
- `pnpm build` — passed.
- `pnpm exec drizzle-kit check` — passed.
