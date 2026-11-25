# Gainora P0 pilot release gate (synthetic-only until approved)

Status: **BLOCKED**. This document is a review checklist, not an approval or evidence that any control passed.

## Merge and verification order

1. Review stacked PRs #81, #82, #83, #85, #87 and #90 and their actual base/head relationships. Do not merge blindly or assume PR numbers alone establish dependencies.
2. For each candidate merge commit, require successful **security audit**, **quality** (npm ci, typecheck, unit tests, build), and **disposable PostgreSQL/RLS** checks on the *exact commit*. Re-run after any rebase. Require independent reviewer approval.
3. Verify the production branch has required branch protection and no bypass for failed security checks. Preview READY is **not** security approval.
4. Resolve the open ExcelJS/uuid advisory with a documented impact assessment; do not use `npm audit fix --force` or silently waive findings.

## Live isolation and authorization evidence (non-production)

- Use a dedicated, isolated Supabase test project with synthetic tenants A and B, two authenticated users, a suspended partner, an unapproved partner, and a Master Control administrator.
- Prove A cannot read/write B's imports, financial rows, findings, results, partner data, audit records, or file objects; test both directions and direct API/database access.
- Verify anonymous, revoked, expired and suspended sessions are denied; ensure partner approval cannot be self-granted or bypassed via direct API calls.
- Verify every privileged action has a server-derived actor and immutable, tenant-scoped audit record; audit write failure must fail closed for sensitive state transitions.
- Record exact commit SHA, test environment, test evidence, reviewer and date. Never use production credentials or customer data.

## Real-customer-data approval

- `REAL_CUSTOMER_DATA_READY` must remain false until a named human approves the release after reviewing RLS, backup/restore, deletion, DPA/subprocessors/regions, encryption, access controls, monitoring, incident response, and AI provider data terms.
- Confirm preview/staging cannot enable real data regardless of copied environment variables.
- Validate CSV/XLSX size/type limits, formula handling, malicious payloads, tenant-scoped storage, preview-before-commit, import audit and deletion on synthetic fixtures.
- Confirm Google Workspace scopes and token handling are least privilege; no live connection without explicit authorization.
- Confirm Compliance Portal/chatbot cannot disclose cross-tenant data, invent approval, or skip trusted Master Control and audit checks.
- Obtain separate explicit approval before any production deployment, migration, purchase, or real customer/partner activation.

## Pilot exit criteria

Five pilot tenants may only be invited **after** signed security and privacy review. Trial terms: 30 days free, no automatic billing without separate explicit agreement. Capture rollback plan, owner, support contact and measurable acceptance criteria. Ventora is out of scope until after pilot start.
