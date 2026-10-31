# Compliance Portal P0: secure domain contract (synthetic-only)

Status: **domain guards + unit tests only** on a separate development branch. Not a functioning customer-support portal, not production authorization and not approved for real data.

## Required server boundary before enabling any endpoint

1. Authenticate every request server-side via the trusted Supabase session; do not accept actor ID, staff status, Master approval or permission list from a browser request.
2. Fetch the **current** Master-approved staff grant from protected tables, including active status, tenant scope, permission set and grant version. Staff logins start with zero internal rights. A partner/admin role does not imply compliance access. Revocation/suspension must be immediate and cannot rely on stale JWT claims.
3. Enforce the same policy through database RLS, not only TypeScript. Check both staff grant and case tenant membership. For search/history, filter at the database level; never fetch cross-tenant rows and filter them afterward.
4. Execute case state changes and an append-only audit entry **in one transaction**, with optimistic concurrency or row locking. Include actor, tenant, case, action, before/after status, timestamp, request/correlation ID and reason; deny the action if audit persistence fails.
5. Never allow browser callers to assert `verifiedBotService`. Verify service identity server-side, rate-limit escalation and sanitize chatbot inputs. The bot can only queue a case, never assign an employee or send a final human reply.
6. Staff can claim only queued/unassigned cases. An interim reply retains assigned status; a final reply resolves the case. A case must be assigned to the replying employee. **Both reply transitions require a nonblank message no longer than 10,000 characters**; an empty final reply cannot close a case. Prevent double-claim races at the database layer. The server must validate and sanitize content, persist the message, state transition and append-only audit record atomically; a pure allow decision must never send a message.
7. A suggested knowledge-base answer must be reviewed by a **different** active, Master-approved employee with explicit `compliance.knowledge.approve`. Approval yields `approved_for_publication`, **not automatic publication**. A later separate audited publishing step must verify the approval is current, the text is safe, tenant scope and source restrictions, and the bot knowledge index is updated only from published revisions. The approval decision now pins the exact positive integer revision and a canonical `sha256:` + 64 lowercase hex digest into `approvedRevision` and `approvedContentDigest`; neither value may be absent or malformed. The pure publication gate checks explicit `compliance.knowledge.publish`, independent approval, approved revision and the same canonical digest. **The digest must be recomputed server-side from the stored canonical text**; a client-supplied digest or status is not evidence of approval. Publication must atomically record audit and a durable index-update outbox event; until that transaction and worker exist, do not publish.
8. Redact secrets and personal/financial data from logs and knowledge proposals. Define retention, subject-access/deletion, and audit review before any customer onboarding.

## Pure-domain entry points

- `hasCurrentComplianceGrant`: default-deny staff access with Master approval, current grant version, explicit permissions and organization scope.
- `decideStaffCaseAction`: separate read, claim, interim reply, final reply and export actions. Reply actions additionally require nonblank, bounded text; the domain decision does not transmit or store it.
- `decideBotEscalation`: verified-service-only queue transition with reason.
- `decideKnowledgeApproval`: independent human approval of a pending suggestion **bound to a specific revision and canonical SHA-256 digest**. The server must recompute the digest from the exact stored canonical text and persist the approved revision/digest in the same audited transaction. This decision does not write approval to storage.
- `decideKnowledgePublication`: distinct publish permission, independent prior reviewer, unchanged approved revision and strictly formatted matching SHA-256 digests, and auditable publish decision. This is **not** an index write. Both digest values must be fetched from protected storage, not supplied by a browser.

Each positive decision includes `auditRequired: true`. This is a **contract**, not an audit implementation.

### Runtime input hardening (28 Oct 2026)

The pure decision functions reject malformed runtime identities, permissions, case identifiers/assignments and review reasons without throwing. In particular, `verifiedBotService` must be the literal boolean `true` (a truthy string such as `"false"` is denied). This prevents accidental acceptance of malformed caller data, **but does not authenticate a bot**: service identity must still be derived from trusted server credentials, never a request body. All allow decisions remain non-authoritative until server-side authorization, database RLS and transactional audit persistence are implemented. Synthetic negative tests are included.


## Synthetic audit envelope contract (30 Oct 2026)

- `prepareCaseAuditEnvelope` in `src/lib/compliance/audit-envelope.ts` builds a **pure, non-persistent** event envelope for case reads, exports, bot handoff, staff claim, interim replies and final replies.
- It records a strict event/reason code, actor type and identifier, organization/case identifiers, request correlation ID, canonical UTC timestamp, and before/after case status, assignee and optimistic version. It rejects malformed identifiers, forged/unaudited decisions, impossible transitions, wrong reply assignees, invalid timestamps and version overflow.
- The caller must pass a **trusted server-derived actor class** (`staff` or `bot_service`) separately from the decision. The envelope now rejects a bot handoff presented as a staff event, or a staff action presented as a bot event. A browser claim of actor class is never sufficient. This is a guardrail, not service authentication.
- A read/export event preserves the case version; a handoff/claim/reply transition increments it. The envelope intentionally excludes customer message text and free-form reasons to avoid leaking personal information into audit metadata.
- **This is not an audit log or proof of authorization.** Server-side identity, current Master approval, tenant membership, source case, version and timestamps must be fetched from trusted context. The database must re-authorize, enforce RLS and append the audit entry atomically with the case/message update. Read/export events also require durable audited persistence before results are disclosed. Fail closed if audit persistence fails.
- Unit tests use synthetic cases only. No audit table, RPC, endpoint, migration or worker has been deployed.

### Knowledge revision binding (31 Oct 2026)

The earlier pure approval decision did not carry an immutable revision/digest: a caller could mark a suggestion approved without specifying the exact text reviewed. This is now rejected. An allow decision explicitly returns `approvedRevision` and `approvedContentDigest`, which the future transaction must store alongside the reviewer identity. The publisher must later verify those values against the current stored revision and server-recomputed digest. Canonical formatting is **not cryptographic verification**: only trusted server-side hashing and atomic persistence provide that guarantee. All tests use synthetic digests and content; no knowledge index has been modified.

## Pilot launch blockers

- [ ] Sole Master and employee grant schema + protected approval workflow implemented.
- [ ] RLS policies for cases, staff grants, conversation messages, audit and knowledge revisions tested against direct API/database access.
- [ ] Transactional API for handoff, claim, interim/final reply, search/export and audit persistence implemented and tested.
- [ ] Separate knowledge review and publication pipeline implemented with two-person control.
- [ ] Synthetic end-to-end tests for cross-tenant access, revoked grants, stale versions, races, bot spoofing, self-approval and audit failure.
- [ ] Security/privacy review, DPIA where appropriate, retention policy, incident process and explicit REAL_CUSTOMER_DATA_READY decision.

This branch is intentionally separate from ongoing Partner Hub/Master and import PRs. Merge only after CI review; do not enable production routes or run migrations as part of this domain-only change.
