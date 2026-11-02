# P0 Compliance case preflight – synthetic-only integration contract

Status: **development-only preflight**. Not an authenticated route, not a database
authorization mechanism, not an audit writer, and not safe for real customer data.

## Implemented in this branch

`src/lib/compliance/case-preflight.ts` composes the strict request parser from
PR #89, the current-grant domain policy from PR #80, and the audit envelope.
It uses server-provided async adapters to resolve (1) authenticated actor,
(2) current protected Master-approved grant, (3) case record and version,
and (4) request correlation ID and UTC timestamp.

The preflight rejects unrecognized client fields, invalid IDs, stale grants,
suspended/unapproved staff, missing reply permission, cross-tenant case
snapshots, unassigned replies, bad audit metadata and failed lookups. All
denials after parsing have the same generic result to avoid revealing
whether a tenant, case, staff grant or audit context exists.

Interim reply remains `assigned`; final reply becomes `resolved` in the
**proposed audit envelope only**. No message is sent and no case is changed.
No free-form message body is included in the audit envelope.

## Non-negotiable production integration requirements

1. Implement each trusted adapter **server-only** using a validated Supabase
   session and protected database data. Never pass browser-provided grant,
   actor identity, case, version, or bot-service flag to the adapter.
2. Do **not** treat `prepared: true` as permission to disclose a case, send a
   message or write state. A preflight check can race with Master revocation,
   reassignment, tenant changes or another reply.
3. Implement a narrowly privileged **database transaction/RPC** that
   re-authenticates the caller, re-evaluates the current Master grant and tenant
   permission under RLS, locks/checks the case version and assignee, writes the
   message and state transition, and appends the immutable audit event in
   the **same transaction**. Roll back if any part fails. Read operations must
   also persist their audit entry before returning case data.
4. Never use a service-role client to bypass RLS without a separately reviewed,
   scoped security-definer boundary. Verify Supabase roles, function execution
   grants and `search_path` in hosted staging before any pilot.
5. Escalation from chatbot and knowledge approval/publication are **separate**
   workflows. The bot must have a verified server service identity; the
   knowledge publisher must recompute the exact stored text digest and require
   an independent human review. Neither is enabled by this preflight.
6. Add disposable DB tests for atomic audit rollback, version races, tenant
   isolation, suspended Master, expired approval and replayed requests before
   exposing any route.

This branch intentionally does not touch general Gainora PR #90 (two-tenant
results RLS), hosted Supabase, production migrations, customer data or payments.
The Compliance stack is PR #88 -> #89 -> this branch, and remains draft.
