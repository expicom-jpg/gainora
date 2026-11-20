# Gainora 2.0 Roadmap

## Phase 0 - Foundation
Repository baseline, architecture, privacy model, environment strategy and vendor decisions.

## Phase 1 - Core SaaS
Next.js shell, Supabase, auth, organizations, memberships, roles, Row Level Security and audit log.

## Phase 2 - Financial Import
CSV/XLSX upload, preview, row validation, normalization, import history and original-file deletion.

## Phase 3 - Profit Audit
KPI engine, audit findings, Opportunities and human approval workflow.

## Phase 4 - Results and Value Attribution
Result documentation, before/after measurement, attribution and customer reporting.

## Phase 5 - AI Layer
Controlled server-side AI, minimal-data prompts, provider/model audit metadata and human-in-the-loop approval.

## Phase 6 - Pilot
Five-company allowlist, synthetic dry run, readiness review, REAL_CUSTOMER_DATA_READY approval and controlled live pilot.


## Approved execution priorities — 2026-11-20

This execution order supersedes earlier informal sequencing, without removing the architectural phases above. P0 gates always block live financial data and pilot activation. Statuses below are **not** claims of verified readiness.

| Order | Priority | Phase | Workstream | Acceptance evidence |
| --- | --- | --- | --- | --- |
| 1 | P0 | Before pilot | Security, RLS and Master Control | Independent security review; exact-commit CI; authenticated tenant/role isolation including missing identity; audit/release gate evidence |
| 2 | P0 | Before pilot | Contact form and CRM | Synthetic end-to-end submission; verified owner assignment; duplicate detection; authorization, privacy and abuse controls |
| 3 | P0 | Before pilot | Safe Excel import and Profit Audit | Synthetic malformed/oversized-file tests, validated mapping, tenant isolation, deletion/retention and safe failure |
| 4 | P1 | Before pilot | Pilot readiness | Decide pilot size/duration, onboarding, measurement baseline, approval process and stop conditions |
| 5 | P1 | Before pilot | Morten CRM and interview tool | Synthetic business and seller-flow functional test; role boundaries and no cross-owner leakage |
| 6 | P1 | Before pilot | Landing page and branding | Review claims, contact path, mobile/accessibility and production-vs-preview parity |
| 7 | P2 | After pilot | Partner Hub and commissions | Partner approvals, lead ownership/expiry, commission policy, least privilege |
| 8 | P2 | After pilot | Google Workspace | Scoped authorization, notification and calendar/mail security |
| 9 | P2 | After pilot | Compliance Portal and chatbot | Controlled assistance, audit trail, safe handoff and permissions |
| 10 | P3 | Ongoing | Competitor research | Dated sources and scoring of customer value, differentiation, complexity, security and pilot relevance; no copied code/design |

### Execution rules
- P2 work may be researched, but must not delay P0 or the pilot; compliance/security controls that are P0 dependencies remain P0 regardless of product workstream label.
- Pilot remains blocked pending independent review, hosted RLS evidence, explicit approval and privacy/data readiness. Do not infer approval from a READY Vercel deployment.
- Work on isolated branches and draft PRs; no production merges, database migrations, purchases, or real-customer activation without explicit approval.
- Reconcile existing open PRs and main before creating duplicate implementations. Record verified commit SHA, CI checks and evidence in each PR.
- Pilot count (originally 5; proposed 7), duration (30 vs 90 days), pricing and commissions remain decisions to finalize, not public commitments.
- This list is a priority decision, not a claim that any task is complete.


### Gainora internal accounting — Dinero (decision 2026-11-20)
- **Chosen accounting software for Gainora itself:** Dinero, for bookkeeping, invoicing, VAT and accounting.
- **Before paid operations:** verify legal entity, invoicing details, VAT treatment, access/roles, subscription and data handling; set up only with explicit authorization.
- **Later, optional:** assess a secure API integration to reduce administrative work. This is distinct from integrating customer-owned Dinero accounts into Gainora's product.
- **Priority:** business setup needed for first paid invoices; do not displace P0 security/pilot gates. No account creation, purchases, integrations or production changes authorized by this decision.


### Company formation and accounting preparation — P1 before paid operations (2026-11-20)
- Planned entity: Danish ApS; ownership: founder 51%, Morten 49%. CVR not yet available; company formation not completed.
- Selected internal bookkeeping software: Dinero; Stripe planned as payment provider, subject to commercial/security review.
- Prepare draft incorporation documents, ownership register, funding and bookkeeping checklist, budget, expense evidence and invoice workflows. Obtain appropriate legal/accounting review.
- Create/configure Dinero for the legal entity when registration details are available; do not claim an account or automated integration exists.
- Keep P0 security and pilot data gates unchanged. No production changes, purchases, filings, transfers or paid subscriptions authorized.


### Profit retention policy — approved principle (2026-11-20)
- Gainora should retain its **actual net profit** after contractual seller/partner commissions, all operating costs, applicable taxes and other obligations. Commissions alone do not determine net profit.
- Default: retain distributable earnings in Gainora ApS to build reserves, fund product development and growth. No automatic owner distributions based on the 51/49 ownership split.
- Any dividend or owner compensation requires a separate documented decision, adequate liquidity and compliance with applicable Danish corporate, accounting and tax law.
- Dinero management reporting should separately show revenue excluding VAT, commissions, operating expenses, profit before/after tax, liquidity and retained earnings. Avoid conflating accounting profit with cash.
- Define and approve the commission calculation basis and payment timing separately; do not hardcode unapproved percentages.
