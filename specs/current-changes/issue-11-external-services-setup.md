# Issue 11 External Services Setup

Date: 2026-03-24
Issue: [#11](https://github.com/BallLightningAB/shipping-api-dojo/issues/11)
Scope: Document external service configurations created during auth foundation setup.

## Email Routing Configuration

### Cloudflare Email Routing

- **Domain**: apidojo.app
- **Routes configured**:
  - support@apidojo.app → info+apidojo@balllightning.cloud
  - billing@apidojo.app → info+apidojo@balllightning.cloud
  - support@mail.apidojo.app → info+apidojo@balllightning.cloud
  - billing@mail.apidojo.app → info+apidojo@balllightning.cloud

### Resend Setup

- **Dedicated Resend account**: Created for API Dojo
- **Sending domain**: mail.apidojo.app (verified)
- **Sender addresses** (ready to use):
  - auth@mail.apidojo.app (for auth emails)
  - hello@mail.apidojo.app (for welcome emails)
  - billing@mail.apidojo.app (for billing emails)

### Email Strategy

- **Inbound handling**: Single Cloudflare routing rule for all replies (support, billing, auth)
- **Outbound transactional**: Resend-based with multiple sender identities
- **No inbox automation**: Deferred until volume justifies it

## Creem Store Configuration

### Store Details

- **Store name**: APIDojo
- **Store URL**: https://creem.io/apidojo
- **Status**: Created, first product setup in progress

### Product Structure (from #7 scoping plan)

#### Free Tier
- **Name**: Free
- **Description**: Sign-in required, durable progress, core content, baseline randomized practice
- **Capabilities**: content.sample.read, progress.server, content.free.read, limited randomization.premium, limited review.mode
- **Price**: EUR 0/month

#### Pro Tier  
- **Name**: Shipping - Pro
- **Description**: Premium challenge modes, deeper variant banks, certificates, richer review tools
- **Capabilities**: All Free capabilities + content.premium.read, full randomization.premium, full review.mode, certificate.basic
- **Pricing**: EUR 4.99/month or EUR 49/year (separate products due to Creem limitations)
- **Value metric**: Flat-fee per signed-in individual account

#### Enterprise Tier
- **Name**: Enterprise  
- **Description**: Branded certificates, reporting, team/admin controls, custom content packs
- **Capabilities**: All Pro capabilities + certificate.branded, reporting.team, custom content.premium.read
- **Pricing**: Custom quoting
- **Value metric**: Priced by seats and team scope
- **Status**: Placeholder for future expansion

## Environment Variables Required

From issue-11-auth-foundation-plan.md, the following env vars are configured:

- [x] `CREEM_API_KEY` - Configured with minimal permissions
- [x] `CREEM_WEBHOOK_SECRET` - Set up for shipping-api-dojo-webhooks
- [x] `CREEM_ENV` - Set to "test"
- [x] `CREEM_PRO_MONTHLY_PRODUCT_ID` - Configured
- [x] `CREEM_PRO_ANNUAL_PRODUCT_ID` - Configured
- [ ] `CREEM_ENTERPRISE_PRODUCT_ID` - Deferred until later

### Deferred (not needed for current scope)

- `SESSION_COOKIE_DOMAIN` - Not needed during development
- `RESEND_WEBHOOK_SECRET` - Resend webhooks not in current scope

## Implementation Notes

- First paid implementation needs monthly and annual Pro tiers plus Enterprise placeholders
- Creem Better Auth SDK available for integration: https://docs.creem.io/code/sdks/better-auth
- Creem price IDs are not needed upfront - use product IDs for checkout, price IDs come from webhooks/subscription data
- Better Auth will support both magic links and passwords for web+mobile compatibility
- Creem owns formal invoices and receipts
- Assume Creem test mode during development
- Feature flags or test-mode defaults to allow local development without billing

## Next Implementation Steps

**Foundation Complete ✅ - Ready for Implementation Phase**

1. **Phase 1**: Neon/Drizzle schema setup (users, progress, entitlements, subscriptions)
2. **Phase 2**: Better Auth implementation (magic link + password support)
3. **Phase 3**: Server-backed progress system with anonymous-to-account migration
4. **Phase 4**: Capability-based entitlements (free/pro/enterprise)
5. **Phase 5**: Creem billing integration (checkout, webhooks, subscription sync)
6. **Phase 6**: Resend email templates and sending logic
7. **Phase 7**: Domain cutover configuration (production URLs, Vercel)

**Key Implementation Details**:
- Use Creem Better Auth SDK: https://docs.creem.io/code/sdks/better-auth
- Use mcp-server-neon if needed for database operations
- Monthly/annual product IDs: CREEM_PRO_MONTHLY_PRODUCT_ID, CREEM_PRO_ANNUAL_PRODUCT_ID
- Better Auth: Magic link + password for web+mobile compatibility
- All external services configured and ready

## Status

- [x] Cloudflare email routing configured
- [x] Creem store created  
- [x] Creem API key configured with minimal permissions
- [x] Creem webhooks configured (all events enabled)
- [x] Environment variables configured (core ones)
- [x] Resend domain verification completed (mail.apidojo.app)
- [x] Creem product configuration completed
- [x] Neon DATABASE_URL added

## Implementation Progress (2026-03-25)

- [x] Phase 1 started and completed for Neon/Drizzle foundation
- [x] Drizzle config and migration scripts added
- [x] Initial schema and SQL migration generated
- [x] DB env validation and DB client scaffolding added
- [x] Phase 2 Better Auth server scaffolding started (auth routes, plugins, schema, migration)
- [x] Phase 3 server-backed progress contracts and merge rules started (server functions + tested merge logic)
