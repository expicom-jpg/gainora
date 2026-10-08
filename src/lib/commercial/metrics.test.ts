import { describe, expect, it } from "vitest";
import { calculateEarnedCommission, calculatePartnerMetrics } from "./metrics";

describe("commission eligibility", () => {
  const base = { paymentEventId: "evt_1", partnerId: "partner_1", amountMinor: 249500, currency: "DKK", percentage: 20 } as const;
  it("earns only on paid events", () => {
    expect(calculateEarnedCommission({ ...base, status: "paid" }).commissionMinor).toBe(49900);
    expect(calculateEarnedCommission({ ...base, status: "failed" }).commissionMinor).toBe(0);
    expect(calculateEarnedCommission({ ...base, status: "refunded" }).commissionMinor).toBe(0);
  });
  it("rejects invalid rates and amounts", () => {
    expect(calculateEarnedCommission({ ...base, status: "paid", percentage: 101 }).eligible).toBe(false);
    expect(calculateEarnedCommission({ ...base, status: "paid", amountMinor: -1 }).eligible).toBe(false);
  });
});

describe("partner metrics", () => {
  it("calculates MRR, net earned and paid without mixing currencies", () => {
    expect(calculatePartnerMetrics({
      leads: [{ status: "won" }, { status: "new" }],
      subscriptions: [{ status: "active", amountMinor: 249500, billingInterval: "month", currency: "DKK" }, { status: "active", amountMinor: 10000, billingInterval: "month", currency: "EUR" }],
      ledger: [{ entryType: "earned", amountMinor: 49900, currency: "DKK" }, { entryType: "reversal", amountMinor: 10000, currency: "DKK" }],
      payouts: [{ status: "paid", amountMinor: 10000, currency: "DKK" }]
    })).toEqual({ leads: 2, convertedLeads: 1, activeSubscriptions: 1, mrrMinor: 249500, netEarnedMinor: 39900, paidMinor: 10000, outstandingMinor: 29900 });
  });
});
