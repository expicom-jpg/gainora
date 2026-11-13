# P0 pilot release evidence register (2026-11-13)

**Status: BLOCKED. Synthetic data only.** This register is a review artifact, not an authorization to deploy, enable `REAL_CUSTOMER_DATA_READY`, process real customer data, run migrations, or onboard pilot customers.

## Verified on the integration branch

- Branch: `integration/p0-security-review-20261106`
- Exact head: `f99f093941fc0edac945f6501b95ceeebc91f681`
- [GitHub Actions CI #295](https://github.com/expicom-jpg/gainora/actions/runs/43181972196): **completed/success** for the exact head, checked 2026-11-13. The run-level success alone does not establish production readiness.
- [Vercel preview](https://vercel.com/expicom-7941/gainora/21v1duDKZijnga499LiqGgKFPgDW): **READY**, target `null`, same commit SHA. Preview readiness is not an application security audit.
- `package.json` on this branch pins `next: 16.4.3`, `zod: ^4.6.7`. Verify the lockfile and audit output on each subsequent head.

## Release-blocking evidence still required

| Gate | Required evidence | Status |
| --- | --- | --- |
| Dependency security | Exact-head `npm ci`, `npm audit --audit-level=high`; inspect any remaining moderate ExcelJS/uuid findings | CI success reported; detailed advisory disposition pending |
| Quality | Exact-head typecheck, unit tests, build and independent `security_audit`, `quality`, `database` jobs | Run succeeded; job-level review required |
| Tenant isolation | Live disposable PostgreSQL RLS tests for both tenants: SELECT/INSERT/UPDATE/DELETE, authenticated/anonymous roles, malformed tenant context; deny by default | **BLOCKED: no verified hosted RLS evidence** |
| Database migrations | Review SQL policies, service-role boundaries, migration ordering and rollback; test in disposable environment | Pending review; **do not apply to production** |
| Master Control | Role/permission matrix; negative tests for admin privilege escalation, approval bypass, and cross-tenant access | Pending |
| Partner Hub | Partner approval/rejection authorization, audit trail, and inability to self-approve or modify other partners | Pending |
| Audit and compliance | Immutable or tamper-evident event evidence for privileged actions, imports, deletion and customer approvals; retention/DSAR plan | Pending |
| Excel import | Synthetic malicious CSV/XLSX cases, formula injection, oversized files, MIME mismatch, schema errors, private storage, retention/deletion | Pending |
| Provider readiness | Subprocessor inventory, DPA, region, AI data-use policy, encryption, backup restore and deletion tests | Pending |
| Deployment gate | Fail-closed `REAL_CUSTOMER_DATA_READY` tests; Vercel production env and branch-protection checks independently verified | Code tests exist; live configuration review pending |
| Release decision | Named security reviewer, dated sign-off, explicit owner approval and rollback plan | **NOT APPROVED** |

## Required next steps (ordered)

1. Independently review the exact-head CI job outputs, package-lock, and remaining dependency findings.
2. Run disposable PostgreSQL RLS isolation against realistic synthetic fixtures; preserve command, SHA, job link and redacted evidence.
3. Review Master Control/Partner Hub permission boundaries and add negative authorization tests before any partner activation.
4. Review import/audit/compliance requirements, including data deletion and backup restore.
5. Obtain explicit owner/security approval before merging any production-deploying branch, migration, or pilot/customer activation.

**Change-control rule:** Every new commit invalidates prior exact-head test evidence until CI is rerun and the evidence register is updated. Vercel READY, passing CI or a draft PR alone never authorizes production changes.
