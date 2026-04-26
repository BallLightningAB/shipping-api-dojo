# Mobile Readiness and Native App Strategy — Long-Form Plan

Date: 2026-04-25
Issue: [#13](https://github.com/BallLightningAB/shipping-api-dojo/issues/13)
Branch: `codex/issue-13-mobile-readiness`
Release: `1.3.3` (patch — strategy + small refactor, no user-visible change)

This document is the long-form companion to
`specs/current-changes/issue-13-mobile-readiness-outline.md`. The outline stays
the high-level source of truth; this plan delivers the five required
artifacts (`I13D1`–`I13D5`) and records the small, surgical refactor done in
this iteration to protect platform-neutral domain boundaries in the existing
web codebase.

This is a strategy + light-touch refactor pass. **No native app code, no
React Native dependency, no monorepo tooling, and no user-visible web
behavior change is shipped here.**

---

## Goal

Define how Shipping API Dojo can become a future native product without
forcing premature complexity into the current web-first implementation.
Protect platform-neutral domain logic so a future React Native (Expo) client
can reuse it, and document the auth/session, API, deep-linking, offline,
and app-store decisions that should be revisited after the v2 web program
ships.

## Recommendation summary

- Stay web-first now. The v2 plans (`#5`, `#11`, `#9`, `#21`, `#26`, `#28`)
  remain the right scope.
- Treat **Expo + React Native + TanStack Router (native)** as the default
  future stack, with a fallback path to a thin "native shell that reuses the
  Vercel-hosted web app" if a fully native client cannot be justified.
- Keep all platform-neutral logic inside `src/lib/...` (no separate package,
  no workspace) until there is a real second consumer. When that consumer
  exists (a native app or a sibling product like the planned EDI track in
  `#16`), revisit the package-extraction question with concrete code-share
  numbers.

---

## `I13D1` — V2 architecture audit for mobile blockers

This audit covers the modules listed in the issue brief plus the immediate
neighbours they pull in. Files are grouped by whether they are
platform-neutral, browser-coupled, or TanStack-Start/Router-coupled.

### Platform-neutral domain modules (safe to share with a native client)

These modules contain no `window`, `document`, `localStorage`,
`IntersectionObserver`, React, or router imports. They are pure TypeScript
and can be reused unmodified by a future Expo/React Native client.

- **`src/lib/randomization.ts`** — `hashStringToSeed`, `createSeededRandom`,
  `shuffleDeterministic`, `pickDeterministic`, `deriveRouteSeed`,
  `deriveChildSeed`, `makeClientSeed`. `makeClientSeed` uses `Date.now()`
  and `Math.random()`, both of which exist on the React Native JS runtime.
  No leakage.
- **`src/lib/progress/progress.schema.ts`** — Zod schema, defaults,
  normalization, and migration. The header comment mentions "localStorage"
  but the runtime code is platform-neutral.
- **`src/lib/progress/progress.merge.ts`** — `mergeProgressSnapshots` and
  helpers. Pure.
- **`src/lib/progress/progress.actions.ts`** — XP/streak/lesson/drill/
  scenario actions. Uses `new Date()` only, no DOM.
- **`src/lib/progress/progress.hydration.ts`** — `shouldReplaceLocalProgress`.
  Pure boolean helper.
- **`src/lib/practice/practice-runs.ts`** — `buildLessonPracticeRun`,
  `buildArenaScenarioCards`, `buildScenarioPracticeRun`,
  `getAnonymous*Seed`, `generatePracticeSeed`, `createPracticeSeedId`. Uses
  `globalThis.crypto`, which is present in React Native ≥ 0.71 / Expo SDK 49+
  via the WebCrypto polyfill (`expo-crypto` exposes
  `Crypto.getRandomValues` and `Crypto.randomUUID`). Tier matrix in
  `access-policy` already drives Pro/Enterprise visibility, so the cards
  builder accepts capability predicates rather than hard-coded plan keys.
- **`src/lib/practice/seed-search.ts`** — Zod search schemas, legacy seed
  param list, and the new `stripLegacySeedParamsFromHref` helper added in
  `I13D2`. No browser, React, or router imports.
- **`src/lib/entitlements/entitlements.ts`** — `TIER_PRIORITY`,
  `CAPABILITY_BUNDLES`, `resolveEntitlements`, `hasCapability`. Pure.
- **`src/lib/entitlements/access-policy.ts`** — `TIER_CAPABILITY_MATRIX`,
  `fallbackFreeEntitlements`, the lesson/scenario reroll predicates,
  `requiresPremiumScenarioDepth`, `canAccessScenarioRun`. Pure.
- **`src/lib/billing/creem.ts`** — Creem webhook signature verification and
  plan-resolution helpers. Uses `node:crypto` (`createHmac`,
  `timingSafeEqual`). This is **server-only** and intentionally so. A
  native client never imports this directly; it consumes the server's
  webhook-derived state via the entitlement endpoint. Safe.
- **`src/content/*`** — `families.ts`, `families/*`, `catalog/*`,
  `runtime.ts`, `lessons.ts`, `drills.ts`, `scenarios.ts`, `wiki.ts`,
  `directory.ts`, `legal.ts`, `types.ts`. The runtime composes
  `randomization.ts` + family definitions. No browser APIs. The legal copy
  references "browser localStorage" but only as user-facing text rendered
  from server-shaped data; it does not invoke any browser API.

### Browser-coupled modules (must stay in the web layer)

These touch `window`, `document`, or `localStorage`. They are correctly
isolated and should not be moved into shared domain modules.

- **`src/lib/progress/progress.storage.ts`** — uses `createIsomorphicFn`
  (TanStack Start) plus `localStorage`. The pure helpers
  `parseStoredProgress`, `readStoredProgress`, and
  `migrateLegacyProgressIfNeeded` already accept a `StorageReader` /
  `StorageWriter` interface, so the platform-neutral split is in place.
  A native client would supply its own `StorageReader`/`StorageWriter`
  backed by `expo-secure-store` (for sensitive blobs) or AsyncStorage
  (for cache-only progress). **No refactor needed in this iteration.**
- **`src/lib/progress/progress.store.ts`** — TanStack Store singleton plus
  `setupCrossTabSync` (uses `window.addEventListener("storage", …)`). The
  store itself is platform-neutral; the cross-tab sync hook is
  browser-only by design and short-circuits cleanly when `window` is
  undefined. A native client would skip `setupCrossTabSync` entirely. No
  refactor needed.
- **`src/lib/practice/use-strip-legacy-seed-params.ts`** — React effect
  hook bound to TanStack Router's `useLocation` and `useNavigate`. The
  pure URL-cleaning logic was extracted into
  `stripLegacySeedParamsFromHref` in `seed-search.ts` (see `I13D2`). The
  hook is now a thin router-binding shell — appropriate to live next to
  the router.
- **`src/components/progress/ProgressHydrator.tsx`** — calls
  `hydrateProgress`, `setupCrossTabSync`, `progressStore.subscribe`, and
  the server functions through `authClient.useSession`. Browser-only by
  design; native equivalent would be a similar hook that calls the
  server functions through Better Auth's React Native client.
- **`src/routes/settings.tsx`** — uses `document.createElement("a")`,
  `URL.createObjectURL`, `window.confirm`. Web-only export/import UX.
  Native equivalent would use `expo-file-system` / `expo-sharing`.

### Server / TanStack-Start-coupled modules (cannot be called from a native client directly)

These define server functions via `@tanstack/react-start`'s `createServerFn`.
TanStack Start server functions are RPC entry points; a native (non-web)
client cannot import them, but it **can** invoke them over HTTP because
TanStack Start exposes them via the same router that handles route loaders
and actions. We treat the surface area below as the implicit "API contract"
that a future native client must consume over HTTPS.

- **`src/lib/auth/server.ts`** — `getRequestSession`,
  `requireRequestSession`. Wraps `auth.api.getSession({ headers })` from
  Better Auth. Server-only.
- **`src/lib/auth/session.ts`** — `getServerSession` server fn.
- **`src/lib/auth/index.ts`** — Better Auth `betterAuth(...)` configuration.
  Uses cookie-based sessions through `tanstackStartCookies()`. A native
  client would replace cookie storage with the Bearer-plus-Expo-secure-store
  flow described in `I13D4`.
- **`src/lib/auth/client.ts`** — `createAuthClient` from
  `better-auth/react`. Web client only. Native uses
  `better-auth/react-native` (see `I13D4`).
- **`src/lib/auth/email.ts`**, **`src/lib/auth/config.ts`**,
  **`src/lib/auth/env.ts`** — server-side env parsing and email senders.
  Already platform-neutral as far as the web app is concerned and remain
  on the server.
- **`src/lib/entitlements/entitlements.sync.ts`** — `getCurrentEntitlements`,
  `requireCapability` server fns. The pure `resolveEntitlementsForUserId`
  beneath them is server-only (it queries Drizzle), but the **shape** of
  its return value is platform-neutral.
- **`src/lib/practice/practice-runs.sync.ts`** — `getLessonPracticeRouteData`,
  `getArenaPracticeRouteData`, `createLessonPracticeRun`,
  `createArenaCardsRun`, `createArenaScenarioRun` server fns plus the
  `getOrCreateUserPracticeSeed` / `rotateUserPracticeSeed` helpers. These
  are the canonical server-owned seed boundary established in `#28`.
- **`src/lib/progress/progress.sync.ts`** — `readServerProgress`,
  `writeServerProgress`, `mergeAnonymousProgressOnSignIn` server fns.
- **`src/lib/account/account-rights.sync.ts`** — account export server fn.
- **`src/lib/billing/creem.ts`** — uses `node:crypto`. Server-only by design.

### IDs, certificate URLs, and premium capability names

Audit goal: ensure none of these are derived from URL state or otherwise
unstable across surfaces.

- **Lesson IDs** — `Lesson.slug` is the canonical lesson identifier. Set in
  `lessonDefinitions` (content layer) and used as the progress key via
  `getLessonProgressKey`. Stable across web and native.
- **Drill IDs** — composed as `${familyId}:${variantId}` in
  `materializeFamilyDrill`. Progress is keyed via `progressKey ?? familyId`
  (see `getDrillProgressKey`). Stable.
- **Scenario IDs** — `Scenario.id` from `scenarioFamilies`. Progress is
  keyed by `progressKey ?? scenarioFamilyId ?? id`. Stable.
- **Practice seeds** — server-owned in `practice_seeds` (Postgres), keyed
  by `(user_id, surface, scope)`. Never appear in URLs after `#28`.
  `arenaPracticeSearchSchema` carries only the optional `scenario` id; all
  three legacy seed params are stripped on the way in, both via the schema
  and via `stripLegacySeedParamsFromHref` for any internal navigation that
  reintroduces them.
- **Certificate identifiers and credential URLs** — defined by the
  `certificates` table in `src/lib/db/schema.ts`:
  - `id` — primary key, server-issued.
  - `credentialId` — public, unique credential identifier (UUID-shaped),
    exposed on certificate pages and in LinkedIn-credential metadata.
  - `credentialUrl` — opaque public URL stored on the row.
  - **None of these are derived from URL state**: the route layer reads
    them from the certificate row, and the route layer's URL is derived
    from `credentialId`, not the other way around.
- **Premium capability names** — defined in `CAPABILITY_BUNDLES`
  (`src/lib/entitlements/entitlements.ts`) and referenced by name in
  `access-policy.ts`. They are **string constants in the domain layer**,
  never derived from URLs or route state. Both web and native clients can
  read these names by calling `getCurrentEntitlements()` and applying the
  same `hasCapability()` predicate.

### Functions that depend on TanStack Router/Start internals a native client cannot call

| Module | Function | Native impact |
| ------ | -------- | ------------- |
| `src/lib/practice/use-strip-legacy-seed-params.ts` | `useStripLegacySeedParams` | React-Router-bound effect. Native router would call `stripLegacySeedParamsFromHref` (now pure) before navigating. |
| `src/lib/auth/session.ts` | `getServerSession` | Server fn invoked from web. Native calls `auth.api.getSession()` over HTTPS via Better Auth's React Native client. |
| `src/lib/auth/server.ts` | `getRequestSession`, `requireRequestSession` | Reads cookies via `getRequestHeaders()`. Native flow uses Bearer token auth (see `I13D4`). |
| `src/lib/entitlements/entitlements.sync.ts` | `getCurrentEntitlements`, `requireCapability` | RPC. Native calls these via the server-fn HTTP transport or a public-shaped HTTP endpoint (see `I13D5`). |
| `src/lib/practice/practice-runs.sync.ts` | `getLessonPracticeRouteData`, `getArenaPracticeRouteData`, `createLessonPracticeRun`, `createArenaCardsRun`, `createArenaScenarioRun` | RPC. Same — must be reachable over HTTPS with Bearer auth from native. |
| `src/lib/progress/progress.sync.ts` | `readServerProgress`, `writeServerProgress`, `mergeAnonymousProgressOnSignIn` | RPC. Same. |
| `src/lib/account/account-rights.sync.ts` | account export server fn | RPC. Same. |

None of the **pure domain logic** depends on TanStack Router or Start
internals. The dependency is exclusively at the RPC boundary, which is
where it should be.

---

## `I13D2` — Platform-neutral boundaries (refactor done in this branch)

The audit found exactly one piece of meaningful leakage that warranted a
small, surgical refactor in this iteration:

### Refactor: extract `stripLegacySeedParamsFromHref` from the router hook

- **Before.** `src/lib/practice/use-strip-legacy-seed-params.ts` mixed two
  concerns: the React + TanStack Router binding (`useLocation`,
  `useNavigate`, `useEffect`) and the pure URL-cleaning logic (parse the
  `href`, walk `LEGACY_SEED_SEARCH_PARAMS`, rebuild a clean
  `pathname+search+hash`).
- **After.** `src/lib/practice/seed-search.ts` now exports
  `stripLegacySeedParamsFromHref(href: string): { changed: boolean; href: string }`,
  a pure function with no React, router, or browser dependency. The hook
  in `use-strip-legacy-seed-params.ts` is now a thin shell that delegates
  to the pure helper and only owns the router binding.
- **Tests.** Four new unit tests in
  `src/lib/practice/seed-search.test.ts` cover: the no-op case, preserved
  non-legacy params plus hash fragment, all-three-legacy-params removal,
  and accepting hrefs with no leading slash.
- **Web behavior.** Identical. The hook still calls `navigate` with
  `{ replace: true, resetScroll: false }` exactly as before; only the
  string transformation moved.

### Why the other audited modules did **not** need refactoring

- **`progress.storage.ts`** already separates the pure
  `readStoredProgress(StorageReader)` /
  `migrateLegacyProgressIfNeeded(StorageWriter, …)` helpers from the
  `createIsomorphicFn`-bound `loadProgress` / `saveProgress` /
  `clearProgress` adapters. A native build would supply a different
  `StorageReader` / `StorageWriter` (e.g. AsyncStorage-backed) and reuse
  the helpers unchanged.
- **`progress.store.ts`** already guards `setupCrossTabSync` with
  `typeof window === "undefined"` and returns a `noop` teardown. The
  store, hydration, and snapshot helpers are platform-neutral. Splitting
  the cross-tab logic into its own file would add one import per call site
  for no current benefit; a native build can simply not call
  `setupCrossTabSync`.
- **`practice-runs.ts`** already exposes platform-neutral builders. The
  `.sync.ts` neighbour is the server-fn layer, which is the right place
  for the RPC binding.
- **`entitlements.ts`** and **`access-policy.ts`** are already pure.
- **`creem.ts`** is intentionally server-side; native clients consume its
  output via the entitlement endpoint, not directly.

### Boundary contract (recap)

The refactor consolidates the boundary so a future native client follows
the same rules the web client already follows:

- `src/content/*` — read-only, platform-neutral content + runtime.
- `src/lib/randomization.ts` — pure deterministic randomization.
- `src/lib/progress/progress.{schema,merge,actions,hydration,store}.ts` —
  pure progress logic + platform-neutral store.
- `src/lib/progress/progress.storage.ts` — platform-neutral parser /
  migrator helpers + a browser-only adapter; a native build replaces the
  adapter only.
- `src/lib/practice/practice-runs.ts` — pure run builders.
- `src/lib/practice/seed-search.ts` — pure schemas + URL helper.
- `src/lib/entitlements/{entitlements,access-policy}.ts` — pure.
- `src/lib/billing/creem.ts` — server-only, by design.
- `src/lib/**/*.sync.ts` — server-fn layer (HTTPS contract for native).

No separate package or workspace was introduced. Everything stays inside
`src/`, matching the issue's explicit out-of-scope list.

---

## `I13D3` — Likely native stack and app strategy

### Recommended default: Expo + React Native + TanStack Router (native)

**Why Expo + React Native:**

- **Maximum domain-code share.** Every module marked
  "platform-neutral domain module" in `I13D1` is plain TypeScript and runs
  unchanged on the React Native JS runtime (Hermes). Realistically that
  means `src/content/*`, `src/lib/randomization.ts`,
  `src/lib/progress/progress.{schema,merge,actions,hydration}.ts`,
  `src/lib/practice/practice-runs.ts` (excluding the React-Native-specific
  crypto polyfill choice), `src/lib/practice/seed-search.ts`, and
  `src/lib/entitlements/*` ship as-is. By line count this is roughly
  **40–50 % of the v2 source tree** and **close to 100 % of the
  curriculum, scoring, randomization, and entitlement decision logic**.
  This is the load-bearing answer to "how much can really be shared":
  *the pure domain layer can be shared verbatim; nothing else needs to
  be.*
- **TanStack alignment.** TanStack Router publishes a native build
  (`@tanstack/react-router` runs in React Native via the `History` /
  in-memory history adapter, and `@tanstack/react-query` is already
  cross-platform). A native client gets type-safe routes, loaders, and
  search-param validation with the same mental model the web app uses.
- **Better Auth has a first-class React Native client**
  (`better-auth/react-native`) that handles secure token storage, Bearer
  authorization, and deep-link callback URLs with very little
  ceremony — the topic is documented in detail in `I13D4`.
- **Single repo, single TypeScript codebase.** No need for pnpm
  workspaces, Turbo, or Nx until there is a *second* consumer with
  enough share to justify it. We deliberately keep everything inside
  `src/` and let the native app import from `src/lib/*` and
  `src/content/*` via TypeScript path aliases when the time comes.
- **Expo SDK gives us the native primitives we need.** `expo-router` (or
  TanStack Router native), `expo-secure-store`, `expo-crypto`,
  `expo-notifications`, `expo-linking` (deep links),
  `expo-web-browser` (OAuth flows), `expo-file-system`, and EAS Build /
  Submit cover the surface area in `I13D5`.

**What stays web-only:**

- `src/routes/*` — TanStack Start file-based routes, SSR meta tags,
  sitemap, `robots.txt`, OG image generation, and the marketing
  landing/wiki/directory surfaces. The native app is a learner-only
  client; SEO and crawlability remain web concerns.
- `src/components/*` UI built around Tailwind v4, Radix primitives,
  Lucide, and shadcn/ui. **None** of this transfers directly to React
  Native; the native app re-implements equivalent screens with native
  primitives (`react-native`, `react-native-reanimated`,
  `expo-symbols`, `nativewind` if Tailwind class re-use is desired).
- `src/lib/seo/*`, OG asset generation, and any `<meta>` / `<link>`
  surface.
- `src/components/progress/ProgressHydrator.tsx`, `setupCrossTabSync`,
  and the export/import flow in `src/routes/settings.tsx`.
- All Better Auth web cookie wiring (`tanstackStartCookies()`,
  `crossSubDomainCookies`, `useSecureCookies`) — replaced by Bearer +
  secure storage on native.
- Sentry web init (`src/instrument.client.ts`); native uses
  `@sentry/react-native` initialised on app start.

**What stays shared:**

- The entire content layer (`src/content/*`).
- `src/lib/randomization.ts`.
- `src/lib/progress/progress.{schema,merge,actions,hydration}.ts` plus
  the platform-neutral helpers in `progress.storage.ts`
  (`readStoredProgress`, `migrateLegacyProgressIfNeeded`, the storage
  interfaces).
- `src/lib/practice/practice-runs.ts` and `src/lib/practice/seed-search.ts`
  (post-`I13D2`).
- `src/lib/entitlements/{entitlements,access-policy}.ts`.
- The `Drill`, `Lesson`, `Scenario`, and `ResolvedEntitlements` types in
  `src/content/types.ts` and `src/lib/entitlements/entitlements.ts`.

### Strategy option A — fully native client (default)

- Expo SDK app under a future `apps/native/` (introduced *only* when the
  native app actually starts; out of scope here).
- Imports shared logic from `src/lib/*` and `src/content/*` directly via
  a TypeScript path alias.
- Calls Shipping API Dojo's HTTPS endpoints (server functions plus
  `/api/auth/*`) using Bearer tokens stored in `expo-secure-store`.
- Owns its own UI layer, navigation, and offline cache (see `I13D5`).
- App-store distribution via EAS Build + EAS Submit.

**Pros.** Best UX, full offline support, deep-linking, push notifications,
biometric gate, and access to native APIs. Best long-term answer.

**Cons.** Higher up-front cost: native UI must be re-implemented; CI must
add EAS pipelines; `#26` Sentry needs a native instance; app-store review
overhead; Apple in-app purchase considerations (`I13D5`).

### Strategy option B — thin native shell over the hosted web app

- Expo app that wraps the hosted `https://shipping.apidojo.app` site in a
  WebView (`react-native-webview`).
- Adds: deep-linking via `expo-linking`, push notifications via
  `expo-notifications`, biometric unlock before showing the WebView,
  optional native splash, and crash reporting.
- Auth still flows through cookies inside the WebView; the shell mostly
  exists to ship to the App Store / Play Store and own push.

**Pros.** Days of work, near-zero domain-share complexity, single
codebase truly shared, single Sentry instance.

**Cons.** Apple may reject "thin wrappers" under guideline 4.2; offline
support is whatever the PWA provides; no biometric gate inside the web
view; app-store billing path is awkward; UX is "browser inside an app,"
not native.

**Recommendation.** Default to Option A when there is a real native
demand signal (typically learner-side requests, paid tier conversions
from mobile-heavy traffic, or an EDI sibling app shipping first). Use
Option B only as a holding pattern if the demand signal is unclear and
we want a defensible app-store presence quickly. Either way, the
platform-neutral boundary documented above is what makes Option A cheap
when we are ready.

---

## `I13D4` — Future auth/session approach for native clients

This is design-only; **no code changes here**. The intent is that when a
native client begins, the web app's Better Auth configuration is reused
unchanged on the server, and only the *client* configuration changes.

### Token storage and transport

- **Web (today).** `tanstackStartCookies()` plugin stores the session in
  an HTTP-only cookie. `getCrossSubdomainCookieConfig` covers
  `apidojo.app` subdomains. `useSecureCookies` follows
  `BETTER_AUTH_URL`'s protocol.
- **Native (future).** Switch to **Bearer token** transport:
  - On the client, configure
    `createAuthClient` from `better-auth/react-native` with
    `baseURL: process.env.EXPO_PUBLIC_AUTH_BASE_URL` and the
    `expoClient({ scheme, storage })` plugin so Better Auth automatically
    persists the session token in `expo-secure-store` and attaches it as
    `Authorization: Bearer <token>` to every fetch.
  - On the server, enable Better Auth's `bearer()` plugin alongside the
    existing `tanstackStartCookies()` plugin. This is additive — web
    cookie auth keeps working, and the server starts accepting Bearer
    tokens for the same session model.
  - Add the native app's deep-link scheme(s) to
    `BETTER_AUTH_TRUSTED_ORIGINS` so OAuth and magic-link callbacks can
    return to the app via `myapp://auth/callback`.
- **Storage choice.**
  - `expo-secure-store` for the session token (keychain on iOS,
    Keystore on Android). Required.
  - `expo-secure-store` *or* AsyncStorage for the cached progress
    snapshot. Progress is non-secret, so AsyncStorage is adequate; we
    standardise on `expo-secure-store` only if device theft becomes a
    real concern for paid learners.
  - **Never** use AsyncStorage for the auth token.

### Refresh strategy

- Better Auth manages session expiry server-side
  (`session.expiresIn = 30d`, `updateAge = 1d`). The Bearer plugin
  rotates tokens on activity using the same model. The native client
  reads the latest token from `getSession()` and lets the SDK persist it.
- On 401, the native client calls `signOut()` and routes the user back
  to the auth screen — same UX rule as web.
- We do **not** roll our own refresh token plumbing; Better Auth's
  built-in session refresh is sufficient and matches the v2 web flow.

### Deep-link callback URLs

- Reserve a custom scheme on app config — e.g.
  `shippingapidojo://`. Configure `expo-linking` and add the matching
  intent filters to the EAS app config.
- Magic-link emails (currently sent through
  `src/lib/auth/email.ts → sendMagicLinkEmail`) must support a
  *different* callback URL on native than on web. Better Auth's
  `magicLink` plugin already accepts `callbackURL` per request; the
  native client passes its `shippingapidojo://auth/magic-link`
  destination, the web client passes the existing web URL. The same
  underlying email template can branch on user-agent or session origin.
- Universal Links / App Links can be added later if we want
  `https://shipping.apidojo.app/auth/...` to open the app instead of the
  browser; this requires hosting `apple-app-site-association` and
  `assetlinks.json` files under the existing web origin.

### Biometric gate

- Optional but recommended for paid learners. Use
  `expo-local-authentication` to prompt for Face ID / Touch ID /
  device PIN before unlocking the cached entitlement state and progress
  on app launch.
- Gate is **client-side UX only**. The Bearer token in
  `expo-secure-store` already requires device unlock; the biometric
  prompt is a defence-in-depth layer that prevents an unlocked device
  from showing private learner state.
- If the gate fails N times, fall back to anonymous mode (read-only
  Free content) until the user explicitly signs back in.

### Device-bound sessions

- Better Auth's session table already records `userAgent` and IP. For
  native clients, store the install's `Application.applicationId` plus a
  `Device.osName` / `Device.osVersion` snapshot in the session metadata
  on first sign-in (custom field on the `session` table or via the
  Better Auth `databaseHooks.session.create.after` hook when we
  introduce it). This lets us build a "signed-in devices" surface in
  `/settings` for both web and native, and lets us revoke a single
  device without invalidating every session.
- We do **not** do hardware attestation for v1. We trust the OS
  secure-storage primitives and the Better Auth session expiry model.

### What does **not** change on the server

- The `auth` instance in `src/lib/auth/index.ts`, the user / account /
  session / verification tables, the welcome email lifecycle hook, and
  the `crossSubDomainCookies` / `trustedProxyHeaders` /
  `useSecureCookies` web concerns all stay exactly as they are. Native
  is purely additive.

---

## `I13D5` — API, deep-linking, offline, and app-store follow-up

### Public API shape

A native client cannot import TanStack Start server functions; it can,
however, call them over HTTPS as JSON RPCs because TanStack Start
already exposes them on the same router that handles route loaders. For
v1 we treat the existing server-fn endpoints as the implicit public API
and document their shape; we **do not** add a parallel `/api/v1/*`
surface yet.

The endpoints that must remain stable for native clients are:

- **Auth.** `/api/auth/*` (Better Auth handler) — sign-in, sign-out,
  magic-link request and verification, password reset.
- **Session.** `getServerSession`.
- **Progress.** `readServerProgress`, `writeServerProgress`,
  `mergeAnonymousProgressOnSignIn`.
- **Entitlements.** `getCurrentEntitlements`, `requireCapability`.
- **Practice (lessons + arena).**
  `getLessonPracticeRouteData`, `getArenaPracticeRouteData`,
  `createLessonPracticeRun`, `createArenaCardsRun`,
  `createArenaScenarioRun`.
- **Account rights.** account export server fn.

Stability rules (recommended once the native client work begins):

- Treat these server fns' input schemas (Zod) and return shapes as
  **contract**. Any breaking change ships behind a new function or a
  new `version` discriminator.
- Add an API versioning prefix (e.g. `/_serverFn/v1/...`) only when the
  first non-v1 client appears. Until then, "the current shape" is the
  contract.
- Do not include URL-state-derived seeds, cookie values, or browser
  request shapes in the response payloads. (Already true after `#28`.)

### Deep-link URL scheme

- **Custom scheme.** `shippingapidojo://` reserved for the native app.
- **Top-level deep links.**
  - `shippingapidojo://learn/{track}` → opens the corresponding learn
    hub.
  - `shippingapidojo://lesson/{slug}` → opens a specific lesson.
  - `shippingapidojo://arena` and `shippingapidojo://arena/{scenarioId}`.
  - `shippingapidojo://wiki/{slug}` and
    `shippingapidojo://directory`.
  - `shippingapidojo://settings`.
  - `shippingapidojo://auth/magic-link?token=...` and
    `shippingapidojo://auth/callback` — Better Auth callbacks.
  - `shippingapidojo://certificate/{credentialId}` — opens the
    certificate detail screen using the canonical `credentialId` from
    the `certificates` table (not a URL-derived value).
- **Universal Links.** Defer until v1 native ships and there is a need
  to convert `https://shipping.apidojo.app/lesson/{slug}` clicks into
  app launches. Adding universal links is an apex-domain concern (host
  `apple-app-site-association` + `assetlinks.json` under the existing
  web origin) and is independent of the local-link scheme above.

### Offline cache and sync conflict rules

- **What is cached on device.**
  - Curriculum: `src/content/*` ships in the app bundle on each EAS
    build. No network required to read lessons, drills, scenarios,
    wiki, or directory entries.
  - Progress snapshot: persisted in AsyncStorage (or
    `expo-secure-store` if biometric gating is enabled), keyed by user
    id for signed-in users and by an anonymous device id for
    sign-out-then-sign-in flows.
  - Entitlement snapshot: cached for ≤ 24 h; falls back to
    `fallbackFreeEntitlements()` if the cache is stale **and** the
    network is unreachable.
  - Practice seeds: not cached. Native always asks the server for the
    current `(user_id, surface, scope)` seed; offline practice falls
    back to anonymous demo seeds (`getAnonymous*Seed`) and is
    explicitly marked non-certificate-bearing — same rule the web app
    follows for anonymous users.
- **Sync conflict rules.** Re-use the v2 web rules:
  - On every successful auth + reconnect, call
    `mergeAnonymousProgressOnSignIn` with the local snapshot. If the
    server is empty, take local. If both exist, the server returns
    `requiresDecision = true` and the native UI surfaces the
    "merge / keep server" choice the same way the web UI does.
  - For background writes during a session, `writeServerProgress` is
    last-write-wins per user (a single row). Native runs the same
    300 ms debounce the web client uses.
  - Offline-only mode: queue writes locally and replay on reconnect,
    falling back to the merge flow if a conflict is detected by
    timestamp diff in `mergeProgressSnapshots`.
- **Certificates.** Always re-fetched from the server. We never trust
  a locally cached certificate row as authoritative.

### Push-notification surface

- **Provider.** `expo-notifications` + Expo Push (or APNs / FCM
  directly if Expo Push is not viable for our org).
- **Initial use cases.**
  - Streak reminders ("you're on a 4-day streak, keep going").
  - Weekly review-mode availability for paid tiers.
  - Subscription state changes (Pro paused, payment failed) — already
    sent by Resend lifecycle email; the native push is additive.
  - Certificate-issued notification once `certificate.basic` flows
    ship.
- **Token management.** Add a `device_push_tokens` table (mirrors the
  web `email_events` pattern) keyed on `user_id`, `device_id`,
  `platform` (`ios` | `android`), `token`. The native app registers on
  permission grant and de-registers on sign-out.
- **Privacy.** No PII or learner content in payloads; payloads
  reference canonical IDs only (lesson slug, scenario id, credential
  id) and the native app fetches the full content over HTTPS.
- **Out of scope.** Cross-device push fan-out, analytics on push
  open-rate, and silent background pushes for cache invalidation —
  defer until the native app has real users.

### App-store billing vs hosted-web billing

- **Status quo (web).** Creem checkout, webhooks → `subscriptions`
  table → entitlement resolution. No app-store involvement.
- **App-store rules.**
  - **Apple App Store.** Guideline 3.1.1 requires in-app purchase
    (IAP) for unlocking digital functionality consumed inside the app.
    Continuing to bill via Creem on the web is fine; *forcing* the
    native user to purchase Pro from the app instead is the gray area.
    The pragmatic v1 approach is:
    1. Allow the native app to read web-purchased entitlements (Creem
       sub via Bearer-authenticated entitlement endpoint). Users who
       buy on the web see Pro unlocked on native. ✅
    2. **Do not** include in-app upgrade CTAs that link to an external
       checkout URL inside the app — Apple disallows this for digital
       goods.
    3. Either (a) gate the native upgrade flow behind StoreKit IAP
       and reconcile via Apple's S2S notifications, or (b) ship the
       native app *without* an in-app upgrade flow at all and direct
       paid acquisition to the web. Option (b) is the recommended v1
       path; option (a) is the long-term direction once paid mobile
       traffic justifies the integration.
  - **Google Play.** Similar rules under Play's Payments policy, with
    slightly more flexibility for "external account" links (under the
    EU DMA + recent US settlements). Same v1 recommendation: read
    web-purchased entitlements, do not host an upgrade flow inside the
    app.
- **Reconciliation.** When IAP is added, route StoreKit / Play Billing
  webhooks into a new `app_store_subscriptions` table parallel to
  `subscriptions`, and have `resolveEntitlementsForUserId` take the
  *highest* tier across providers. The capability bundles
  (`CAPABILITY_BUNDLES`) stay unchanged — only the source of the tier
  changes.
- **Tier mapping.** The native app reads
  `getCurrentEntitlements` and applies the exact same
  `hasCapability(...)` predicates that `access-policy.ts` uses today.

### Follow-up issues to file *after* this strategy lands

These are intentionally **not** opened from this thread:

- Add public-API shape documentation under `specs/api/` once the first
  non-web client begins.
- Add `device_push_tokens` table + native push registration (when the
  native app starts).
- Add Apple StoreKit / Play Billing integration and dual-source
  reconciliation in `resolveEntitlementsForUserId` (deferred until
  paid mobile traffic justifies it).
- Add universal-link configuration (`apple-app-site-association`,
  `assetlinks.json`) once the native app is in TestFlight.

---

## Validation

- `pnpm format` — clean
- `pnpm lint` — clean
- `pnpm typecheck` — clean
- `pnpm test --run` — all suites pass, including the four new
  `stripLegacySeedParamsFromHref` cases

## Out of scope (confirmed)

- Native app code, React Native dependencies, Expo SDK installs.
- pnpm workspaces, Turbo, Nx, or any monorepo tooling.
- User-visible web behavior changes.
- Issue `#15` deep wiki expansion work.

## Acceptance criteria mapping

- `I13D1` — covered by the audit table above.
- `I13D2` — covered by the
  `stripLegacySeedParamsFromHref` extraction + 4 new tests; remaining
  modules verified as already platform-neutral.
- `I13D3` — covered by the Expo + React Native recommendation, the
  shared-vs-web-only matrix, and the two-option strategy.
- `I13D4` — covered by the Bearer + `expo-secure-store` + magic-link
  deep-link plan.
- `I13D5` — covered by the public-API list, deep-link scheme, offline
  rules, push surface, and Apple/Google billing strategy.
