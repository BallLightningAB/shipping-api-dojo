# Issue 16 — EDI API Dojo Wiki + Directory Inventory and Cross-Product Overlap Matrix

Date: 2026-04-28
Issue: [#16](https://github.com/BallLightningAB/shipping-api-dojo/issues/16)
Companion strategy: `specs/current-changes/issue-16-edi-product-plan.md`
Companion implementation plan: `specs/current-changes/issue-16-edi-product-implementation-plan.md`
Companion curriculum draft: `specs/current-changes/issue-16-edi-curriculum-draft.md`
Status: Draft. Lands in code during `#16` Wave 2 after `#39` merges.

This document inventories the wiki entries, vendor surfaces, integration surfaces, and directory entries that EDI API Dojo needs at launch, and assigns cross-product overlap rules with Shipping API Dojo.

## Taxonomy

EDI mirrors the `#15` deep-wiki convention adapted to standards-driven content. Four URL groups under `edi.apidojo.app`:

| URL group | Purpose | Slug pattern |
| --- | --- | --- |
| `/wiki/{slug}` | Concept articles (envelopes, ACK semantics, mapping concepts, ops topics) | `edi-{topic}-{detail}` (e.g. `edi-997-functional-acknowledgement`) |
| `/wiki/standards/{slug}` | Specific transaction sets / messages | X12: `x12-{set-id}-{name}` (e.g. `x12-850-purchase-order`); EDIFACT: `edifact-{message}-{name}` (e.g. `edifact-orders-purchase-order`) |
| `/wiki/transports/{slug}` | Transport implementations | `{transport}-{detail}` (e.g. `as2-rfc-4130`, `oftp2-enx-network`) |
| `/wiki/integrations/{slug}` | ERP / WMS / TMS / retail-compliance integration surfaces | `{vendor}-{businessunit}-{region}-{protocol}` (e.g. `sap-erp-idoc-edi-bridge`, `manhattan-wms-edi-outbound`) |

Plus `/wiki/carriers/{slug}` mirroring Shipping's `CarrierSurface` schema for carrier EDI flows that have a distinct EDI surface (DHL Freight Sweden launch example).

## Wiki: concept articles (`/wiki/{slug}`)

### Standards (canonicalised on EDI)

- `edi-x12-envelopes-isa-gs-st`
- `edi-edifact-envelopes-una-unb-ung-unh`
- `edi-997-functional-acknowledgement`
- `edi-ta1-interchange-acknowledgement`
- `edi-contrl-syntax-and-service-acknowledgement`
- `edi-segment-element-subelement-syntax`
- `edi-control-numbers-and-monotonicity`
- `edi-versions-x12-005010-vs-004010`
- `edi-versions-edifact-d96a-d01b-d10b`

### Mapping (canonicalised on EDI)

- `edi-mapping-qualifiers-and-id-codes`
- `edi-mapping-code-lists-and-versioning`
- `edi-mapping-date-time-formats`
- `edi-mapping-decimal-and-thousands-separators`
- `edi-mapping-repeating-segments-loop-control`
- `edi-mapping-partner-profiles-and-trading-partner-agreements`

### Ops (canonicalised on EDI)

- `edi-ops-reject-loops`
- `edi-ops-duplicate-isa-control-numbers`
- `edi-ops-stuck-queues-and-idempotent-reprocess`
- `edi-ops-silent-partner-drops`
- `edi-ops-cert-rotation-playbook`
- `edi-ops-van-outage-recovery`

### Transports (canonicalised on EDI)

- `edi-transport-comparison-as2-sftp-van-oftp2`

### Cross-domain (canonicalised on Shipping; EDI links in)

These are referenced from EDI lessons but not duplicated here:

- `idempotency-keys-and-deduplication` → on Shipping wiki.
- `webhook-signatures-replay-defense` → on Shipping wiki.
- `retry-strategy-permanent-vs-transient-errors` → on Shipping wiki.
- `oauth2-client-credentials` → on Shipping wiki.

## Wiki: standards surfaces (`/wiki/standards/{slug}`)

X12 transaction sets (launch list):

| Slug | Title | Most-cited use |
| --- | --- | --- |
| `x12-850-purchase-order` | "X12 850 Purchase Order" | Retail buyer issues PO |
| `x12-855-purchase-order-acknowledgement` | "X12 855 PO Acknowledgement" | Supplier confirms PO |
| `x12-856-advance-ship-notice` | "X12 856 Advance Ship Notice" | Supplier ships, retail receives |
| `x12-810-invoice` | "X12 810 Invoice" | Supplier invoices retail |
| `x12-940-warehouse-shipping-order` | "X12 940 Warehouse Shipping Order" | 3PL receives ship instructions |
| `x12-943-warehouse-stock-transfer-shipment-advice` | "X12 943 Warehouse Stock Transfer Shipment Advice" | 3PL inbound transfer |
| `x12-944-warehouse-stock-transfer-receipt-advice` | "X12 944 Warehouse Stock Transfer Receipt Advice" | 3PL receipt |
| `x12-945-warehouse-shipping-advice` | "X12 945 Warehouse Shipping Advice" | 3PL ships, supplier confirms |
| `x12-947-warehouse-inventory-adjustment-advice` | "X12 947 Warehouse Inventory Adjustment Advice" | 3PL adjusts |
| `x12-204-motor-carrier-load-tender` | "X12 204 Motor Carrier Load Tender" | Shipper tenders to carrier |
| `x12-210-motor-carrier-freight-details-and-invoice` | "X12 210 Motor Carrier Freight Invoice" | Carrier invoices shipper |
| `x12-214-transportation-carrier-shipment-status-message` | "X12 214 Transportation Carrier Shipment Status" | Carrier reports milestones |
| `x12-990-response-to-load-tender` | "X12 990 Response to Load Tender" | Carrier accepts/rejects |
| `x12-997-functional-acknowledgement` | "X12 997 Functional Acknowledgement" | Functional ACK |

EDIFACT messages (launch list):

| Slug | Title |
| --- | --- |
| `edifact-orders-purchase-order` | "EDIFACT ORDERS Purchase Order" |
| `edifact-ordrsp-purchase-order-response` | "EDIFACT ORDRSP Purchase Order Response" |
| `edifact-desadv-despatch-advice` | "EDIFACT DESADV Despatch Advice" |
| `edifact-invoic-invoice` | "EDIFACT INVOIC Invoice" |
| `edifact-iftmin-instruction-message` | "EDIFACT IFTMIN Instruction Message" |
| `edifact-iftmbf-firm-booking` | "EDIFACT IFTMBF Firm Booking" |
| `edifact-iftsta-international-multimodal-status-report` | "EDIFACT IFTSTA International Multimodal Status Report" |
| `edifact-iftmcs-instruction-contract-status` | "EDIFACT IFTMCS Instruction Contract Status" |
| `edifact-contrl-syntax-and-service-report` | "EDIFACT CONTRL Syntax and Service Report" |

Each surface page captures: title, summary, segments (stable list), versions (X12 release codes / EDIFACT directories), partner-side reality notes, FAQs (≥3), example fragments where licensing permits, related concept articles, related standards (e.g. 850 ↔ ORDERS).

## Wiki: transport surfaces (`/wiki/transports/{slug}`)

| Slug | Title | Reference |
| --- | --- | --- |
| `as2-rfc-4130` | "AS2 transport (RFC 4130)" | RFC 4130 |
| `as2-mdn-and-cert-trust` | "AS2 MDNs and certificate trust" | RFC 4130 + RFC 5402 |
| `as2-drummond-certified-vendors` | "AS2 Drummond-certified vendors" | Drummond Group cross-test history |
| `as2-openas2-and-mendelson` | "AS2 open-source: OpenAS2 and Mendelson" | OpenAS2 docs, Mendelson AS2 docs |
| `sftp-edi-conventions` | "SFTP for EDI: filename + sequencing conventions" | Common partner profiles |
| `van-routing-mailbox-conventions` | "VAN routing and mailbox conventions" | Generic VAN model |
| `oftp2-enx-network` | "OFTP2 (RFC 5024) and ENX-Net" | RFC 5024 + ENX docs |
| `as4-ebms3-awareness` | "AS4 / ebMS3 awareness" | OASIS ebMS3 |
| `https-as-edi-pseudo-transport` | "HTTPS as EDI: when partners just POST" | Partner-by-partner |

VAN provider entries (one per provider, content depth varies by importance):

| Slug | Provider |
| --- | --- |
| `van-opentext-gxs` | OpenText / GXS |
| `van-ibm-sterling-b2bi` | IBM Sterling B2B Integrator |
| `van-sps-commerce` | SPS Commerce |
| `van-truecommerce` | TrueCommerce |
| `van-cleo` | Cleo |
| `van-babelway-tradeshift` | Babelway / Tradeshift |

## Wiki: integration surfaces (`/wiki/integrations/{slug}`)

ERP↔EDI:

| Slug | Title |
| --- | --- |
| `sap-erp-idoc-edi-bridge` | "SAP IDoc ↔ EDI bridge" |
| `oracle-erp-cloud-edi` | "Oracle ERP Cloud and EDI" |
| `netsuite-edi-integration` | "NetSuite EDI integration" |
| `dynamics-365-bc-edi` | "Microsoft Dynamics 365 Business Central and EDI" |
| `dynamics-365-fo-electronic-reporting-edi` | "Microsoft Dynamics 365 F&O electronic reporting and EDI" |

WMS↔EDI:

| Slug | Title |
| --- | --- |
| `manhattan-wms-edi` | "Manhattan WMS and EDI" |
| `blue-yonder-wms-edi` | "Blue Yonder WMS and EDI" |
| `korber-wms-edi` | "Körber WMS and EDI" |
| `sap-ewm-edi` | "SAP EWM and EDI" |

TMS↔EDI:

| Slug | Title |
| --- | --- |
| `oracle-tms-edi` | "Oracle TMS and EDI" |
| `blue-yonder-tms-edi` | "Blue Yonder TMS and EDI" |
| `mercurygate-tms-edi` | "MercuryGate TMS and EDI" |
| `alpega-tms-edi` | "Alpega TMS and EDI" |

Retail compliance:

| Slug | Title |
| --- | --- |
| `walmart-retail-edi-compliance` | "Walmart retail EDI compliance" |
| `target-retail-edi-compliance` | "Target retail EDI compliance" |
| `amazon-vendor-direct-fulfillment-edi` | "Amazon Vendor / Direct Fulfillment EDI" |
| `sps-commerce-retail-network` | "SPS Commerce retail network" |
| `truecommerce-retail-network` | "TrueCommerce retail network" |

3PL / 4PL ingestion (read-only awareness):

| Slug | Title |
| --- | --- |
| `project44-edi-ingestion` | "Project44 EDI ingestion" |
| `fourkites-edi-ingestion` | "FourKites EDI ingestion" |

## Wiki: carrier EDI surfaces (`/wiki/carriers/{slug}`)

Mirrors Shipping's `CarrierSurface` schema. Launch list (smaller than Shipping; EDI surfaces are fewer than REST/SOAP surfaces):

| Slug | Carrier surface |
| --- | --- |
| `dhl-freight-se-edi` | DHL Freight Sweden EDI (paired with the DHL Freight Sweden API Farm surface on Shipping) — link to `dhldashboard.se` |
| `dhl-global-forwarding-edi` | DHL Global Forwarding EDI |
| `maersk-edi` | Maersk EDI (IFTMIN / IFTMBF / IFTSTA) |
| `kuehne-nagel-edi` | Kuehne+Nagel EDI |
| `dsv-edi` | DSV EDI |
| `db-schenker-edi` | DB Schenker EDI |
| `fedex-edi` | FedEx EDI surfaces |
| `ups-edi-awareness` | UPS EDI awareness page (most flows now go through UPS APIs) |

## Directory entries

Mirrors `DirectoryEntry`. Categories: `spec`, `tool`, `carrier`, `community`. Launch list:

Specs:

- ASC X12 official site (`x12.org`).
- UN/CEFACT EDIFACT directories (`unece.org`).
- RFC 4130 (AS2).
- RFC 5024 (OFTP2).
- RFC 5402 (AS2 MDN compression).
- OASIS ebMS3 (AS4).

Tools:

- OpenAS2 (open-source AS2 server).
- Mendelson AS2 / EDIFACT viewer.
- IBM Sterling B2B Integrator product page.
- OpenText / GXS Trading Grid.
- SPS Commerce trading-partner directory.
- TrueCommerce trading-partner directory.
- Free X12 / EDIFACT validators (named, with vendor link).
- Drummond Group AS2 cross-test history.

Carrier (links into the carrier-EDI wiki entries above):

- DHL Freight Sweden API Farm + EDI portal (`dhldashboard.se`).
- DHL Global Forwarding EDI portal.
- Maersk EDI portal.
- Kuehne+Nagel EDI portal.
- DSV EDI portal.

Community:

- EDI Reddit + Slack/Discord communities (curated).
- Stack Overflow EDI tag.

## Cross-product overlap matrix

Five-bucket assignment for every Shipping API Dojo wiki entry (audited against `apps/shipping/src/content/wiki.ts` and `apps/shipping/src/content/carriers.ts` post-`#39`).

| Shipping topic / wiki slug | Bucket | Cross-link rule |
| --- | --- | --- |
| `idempotency-keys-and-deduplication` | `shared-canonical-on-shipping` | EDI lesson `edi-7` and EDI ops wiki link in. |
| `webhook-signatures-replay-defense` | `shared-canonical-on-shipping` | EDI links from `edi-iftsta` carrier-status discussion. |
| `retry-strategy-permanent-vs-transient-errors` | `shared-canonical-on-shipping` | EDI ops reject-loop wiki links in. |
| `oauth2-client-credentials` | `shared-canonical-on-shipping` | EDI links if any vendor portal uses OAuth (e.g. DHL Freight Sweden API Farm). |
| `pagination-state-cursor-vs-offset` | `shipping-only` | No cross-link. |
| `partial-success-bulk-compensation` | `shipping-only` | No cross-link. |
| `rate-limits-quotas-backpressure` | `shipping-only` | No cross-link. |
| `sandbox-vs-production-behavior` | `shared-canonical-on-shipping` | EDI carrier-EDI wiki entries link in for the sandbox-vs-prod conversation. |
| `wsdl-version-drift` | `shipping-only` | No cross-link. |
| `soap-fault-taxonomy` | `shipping-only` | No cross-link. |
| `xsd-type-mismatches` | `shipping-only` | No cross-link. |
| `dhl-express-mydhl-rest` | `shipping-only` | EDI carrier `dhl-freight-se-edi` is the EDI sibling, but the Express REST page stays single-canonical on Shipping. |
| `dhl-ecommerce-americas` | `shipping-only` | — |
| `dhl-parcel-de` | `shipping-only` | — |
| `dhl-freight-se-rest` | `shipping-only` | EDI sibling links cross. |
| `ups-rest-oauth` | `shipping-only` | — |
| `ups-xml-soap-legacy-sunset-2024` | `shipping-only` | — |
| `fedex-rest` | `shipping-only` | — |
| `fedex-soap-legacy` | `shipping-only` | — |
| `usps-apis` | `shipping-only` | — |
| `usps-web-tools-deprecated` | `shipping-only` | — |
| `royal-mail-shipping-v3` | `shipping-only` | — |
| `la-poste-colissimo` | `shipping-only` | — |
| `australia-post-shipping-tracking` | `shipping-only` | — |

EDI-side topics (all `edi-only` unless otherwise marked):

| EDI topic | Bucket | Note |
| --- | --- | --- |
| `edi-x12-envelopes-isa-gs-st` | `edi-only` | — |
| `edi-edifact-envelopes-una-unb-ung-unh` | `edi-only` | — |
| `edi-997-functional-acknowledgement` | `edi-only` | — |
| `as2-rfc-4130` | `edi-only` | Shipping has no AS2 surface. |
| `oftp2-enx-network` | `edi-only` | — |
| `van-routing-mailbox-conventions` | `edi-only` | — |
| Mapping topics | `edi-only` | — |
| `dhl-freight-se-edi` | `edi-only` | Cross-links to `dhl-freight-se-rest` on Shipping. |
| Retail compliance topics | `edi-only` | — |
| ERP / WMS / TMS integration topics | `edi-only` | — |

## Indexability and SEO posture

- All real-content pages indexable on each product. No noindex on educational content.
- `/settings` remains noindex on both products.
- Sunset/legacy entries stay indexed (mirrors `#15`).
- Each EDI URL has a single canonical pointing to its EDI host. Never to Shipping.
- Each Shipping URL has a single canonical pointing to its Shipping host.
- The cross-product overlap matrix prevents duplicate-content drift; "shared-canonical" rules render only as teaser+link on the non-canonical side, never as a duplicated full article.
- Sitemap drift regression test extends per product after `#39`.

## Authoring sources (must cite or link in the surface page)

- ASC X12 publication numbers (e.g. `005010` for the launch baseline).
- UN/CEFACT EDIFACT directory codes (e.g. `D.01B`, `D.96A`).
- RFC 4130 (AS2), RFC 5024 (OFTP2), RFC 5402 (AS2 MDN compression), OASIS ebMS3 (AS4).
- Vendor docs: `dhldashboard.se`, `developer.dhl.com`, `wiki.scn.sap.com` for IDoc references, NetSuite SuiteAnswers, Microsoft Learn for D365.
- Drummond Group cross-test history (publicly listed Drummond-certified products).

## Stop condition for the inventory

Inventory is "ready to author" when every entry above has:

- a stable slug,
- a one-line summary,
- a primary source URL,
- a clear cross-product bucket,
- and is referenced from at least one drill family or scenario family in `issue-16-edi-curriculum-draft.md` (where applicable).
