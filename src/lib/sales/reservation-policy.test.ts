import { describe, expect, it } from "vitest";
import { evaluateReservation, LEAD_POLICY } from "./reservation-policy";
const valid = { verifiedAvailable: true, activeReservations: 0, blocked: false, authenticatedSeller: true, adminOverrideApproved: false };
describe("proposed sales reservation policy", () => {
  it("permits eligible seller below quota to request reservation", () => {
    expect(evaluateReservation(valid).allowed).toBe(true);
  });
  it("rejects quota excess unless approved override", () => {
    expect(evaluateReservation({ ...valid, activeReservations: LEAD_POLICY.maxActiveReservations }).allowed).toBe(false);
    expect(evaluateReservation({ ...valid, activeReservations: LEAD_POLICY.maxActiveReservations, adminOverrideApproved: true }).allowed).toBe(true);
  });
  it("never overrides blocked, unverified or unauthenticated status", () => {
    for (const change of [{blocked:true},{verifiedAvailable:false},{authenticatedSeller:false}]) {
      expect(evaluateReservation({...valid,...change,adminOverrideApproved:true}).allowed).toBe(false);
    }
  });
});
