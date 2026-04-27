# Issue 5 Final Production Readiness Plan

Date: 2026-04-27
Parent issue: [#5](https://github.com/BallLightningAB/shipping-api-dojo/issues/5)
Issue: [#36](https://github.com/BallLightningAB/shipping-api-dojo/issues/36)
Branch: `codex/issue-5-production-readiness`
Release: `1.4.1.6` (documentation and final readiness planning)

## Goal

Close the remaining gap between the implemented web-v2 platform and a
production-ready paid product. The core v2 implementation is complete, but the
public website still needs clear product, plan, sign-in, and purchase surfaces
before Creem payment activation can be approved and before Shipping API Dojo is
treated as commercially ready.

This issue is the final `#5` sub-issue. It does not reopen the completed
curriculum, wiki, auth foundation, entitlement, seed-security, observability, or
compliance work. It verifies and exposes those systems as a coherent product.

## Current Gap

- Pro product IDs exist and are the only paid product IDs currently in scope:
  - `CREEM_PRO_MONTHLY_PRODUCT_ID=prod_3jDZfwYMV4z7s0yyzLMGtp`
  - `CREEM_PRO_ANNUAL_PRODUCT_ID=prod_2UKovfLiNB4uUAdlQrN2TD`
- There is no Team or Enterprise plan currently implemented.
- The site describes plan capabilities mainly inside `/settings`, which is a
  noindex account/settings page and not an adequate public product surface.
- The header does not expose a public sign-in action or a public plans/pricing
  page.
- Upgrade links in lessons and arena currently point to `/settings#paid-access`
  rather than a public product/pricing page or Creem Storefront path.
- Enterprise copy exists in the internal capability matrix, but the product
  needs to clearly state that Enterprise is not available yet and should be
  handled by support inquiry only.
- Production external integrations still need an explicit acceptance pass
  against the target deployment and provider dashboards.

## Deliverables

### I5D14.1 Public product and pricing page

Create a public, crawlable product/plans page, likely `/pricing` or `/plans`,
that makes the paid product clear enough for Creem payment activation review.

Required content:

- What Shipping API Dojo is.
- What Free includes.
- What Pro includes.
- Monthly and annual Pro purchase CTAs.
- Clear statement that the two Creem product IDs are both Pro products.
- Clear statement that Team and Enterprise are not implemented yet.
- Contact-support CTA for Enterprise, teams, procurement, custom access, or
  support questions.
- Links back into the concrete product surfaces: lessons, arena, wiki, and
  directory.
- Privacy/cookie/support links reachable from the page.

### I5D14.2 Creem Storefront direction

Add the runtime configuration and UI needed to direct customers to the Creem
Storefront for Pro.

Acceptance criteria:

- Configure monthly and annual Pro storefront URLs without hard-coding secrets.
- Keep product IDs separate from storefront URLs so webhooks still resolve by
  product ID while public CTAs use Creem's customer-facing purchase URLs.
- Add prominent Pro monthly and Pro annual CTAs on the public plans page.
- Do not expose any Enterprise checkout CTA until an Enterprise product exists.
- If storefront URLs are missing, render a support-contact fallback instead of
  a broken purchase link.

### I5D14.3 Sign-in and navigation affordances

Make account and plan entry points visible across the site.

Acceptance criteria:

- Header includes a visible sign-in/account action.
- Header and footer include a public plans/pricing link.
- Public paid-feature lock states link to the public plans page instead of
  `/settings#paid-access`.
- Settings keeps entitlement/status details, but no longer acts as the primary
  sales page.
- Anonymous, Free, and paid users all see coherent CTA copy for their state.

### I5D14.4 Paid feature direction from product surfaces

Update the learning surfaces so users understand what paid access unlocks.

Acceptance criteria:

- Lesson premium reroll lock copy points to Pro and links to the public plans
  page.
- Arena advanced-depth lock copy points to Pro and links to the public plans
  page.
- Wiki, directory, and learning hubs include lightweight, non-intrusive links
  to plans where appropriate.
- Public SEO-critical educational content remains crawlable and not hidden
  behind auth or checkout.

### I5D14.5 External integration acceptance tests

Run a targeted launch-readiness acceptance pass against preview or production.

Required checks:

- `pnpm test:checkpoint`.
- Seed dev users and run `pnpm test:e2e` with tiered auth credentials present
  so Free, Pro, Enterprise-shaped, canceled, and past-due states actually run
  instead of skipping.
- Production or preview smoke test for sign-up, sign-in, sign-out, session
  persistence, account settings, and account export.
- Neon migration/schema verification against the target database.
- Creem webhook replay or test events for active, canceled, and past-due Pro
  subscriptions, verifying entitlement transitions.
- Creem Storefront monthly and annual Pro CTA verification from the deployed
  site.
- Resend transactional email send plus webhook delivery verification.
- Sentry DSN test event verification with privacy scrubbing confirmed.
- Browser smoke against the deployed target for home, plans, learning hubs,
  representative lesson, arena, wiki, directory, privacy, cookies, and settings.
- `pnpm audit --json` remains zero-advisory or has a documented exception.

### I5D14.6 Documentation and launch state cleanup

Keep the repo documents aligned with the final v2 state.

Acceptance criteria:

- README describes Better Auth, Neon/Drizzle, Creem, Resend, and Sentry as
  implemented infrastructure, not planned additions.
- README makes clear that Pro is the only storefront-backed paid plan today.
- README makes clear that Enterprise is an inquiry/future plan, not an
  implemented checkout product.
- `specs/memory-bank/active-context.yaml` marks completed v2 sub-issues
  correctly and leaves only this final readiness issue open under `#5`.
- `specs/current-changes/issue-5-joint-plan.md` includes this final readiness
  sub-issue and explains that `#5` closes after it.

## Non-goals

- Do not implement Team or Enterprise checkout.
- Do not implement certificates, team reporting, or custom packs.
- Do not add analytics or marketing pixels.
- Do not hide the public lessons, wiki, or directory behind auth.
- Do not move the product to a new domain as part of this issue unless the
  deployment already targets `shipping.apidojo.app`.

## Exit Criteria

This issue is complete when:

- The public site clearly describes Free and Pro.
- Pro monthly and annual CTAs direct customers to Creem Storefront or a safe
  support fallback when configuration is missing.
- Enterprise is clearly marked as not yet implemented and inquiry-only.
- Sign-in/account and plans navigation are visible from the main site.
- Product surfaces direct users to paid plans where paid capabilities are
  encountered.
- External integrations have been verified against the target environment.
- README and memory-bank state no longer describe completed v2 systems as
  planned or in-progress.
- Parent issue `#5` can be closed as completed.
