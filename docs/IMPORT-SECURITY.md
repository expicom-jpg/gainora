# Import Security

## Accepted formats
- CSV
- XLSX

## Initial limits
- Maximum upload size: 5 MB
- Authenticated users only
- User must belong to the selected organization
- Parsing occurs server-side
- Preview does not persist financial rows
- Unsupported file types are rejected

## Production rule
Preview and validation may be developed with synthetic data.
Permanent storage of real customer financial data remains blocked until REAL_CUSTOMER_DATA_READY is approved.

## Next controls
- canonical column mapping
- formula/cell-type hardening
- malware/content scanning where appropriate
- private object storage
- retention/deletion job
- import audit event
