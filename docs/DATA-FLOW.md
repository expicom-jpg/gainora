# Gainora 2.0 Data Flow

## Financial upload
User -> authenticated web app -> private tenant-scoped storage -> server-side parser -> normalized PostgreSQL rows -> deterministic Profit Audit.

## AI usage
Normalized, minimized facts -> server-side AI request -> suggested narrative/recommendation -> human approval -> stored Opportunity/Result.

Raw CSV/XLSX files are not sent to AI by default.

## Deletion
Customer deletion request -> tenant records identified -> stored files deleted -> database rows deleted/anonymized according to policy -> audit event written -> backup expiry follows documented provider retention.

## Environments
Development and staging use synthetic data only.
Production may use real customer data only when REAL_CUSTOMER_DATA_READY is explicitly true and the readiness checklist is complete.
