import { describe, expect, it } from "vitest";
import { evaluateRealCustomerDataGate } from "./customer-data-gate";

/**
 * Regression tests for runtime environment values that can be absent,
 * malformed or unexpectedly populated by deployment providers.
 * No real customer data or hosted services are used.
 */
describe("real customer data gate: untrusted deployment metadata", () => {
  const approved = {
    appEnvironment: "production",
    approvalFlag: "true",
    vercelEnvironment: "production",
    vercelMarker: "1"
  };

  it("rejects absent and whitespace-padded approval or environment values", () => {
    for (const key of ["appEnvironment", "approvalFlag", "vercelEnvironment", "vercelMarker"] as const) {
      for (const value of [undefined, "", " ", "\n", "production ", "true ", "1 ", "\t"]) {
        const input = { ...approved, [key]: value };
        expect(evaluateRealCustomerDataGate(input), `${key}=${JSON.stringify(value)}`).toBe(false);
      }
    }
  });

  it("does not allow a single Vercel marker to masquerade as a non-Vercel deployment", () => {
    for (const vercelEnvironment of [undefined, "", "preview", "production"]) {
      for (const vercelMarker of [undefined, "", "0", "1"]) {
        if (vercelEnvironment === undefined && vercelMarker === undefined) continue;
        const expected = vercelEnvironment === "production" && vercelMarker === "1";
        expect(evaluateRealCustomerDataGate({
          ...approved, vercelEnvironment, vercelMarker
        })).toBe(expected);
      }
    }
  });

  it("keeps approval closed for preview even with exact production app flags", () => {
    expect(evaluateRealCustomerDataGate({
      ...approved, vercelEnvironment: "preview"
    })).toBe(false);
  });
});
