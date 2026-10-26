# Compliance Portal P0: secure domain contract (synthetic-only)

Status: **domain guards + unit tests only** on a separate development branch. Not a functioning customer-support portal, not production authorization and not approved for real data.

## Required server boundary before enabling any endpoint

1. Authenticate every request server-side via the trusted Supabase session; do not accept actor ID, staff status, Master approval or permission list from a browser request.
2. Fetch the **current** Master-approved staff grant from protected tables, including active status, tenant scope, permission set and grant version. Staff logins start with zero internal rights. A partner/admin role does not imply compliance access. Revocation/suspension must be immediate and cannot rely on stale JWT claims.
3. Enforce the same policy through database RLS, not only TypeScript. Check both staff grant and case tenant membership. For search/history, filter at the database level; never fetch cross-tenant rows and filter them afterward.
4. Execute case state changes and an append-only audit entry **in one transaction**, with optimistic concurrency or row locking. Include actor, tenant, case, action, before/after status, timestamp, request/correlation ID and reason; deny the action if audit persistence fails.
5. Never allow browser callers to assert `verifiedBotService`. Verify service identity server-side, rate-limit escalation and sanitize chatbot inputs. The bot can only queue a case, never assign an employee or send a final human reply.
6. Staff can claim only queued/unassigned cases. An interim reply retains assigned status; a final reply resolves the case. A case must be assigned to the replying employee. Prevent double-claim races at the database layer.
7. A suggested knowledge-base answer must be reviewed by a **different** active, Master-approved employee with explicit `compliance.knowledge.approve`. Approval yields `approved_for_publication`, **not automatic publication**. A later separate audited publishing step must verify the approval is current, the text is safe, tenant scope and source restrictions, and the bot knowledge index is updated only from published revisions.
8. Redact secrets and personal/financial data from logs and knowledge proposals. Define retention, subject-access/deletion, and audit review before any customer onboarding.

## Pure-domain entry points

- `hasCurrentComplianceGrant`: default-deny staff access with Master approval, current grant version, explicit permissions and organization scope.
- `decideStaffCaseAction`: separate read, claim, interim reply, final reply and export actions.
- `decideBotEscalation`: verified-service-only queue transition with reason.
- `decideKnowledgeApproval`: independent human approval of a pending suggestion.

Each positive decision includes `auditRequired: true`. This is a **contract**, not an audit implementation.

## Pilot launch blockers

- [ ] Sole Master and employee grant schema + protected approval workflow implemented.
- [ ] RLS policies for cases, staff grants, conversation messages, audit and knowledge revisions tested against direct API/database access.
- [ ] Transactional API for handoff, claim, interim/final reply, search/export and audit persistence implemented and tested.
- [ ] Separate knowledge review and publication pipeline implemented with two-person control.
- [ ] Synthetic end-to-end tests for cross-tenant access, revoked grants, stale versions, races, bot spoofing, self-approval and audit failure.
- [ ] Security/privacy review, DPIA where appropriate, retention policy, incident process and explicit REAL_CUSTOMER_DATA_READY decision.

This branch is intentionally separate from ongoing Partner Hub/Master and import PRs. Merge only after CI review; do not enable production routes or run migrations as part of this domain-only change.
