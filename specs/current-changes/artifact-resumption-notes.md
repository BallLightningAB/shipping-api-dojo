# Artifact status and resumption notes

Updated 2026-10-12. The owner considers this site primarily an artifact. The
authenticated version was never established as a production service. Auth,
server-backed progress, paid tiers, billing, and email code exist, but that
does not establish live acceptance. No authenticated launch is planned now.

## Verified baseline

Security maintenance is in PR #42, which includes PR #41. At validation time:

- Full dependency audit: zero reported advisories.
- 161 unit/auth tests; 19 Chromium browser tests, including five signed-in tiers.
- Typecheck, lint, schema consistency, production build, CodeQL, and Gitleaks passed.
- Authenticated Vercel CLI checks rendered home, plans, REST hub, and settings.
  These were public SSR checks, not hosted signed-in acceptance.

Browser auth/tier tests ran locally against an isolated Neon child of preview,
using existing migrations, fake accounts, random passwords, and suppressed
email delivery. The shared preview branch had no application tables when
inspected. Production schema/data were not inspected. Temporary test resources
are disposable. At the owner's request, the isolated test branch
`security-pr-42-preview-tests-2026-10-12` (`br-wild-dawn-al62eyca`) is retained.
Local credentials and logs are preserved under
`C:/Users/nicol/.codex/artifacts/shipping-api-dojo/security-pr-42/` before the
review worktree is archived. Treat these as test-only secrets, and revalidate
branch/schema identity before rerunning tests.

## Before picking this up again

1. Refresh dependencies and advisories, inspect current PRs/reviews, and rerun
   frozen install, typecheck, lint, schema checks, unit tests, build, and the
   full browser suite. October results are a historical baseline.
2. Verify domains, deployment configuration, secrets, database branch identity,
   schema/migration state, and backups for each intended environment. Initialize
   preview explicitly; do not assume its schema matches the code. Keep dev
   seeds blocked in shared preview and production.
3. Exercise hosted signup, password sign-in/out, reset and magic links, cookie
   security, trusted origins, expiry/replay, and session revocation. Test actual
   email delivery. Better Auth 1.7.7 changed verification record handling: if
   any older deployments or pending tokens remain, inspect the upgrade notes
   and replace pending links rather than assuming an existing user cutover.
4. Verify anonymous progress, sign-in merge decisions, persistence across
   sessions/devices, and Free/Pro/Enterprise/canceled/inactive access using the
   real server guards and database resolver.
5. Before offering paid access, verify Creem checkout configuration, webhook
   signatures/replays/idempotency, entitlement changes, cancellation/failure
   handling, and Resend lifecycle delivery. Revisit the documented caveat that
   manual and billing-derived entitlement state share a model.
6. Confirm privacy/account-rights behavior, observability redaction, and the
   intended English-only scope. No translated routes/catalogs currently exist;
   localization requires implementation and its own acceptance tests.
7. Only after explicit launch approval, deploy and run hosted acceptance on
   the exact release. Verify production health and security-alert resolution;
   a successful build or public page render does not establish auth readiness.

The original checkout's uncommitted activation notes were preserved. Reconcile
them with this status before restarting a launch checklist. See
[security review details](security-pr-review-2026-10-10.md) for the tested
dependency versions and environment limitations.
