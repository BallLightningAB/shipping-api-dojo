# Issue 11 Auth Foundation Plan

Date: 2026-03-31
Issue: [#11](https://github.com/BallLightningAB/shipping-api-dojo/issues/11)
Branch: `codex/issue-11-auth-foundation`
Scope: Implement the platform foundation defined in `#7`.

## Completed

- Shipped the Neon + Drizzle foundation for auth, progress, billing, entitlements, email, and certificates.
- Added Better Auth server/session plumbing with Drizzle-backed tables and TanStack Start auth routing.
- Implemented signed-in progress persistence, anonymous merge-on-sign-in flow, and server-backed progress contracts.
- Added capability-based entitlements with server-side guards for free, pro, and enterprise access.
- Implemented Creem webhook verification, idempotent subscription sync, and entitlement upserts.
- Added Resend transactional email rendering plus lifecycle email dispatch and event tracking helpers.
- Wired preview-safe auth host/cookie behavior and domain-cutover readiness for `shipping.apidojo.app`.
- Validated the preview deployment and fixed an env parsing issue that was causing startup 500s.
- Fixed the preview font import so the live preview page no longer emits the Google Fonts 400 error.
- Uploaded and validated preview and production envs in Vercel.
- Archived the phase implementation logs and setup notes into `specs/archived/completed/`.

## Validation

- Local validation passed:
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm lint`
- Live preview validation passed:
  - `https://preview.shipping.apidojo.app/` returned `200 OK`
  - `https://preview.shipping.apidojo.app/api/auth/ok` returned `200 OK`
  - `https://preview.shipping.apidojo.app/site.webmanifest` returned `200 OK`

## Completion Notes

- The remaining production validation is a merge/deploy step, not a code issue.
- Issue #11 is complete on the feature branch and ready to merge to `main`.
- Follow-on work moves to `#8` after merge and release coordination.
