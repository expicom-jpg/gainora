# Gainora / Pænt Betalt — status 2026-10-08

## Verified from repository
- Stack: Next.js, TypeScript, Supabase; test command `npm test`, typecheck `npm run typecheck`, build `npm run build`.
- Recent commits introduce evidence-aware recommendations, monthly/account analysis, and rejection of partial financial reads.
- Production privacy checklist in `docs/PRIVACY-SECURITY.md` remains unchecked; `REAL_CUSTOMER_DATA_READY` must stay false until explicitly approved.

## Immediate execution order
1. Run tests, typecheck, build in CI and capture exact results. Do not treat merged commits as deployment proof.
2. Synthetic CSV/XLSX end-to-end: upload, preview, validation, tenant-scoped complete import, monthly totals, recommendations, approval, deletion.
3. Negative tests: tenant A cannot access tenant B; malformed files, oversized uploads, incomplete paginated reads, duplicate imports, unauthenticated access.
4. Verify pilot allowlist and owner bootstrap in staging with synthetic data; record evidence, not assumptions.
5. Document actual infrastructure regions, DPAs, subprocessors, encryption, backups, retention, deletion, AI training terms before any real financial data.
6. Only after all gates pass, approve a controlled five-customer pilot.

## Release gate
**REAL_CUSTOMER_DATA_READY = false (not verified).** No real customer financial data in development or staging.

## Product priorities
- Profit Audit findings must cite traceable scoped data and distinguish verified savings from hypothetical scenarios.
- Preserve human approval of recommendations and clear DKK/month/year units.
- Plan Dinero, e-conomic, bank read-only integrations and Stripe without enabling unreviewed access or billing.

## Source of truth
GitHub repository is source of truth for code; project notes can be mirrored to the ChatGPT Library project folder. This document records priorities, not test execution or production approval.
