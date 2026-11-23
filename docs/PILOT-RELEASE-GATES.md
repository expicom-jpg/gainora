# P0 pilot release gates (2026-11-23)

Status: **BLOCKED / NOT APPROVED**. This document is a review checklist, not evidence of passing tests or authorization to enable production data.

## Non-negotiable release gates

| Gate | Required evidence | Owner sign-off | State |
| --- | --- | --- | --- |
| CI | Locked dependencies; typecheck, unit tests, build and dependency/security checks pass on reviewed commit | Engineering | Unverified |
| Tenant RLS | Negative tests prove cross-tenant SELECT/INSERT/UPDATE/DELETE denied; service-role access reviewed | Security | Unverified |
| Master Control | Admin actions require server-side authorization; deny-by-default and audit trails verified | Security | Unverified |
| Partner Hub | Partner approval and lead assignment enforce roles, quotas, expiry and duplicate protection server-side | Engineering | Unverified |
| Audit | Actor, tenant, action, timestamp, target and outcome recorded without secrets; immutability/retention reviewed | Security | Unverified |
| Import | XLSX/CSV size, type, row and formula limits; malicious files and spreadsheet injection tested; originals deleted per policy | Security | Unverified |
| AI / compliance | Server-side only; least data shared; prompt injection and tenant data leakage tests; human approval before action | Security | Unverified |
| Google Workspace | OAuth scope minimization, token encryption, revocation and access review | Security | Unverified |
| Billing | Test-mode checkout, verified webhook signatures, idempotency, entitlement revocation, failed payments | Engineering | Unverified |
| Privacy / operations | DPA, subprocessors, retention, backup/restore, incident response, access reviews and monitoring approved | Legal/Operations | Unverified |
| Pilot allowlist | Five explicitly approved pilot organizations; synthetic dry run and rollback plan | Product | Unverified |

## Required negative test scenarios

1. Unauthenticated request cannot read or mutate organization, partner or billing records.
2. Tenant A user cannot access Tenant B rows by changing URL, API body, organization ID or imported file ID.
3. Seller cannot self-approve partner privileges, bypass quota, claim another seller's reserved lead, or revive expired reservation.
4. Admin-only action fails for ordinary user even if the UI is manipulated; denied action is auditable.
5. Import rejects oversized, malformed, formula-bearing or unexpected file types safely; no raw financial file reaches AI.
6. Duplicate/replayed Stripe webhook does not duplicate entitlements; unsigned event is rejected.
7. Missing environment configuration fails closed; no customer data is processed with `REAL_CUSTOMER_DATA_READY` absent/false.

## Approval record (fill only after evidence exists)

- Reviewed commit SHA:
- CI run URL:
- RLS test evidence URL:
- Security review and outstanding findings:
- Rollback / incident owner:
- Explicit approval by and date:

**Do not** set `REAL_CUSTOMER_DATA_READY=true`, migrate production databases, enable real Stripe payments or onboard live customers based solely on this document.

## Product decision log

- 2026-11-23: P0 security and pilot gates take precedence over competitor-derived features. Competitor ideas require dated sources and scoring on customer value, differentiation, complexity, security and pilot relevance before implementation.
- 2026-11-23: Billing proposal: Business DKK 5,985/quarter or 20,349/year; Pro DKK 10,485/quarter or 35,649/year, ex VAT; annual prepayment highlighted. No live billing activation authorized.
