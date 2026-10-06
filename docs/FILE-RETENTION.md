# Original Financial File Retention

## Default
Original CSV/XLSX uploads are retained for 7 days after a successful import, then deleted from private object storage.

## Why retain briefly
The short window allows import troubleshooting and customer support while reducing the amount of raw financial data retained.

## Rules
- Storage bucket is private.
- Paths are tenant-scoped: organization/import/file.
- Membership/RLS controls access.
- Raw files are not sent to AI by default.
- Parsed normalized rows are the system of record after import.
- Deletion of the original file must be audit logged.
- Failed or abandoned uploads should be deleted earlier where possible.

## Production readiness
The actual Supabase project region, backup behavior and storage deletion semantics must be documented before REAL_CUSTOMER_DATA_READY can become true.
