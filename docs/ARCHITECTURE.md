# Gainora 2.0 Architecture

## Goal
Gainora 2.0 is an independently controlled SaaS platform for financial analysis, Profit Audit, Opportunities, Result Documentation and Value Attribution.

## Proposed stack
- Application: Next.js / TypeScript
- Database: PostgreSQL via Supabase, EU region preferred
- Authentication: Supabase Auth
- File storage: private tenant-scoped object storage
- Hosting/API: Vercel or equivalent
- AI: server-side provider API only
- Source control: GitHub

## Core domains
1. Organizations / tenants
2. Users and memberships
3. Financial imports
4. Profit Audit
5. Opportunities
6. Approval workflow
7. Results
8. Value Attribution
9. Audit log

## Tenant isolation
Every customer-owned row must carry an organization_id. Row Level Security must enforce tenant boundaries. No browser client receives service-role credentials.

## File import flow
1. Upload CSV/XLSX to private tenant-scoped storage.
2. Validate type, size and schema server-side.
3. Parse and normalize server-side.
4. Write validated rows to PostgreSQL.
5. Apply a short, explicit original-file retention policy.
6. Log import state, validation errors and deletion state.

## AI boundary
AI is not the system of record. Only minimum necessary data is sent. Raw uploads are not sent to AI by default. AI recommendations require human approval before becoming recorded Opportunities or Results.

## Environments
- local
- staging: synthetic/test data only
- production: real customer data only after readiness approval

## REAL_CUSTOMER_DATA_READY gate
This may only become true after vendor/DPA records, data regions, encryption, backups, deletion, tenant-isolation tests, production secrets, AI data-use terms and restore procedures are documented and verified.
