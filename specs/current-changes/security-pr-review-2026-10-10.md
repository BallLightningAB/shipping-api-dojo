# Security PR review — 2026-10-10

Validation resumed and finalized on 2026-10-12.

Repository: `BallLightningAB/shipping-api-dojo`
Branch: `codex/security-dependency-refresh`

## Inventory and sequence

Only PR [#41](https://github.com/BallLightningAB/shipping-api-dojo/pull/41)
was open at the start of this review. Its Kysely 0.28.17 update hardens JSON
paths against SQL injection. The lockfile also changes Nitro and Rolldown;
it is not solely a Kysely update. Main is already an ancestor of the PR,
so rebasing it onto the same main commit would accomplish nothing.

The PR's hosted build and Gitleaks checks passed. CodeQL was neutral rather
than a completed analysis. No open CodeQL or secret-scanning alerts were
returned by the GitHub API. These results do not establish dependency safety.

The PR checkout passed typecheck, lint, schema consistency, and production
build. Its 157 unit tests passed after normalizing the Windows checkout of
the generated sitemap to LF. Browser startup encountered a Nitro environment
error; that interrupted run is not recorded as a passing browser check.

The full dependency audit on the PR checkout reported **77 advisories**:
5 critical, 33 high, 31 moderate, and 8 low. Therefore, the follow-up includes
the original PR's changes and remediates the larger backlog before release.

## Remediation

- Update Better Auth to 1.7.7, Sentry within major 10, TanStack Start/Router,
  Vitest within major 4, TSX, and browser mapping.
- Align TanStack Store and React Store with the router's 0.11.2 dependency;
  otherwise browser hydration fails because the old direct dependency lacks
  `useSelector`. Keep the existing SSR Query integration at 1.166.10 to retain
  compatibility with its Query 5.90 peers.
- Refresh vulnerable transitive dependencies within their supported ranges.
- Update stale Undici and Seroval pins; Seroval must also satisfy Start's
  `^1.6.7` API requirement, not just the advisory's earliest fixed version.
- Pin Nitro to 3.0.260903-beta, replacing `latest`, and let it resolve its
  compatible H3 dependency instead of overriding H3 to an old release.
  The April release fails dev startup with the updated Start; the June release
  starts but fails server bundling under Rollup. Align Vite to 8.3.4 and the
  React, Tailwind, and devtools plugins with Nitro's Vite 8 builder.
- Refresh the Rollup pin to 4.64.5 and Zod to 4.6.7. Better Auth 1.7.7's IP
  validation calls `z.validate`, absent from the previously resolved Zod.
  The password-session test now exercises forwarded-IP validation.
- Use targeted patched esbuild overrides for Drizzle tooling and a targeted
  selector-parser 7.1.6 override for Tailwind Typography's pinned v6 path.
  Browser checks and the production build validate the parser upgrade.
- Move Sentry's existing gated initialization from the shared router into
  a standard client entry point, respecting Start's import protection.
- Enforce LF for `public/sitemap.xml` through `.gitattributes`.
- Check the English `html[lang]` declaration in browser smoke coverage.
- Add isolated Better Auth integration tests for password sign-in, session
  revocation, one-time magic links, and verification-purpose separation.

## Security upgrade notes

[Better Auth's purpose-isolation advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm)
requires 1.7.7. The current app enables magic links but does not configure a
social/Generic OAuth provider, so the advisory's complete attack conditions
are not currently present. The upgrade protects future configurations too.
Deploy all servers sharing verification storage together. Users must request
new magic links after cutover; pending pre-upgrade links/state cannot finish.
This advisory requires no database schema migration. No production or shared
preview application data was mutated during this review.

## Validation and release gates

- Dependency audit: zero advisories after remediation.
- Unit/integration tests: 161 tests across 30 files passed.
- Frozen lockfile install: passed; final dependency resolution has no unmet
  peer warnings.
- Typecheck, formatting/lint, and Drizzle schema checks: passed.
- Production build: passed with the Vercel preset on Windows. Existing
  server-function deprecation and module-directive warnings remain; the Zod
  undefined-import warning is resolved.
- Chromium browser suite: **19 passed, zero skipped** after preparing the
  isolated preview-derived database below. English language metadata, public
  routes, anonymous gating, interactive practice, and all five signed-in
  tiers passed through the actual PostgreSQL/Drizzle/Better Auth paths.

The initial public-only run used placeholder provider configuration. After
the user selected the preview database, a read-only inspection confirmed the
configured endpoint maps to Neon's `preview` branch (`br-bold-brook-alzmm0ox`)
and that this branch has no application tables. Repository seed guards
explicitly prohibit seeding preview or production, so they were preserved.

Created the isolated child branch `security-pr-42-preview-tests-2026-10-12`
(`br-wild-dawn-al62eyca`), applied the three existing migrations, and ran the
guarded local seed with randomized credentials. All five fixture accounts
were created; welcome emails were suppressed by the existing seed hook.
The complete 19-test suite passed against this branch. Credentials and logs
remain gitignored. The test branch is retained for inspection; cleanup has
not been performed. No real email, billing, or production-auth acceptance
was claimed. The shared hosted preview requires schema initialization before
it can support database-backed auth acceptance tests.

Localization is deferred by the project plans. There is no Paraglide runtime,
translation catalog, or locale route set in this app. English rendering and
the language declaration are covered; translated locales cannot be verified.

Before any subsequent PR: wait for checks and preview deployment to finish,
allow at least 60 seconds for new review/check results, fetch origin again,
inspect new review findings, then rebase only if main actually changed.
After a merge, wait for production deployment and route smoke confirmation
before proceeding to the next PR. Do not treat elapsed time alone as a pass.

The user's original checkout and its uncommitted activation-check work remain
untouched in their original directory.

## Hosted review outcome — 2026-10-12

PR [#42](https://github.com/BallLightningAB/shipping-api-dojo/pull/42)
contains the original #41 commit and the security fixes. Gitleaks, CodeQL
(Actions and JavaScript/TypeScript analyses), and the Vercel build passed on
the implementation commit `7ff4cc2`. No review findings were returned after
the settling period. Main remains `76152b6`, already an ancestor of this
branch, so no rebase is required. Neither PR was merged or closed.

The initial browser session redirected to Vercel sign-in. The existing
authenticated Vercel CLI subsequently provided authorized access without
changing deployment protection. Hosted SSR smoke checks passed for `/`,
`/plans`, `/learn/rest`, and `/settings`: each rendered its expected heading
with English metadata and no server error page. Full interactive browser
coverage ran locally against the isolated Neon branch, not the hosted URL.
The seeded-tier and hosted-route validation gates are complete, and #42 can
proceed to review. Main's existing dependency alerts remain until a tested
fix is merged and deployed; the Better Auth cutover notes still apply.
