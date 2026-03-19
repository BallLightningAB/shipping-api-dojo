# Issue 12 Compliance Plan

Date: 2026-03-17
Issue: [#12](https://github.com/BallLightningAB/shipping-api-dojo/issues/12)
Branch: `codex/issue-12-compliance`
Scope: Privacy, storage-disclosure, and launch-compliance work required before production auth and paid features are enabled.

## Deliverable Mapping

- `I12D1`: confirm and document which cookies and storage/access technologies are strictly necessary
- `I12D2`: create the privacy policy and cookie/storage disclosure
- `I12D3`: define and implement GDPR user-rights surfaces
- `I12D4`: define the trigger conditions for a future consent banner
- `I12D5`: run the final launch-readiness compliance review for `shippingapidojo.com`

## Rough Estimate

- Dev: 8h
- Test/validation: 4h

## Goal

Ship the legal and operational compliance layer that matches the hosted v2 implementation without overbuilding a consent banner before it is actually required.

## Dependencies

- `#7` must lock the storage, auth, billing, and email architecture.
- `#11` must be implemented far enough to expose the real cookies, server-side storage, payment flow, and email behavior.
- This issue must complete before production auth and paid features are enabled on `shipping.apidojo.app`.

## Workstreams

### 1. Storage and cookie inventory (`I12D1`)

- classify every cookie and storage/access technology used by the hosted product
- separate strictly necessary technologies from future optional ones
- document the no-banner assumption while analytics and other non-essential tracking remain disabled

### 2. Public disclosure documents (`I12D2`)

- add a privacy policy
- add a cookie/storage disclosure
- explain Better Auth, Neon/Drizzle, Creem, and Resend data flows in plain language
- link the disclosures from the footer and any relevant auth/billing surfaces

### 3. GDPR rights surfaces (`I12D3`)

- define account-data access path
- define deletion and retention path
- define support contact and escalation path
- confirm what data is deleted immediately versus retained for legal, fraud, or billing reasons

### 4. Future consent-trigger matrix (`I12D4`)

- document which future additions would trigger consent-banner work:
  - analytics
  - ad or remarketing pixels
  - personalization cookies beyond requested-service storage
  - session replay or behavioral tooling
- define the decision point for adding a consent-management layer later

### 5. Launch compliance review (`I12D5`)

- review the production domain, policies, footer links, auth copy, email copy, and billing flows
- confirm the implemented storage behavior matches the published disclosures
- produce a short launch checklist and close any mismatches before enabling paid/auth in production

## Acceptance Criteria

- the hosted product has accurate privacy and storage disclosures
- the user-rights surfaces are visible and operationally defined
- the current no-consent-banner stance is documented and justified
- the future trigger conditions for a consent banner are explicit
- the final launch review is complete before production auth and paid features go live

## Validation And Iteration

- verify policy links and disclosure links in the real UI with browser control
- verify the documented cookies/storage match what the app actually sets in browser/devtools
- rerun the compliance checklist whenever auth, billing, email, or analytics behavior changes before launch
