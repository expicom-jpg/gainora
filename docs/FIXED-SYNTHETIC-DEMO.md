# Fixed synthetic demo — 2026-10-08

## Scope
File import is closed for all deployments. Preview, mapping, validation and commit endpoints reject requests before parsing file/JSON payloads. Neither `synthetic: true` nor a readiness environment flag enables these endpoints. File parser libraries remain available for a future reviewed release.

`POST /api/imports/demo` accepts only `organizationId`. The database authorizes owner/admin/member and creates or reuses one fixed fixture per organization. The eight September 2026 entries total DKK 200,000 revenue, DKK 164,000 costs and DKK 36,000 result. These are fictional illustrative figures, not documented savings. Re-running the analysis preserves finding IDs, approvals and results.

## Database boundary
- Untrusted roles cannot execute the legacy arbitrary-row import RPC, insert financial rows/imports, or update financial amounts and import metadata.
- Storage denies both new uploads and replacements in `financial-imports`, including if another permissive policy is later added.
- A private, narrowly scoped SECURITY DEFINER function inserts only fixed literal data after checking auth.uid and membership. The public wrapper uses SECURITY INVOKER. The private mapping table has RLS and no client grants.
- Organization row locking serializes demo creation. Import `UPDATE(id)` exists only to support SELECT FOR UPDATE in the audit RPC; the fixture's foreign key protects its identity.
- No service key is sent to the client. Existing records are not deleted. Privileged administrative/service-role access is outside this client boundary.

## Verification
52 application tests, TypeScript and production build pass locally. CI runs all migrations in disposable PostgreSQL 17, the existing audit workflow regression, and the new demo regression. The demo regression checks repeat requests, fixed totals, legacy RPC denial, direct table writes, storage insert denial, private mapping access, outsider/viewer/anonymous denial, and owner/member/admin access. Fixtures roll back.

Before deployment, require green GitHub CI; apply the migration before merging the app. After application, rerun both SQL suites against staging and inspect Supabase advisors. No real-data flag is changed. An authenticated browser walkthrough remains a separate release check; unit/SQL tests are not browser end-to-end evidence.

## Remaining limits
This closes the financial file ingestion paths. Organization names, result notes, finding inputs and other free-text fields remain user-editable; users must not enter real customer data there. This is not a general sensitive-content detector. Legal/privacy readiness, retention/deletion, password protection and a complete authenticated browser walkthrough remain open. Reopening real financial ingestion requires a separate reviewed application and database change; toggling an environment flag is insufficient.
