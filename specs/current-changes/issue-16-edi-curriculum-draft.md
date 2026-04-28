# Issue 16 — EDI API Dojo First-Wave Curriculum Draft

Date: 2026-04-28
Issue: [#16](https://github.com/BallLightningAB/shipping-api-dojo/issues/16)
Companion strategy: `specs/current-changes/issue-16-edi-product-plan.md`
Companion implementation plan: `specs/current-changes/issue-16-edi-product-implementation-plan.md`
Companion wiki inventory: `specs/current-changes/issue-16-edi-wiki-inventory.md`
Status: Draft. No content lands in code until `#39` merges and `#16` Wave 2 starts.

This is the first-wave EDI API Dojo curriculum, sized to match the proven Shipping API Dojo launch shape: 8 lessons, ≥15 drill families, ≥8 scenario families, plus a clear authoring framework so Wave 2 can land content directly from this draft without re-deciding scope.

## Authoring constraints (carried over)

- Editorial lessons stay human-authored.
- Drill families: ≥4 authored variants per family, deterministic seeded variant builder, one primary misconception per family.
- Scenario families: family + run-builder + evidence-axis pattern. Reward safest operational decision, not trivia.
- Lessons: ≥12 distinct challenge outcomes across 400 seeds (regression mirrors Shipping `#19`).
- Cite ASC X12, UN/CEFACT EDIFACT, and named vendor docs in evidence/explanations. Mark anything not directly attributable as opinion.
- Cross-product overlap matrix decides which topics get full authored content here vs. teaser+link to Shipping (e.g. retry/idempotency canonicalises on Shipping; AS2 cert handling canonicalises on EDI).

## Tracks

EDI API Dojo at launch ships **three tracks** plus a `cross-track` slot for integration topics:

- `standards` — X12 + EDIFACT envelopes, transaction sets, ACK semantics.
- `transports` — AS2, SFTP, VAN, OFTP2, AS4 awareness.
- `mapping-and-ops` — mapping patterns, troubleshooting reject loops, control-number management, partner onboarding.
- `cross-track` (slot reserved) — ERP/WMS/TMS integration realities; one cross-track lesson at launch.

The `Track` union in `@apidojo/shared-domain/content/types.ts` extends to include `"standards" | "transports" | "mapping-and-ops" | "cross-track"`. `Track` is already a union, so this is additive.

## Lesson definitions (first-wave, 8 total)

Each lesson follows the existing `LessonDefinition` shape (slug, track, order, title, summary, objectives, sections, drillFamilyIds).

### `edi-1-x12-envelopes-isa-gs-st`

- Track: `standards`. Order: 1.
- Title: "X12 envelopes: ISA, GS, and ST"
- Summary: "How ASC X12 envelopes wrap a transaction set, why control numbers matter, and what breaks when ISA/GS/ST get out of sync."
- Objectives:
  - Identify the role of ISA, GS, and ST envelopes.
  - Read sender/receiver IDs, qualifiers, control numbers, and version codes.
  - Explain why duplicate ISA control numbers cause partner-side rejections.
- Sections:
  - "Why X12 envelopes exist" (segment terminator, element separator, sub-element separator; reference: ASC X12 005010 publication).
  - "ISA: interchange envelope" (positions 1–16, qualifiers 14/ZZ, control number, ack-requested flag, usage indicator).
  - "GS: functional group envelope" (functional ID code, application sender/receiver, group control number, version).
  - "ST: transaction set envelope" (TS code, transaction set control number).
  - "Duplicate ISA control numbers — what happens" (carrier reality: this is the most common cause of "silent partner drop").
- Drill families used: `edi.envelope-roles-mcq`, `edi.isa-control-number-cloze`, `edi.envelope-trace-builder`.

### `edi-2-edifact-envelopes-unb-ung-unh`

- Track: `standards`. Order: 2.
- Title: "EDIFACT envelopes: UNA, UNB, UNG, UNH"
- Summary: "The EDIFACT envelope hierarchy and how it differs from X12, with attention to syntax versions and character sets."
- Objectives:
  - Map EDIFACT envelopes to their X12 equivalents.
  - Identify the syntax version and character set in UNA / UNB.
  - Recognise the role of UNG (functional group, optional) vs UNH (message header).
- Sections:
  - "EDIFACT vs X12 mental model" (segment terminator `'`, element separator `+`, component separator `:`, release character `?`).
  - "UNA: service string advice" (when present, what it overrides).
  - "UNB: interchange header".
  - "UNG: functional group (optional)".
  - "UNH: message header" (message type ORDERS / DESADV / IFTMIN / etc.).
- Drill families used: `edi.envelope-roles-mcq`, `edi.edifact-uno-cloze`, `edi.envelope-trace-builder`.

### `edi-3-acks-997-ta1-contrl`

- Track: `standards`. Order: 3.
- Title: "Acknowledgements: TA1, 997, CONTRL"
- Summary: "The four kinds of acknowledgement that EDI partners actually use, and the ones that you cannot afford to ignore."
- Objectives:
  - Distinguish technical (TA1) vs functional (997 / CONTRL) acknowledgements.
  - Read 997 AK1/AK2/AK5 hierarchies and CONTRL UCI/UCM/UCD hierarchies.
  - Decide what to retry vs reject based on AK5/AK9 acknowledgement codes.
- Sections:
  - "Technical vs functional ACK".
  - "997 structure".
  - "CONTRL structure".
  - "What to do with a 997 with AK5 = R (rejected)".
  - "Common reject loops and how to break them" (canonicalised on EDI; Shipping links here).
- Drill families used: `edi.ack-classification-mcq`, `edi.ack-error-code-cloze`, `edi.ack-trace-builder`.

### `edi-4-as2-mdn-cert-rotation`

- Track: `transports`. Order: 4.
- Title: "AS2 transport: MDNs, signing, encryption, and certificate rotation"
- Summary: "How AS2 actually moves an EDI message between partners, and the certificate-rotation operational pattern that prevents weekend outages."
- Objectives:
  - Explain the AS2 message + MDN exchange.
  - Identify when a partner expects a synchronous vs asynchronous MDN.
  - Plan a zero-downtime certificate rotation.
- Sections:
  - "AS2 over HTTPS" (RFC 4130 reference).
  - "Sign + encrypt: the two halves of partner trust".
  - "MDN: synchronous vs asynchronous".
  - "Drummond-certified vs OpenAS2 / Mendelson reality" (canonicalised on EDI; mention Drummond Group cross-test history).
  - "Cert rotation playbook" (overlap pre-publish, dual-trust window, partner notification cadence).
- Drill families used: `edi.as2-mdn-mcq`, `edi.as2-cert-rotation-builder`, `edi.transport-classification-mcq`.

### `edi-5-sftp-van-oftp2-tradeoffs`

- Track: `transports`. Order: 5.
- Title: "SFTP, VAN, and OFTP2: when to pick what"
- Summary: "Operational tradeoffs across the non-AS2 EDI transports, including VAN provider economics and OFTP2's automotive niche."
- Objectives:
  - Pick SFTP vs AS2 vs VAN vs OFTP2 for a given partner.
  - Read VAN routing semantics and post-office mailbox conventions.
  - Recognise OFTP2's automotive provenance and where it still appears.
- Sections:
  - "SFTP: when partner-side simplicity wins".
  - "VAN: managed routing, mailbox + envelope addressing" (OpenText/GXS, IBM Sterling/B2Bi, SPS Commerce, TrueCommerce, Cleo, Babelway/Tradeshift; covered as wiki entries).
  - "OFTP2: ENX-Net + automotive trade".
  - "AS4 awareness".
- Drill families used: `edi.transport-classification-mcq`, `edi.van-routing-cloze`, `edi.transport-tradeoff-builder`.

### `edi-6-mapping-fundamentals-code-lists-qualifiers`

- Track: `mapping-and-ops`. Order: 6.
- Title: "Mapping fundamentals: qualifiers, code lists, and the gotchas that bite"
- Summary: "How real-world mapping fails: qualifier mismatches, code-list drift, date format ambiguity, and decimal separators."
- Objectives:
  - Read partner profiles and qualifier dictionaries.
  - Translate between X12 element codes and an internal canonical model.
  - Detect and prevent the four most common mapping defects.
- Sections:
  - "Partner profiles and trading-partner agreements".
  - "Qualifiers: the ID code dance".
  - "Code lists, code-list versions, and code-list drift".
  - "Date format ambiguity (CCYYMMDD vs YYMMDD vs DTM segments)".
  - "Decimal separators, segment terminators, and repeating segments".
- Drill families used: `edi.mapping-qualifier-mcq`, `edi.mapping-codelist-cloze`, `edi.mapping-date-format-builder`.

### `edi-7-ops-troubleshooting-control-numbers`

- Track: `mapping-and-ops`. Order: 7.
- Title: "Operational troubleshooting: control numbers, reject loops, and stuck queues"
- Summary: "The most common EDI ops failures and how to recover without doubling the partner's reject backlog."
- Objectives:
  - Diagnose the four common reject-loop shapes.
  - Recover from a duplicate-ISA control-number incident.
  - Avoid the classic 'replay every stuck message and double the dupes' anti-pattern.
- Sections:
  - "Control number management" (per-direction, per-partner, monotonic; reset rules).
  - "Reject loops: detection and break-out".
  - "Stuck queues and idempotent reprocessing" (canonicalised topic — Shipping side `idempotency-keys-and-deduplication` lesson links here).
  - "Silent partner drops".
  - "When to escalate to the VAN/partner ops desk".
- Drill families used: `edi.ops-reject-loop-mcq`, `edi.ops-control-number-builder`, `edi.ops-stuck-queue-cloze`.

### `edi-8-erp-and-wms-integration-realities`

- Track: `cross-track`. Order: 8.
- Title: "Where EDI meets ERP, WMS, and TMS"
- Summary: "How EDI flows actually land inside SAP IDoc, Oracle / NetSuite, Microsoft Dynamics 365, Manhattan WMS, and Blue Yonder TMS, and the integration realities that bite."
- Objectives:
  - Map an inbound 850 / ORDERS to the right ERP intake (SAP IDoc, NetSuite SuiteTalk EDI, Dynamics 365 BC/F&O incoming document).
  - Map an outbound 856 / DESADV from a WMS without truncating package data.
  - Recognise the carrier-EDI seam (DHL Freight Sweden via `dhldashboard.se` as the launch example).
- Sections:
  - "ERP intake patterns" (SAP IDoc-to-EDIFACT bridges; NetSuite EDI add-ons; Dynamics 365 F&O electronic reporting).
  - "WMS outbound 856 truncation" (Manhattan, Blue Yonder, Körber, SAP EWM).
  - "TMS EDI surfaces" (Oracle TMS, Blue Yonder TMS, MercuryGate, Alpega).
  - "Carrier EDI seam: DHL Freight Sweden API Farm and `dhldashboard.se`".
  - "Retail compliance hubs" (SPS Commerce, TrueCommerce; Walmart / Target / Amazon Vendor / Direct Fulfillment routing).
- Drill families used: `edi.integration-erp-mcq`, `edi.integration-wms-builder`, `edi.integration-carrier-edi-mcq`.

## Drill families (first-wave, 18 total — exceeds the ≥15 floor)

Each family follows `DrillFamilyDefinition` (id, type, concept, misconception, difficulty, tags, buildVariant). Variant counts target ≥4 unless noted.

| Family ID | Type | Concept tested | Primary misconception |
| --- | --- | --- | --- |
| `edi.envelope-roles-mcq` | mcq | Identify which envelope (ISA / GS / ST / UNB / UNG / UNH) carries a given field | Conflating GS with UNG, or thinking ST and UNH are at the same hierarchy level |
| `edi.isa-control-number-cloze` | cloze | Fill in the correct ISA control number management rule | Resetting control numbers per day instead of per direction per partner |
| `edi.envelope-trace-builder` | builder.rest | Walk a sample envelope and identify the parsing failure | Confusing segment terminator with element separator |
| `edi.edifact-uno-cloze` | cloze | UNA service-string-advice values | Assuming UNA defaults always apply when the segment is present |
| `edi.ack-classification-mcq` | mcq | Pick the right ack type (TA1 / 997 / CONTRL) for a given failure | Treating 997 as transport-level instead of functional |
| `edi.ack-error-code-cloze` | cloze | 997 AK5 / AK9 codes | Treating "P" (partial accept) as success |
| `edi.ack-trace-builder` | builder.rest | Build a 997 from a partial transaction set with one bad ST | Returning AK5 = A (accept) when at least one segment was rejected |
| `edi.as2-mdn-mcq` | mcq | Synchronous vs asynchronous MDN choice | Treating async MDN as a "best effort" instead of a contractual response |
| `edi.as2-cert-rotation-builder` | builder.rest | Plan a zero-downtime cert rotation | Cutting over without an overlap window |
| `edi.transport-classification-mcq` | mcq | Pick AS2 / SFTP / VAN / OFTP2 for a partner profile | Defaulting to AS2 when the partner only supports SFTP |
| `edi.van-routing-cloze` | cloze | VAN mailbox routing fields | Assuming VAN routing follows ISA receiver ID directly |
| `edi.transport-tradeoff-builder` | builder.rest | Recommend transport given partner constraints | Recommending OFTP2 outside the automotive trade |
| `edi.mapping-qualifier-mcq` | mcq | Pick the right qualifier for a partner ID | Assuming qualifier 14 is universal |
| `edi.mapping-codelist-cloze` | cloze | Code-list lookups for transaction set 850 line items | Assuming UN/EDIFACT D-versions and X12 versions interchange |
| `edi.mapping-date-format-builder` | builder.rest | Resolve a DTM-or-equivalent ambiguity | Assuming the partner's local timezone if not specified |
| `edi.ops-reject-loop-mcq` | mcq | Detect a reject loop from logs | Treating each reject as independent |
| `edi.ops-control-number-builder` | builder.rest | Recover from a duplicate ISA control number | Replaying every "missing" message |
| `edi.ops-stuck-queue-cloze` | cloze | Pick the safest reprocess policy | Reprocessing without idempotency |
| `edi.integration-erp-mcq` | mcq | Map inbound 850 to the right ERP intake | Treating SAP IDoc as a public surface |
| `edi.integration-wms-builder` | builder.rest | Avoid 856 truncation against a real WMS profile | Assuming the WMS preserves trailing nulls |
| `edi.integration-carrier-edi-mcq` | mcq | Identify which DHL business unit owns a given EDI flow (DHL Freight SE example) | Conflating DHL Freight EDI with DHL Express API |

That is 21 entries. Wave 2 may consolidate a few; the 18-floor target is comfortable.

## Scenario families (first-wave, 10 total — exceeds the ≥8 floor)

Each follows `ScenarioFamilyDefinition` (id, title, summary, ladder level, build run with evidence axes).

| Scenario ID | Ladder | Title | Decision focus |
| --- | --- | --- | --- |
| `edi.scenario-997-reject-loop-after-partner-upgrade` | 2 | "997 reject loop after partner upgrade" | Diagnose the change in code list version |
| `edi.scenario-as2-cert-rotation-missed` | 3 | "AS2 certificate rotation missed" | Recover without breaking the trust chain |
| `edi.scenario-duplicate-isa-control-numbers` | 2 | "Duplicate ISA control numbers in retransmit" | Stop the dupe loop before partner reconciles |
| `edi.scenario-erp-idoc-vs-edifact-mismatch` | 3 | "ERP IDoc vs EDIFACT field-length mismatch" | Decide whether the bridge or the partner adapts |
| `edi.scenario-wms-outbound-856-truncation` | 3 | "WMS outbound 856 truncation under high volume" | Detect the silent data loss and fix at the right layer |
| `edi.scenario-van-outage-during-cutover` | 4 | "VAN outage during cutover weekend" | Pick the right fallback route without doubling messages |
| `edi.scenario-sftp-filename-collision` | 2 | "SFTP filename collision under high volume" | Sequence numbering and the dedup conversation |
| `edi.scenario-partner-side-silent-drop` | 3 | "Partner-side silent drop with no ACK" | Prove the messages were sent before escalating |
| `edi.scenario-retail-asn-non-compliance-fee` | 3 | "Retail ASN non-compliance fee" | Audit the 856 against the partner's profile and avoid chargebacks |
| `edi.scenario-dhl-freight-se-edi-vs-api-farm-cutover` | 4 | "DHL Freight Sweden EDI vs API Farm cutover" | Pick API Farm or EDI for a given customer volume; reference `dhldashboard.se` |

## Cross-product overlap (curriculum-level)

Topics canonicalised on **EDI**:

- AS2/SFTP/VAN/OFTP2 transport mechanics.
- 997 / TA1 / CONTRL semantics.
- X12 + EDIFACT envelopes and transaction sets.
- VAN routing.
- Reject-loop ops patterns.
- Carrier EDI surfaces (including DHL Freight Sweden).
- ERP/WMS/TMS EDI integration patterns.

Topics canonicalised on **Shipping**:

- HTTP retry semantics and idempotency keys.
- Webhook signature verification.
- Carrier API surfaces (REST/SOAP).
- Sandbox vs production drift on carrier APIs.
- OAuth2 client-credentials flows.

When an EDI lesson references a Shipping-canonical topic (e.g. idempotency in `edi-7`), the lesson copy uses a one-paragraph teaser and a link to the Shipping wiki page; no full re-authoring.

## Non-goals for the first wave

- Healthcare EDI (270/271, 837/835): flagged as future. Not authored at launch.
- Financial EDI (820, 823, 824 specifics): out of launch scope.
- Government / customs EDI (CUSCAR, CUSDEC): out of launch scope.
- AS4 (ebMS3): awareness mention only; not a transport family.
- AI-driven challenge runtime: future, parallel to Shipping `#10`.

## Wave 2 acceptance shape

Wave 2 is "done" when:

- 8 lessons land with the structures above.
- ≥15 drill families (18 here, target plus margin) land with ≥4 variants each.
- ≥8 scenario families (10 here, target plus margin) land.
- 12-outcome challenge depth regression runs against the new EDI catalog and passes.
- 4-variant floor regression covers every EDI family.
- All drill explanations directly resolve the documented misconception.
- Cross-product cross-links match the overlap matrix.
- Browser smoke covers a representative EDI lesson and the EDI arena.
