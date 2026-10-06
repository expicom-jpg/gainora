# Gainora

Gainora 2.0 is the independently controlled rebuild of the Gainora / Pænt Betalt platform.

## Current status
Bootstrap phase. Real customer financial data is **not approved** yet.

## Stack
- Next.js / TypeScript
- PostgreSQL + Supabase Auth/Storage
- Tenant isolation with Row Level Security
- Server-side AI integration only
- GitHub CI

## Safety baseline
- Development/staging use synthetic data only.
- Raw CSV/XLSX files are not sent to AI by default.
- Production customer data is blocked until `REAL_CUSTOMER_DATA_READY=true`.
- Customer-owned rows are tenant-scoped.
- Secrets and production data must never be committed to Git.

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Configure Supabase environment variables.
3. Run `npm install`.
4. Run `npm run dev`.

## Documentation
- `docs/ARCHITECTURE.md`
- `docs/PRIVACY-SECURITY.md`
- `docs/DATA-FLOW.md`
- `docs/ROADMAP.md`
- `docs/COSTS.md`

## Production gate
Do not process real customer financial data until the privacy/security readiness checklist is complete and the gate has been explicitly approved.
