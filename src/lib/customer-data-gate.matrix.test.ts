import { describe, expect, it } from "vitest";
import { evaluateRealCustomerDataGate } from "./customer-data-gate";

describe("real customer data gate deployment matrix", () => {
  const production = {
    appEnvironment: "production",
    approvalFlag: "true",
    vercelEnvironment: "production",
    vercelMarker: "1"
  };

  it("only allows exact production approval for Vercel deployments", () => {
    for (const appEnvironment of ["development", "staging", "production", "", "Production"]) {
      for (const approvalFlag of ["true", "false", "TRUE", "", "1"]) {
        for (const vercelEnvironment of ["production", "preview", "development", "", "Production"]) {
          for (const vercelMarker of ["1", "0", "true", "", "1 "]) {
            const allowed = appEnvironment === "production" &&
              approvalFlag === "true" &&
              vercelEnvironment === "production" &&
              vercelMarker === "1";
            expect(evaluateRealCustomerDataGate({
              appEnvironment, approvalFlag, vercelEnvironment, vercelMarker
            })).toBe(allowed);
          }
        }
      }
    }
  });

  it("rejects partial Vercel metadata even when app approval is true", () => {
    for (const vercelEnvironment of ["production", "preview", undefined]) {
      for (const vercelMarker of ["1", "0", undefined]) {
        if (vercelEnvironment === undefined && vercelMarker === undefined) continue;
        const allowed = vercelEnvironment === "production" && vercelMarker === "1";
        expect(evaluateRealCustomerDataGate({
          ...production, vercelEnvironment, vercelMarker
        })).toBe(allowed);
      }
    }
  });

  it("requires exact approval in non-Vercel deployments", () => {
    for (const approvalFlag of ["true", "false", "TRUE", "", undefined]) {
      expect(evaluateRealCustomerDataGate({
        ...production, approvalFlag,
        vercelEnvironment: undefined, vercelMarker: undefined
      })).toBe(approvalFlag === "true");
    }
  });
});
