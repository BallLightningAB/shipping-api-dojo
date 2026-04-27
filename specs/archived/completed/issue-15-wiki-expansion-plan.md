# Issue 15 Wiki Expansion — Long-Form Plan

Date: 2026-04-25
Issue: [#15](https://github.com/BallLightningAB/shipping-api-dojo/issues/15)
Branch: `codex/issue-15-wiki-expansion`
Outline source-of-truth: `specs/current-changes/issue-15-wiki-expansion-outline.md`
Status: in-progress

## Scope Reminder

This plan extends the issue `#9` curriculum-supporting wiki into a durable carrier-reference library. It is the in-scope `I5D10` slice of the v2 umbrella (`#5`). It must not:

- duplicate or reorganize the curriculum-supporting wiki entries that issue `#9` shipped (`/wiki/idempotency`, `/wiki/retry-strategies`, `/wiki/soap-fault`, etc.);
- add curriculum (lessons, drills, scenario families);
- touch paywall/entitlement, randomization, or progress contracts;
- ship mobile-native readiness work (that stays in `#13`).

It does:

- introduce a new content type for carrier surfaces (vendor + business unit + region + protocol);
- expose those surfaces through a stable URL convention and a parallel route subtree;
- extend the directory with vendor-aware metadata (deprecation, sandbox, protocol tooling);
- harden SEO (canonicals, sitemap, internal links, JSON-LD: `Article`, `BreadcrumbList`, `FAQPage`).

## I15D1 — Taxonomy and URL Conventions

### Taxonomy axes

A carrier API surface is uniquely identified by four axes:

1. **Vendor** — the carrier brand (`DHL`, `UPS`, `FedEx`, `USPS`, `Royal Mail`, `La Poste`, `Australia Post`, `Japan Post`, regional consolidators).
2. **Business unit / product line** — the carrier's internal API product. DHL is the canonical example: `Express` (MyDHL API), `eCommerce Solutions` (Americas/EU), `Parcel DE` (Post & Parcel Germany), and `Freight` are completely different APIs. Treating them as one "DHL API" loses real behavior.
3. **Region / country** — region-specific endpoints, regulatory scope, language, and credentialing differ per country. Examples: DHL Express is global, DHL Parcel DE is Germany-only, FedEx Ground is US/CA-only.
4. **Protocol / documentation surface** — REST, SOAP, EDI X12, EDIFACT, GraphQL, or webhook. A vendor can offer the same business unit through more than one protocol family (UPS once supported both XML and REST; FedEx still has SOAP web services alongside the modern REST suite).

Every page in `/wiki/carriers/...` must be specific on all four axes. Generic "DHL", "FedEx", "USPS" hub pages are explicitly out of scope because they hide the real differences carriers have between business units and protocols.

### Slug pattern

Slug format (lowercase, hyphenated, no trailing path components):

```
{vendor}-{business-unit}-{region}-{protocol}[-{product-name}]
```

Examples:

- `dhl-express-global-mydhl-rest`
- `dhl-ecommerce-americas-rest`
- `dhl-parcel-de-rest`
- `ups-global-rest-oauth`
- `fedex-express-us-rest`
- `fedex-express-global-soap-legacy`
- `usps-us-apis-rest`
- `usps-us-webtools-legacy`
- `royal-mail-uk-shipping-v3-rest`
- `la-poste-colissimo-fr-soap`
- `australia-post-au-shipping-rest`
- `japan-post-jp-tracking-rest`

The slug is treated as **immutable** once published. If the vendor renames the API later, the new name is added as an `apiName` alias on the existing carrier surface entry; the slug stays. Slug rename would cost canonical equity and break inbound links, neither of which we trade for cosmetic taxonomy upgrades.

### URL convention

Two routes, deliberately split:

- `/wiki/$slug` — concept articles (idempotency, retry strategies, SOAP fault, etc.). Existing `#9` content stays here. No taxonomy collision.
- `/wiki/carriers/$slug` — vendor surface pages governed by the slug pattern above.

This split lets us introduce later hierarchical routes (`/wiki/carriers/$vendor/$businessUnit/$region/$protocol`) without breaking inbound links. When that day comes, the canonical for the flat slug stays the canonical, and the hierarchical paths redirect to it.

A `/wiki/carriers/` index provides browsing by vendor → business unit → region; it is **not** the canonical for any individual surface (the per-surface page is the canonical).

### Stability rules

- Slug is immutable.
- Canonical is `${SITE_URL}/wiki/carriers/${slug}` (no trailing slash, no query).
- New axes (e.g., a fifth axis like `audience`) get added as optional metadata fields on the carrier surface, not as new URL segments.
- If an API is sunset, the page stays online with a `status: "sunset"` flag and a `replacement` cross-link, rather than getting deleted. Sunset pages are still indexed because they remain the canonical answer to "is this API still supported?"
- Status changes (active → deprecated → sunset) update `lastReviewed` and surface a visible deprecation banner, but do not change the slug or the canonical.

## I15D2 — Highest-Value Carrier Surfaces

Acquisition value (per the issue `#5` umbrella) is driven by:

- search volume for "{carrier} API integration" intent queries;
- developer pain (carrier known for breaking changes, unreliable docs, or aggressive sunsets);
- topical authority — coverage of the major shipping markets (US, EU/DE/UK/FR, APAC) signals that the dojo is a real reference, not a single-carrier site;
- protocol coverage — REST (modern), SOAP (legacy), EDI (B2B logistics), and webhooks must each appear at least once so the curriculum support and the carrier reference reinforce each other.

### Priority order (8–13 surfaces, justified)

1. **`dhl-express-global-mydhl-rest`** — DHL Express MyDHL API (REST, OAuth 2.0, global). Largest international express carrier; high search intent for "MyDHL API". Anchors the DHL business-unit split.
2. **`dhl-ecommerce-americas-rest`** — DHL eCommerce Solutions Americas (REST). Completely separate API from MyDHL. Common confusion when devs assume "DHL" is one API.
3. **`dhl-parcel-de-rest`** — DHL Post & Parcel Germany (REST, formerly XML/SOAP). Critical for EU shippers and a different credentialing path than Express.
3a. **`dhl-freight-se-rest`** — DHL Freight Sweden API Farm (REST). Fourth distinct DHL business unit. Wholly separate portal (`dhlpaket.se/dashboard/services/api-farm`), base URLs (`api.freight-logistics.dhl.com`), and per-application GUID API-key auth. The DHL Group portal at `developer.dhl.com` explicitly redirects Sweden traffic here, so omitting the page would 404 the canonical destination for that intent.
4. **`ups-global-rest-oauth`** — UPS Developer APIs (REST + OAuth 2.0). Modern UPS surface after the legacy XML/SOAP sunset on 2024-06-03; OAuth migration is still the most-asked UPS integration question.
5. **`ups-global-xml-legacy`** — UPS XML/SOAP legacy (sunset). Marked `status: "sunset"`. Kept indexed because legacy integrators still search "UPS XML API" and need to land on a clear replacement notice rather than a 404.
6. **`fedex-express-us-rest`** — FedEx REST APIs via developer.fedex.com (Ship/Rate/Track/Address Validation). Default modern FedEx surface and a high-traffic search target.
7. **`fedex-express-global-soap-legacy`** — FedEx Web Services (SOAP, WSDL-driven). Still in production with active integrators; the page anchors the SOAP curriculum support to a real-world WSDL.
8. **`usps-us-apis-rest`** — USPS APIs v3 (REST, OAuth 2.0). The current USPS surface after the Web Tools deprecation. High search volume; high acquisition value because USPS docs are notoriously sparse.
9. **`usps-us-webtools-legacy`** — USPS Web Tools (legacy XML over HTTP). Marked `status: "deprecated"`. Same indexed-redirect rationale as the UPS XML legacy page.
10. **`royal-mail-uk-shipping-v3-rest`** — Royal Mail Shipping API V3 (REST, UK). Anchors UK coverage and a non-OAuth bearer-token auth flow that confuses first-time integrators.
11. **`la-poste-colissimo-fr-soap`** — La Poste Colissimo (SOAP, France). Anchors the French market and a working SOAP/WSDL example for the SOAP curriculum.
12. **`australia-post-au-shipping-rest`** — Australia Post Shipping & Tracking API (REST). APAC coverage with a recognizable brand.

### Why this ordering

- Slots 1–3 split DHL into its real business units, which is the strongest signal that the dojo treats vendors precisely.
- Slots 4–5 and 8–9 each pair a modern API with its sunset/legacy counterpart. The pairing is itself a content moat: nobody else is documenting the migration questions side by side.
- Slots 6–7 cover both FedEx surfaces (REST and SOAP) — protocol diversity inside the same vendor, which matches the curriculum's REST-and-SOAP framing.
- Slots 10–12 broaden country coverage (UK, FR, AU) without spreading thinly. They each tie to a distinct protocol or auth pattern, so they are not filler.
- Japan Post and regional consolidators were considered but deferred. Japan Post's English documentation surface is comparatively thin; consolidators (EasyPost, Shippo) are aggregators rather than carriers and would warrant a dedicated `aggregator` page type that is out of scope for this slice.

## I15D3 — Carrier Surface Pages

### Content schema

`src/content/types.ts` adds:

- `ProtocolFamily` — `rest | soap | edi-x12 | edi-edifact | graphql | webhook | xml-rpc`.
- `CarrierStatus` — `active | preview | deprecated | sunset | legacy`.
- `CarrierRegion` — `global | us | ca | de | fr | uk | nl | se | au | jp | apac | europe | americas`.
- `CarrierSurface` — vendor, vendorSlug, businessUnit, businessUnitSlug, region, protocol, apiName, slug, title, summary, status, authMethods[], baseUrls{ sandbox?, production? }, officialDocs[], deprecationNotes?, sandboxNotes?, toolingNotes{ wsdlUrl?, openApiUrl?, ediGuideUrl?, graphqlEndpoint?, postmanCollectionUrl? }, body, faqs[], relatedConceptSlugs[], relatedSurfaceSlugs[], directorySlugs[] (cross-link), sources[], lastReviewed (ISO date string).

`src/content/carriers.ts` exports `carrierSurfaces: CarrierSurface[]` and `getCarrierSurfaceBySlug(slug)`. Invariants are tested in `src/content/carriers.test.ts`.

### Authoring rules

- Body length ≥ 180 words, ≤ 600 words for the long-form body alone (each rendered page also carries FAQs, structured surface details, and sources, so total per-page content is materially larger). Each surface answers: who it is for, when to use it vs other surfaces from the same vendor, the auth model, the sandbox model, and the most common breaking-behavior gotchas.
- ≥ 3 FAQs per surface, written as real questions (`How do I get an OAuth token for ...?`). FAQs feed the `FAQPage` JSON-LD.
- ≥ 2 internal links to concept wiki entries (e.g., `oauth-token-lifecycle`, `webhook-signatures`) and ≥ 1 link to a sibling carrier surface where it exists.
- ≥ 2 official-source citations. Carrier marketing pages do not count; the citation must be the developer portal or a public spec/RFC.
- No marketing claims, no SEO copy padding, no bullet lists longer than 6 items.

### Routes

- `src/routes/wiki/carriers/index.tsx` — index grouped by vendor, then business unit. Renders `BreadcrumbList` JSON-LD and is canonical for `/wiki/carriers`.
- `src/routes/wiki/carriers/$slug.tsx` — surface page. Renders `Article` + `BreadcrumbList` + `FAQPage` JSON-LD when FAQs are present. Canonical for `/wiki/carriers/${slug}`.
- `src/routes/wiki/index.tsx` — gain a "Carrier surfaces" section above the existing concepts list, linking out to `/wiki/carriers`.

## I15D4 — Directory Expansion

`DirectoryEntry` gains optional fields:

- `vendor`, `businessUnit`, `region`, `protocols[]`, `status`, `apiName`.
- `deprecation` — `{ effectiveDate?, replacement?, notes }`.
- `sandbox` — `{ available, notes?, url? }`.
- `tooling` — `{ wsdlUrl?, openApiUrl?, ediGuideUrl?, graphqlEndpoint?, postmanCollectionUrl? }`.
- `carrierSlug` — links a directory entry to its `/wiki/carriers/${slug}` surface page.

The `category` enum is unchanged, but the `carrier` category gains real metadata. New entries cover each of the 12 prioritized surfaces' official developer portals plus the protocol-specific tooling references (UPS XML legacy notice, USPS APIs OAuth portal, La Poste Colissimo WSDL, etc.).

Schema invariants (asserted in `src/content/directory.test.ts`):

- All `carrier` category entries carry `vendor` and `region`.
- All entries with `status: "deprecated" | "sunset"` carry `deprecation.notes`.
- All entries with `status: "deprecated"` and a known `replacement` link to a real carrier surface or directory URL.
- All `tooling.wsdlUrl` / `openApiUrl` / `ediGuideUrl` values resolve to absolute HTTPS URLs.
- All `carrierSlug` values resolve to a real `CarrierSurface`.
- All URLs in the directory are unique (no accidental duplicates).

## I15D5 — SEO and Internal Linking

### Canonical and meta rules

- Per-page canonical is generated through `generateCanonical` in `src/lib/seo/meta.ts`.
- Per-page meta uses `generateMeta({ type: "article", ... })` so OG tags include `article:modified_time` derived from `lastReviewed`.
- Sunset/deprecated pages stay canonical for their slug. They render a visible deprecation banner that includes the replacement URL but do **not** add `<meta name="robots" content="noindex">`. They remain crawlable; their value is helping integrators land the right answer.

### JSON-LD additions

`src/lib/seo/structured-data.ts` adds:

- `generateArticleSchema({ title, description, url, datePublished?, dateModified?, author? })` for both concept and carrier-surface pages.
- `generateBreadcrumbListSchema(crumbs)` for the carrier index, surface pages, and (later) wiki concept pages.
- `generateFAQPageSchema(faqs)` for surfaces with ≥ 1 FAQ.

The root entity graph stays unchanged; the new helpers emit standalone `<script type="application/ld+json">` tags scoped to their pages.

### Sitemap

- `scripts/generate-sitemap.ts` is rewritten for Shipping API Dojo. It pulls slugs from `src/content/lessons.ts` (lesson catalog), `src/content/wiki.ts` (concept entries), `src/content/carriers.ts` (carrier surfaces), plus the static legal/learn/arena/wiki/directory routes. It writes `public/sitemap.xml` deterministically.
- A regression test in `src/lib/seo/sitemap.test.ts` parses `public/sitemap.xml` and asserts that every wiki concept slug, every carrier surface slug, and the static routes are present. The test makes drift impossible to merge silently.

### Internal-link rules

- Every carrier surface page links to ≥ 2 concept wiki entries (typically `oauth-token-lifecycle`, `retry-after-and-backpressure`, `wsdl`, `xsd`, `webhook-signatures`, `correlation-id`, `sandbox-vs-production`).
- Every carrier surface page links to ≥ 1 sibling surface (same vendor, different business unit) when one exists.
- Every carrier surface page links to ≥ 1 directory entry via the `directorySlugs` cross-link, rendered as a "Tooling and references" block.
- The `/wiki` index gains a "Carrier surfaces" hub section with a link to `/wiki/carriers`.
- The home page is **not** modified in this slice. Linking from `/` to specific carrier surfaces is a follow-on decision once the per-surface content is reviewed.

## Validation

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test --run` — must include the new content schema, directory invariant, structured-data, and sitemap tests.
- `pnpm build`

The browser smoke suite is intentionally not extended here because the new pages are pure SSR and asserting all 12 in Playwright would slow the suite without adding signal beyond what the unit tests already cover. We add a single browser assertion for the carrier index page so the new surface is reachable from the live router.

## Out of Scope (Reaffirmed)

- Mobile native readiness (`#13`).
- Curriculum content beyond what `#9` already shipped.
- Paywall, randomization, or progress contract changes.
- Search/filter on the wiki or directory (tracked separately under `wiki search, directory filtering`).
- Affiliate links, vendor logos, or non-Public-source content.

## Acceptance Criteria

- Long-form plan (this file) committed alongside the existing outline.
- 13 carrier surface pages live under `/wiki/carriers/${slug}`, each meeting the authoring rules above (the DHL Freight Sweden surface was added on top of the original 12 to cover the dedicated `api-farm` portal that DHL maintains for the Sweden market).
- Directory entries cover the same 13 surfaces with full metadata and validate against the new invariants.
- `Article`, `BreadcrumbList`, and `FAQPage` JSON-LD are emitted on the right pages.
- `public/sitemap.xml` is regenerated and covers all wiki/carrier/lesson/static routes; drift is caught by a failing unit test.
- `pnpm format && pnpm lint && pnpm typecheck && pnpm test --run && pnpm build` are all green.
- `meta.release` is bumped to `1.4.0` with a CHANGELOG entry referencing `I5D10`, `#5`, and `#15`.
