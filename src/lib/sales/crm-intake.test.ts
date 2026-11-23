import { describe, expect, it } from "vitest";
import { planCvrCrmIntake } from "./crm-intake";
const base = { rawCvr: "DK 12 34 56 78", verifiedRegistryName: "Demo ApS", sellerId: "seller-demo", activeReservations: 19, existingCompanyStatus: "available" as const };
describe("CVR to seller CRM intake plan", () => {
  it("prepares one assigned CRM lead with 14-day reservation", () => {
    expect(planCvrCrmIntake(base)).toEqual({
      ok: true, company: { cvr: "12345678", name: "Demo ApS" },
      sellerId: "seller-demo", stage: "new", reservationDays: 14, firstContactWithinDays: 7
    });
  });
  it("rejects the twenty-first active reservation", () => {
    expect(planCvrCrmIntake({ ...base, activeReservations: 20 }).ok).toBe(false);
  });
  it("rejects existing ownership, blocked and unverified company", () => {
    for (const status of ["mine", "other", "blocked", "pending", "unknown"] as const) {
      expect(planCvrCrmIntake({ ...base, existingCompanyStatus: status }).ok).toBe(false);
    }
  });
  it("rejects missing authenticated seller and invalid CVR", () => {
    expect(planCvrCrmIntake({ ...base, sellerId: null }).ok).toBe(false);
    expect(planCvrCrmIntake({ ...base, rawCvr: "bad" }).ok).toBe(false);
  });
});
