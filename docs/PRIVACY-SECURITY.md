# Privacy and Security Baseline

## Default posture
Gainora 2.0 follows data minimization, least privilege and privacy by design.

## Data classes
- Account data: name, email, organization membership and roles.
- Customer financial data: uploads, parsed rows, KPIs and Profit Audit outputs.
- Operational metadata: import timestamps, validation state, approvals and audit events.

## Rules
- Never commit production customer data or secrets to Git.
- Never copy production customer data to local development.
- Staging uses synthetic data only.
- Access is role-based and tenant-scoped.
- Sensitive mutations are audit logged.
- Original uploads have an explicit retention and deletion workflow.
- Customer deletion covers database rows and stored files subject to documented legal retention requirements.

## AI processing
For every AI provider document provider/model, data categories, purpose, processing region where available, retention, training/service-improvement terms and DPA/subprocessor status.

Initial rules:
- Raw CSV/XLSX to AI: prohibited by default.
- Human approval for recommendations: required.
- Cross-tenant AI context: prohibited.
- Synthetic data in development/staging: required.

## Production readiness checklist
- [ ] Controller legal entity defined
- [ ] Privacy notice drafted
- [ ] DPAs collected
- [ ] Subprocessor register maintained
- [ ] EU data-region choices documented
- [ ] Encryption documented
- [ ] Backup retention documented
- [ ] Restore test completed
- [ ] Deletion workflow tested
- [ ] RLS/tenant-isolation tests pass
- [ ] File upload controls tested
- [ ] AI provider terms approved
- [ ] Incident-response process documented
- [ ] REAL_CUSTOMER_DATA_READY explicitly approved
