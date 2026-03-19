# Higher-Value Randomization, Review Modes, and Shareable Certificates Plan

Date: 2026-03-17
Issue: [#10](https://github.com/BallLightningAB/shipping-api-dojo/issues/10)
Branch: `codex/issue-10-outline`
Scope: Outline only. No implementation in this phase.

## Deliverable Mapping

- `I10D1`: outline higher-value randomized variants beyond ordering changes
- `I10D2`: outline review-mode and challenge-mode surfaces
- `I10D3`: outline premium-ready randomization, analytics hooks, and content gating
- `I10D4`: outline shareable non-authoritative certificates, credential URLs, and LinkedIn-compatible details
- `I10D5`: reserve future AI-only challenge directions

## Rough Estimate

- Dev: 4h
- Test/validation: 1h

## Goal

Define the next layer of product value after minimum viable randomization and the 20/20/20 migration are complete.

## Workstreams

### 1. Higher-value randomization

Extend beyond ordering changes into:

- payload-field rotation
- carrier-name and endpoint variation
- error-code and status-code variation
- evidence-snippet variation
- misconception rotation inside the same family
- multi-variant pulls from the same canonical family

### 2. Review and challenge modes

Outline these product surfaces:

- daily seeded challenge
- weekly seeded challenge
- weak-area review queue
- timed exam mode
- end-of-track assessment mode
- streak-safe rerun and replay rules

### 3. Shareable non-authoritative certificates

Certificates are not accredited. They are completion and proficiency signals only.

Recommended certificate surfaces:

- course completion certificate
- challenge-pass certificate
- track mastery badge
- enterprise branded cohort certificate

Recommended certificate data:

- certificate title
- issuing organization
- issue date
- optional expiry date
- credential ID
- public credential URL

### 4. LinkedIn-compatible sharing

Do not assume native LinkedIn provider integration.

Plan instead for:

- a public credential URL per certificate
- a human-readable credential ID
- social preview metadata for the credential page
- LinkedIn-compatible manual certification details that a user can paste into the "Licenses & certifications" form
- a conservative indexation policy so thin credential pages do not become low-value SEO surfaces by default

### 5. Premium and enterprise hooks

Potential Pro hooks:

- deeper variant banks
- premium challenge modes
- certificates and credential pages
- advanced review analytics

Potential Enterprise hooks:

- branded certificate templates
- enterprise-branded certificates as a primary differentiator, not an afterthought
- team assignments
- cohort reporting
- admin exports
- custom content packs

### 6. Certificate notification surfaces

- certificate issuance email
- share-your-certificate email
- enterprise cohort completion notification

### 7. AI-reserved future work

Explicitly reserve these for a later issue:

- generated troubleshooting branches
- adaptive difficulty tuned per user
- open-ended answer grading
- generated logs, payloads, or incident narratives

## Acceptance Criteria

- the outline is specific enough to become future research or implementation issues
- certificate and LinkedIn-compatible sharing are included
- premium and enterprise hooks are explicit
- AI work remains out of the current implementation scope

## Validation And Iteration

- validate the outline against the Free/Pro/Enterprise packaging model from `#7`
- keep certificate, email, and enterprise reporting surfaces aligned before breaking this into future implementation issues
- confirm which shareable pages should stay `noindex` by default unless they gain enough standalone user value to justify indexation
