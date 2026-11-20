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
