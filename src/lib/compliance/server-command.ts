/**
 * Server-boundary request parsing only; NOT an authorization decision.
 * A server handler must resolve the authenticated user, check the current
 * database Master grant, enforce tenant/case scope and persist audit atomically.
 * No client-supplied identity, grant, approval or status is accepted.
 */
export type ComplianceCaseCommand =
  | { kind: "case.read"; organizationId: string; caseId: string }
  | { kind: "case.interim_reply" | "case.final_reply"; organizationId: string; caseId: string; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedKeys = new Set(["kind", "organizationId", "caseId", "message"]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function parseComplianceCaseCommand(input: unknown): ComplianceCaseCommand | null {
  if (!isRecord(input) || Object.keys(input).some((key) => !allowedKeys.has(key))) return null;
  const { kind, organizationId, caseId, message } = input;
  if (typeof organizationId !== "string" || !UUID.test(organizationId) ||
      typeof caseId !== "string" || !UUID.test(caseId)) return null;
  if (kind === "case.read") {
    if ("message" in input) return null;
    return { kind, organizationId, caseId };
  }
  if (kind !== "case.interim_reply" && kind !== "case.final_reply") return null;
  if (typeof message !== "string" || message.trim().length === 0 ||
      message.length > 10000 || message.includes("\u0000")) return null;
  return { kind, organizationId, caseId, message };
}
