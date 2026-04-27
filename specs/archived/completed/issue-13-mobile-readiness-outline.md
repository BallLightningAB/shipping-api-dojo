# Mobile Readiness and Native App Strategy Plan

Date: 2026-03-17
Issue: [#13](https://github.com/BallLightningAB/shipping-api-dojo/issues/13)
Branch: `codex/issue-13-mobile-readiness`
Scope: Follow-on strategy only after the web v2 work is complete.

## Rough Estimate

- Dev: 6h
- Test/validation: 3h

## Goal

Define how Shipping API Dojo can become a future native product without forcing premature complexity into the current web-first implementation.

## Deliverable Mapping

- `I13D1`: review the v2 architecture for mobile blockers
- `I13D2`: define the platform-neutral boundaries required for a future native client
- `I13D3`: decide the likely native stack and app strategy
- `I13D4`: define the future auth/session approach for native clients
- `I13D5`: define the API, deep-linking, offline, and app-store follow-up work

## Current Recommendation

- finish the web v2 first
- keep the current implementation web-first
- protect platform-neutral domain logic now so native can reuse it later
- treat React Native with Expo as the likely future mobile direction unless a later constraint changes that

## Mobile-Neutral Requirements For Web V2

- content family definitions stay independent of React route components
- scoring and run-generation logic stay independent of browser-only APIs
- progress, entitlements, certificates, and challenge runs are exposed through backend contracts that a native client can call later
- local browser storage stays a client-side cache or anonymous-only mechanism, not the long-term canonical model
- IDs, certificate URLs, and premium capability names stay stable across surfaces
- web-only SEO concerns such as canonicals, sitemaps, and route metadata stay at the route layer rather than polluting shared domain logic

## Topics To Resolve Later

- native auth flow with Better Auth
- offline caching and sync conflict rules
- push notifications and reminder logic
- deep-linking into lessons, challenges, and certificates
- app-store billing versus hosted-web billing strategy
- how much code can actually be shared between web and native clients

## Acceptance Criteria

- the follow-up issue clearly captures the mobile path without inflating current scope
- the web v2 plans preserve platform-neutral boundaries where that adds real future leverage

## Validation And Iteration

- validate the mobile-readiness recommendations against the actual `#7`, `#11`, `#8`, and `#9` implementation plans
- flag any web-only assumption that would force a future native rewrite of core learning, progress, or entitlement logic
