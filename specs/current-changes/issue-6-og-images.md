# Issue 6: OG Images Refresh

Date: 2026-03-17
Issue: [#6](https://github.com/BallLightningAB/api-trainer/issues/6)
Scope: Replace leftover Ball Lightning OG assets with API-Trainer branded images and wire them into route metadata.

## Completed

- Added a reproducible generator at [`scripts/generate-og-images.mjs`](../../scripts/generate-og-images.mjs) so OG assets can be re-rendered locally instead of edited manually.
- Generated four `1200x630` PNG assets in [`public`](../../public):
  - `og-home.png`
  - `og-rest.png`
  - `og-soap.png`
  - `og-arena.png`
- Removed the unused Ball Lightning leftovers `og-portfolio.png` and `og-services.png` from `public/`.
- Updated SEO meta generation in [`src/lib/seo/meta.ts`](../../src/lib/seo/meta.ts) so OG image URLs are absolute and publish width, height, and type metadata.
- Updated route metadata for:
  - `/` via [`src/routes/__root.tsx`](../../src/routes/__root.tsx)
  - `/learn/rest` via [`src/routes/learn/rest.tsx`](../../src/routes/learn/rest.tsx)
  - `/learn/soap` via [`src/routes/learn/soap.tsx`](../../src/routes/learn/soap.tsx)
  - `/arena` via [`src/routes/arena/index.tsx`](../../src/routes/arena/index.tsx)

## Design Direction

- Use the established API-Trainer palette:
  - blue `#3B82F6`
  - green `#10B981`
  - yellow `#F59E0B`
- Use `Shipping API Dojo` as the brand lockup in the OG artwork and OG/SEO titles for the affected routes.
- Keep the dark product backdrop from the site so OG previews feel consistent with the current UI.
- Differentiate each image with route-specific panels rather than one generic brand card:
  - home = lessons + drills + incidents
  - REST = request flow, headers, retries
  - SOAP = envelope/WSDL/fault debugging
  - arena = scenario ladder and recovery steps

## Local Verification

- Confirm generated assets are PNG and `1200x630`.
- Confirm the affected routes publish page-specific `og:image` and `twitter:image` values.
- Confirm the default site OG image now points at `og-home.png` instead of `logo.png`.
- Verified locally via SSR HTML fetch that `/`, `/learn/rest`, `/learn/soap`, and `/arena` emit the expected absolute image URLs and `1200x630` metadata.
- Verified locally that `/`, `/learn/rest`, `/learn/soap`, and `/arena` each emit exactly one canonical link after moving the home canonical out of the root route.

## Still Needed After Deployment

- Run the public URLs through social preview tools once the updated build is live:
  - LinkedIn Post Inspector
  - Facebook Sharing Debugger
  - X card check or a live post test
- If any platform caches the old image, force a re-scrape after deployment.
