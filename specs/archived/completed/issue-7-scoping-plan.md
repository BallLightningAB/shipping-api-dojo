# Issue 7 Scoping Plan

Date: 2026-03-17
Issue: [#7](https://github.com/BallLightningAB/shipping-api-dojo/issues/7)
Branch: `codex/issue-7-scoping`
Scope: Decision-complete technical scoping only. No Neon, Better Auth, Creem, or Resend implementation in this issue.

## Validation Status

Validated on 2026-03-20 against:

- the current Shipping API Dojo codebase
- current official TanStack Start docs
- current official Better Auth docs
- current official Resend docs
- current official Neon and Drizzle docs

Decision: this plan is implementation-ready for `#11`, but the current codebase still uses the v1 flat content model and local-only progress system. The work in this issue remains documentation and handoff, not runtime implementation.

## Goal

Define the final architecture for:

- content families and stable IDs
- seeded randomization under TanStack Start
- anonymous versus signed-in progress ownership
- entitlements, packaging, and open-core boundaries
- `shipping.apidojo.app` domain strategy under the `apidojo.app` umbrella
- dedicated Resend sending setup
- the near-final Neon + Drizzle schema that `#11` will implement
- platform-neutral domain boundaries that do not block a future native client

## Decisions To Lock

### Product and access model

- Anonymous users can browse and sample content without signing in.
- Anonymous users keep local-only progress only.
- Signed-in users get durable server-backed progress.
- Free signed-in access is the activation layer.
- Pro is the single self-serve paid plan.
- Enterprise is custom and team-oriented.

### Open-core direction

- Public-repo license target: `AGPL-3.0-only`.
- Rationale: it preserves an actual OSS posture while making hosted copycat reuse less attractive than a permissive license would.
- Premium value should live in hosted entitlements, premium content packs, certificate/reporting surfaces, and private operational configuration rather than in secret client code.
- Premium-only authored content, private configuration, and monetized hosted surfaces should stay outside the public repo once they actually become proprietary assets.
- If distribution/adoption becomes more important than hosted moat later, revisit `Apache-2.0`. That is not the default for this phase.

### Domain and email direction

- Canonical production URL: `https://shipping.apidojo.app`
- `apidojo.app` acts as the umbrella/root domain while `shipping.apidojo.app` is the product-canonical hostname.
- Preview and staging continue on Vercel preview domains until a dedicated staging domain is justified.
- API Trainer gets a dedicated Resend account.
- Auth, billing, and certificate email all use the `shipping.apidojo.app` sending domain.

### SEO and directory direction

- Lessons, wiki pages, and directory pages remain crawlable knowledge surfaces.
- Route-critical instructional content must stay SSR-visible in initial HTML.
- Canonical URLs, sitemap entries, breadcrumbs, and structured data should be generated from the same catalog/source-of-truth where feasible.
- The directory and any future filter/search surfaces should only become indexable when they meet clear quality thresholds.
- The domain cutover to `shipping.apidojo.app` should preserve path structure where possible and run as a controlled site move with redirects and updated sitemaps.

## Content-Family Architecture

### Directory shape

- `src/content/families/lessons/*`
- `src/content/families/drills/*`
- `src/content/families/scenarios/*`
- `src/content/catalog/*` for ordering, track membership, and free/premium assignment

### Stable identity rules

- `lessonId` is canonical and stable.
- `drillFamilyId` is canonical and stable.
- `scenarioFamilyId` is canonical and stable.
- `variantId` identifies one deterministic generated variant within a family.
- `runSeed` identifies one run of a lesson or scenario experience.

### Family rules

- Lessons remain editorial and authored.
- Drill families own misconception targets, parameter banks, and explanation patterns.
- Scenario families own incident goals, branches, evidence banks, and escalation logic.
- Progress always keys off canonical IDs, never shuffled order.
- The family model should be consumable outside the web route layer so future native clients can reuse it.

### Recommended TypeScript shape

```ts
type LessonSectionDefinition = {
  id: string
  heading: string
  body: string
  carrierReality?: string
}

type LessonDefinition = {
  id: string
  slug: string
  track: "intro" | "rest" | "soap" | "cross-track"
  objectives: string[]
  sections: LessonSectionDefinition[]
  drillFamilyIds: string[]
}

type DrillVariant = {
  variantId: string
  prompt: string
  options?: string[]
  correctValue: string
  explanation: string
  renderedFields?: Record<string, string>
}

type DrillFamilyDefinition = {
  id: string
  type: "mcq" | "cloze" | "builder.rest" | "builder.soap"
  concept: string
  misconception: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  parameterBank: Record<string, string[]>
  buildVariant: (seed: number) => DrillVariant
}

type ScenarioRun = {
  runId: string
  scenarioFamilyId: string
  seed: number
  evidence: string[]
  steps: Array<{
    id: string
    text: string
    choices: Array<{
      id: string
      label: string
      feedback: string
      isCorrect: boolean
      nextStepId: string | null
    }>
  }>
}

type ScenarioFamilyDefinition = {
  id: string
  concept: string
  ladderLevel: 1 | 2 | 3 | 4
  evidenceBank: string[]
  buildRun: (seed: number) => ScenarioRun
}
```

### Breaking type notes

- The current `Track` union expands to include `"cross-track"`.
- Lessons keep inline section ownership in the first iteration; sections do not become standalone entities.
- Existing inline lesson sections should migrate into `sections: LessonSectionDefinition[]`, not a `sectionIds` lookup model.

### Current-codebase delta to close in `#8` and `#9`

- Current lessons are keyed by `slug` and `order`; the family migration must add canonical `lessonId` without breaking existing lesson URLs.
- Current drills are static authored items with fixed `correctIndex`; the family migration must move scoring to canonical `drillFamilyId` plus deterministic `variantId`.
- Current scenarios are fixed step trees; the family migration must introduce `scenarioFamilyId`, deterministic run generation, and run-specific evidence without changing progress identity semantics.
- Current lesson sections have no stable IDs; the migration must add section IDs while keeping sections inline with the lesson definition.

## Seeded Randomization Decision

### Default strategy

- Use loader-provided `runSeed` values for SSR-visible randomized content.
- Derive all shuffles and variant selection from a small deterministic PRNG helper.
- Do not call `Math.random()` inside SSR-rendered UI.

### Seed ownership

- Lessons: one `runSeed` per lesson load.
- Arena listing: one `runSeed` per arena page load.
- Scenario runs: one `runSeed` per scenario-family run.
- Explicit "new challenge" actions generate a new seed and rerender from the same family.

### Execution boundary

- Preferred path: route loader or server function creates the seed and serializes it when the randomized output must be SSR-visible.
- Allowed fallback: `ClientOnly` only when the seed depends on device-local or post-hydration state that the loader cannot know safely.
- TanStack Start loaders are isomorphic and may run again on client navigation, so loaders are only for non-secret seed generation and serializable content selection.
- Secret-only logic, auth-bound state changes, and provider-backed mutations must live in `createServerFn(...)` handlers or server routes, not in loaders.

### PRNG recommendation

- Use a small deterministic helper such as `xmur3` + `mulberry32` or equivalent.
- Avoid adding a dependency unless the existing stack clearly benefits from one.

## Progress Ownership Decision

### Anonymous users

- Progress stays in local storage only.
- Anonymous progress is non-authoritative and disposable.
- Anonymous progress may be used as a pre-auth buffer for merge-on-signup.

### Signed-in users

- Server state in Neon is authoritative.
- Client state acts as cache and offline buffer only.
- After sign-in, UI should load and reconcile against server progress.
- Signed-in progress reads and writes should use authenticated server functions, not direct client-side persistence.

### Merge rules on sign-in

- Merge once on first sign-in or explicit import.
- For each canonical unit, keep the highest mastery/completion state.
- Keep the earliest completion date and latest interaction date where both exist.
- Sum attempts only when the records are clearly the same unit and no duplicate import already occurred.
- Record the merge timestamp and source to avoid repeated replay of the same local snapshot.

## Entitlements, Packaging, and Pricing

### Capability model

Use capability keys instead of one boolean plan flag.

| Capability | Anonymous | Free | Pro | Enterprise |
| --- | --- | --- | --- | --- |
| `content.sample.read` | yes | yes | yes | yes |
| `progress.local` | yes | no | no | no |
| `progress.server` | no | yes | yes | yes |
| `content.free.read` | limited | yes | yes | yes |
| `content.premium.read` | no | no | yes | custom |
| `randomization.premium` | no | limited | yes | yes |
| `review.mode` | no | limited | yes | yes |
| `certificate.basic` | no | no | yes | yes |
| `certificate.branded` | no | no | no | yes |
| `reporting.team` | no | no | no | yes |

### Packaging recommendation

- `Free`: sign-in required, durable progress, core content, baseline randomized practice
- `Pro`: one self-serve paid plan, premium challenge modes, deeper variant banks, certificates, richer review tools
- `Enterprise`: branded certificates, reporting, team/admin controls, custom content packs

### Price anchor for later implementation

- Pro pricing hypothesis: `EUR 6-9 / month` or annual equivalent
- Value metric: flat-fee per signed-in individual account for Free/Pro, with Enterprise priced by seats and team scope
- Annual discount target: about `17%`
- Launch posture: freemium rather than time-limited trial
- Enterprise: custom quoting
- Do not optimize around a `EUR 1` launch price in the initial build

## Domain, DNS, and Resend Architecture

### Domain tasks to capture

- Purchase `apidojo.app`
- Decide registrar ownership and renewal responsibility
- Add root-domain and `shipping` subdomain DNS records in the production checklist
- Map `shipping.apidojo.app` to Vercel production
- Decide whether the root `apidojo.app` should redirect to a network hub or hold site-selection content later
- Update canonical URLs, sitemap origins, structured data URLs, manifest URLs, auth URLs, and email links
- Track the recommended public-core license change as a pre-launch task before paid rollout

### Dedicated Resend tasks to capture

- Create a dedicated Resend account for API Trainer
- Verify the `shipping.apidojo.app` sending domain
- Resend currently allows one custom domain and one webhook endpoint on the Free plan, so the dedicated account avoids cross-project collisions
- Add SPF, DKIM, and DMARC records
- Roll out DMARC in phases: `p=none`, then `p=quarantine`, then `p=reject` after healthy delivery signals
- Configure sender identities:
  - `auth@shipping.apidojo.app`
  - `billing@shipping.apidojo.app`
  - `hello@shipping.apidojo.app`
  - `certificates@shipping.apidojo.app`
- Treat those sender identities as valid outbound addresses on the single verified domain; provision mailbox or forwarding separately if any address needs to receive replies
- Resend does not require pre-created sender identities; any sender on the verified domain is acceptable as long as the `from` domain exactly matches the verified domain
- Capture fallback behavior if DNS verification is delayed:
  - finish local auth/billing code behind feature flags
  - block production email sends until the domain is verified

### Email template inventory

- welcome
- sign-in or magic-link email
- password reset if password auth is enabled
- OTP or 2FA verification email reserved for later auth hardening
- subscription confirmation
- renewal, payment failure, cancellation, and reactivation
- certificate/share email for future `#10` work
- Resend delivery, bounce, complaint, and suppression webhooks
- Invoices and receipts are assumed to be Creem-owned unless later UX needs justify custom notifications

## Near-Final Drizzle Schema Outline

This schema is scoped in `#7` and implemented in `#11`.

```ts
users(id, email, name, image, createdAt, updatedAt)
accounts(id, userId, provider, providerAccountId, accessToken, refreshToken, expiresAt)
sessions(id, userId, token, ipAddress, userAgent, expiresAt, createdAt)
verifications(id, identifier, value, expiresAt, createdAt)
progressProfiles(userId, lastLocalMergeAt, progressVersion, createdAt, updatedAt)
lessonProgress(userId, lessonId, status, masteryScore, completedAt, lastRunSeed, updatedAt)
drillFamilyProgress(userId, drillFamilyId, attempts, correctCount, masteryScore, lastVariantId, updatedAt)
scenarioFamilyProgress(userId, scenarioFamilyId, attempts, bestOutcome, completionState, lastRunSeed, updatedAt)
subscriptionCustomers(id, userId, providerCustomerId, provider, createdAt, updatedAt)
subscriptions(id, userId, providerSubscriptionId, planKey, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt)
entitlementGrants(id, userId, capabilityKey, sourceType, sourceId, startsAt, endsAt, createdAt)
billingEvents(id, providerEventId, eventType, status, payloadJson, receivedAt, processedAt)
emailEvents(id, userId, emailType, providerMessageId, providerEventId, status, metadataJson, sentAt, updatedAt)
certificates(id, userId, certificateType, title, credentialId, shareSlug, visibility, issuedAt, updatedAt)
```

### Auth and cookie constraints validated for `#11`

- Set Better Auth `baseURL` explicitly in every environment through `BETTER_AUTH_URL`; do not rely on request inference.
- Preview and multi-host behavior should use an explicit allowed-hosts configuration rather than broad cookie scoping.
- Only enable cross-subdomain cookies if the final product actually needs shared auth across sibling subdomains; the default should keep cookies scoped as narrowly as possible.
- Better Auth sessions are cookie-backed and the core session fields above align with the documented session model.

### Operational data retention notes

- Keep raw billing webhook payloads for `180 days` by default, then archive or prune them.
- Keep normalized subscription and entitlement state longer than raw webhook payloads.

## Runtime Strategy Notes

- Keep local anonymous progress on the existing browser-safe path.
- Move signed-in authoritative progress reads and writes to authenticated server functions.
- Use server-only HTTP request handlers for Creem and Resend webhooks because they need raw-body signature verification and should not be modeled as client-invoked mutations.
- TanStack Start server routes should own raw webhook receipt from `src/server.ts`; this is a hard boundary, not a UI-route concern.
- Keep business rules and payload contracts independent of browser-only component logic so future native clients can reuse the same backend.
- Keep SEO-only concerns such as route metadata, breadcrumbs, and sitemap generation at the web route/catalog layer rather than leaking them into shared domain logic.

## Accounts and Env Checklist

### Accounts

- domain registrar access for `apidojo.app`
- Vercel project and domain access
- Neon project access
- Better Auth provider configuration inputs
- Creem dashboard access for test and live modes
- fresh Resend account for API Trainer

### Environment variables

- `APP_BASE_URL`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
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

### Environment and config notes

- Better Auth preview-host allowlisting may be code-backed config rather than a first-class environment variable; verify the final representation during `#11`.
- Resend Free currently limits the product to one webhook endpoint, so email-event ingestion should be consolidated behind one handler.
- The current repo has no active `BETTER_AUTH`, `CREEM`, `RESEND`, `DATABASE_URL`, or `APP_BASE_URL` wiring yet; `#11` owns the first real integration pass.

## Acceptance Criteria

- all decisions above are captured in the issue and plan artifact
- schema outline is specific enough for `#11` implementation without re-architecture
- seed ownership and SSR boundaries are unambiguous
- access model and entitlement matrix are unambiguous
- domain purchase and dedicated Resend setup are treated as explicit tasks
- SEO and directory guardrails are explicit enough that `#8`, `#9`, and the domain cutover do not accidentally reduce crawlability or route quality

## Validation And Iteration

- review the scoping output against the current codebase types before implementation starts
- verify TanStack Start execution boundaries before approving the webhook and seed strategy
- verify the env list against the actual providers before `#11` starts
- keep the plan open until the implementation team can start `#11` without inventing missing contracts

## 2026-03-20 Validation Summary

### Confirmed in the current repo

- The current app already uses TanStack Start route loaders and SSR-friendly route metadata for lessons and wiki content.
- Canonical URLs and JSON-LD already assume `https://shipping.apidojo.app`.
- The public AGPL open-core posture is already reflected in `package.json` and `README.md`.
- Anonymous progress is explicitly browser-local today and already uses a Shipping API Dojo-specific storage key.

### Confirmed gaps this issue is scoping around

- The repo still uses flat `src/content/*.ts` content collections rather than family folders and family definitions.
- Progress is still keyed by lesson slug and scenario ID in local storage, with no signed-in merge path or server authority.
- Seeded randomization, variant IDs, run seeds, and scenario-family run generation do not exist yet.
- There is no auth, billing, email, or database implementation in the application code today.
- Sitemap and robots guardrails are documented but should still be treated as implementation work to preserve during `#8`, `#9`, and the domain cutover.
