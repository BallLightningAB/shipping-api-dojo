# Issue 12 Compliance Execution Plan

Date: 2026-04-14
Issue: [#12](https://github.com/BallLightningAB/shipping-api-dojo/issues/12)
Branch: `codex/issue-12-compliance`
Scope: Real implementation of the privacy, storage-disclosure, GDPR-rights, and launch-compliance work required before production auth and paid features are enabled on `shipping.apidojo.app`.
Status: In progress on the branch above. Keep `status: planned` in `active-context.yaml` until the final wrap-up wave is complete.

## Summary

- Implement issue `#12` as the launch-readiness compliance gate for hosted auth and paid features.
- Keep four surfaces aligned at every wave checkpoint:
  - the Codex progress checklist
  - this local plan
  - `specs/memory-bank/active-context.yaml`
  - GitHub issue `#12`
- Do not add analytics, consent tooling, or marketing tracking in this issue.
- Document the future trigger conditions for consent work instead.

## Deliverable Mapping

- `I12D1`: confirm and document the strictly necessary cookies and storage/access technologies
- `I12D2`: ship a privacy policy and cookie/storage disclosure
- `I12D3`: implement GDPR user-rights surfaces for access/export, deletion requests, support, and retention
- `I12D4`: document the trigger conditions for future consent-banner work
- `I12D5`: complete the launch-readiness compliance review for `shipping.apidojo.app`

## Current-State Audit Before Wave 1

- Anonymous progress is stored in browser `localStorage` under `shipping-api-dojo-progress`, with migration from the legacy `api-trainer-progress` key.
- Signed-in users use Better Auth with cookie-backed sessions plus database-backed `user`, `session`, `account`, and `verification` records.
- Better Auth is configured for secure cookies on HTTPS and has optional `SESSION_COOKIE_DOMAIN` support if cross-subdomain auth is enabled later.
- Signed-in progress is persisted in `user_progress`, and sign-in merge decisions are recorded in `progress_merge_events`.
- Subscription and billing webhook records are persisted in `subscriptions` and `billing_events`.
- Lifecycle email is sent through Resend, and tracked webhook events are persisted in `email_events`.
- The current settings page still falsely claims that all data is stored locally in the browser.
- The current app has no public privacy-policy route, no public cookie/storage-disclosure route, no footer legal links, and no explicit GDPR-rights surface.
- The current branch has no analytics, remarketing pixels, session replay tooling, or consent banner. That no-banner position only remains valid while optional tracking stays absent.

## Wave Checklist

- [x] Wave 0: branch + artifact sync
- [ ] Wave 1: inventory + public disclosures
- [ ] Wave 2: GDPR rights surfaces
- [ ] Wave 3: consent-trigger matrix + launch review + wrap-up

## Locked Decisions

- The only correct production domain in issue `#12` artifacts is `shipping.apidojo.app`.
- Public legal pages must be SSR-visible, crawlable routes with stable footer links.
- Settings remains the signed-in rights surface, not the only place where legal disclosures live.
- The no-consent-banner stance is allowed only while storage stays limited to strictly necessary auth/session and requested-service functionality.
- Deletion remains an assisted/manual request workflow in this issue. Do not pretend a full self-serve irreversible deletion flow exists yet.
- Public disclosures must explain that some records may be retained for billing, fraud prevention, abuse prevention, and legal/accounting obligations.

## Wave 0: Branch And Artifact Sync

### Objectives

- Switch to `codex/issue-12-compliance`.
- Replace the stale outline plan with this execution-ready checkpoint plan.
- Update GitHub issue `#12` to the same wave structure and current-state facts.
- Update `active-context.yaml` so issue `#12` is the active planned implementation issue after `#10`.

### Validation

- Branch exists locally.
- This file, `active-context.yaml`, and GitHub issue `#12` use the same wave names, deliverables, domain, and current-state notes.
- `active-context.yaml` remains `planned` until Wave 3 wrap-up.

## Wave 1: Inventory And Public Disclosures

### Objectives

- Replace the stale settings copy with accurate anonymous-local versus signed-in server-backed messaging.
- Add public, crawlable, SSR-visible legal routes for:
  - privacy policy
  - cookie/storage disclosure
- Add persistent footer links to those routes.
- Document the current no-consent-banner stance only under the explicit no-optional-tracking condition.
- Update technical/public documentation if the current storage/compliance description is materially inaccurate after implementation.

### Validation

- The legal pages render as first-party routes and are reachable from the footer.
- The settings page no longer claims all data is local-only.
- The disclosure text matches the actual anonymous and signed-in storage model implemented in the repo.
- Browser inspection confirms the observed local storage/cookie behavior is consistent with the published text.

## Wave 2: GDPR Rights Surfaces

### Objectives

- Add visible settings/account rights surfaces for:
  - self-serve export/access
  - deletion request path
  - support contact
  - retention summary
- Keep deletion as an assisted/manual request flow.
- Explain what can be deleted immediately and what may be retained.
- Add or update tests for the new rights surfaces.

### Validation

- Signed-in users can reach a concrete export path from settings.
- The deletion/support path is visible and does not imply irreversible self-serve erasure that is not actually implemented.
- Retention disclosures match the underlying auth, progress, billing, and email event model.
- Automated coverage protects the added settings/legal behavior where practical.

## Wave 3: Consent Trigger Matrix, Launch Review, And Wrap-Up

### Objectives

- Add the future consent-trigger matrix covering:
  - analytics
  - remarketing or ad pixels
  - personalization storage beyond requested-service functionality
  - session replay or behavioral tooling
  - third-party tracking identifiers
- Add the launch-readiness checklist to this file and complete it against actual browser behavior.
- Run a browser validation pass and resolve any mismatch before marking the issue done.
- Mark issue `#12` done in `active-context.yaml`, clear `remaining_deliverables`, archive this plan into `specs/archived/completed`, update GitHub issue `#12` to the completed state, and close the issue after the final push.

### Validation

- Browser inspection confirms the actual cookies/storage visible on the implemented branch match the disclosure text.
- No consent banner is present while optional tracking remains absent.
- The trigger matrix clearly states when future consent work becomes mandatory.
- Final wrap-up clears issue `#12` from active planned work and archives this completed plan.

## Launch-Readiness Checklist

- [ ] Footer exposes public privacy-policy and cookie/storage links.
- [ ] Settings/account copy distinguishes anonymous local progress from signed-in server-backed progress.
- [ ] Account rights surfaces include export/access, deletion request, support contact, and retention summary.
- [ ] Auth/session disclosures match actual Better Auth behavior.
- [ ] Billing and subscription disclosures match Creem-backed subscription records and webhook processing.
- [ ] Email disclosures match Resend lifecycle sends and tracked webhook-event storage.
- [ ] Browser-inspected cookies and storage keys match the published disclosure text.
- [ ] No optional tracking or consent banner is present on the completed branch.

## Artifact Sync Log

- 2026-04-14: Wave 0 synced across the branch, this local plan, `active-context.yaml`, GitHub issue `#12`, and the Codex progress checklist.
