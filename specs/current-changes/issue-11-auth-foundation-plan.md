# Issue 11 Auth Foundation Plan

Date: 2026-03-17
Issue: [#11](https://github.com/BallLightningAB/shipping-api-dojo/issues/11)
Branch: `codex/issue-11-auth-foundation`
Scope: Implement the platform foundation defined in `#7`.

## Goal

Ship the shared infrastructure required before the content proof of concept:

- Neon + Drizzle
- Better Auth
- server-backed progress
- capability-based entitlements
- Creem billing and webhook sync
- dedicated Resend email delivery
- `shipping.apidojo.app` domain readiness

## Dependencies

- `#7` is archived in `specs/archived/completed/issue-7-scoping-plan.md` and must be complete enough to lock schema, entitlement, and seed/progress contracts.
- `apidojo.app` must be purchased before production domain cutover steps can finish.
- Dedicated Resend account creation must be available before production email validation can finish.

## Manual Preparation Checklist

### Owner tasks

- purchase `apidojo.app`
- confirm registrar and DNS access
- create a Neon project for API Trainer
- create or confirm a Creem merchant account with test/live credentials
- create a dedicated Resend account for API Trainer
- add Vercel env access for preview and production

### Decisions to have ready

- whether Better Auth starts with magic links only or magic link + password
- final Creem Pro product and price IDs
- Enterprise contact path and whether an enterprise checkout placeholder is needed in the first pass

## Rough Estimate

- Dev: 30h
- Test/validation: 16h

## Implementation Phases

### Phase 1: Database and env foundation (`I11D2`)

- add `drizzle-orm` and `drizzle-kit` dependencies and configuration
- add schema files for auth, progress, billing, entitlements, and certificates
- add migration generation and migration runbook
- wire `DATABASE_URL` across local, preview, and production
- document Neon branch strategy:
  - local/dev database
  - preview database or preview branch
  - production database

### Phase 2: Better Auth (`I11D3`)

- install Better Auth
- use Better Auth built-in cookie sessions
- configure session cookies as `httpOnly`, `secure` outside local dev, and `sameSite=lax`
- use a rolling session with a 30-day max age unless a later security review changes it
- implement sign-up, sign-in, sign-out, and session retrieval
- protect server actions and route boundaries for signed-in-only features
- keep anonymous browsing available

### Phase 3: Server-backed progress (`I11D4`)

- implement signed-in progress reads and writes against Neon
- keep anonymous progress in local storage
- add one-time anonymous-to-account merge flow
- merge automatically on first sign-in when the account has no existing progress
- if the account already has progress, show an explicit merge-versus-keep-server decision before writing
- expose stable contracts for lesson, drill-family, and scenario-family progress

### Phase 4: Capability-based entitlements (`I11D3`)

- implement capability resolution from account state plus subscription state
- support `free`, `pro`, and `enterprise` capability bundles
- add server-side guards for premium-only actions and content packs
- add minimal debug visibility for current entitlements in development

### Phase 5: Creem billing (`I11D5`)

- create Pro checkout flow
- verify success return handling
- implement the public Creem webhook as a server-only HTTP request handler with raw-body signature verification
- implement webhook verification and idempotent event processing
- map Creem subscription state into entitlement grants
- add customer portal or billing management link if supported in the first pass

### Phase 6: Dedicated Resend setup (`I11D6`)

- verify `shipping.apidojo.app` as a Resend sending domain
- rely on the dedicated account because Resend Free currently supports a single verified domain per team
- add SPF, DKIM, and DMARC DNS entries
- start DMARC at `p=none`, then tighten after healthy delivery data
- configure sender identities for auth and billing emails
- confirm that `auth@shipping.apidojo.app`, `billing@shipping.apidojo.app`, `hello@shipping.apidojo.app`, and `certificates@shipping.apidojo.app` all send from the single verified domain; add mailbox or forwarding separately for any address that must receive replies
- implement templates with `react-email`, not raw HTML strings
- implement transactional email sending for:
  - sign-in or magic link
  - welcome
  - password reset if password auth is enabled
  - subscription confirmation
  - payment failure or cancellation
- reserve OTP or 2FA verification email for later auth hardening
- implement Resend event handling for delivered, bounced, complained, and suppressed states
- store email event metadata needed for debugging and support

### Phase 7: Domain cutover readiness (`I11D1`, `I11D7`)

- add `shipping.apidojo.app` to Vercel
- use `http://localhost:<port>` in local dev, Vercel preview URLs in preview, and `https://shipping.apidojo.app` in production
- wire `APP_BASE_URL`, `BETTER_AUTH_URL`, and cookie domain settings
- update preview-safe behavior so preview deployments still work on Vercel URLs
- treat the domain cutover as a controlled site move: keep route paths stable where possible, add redirects from the old domain, update sitemap origins and canonical tags, and verify Search Console/Bing Webmaster registration before launch

## TanStack Start Runtime Decisions

- use authenticated server functions for signed-in progress and entitlement reads/writes
- use server-only HTTP request handlers for Creem and Resend webhooks because they require raw request access
- keep auth checks at both route boundaries and server boundaries

## Required Environment Variables

- `APP_BASE_URL`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `SESSION_COOKIE_DOMAIN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WEBHOOK_SECRET`
- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_ENV`
- `CREEM_PRO_PRODUCT_ID`
- `CREEM_PRO_PRICE_ID`
- `CREEM_ENTERPRISE_PRODUCT_ID` or lookup key equivalent

## Implementation Notes

- The first paid implementation only needs one self-serve Pro tier plus Enterprise placeholders.
- Certificate tables can be added now even if certificate issuance UI waits for `#10`.
- Keep the auth and billing core server-first. Do not build premium gating as client-only checks.
- Preserve the ability to run the app locally without billing by using feature flags or test-mode defaults.
- Assume Creem owns formal invoices and receipts unless later UX requirements justify custom duplicate notifications.
- Keep progress, entitlement, certificate, and challenge-run contracts transport-neutral so a future native client can consume them without reworking the backend.

## Acceptance Criteria

- [x] users can sign in and out
- [x] signed-in users persist progress to Neon
- [x] anonymous users remain local-only
- [x] anonymous progress can be merged into an account
- [x] Creem webhooks update entitlement state idempotently
- [x] Resend can send verified-domain auth and billing emails
- [x] production domain, auth URLs, and cookies are ready for `shipping.apidojo.app`

## Validation And Iteration

- add unit tests for progress merge rules and entitlement resolution
- add integration tests for Creem and Resend webhook verification and idempotency
- add integration or route tests for auth-aware server functions and protected-route behavior
- use browser control for sign-up, sign-in, sign-out, premium gating, and merge-flow validation
- verify the domain/base-URL change does not regress canonical tags, sitemap origins, robots, or auth redirects
- validate each phase before starting the next one instead of deferring all checks to the end
