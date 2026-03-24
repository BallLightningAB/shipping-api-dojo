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
- **Name**: Pro
- **Description**: Premium challenge modes, deeper variant banks, certificates, richer review tools
- **Capabilities**: All Free capabilities + content.premium.read, full randomization.premium, full review.mode, certificate.basic
- **Price target**: EUR 4.99/month (annual equivalent with ~17% discount)
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
- [x] `CREEM_PRO_PRODUCT_ID` - Configured
- [x] `CREEM_PRO_PRICE_ID` - Configured
- [ ] `CREEM_ENTERPRISE_PRODUCT_ID` - Deferred until later

### Deferred (not needed for current scope)

- `SESSION_COOKIE_DOMAIN` - Not needed during development
- `RESEND_WEBHOOK_SECRET` - Resend webhooks not in current scope

## Implementation Notes

- First paid implementation needs one self-serve Pro tier plus Enterprise placeholders
- Creem owns formal invoices and receipts
- Assume Creem test mode during development
- Feature flags or test-mode defaults to allow local development without billing

## Next Steps

1. Configure Resend sending domain verification (shipping.apidojo.app)
2. Set up Creem Pro product with the details above
3. Add Creem environment variables to .env.local
4. Implement webhook handler for Creem events
5. Test billing flow in Creem test mode

## Status

- [x] Cloudflare email routing configured
- [x] Creem store created  
- [x] Creem API key configured with minimal permissions
- [x] Creem webhooks configured (all events enabled)
- [x] Environment variables configured (core ones)
- [x] Resend domain verification completed (mail.apidojo.app)
- [x] Creem product configuration completed
- [x] Neon DATABASE_URL added
