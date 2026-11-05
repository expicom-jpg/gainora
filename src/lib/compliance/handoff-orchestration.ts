/**
 * Synthetic-only orchestration of handoff preflight and committed receipt.
 * No database writes, API route, or real bot authentication are implemented.
 * The trusted commit adapter MUST reauthenticate service identity, lock the
 * case, recheck tenant/state/version, and atomically persist queue + audit.
 * Never acknowledge the preflight alone.
 */
import { prepareBotHandoff, type TrustedBotHandoffDependencies } from "./bot-handoff-preflight";
import { acknowledgeCommittedHandoff } from "./handoff-commit-receipt";
import type { CaseAuditEnvelope } from "./audit-envelope";

export type HandoffExecutionResult =
  | { acknowledged: true; auditEventId: string }
  | { acknowledged: false };

export async function executeBotHandoff(
  raw: unknown,
  trusted: TrustedBotHandoffDependencies,
  trustedCommit: (envelope: CaseAuditEnvelope) => Promise<unknown>
): Promise<HandoffExecutionResult> {
  try {
    const prepared = await prepareBotHandoff(raw, trusted);
    if (!prepared.prepared) return { acknowledged: false };
    return await acknowledgeCommittedHandoff(prepared.audit, trustedCommit);
  } catch {
    return { acknowledged: false };
  }
}
