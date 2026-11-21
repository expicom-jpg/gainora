# P0 tenant-isolation and pilot release test matrix

Date: 2026-11-21. Status: **NOT EXECUTED / NOT APPROVED**. No customer data may be activated based on this document.

## Required test fixtures (synthetic only)
Create org A and org B; A-admin, A-member, B-admin, B-member, an unauthenticated actor, and a revoked A-member. Use separate auth sessions and tenant-scoped records in each business table. Never use production secrets or service-role keys in browser tests.

## Must-pass checks
| ID | Actor / operation | Expected |
|---|---|---|
| RLS-01 | A-member SELECT org B financial records | Zero rows / denied |
| RLS-02 | A-admin UPDATE org B financial records | Denied; no mutation |
| RLS-03 | A-member INSERT with org_id=B | Denied |
| RLS-04 | A-member DELETE org B records | Denied |
| RLS-05 | Unauthenticated SELECT tenant records | Denied |
| RLS-06 | Revoked A-member access org A | Denied after revocation |
| RLS-07 | A-member access org B import/history/audit | Denied |
| RLS-08 | A-member access org B opportunities/approvals/results | Denied |
| RLS-09 | A-admin request org B via API parameter override | Denied server-side |
| RLS-10 | Cross-org file/storage object URL or signed URL | Denied |
| RLS-11 | Normal A-member accesses own allowed records | Allowed |
| RLS-12 | Partner without approved assignment accesses org A | Denied |
| RLS-13 | Approved partner assignment expires/revoked | Access denied thereafter |
| AUD-01 | Authorized change/approval | Actor, tenant, timestamp, action recorded |
| AUD-02 | Unauthorized mutation attempt | No business mutation; security event recorded without sensitive payload |
| MC-01 | Master Control privileged operation | Explicit role check, auditable reason, least privilege |
| IMP-01 | Excel import formula/oversize/invalid tenant | Rejected or safely sanitized, no writes |

## Execution evidence required
For every check record test path, commit SHA, environment, date, anonymized evidence, observed outcome, and reviewer. Include negative and positive assertions; ensure tests fail when RLS is disabled or tenant filters removed. Validate with authenticated user tokens, not only service-role connections. Verify every exposed table and storage bucket; inventory missing policies explicitly.

## Release gate
Block REAL_CUSTOMER_DATA_READY until all critical checks pass in a non-production environment, no critical/high findings remain, audit retention and incident response are reviewed, and a named human approves the release. A Vercel READY deployment or a passing unit test alone does not satisfy this gate.

## Next implementation
Locate current Supabase schema and test harness; add reproducible isolated integration tests for RLS-01 through RLS-05 first. If credentials or ephemeral database are unavailable, report these as unexecuted, never passed.
