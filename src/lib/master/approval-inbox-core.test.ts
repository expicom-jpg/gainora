import { describe, expect, it } from "vitest";
import { validateMasterDecision, type MasterTask } from "./approval-inbox-core";
const task: MasterTask = { id: "t-1", kind: "compliance_access", status: "pending", createdAt: "2026-10-24T06:00:00Z", subjectId: "person-1", requestedBy: "staff-1", priority: "high" };
const auth = { actorId: "owner", verifiedSoleMasterId: "owner", recentMasterAuthentication: true, decision: "approve" as const, reason: "Approved for assigned duties" };
describe("Master approval inbox guard", () => {
  it("denies approvals by anyone except sole Master", () => {
    expect(validateMasterDecision(task, {...auth, actorId: "staff-1"})).toEqual({ allowed: false, reason: "sole_master_required" });
  });
  it("requires recent strong Master authentication", () => {
    expect(validateMasterDecision(task, {...auth, recentMasterAuthentication: false }).allowed).toBe(false);
  });
  it("does not act on already resolved items", () => {
    expect(validateMasterDecision({...task,status:"approved"},auth).allowed).toBe(false);
  });
  it("requires a reason", () => {
    expect(validateMasterDecision(task,{...auth,reason:" "}).allowed).toBe(false);
  });
  it("accepts explicit approve and reject from Master", () => {
    expect(validateMasterDecision(task,auth)).toEqual({ allowed: true, nextStatus:"approved", eventType:"master.approved" });
    expect(validateMasterDecision(task,{...auth,decision:"reject"})).toEqual({ allowed:true, nextStatus:"rejected", eventType:"master.rejected" });
  });
});
