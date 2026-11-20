# P0 pilot security release gates (2026-11-20)

Status: **NOT APPROVED**. This checklist is a verification plan, not evidence of successful tests. No production changes or real customer access are authorized.

## Mandatory tenant-isolation tests
Use synthetic organizations A and B, users A-owner, A-member, B-owner, and unauthenticated user.

- [ ] A-owner can read only A's financial imports, audit findings, opportunities, approvals and result records.
- [ ] B-owner cannot read or update A records through direct ID lookup, filtered list, bulk update, nested relation or RPC.
- [ ] A-member cannot grant themselves owner/admin role, alter another tenant's memberships, or approve their own elevated permissions.
- [ ] Anonymous requests cannot enumerate tenant metadata, uploads or audit entries.
- [ ] Database RLS applies to SELECT, INSERT, UPDATE, DELETE and relevant storage policies; verify WITH CHECK on writes.
- [ ] Server actions and API routes derive organization membership from authenticated identity, never trust client-supplied org ID alone.
- [ ] Service-role credentials are server-only; no privileged bypass on user-facing routes without explicit authorization checks.
- [ ] Cross-tenant object references in spreadsheet imports are rejected atomically, without leaking other tenant data.

## Master Control / Partner Hub
- [ ] Platform-admin actions require explicit role checks and create immutable audit events.
- [ ] Partner approval, suspension and customer assignment require authorized actor, prior-state validation and audit metadata.
- [ ] Duplicate/expired lead locks cannot be extended or reassigned by unauthorized partners.
- [ ] Sensitive admin routes deny by default when configuration or identity lookup fails.

## Import / AI / audit
- [ ] XLSX/CSV limits on bytes, sheets, rows and columns; reject malformed and encrypted files; no macro execution.
- [ ] Formula-like cells are treated as untrusted data; no CSV formula injection on export.
- [ ] Upload processing and deletion follow documented retention rules; no cross-tenant storage access.
- [ ] AI output cannot execute actions; recommendations require customer approval and evidence before impact attribution.
- [ ] Audit records capture actor, tenant, action, timestamp and outcome, without secrets or raw sensitive prompts.

## Release evidence (required before any live pilot)
- [ ] CI: typecheck, build, unit tests and dependency/security checks pass on exact candidate SHA.
- [ ] RLS integration tests run against disposable nonproduction Supabase with synthetic data; attach results and policy inventory.
- [ ] Vercel preview and GitHub checks pass; secrets and environment boundaries reviewed.
- [ ] Explicit security reviewer sign-off, five-company allowlist and REAL_CUSTOMER_DATA_READY authorization recorded.

Do not treat a READY Vercel preview as security approval. Any failed gate blocks real customer data and launch.
