import { describe, expect, it } from "vitest";
import { evaluateRealCustomerDataGate } from "./customer-data-gate";

describe("real customer data deployment gate", () => {
  const base = {
    appEnvironment: "production",
    approvalFlag: "true",
    vercelEnvironment: "production",
    vercelMarker: "1"
  };

  it("allows an explicitly approved production deployment", () => {
    expect(evaluateRealCustomerDataGate(base)).toBe(true);
  });

  it("allows an explicitly approved non-Vercel production deployment", () => {
    expect(evaluateRealCustomerDataGate({ ...base, vercelEnvironment: undefined, vercelMarker: undefined })).toBe(true);
  });

  const deniedCases: Array<[string, Partial<Parameters<typeof evaluateRealCustomerDataGate>[0]>]> = [
    ["development app", { appEnvironment: "development" }],
    ["staging app", { appEnvironment: "staging" }],
    ["missing approval", { approvalFlag: undefined }],
    ["false approval", { approvalFlag: "false" }],
    ["truthy but invalid approval", { approvalFlag: "TRUE" }],
    ["Vercel preview", { vercelEnvironment: "preview" }],
    ["Vercel development", { vercelEnvironment: "development" }],
    ["missing Vercel environment", { vercelEnvironment: undefined }],
    ["unknown Vercel environment", { vercelEnvironment: "custom" }]
  ];

  it.each(deniedCases)("denies %s", (_scenario, changes) => {
    expect(evaluateRealCustomerDataGate({ ...base, ...changes })).toBe(false);
  });

  it("denies a preview marker even when the app environment claims production", () => {
    expect(evaluateRealCustomerDataGate({
      appEnvironment: "production",
      approvalFlag: "true",
      vercelEnvironment: "preview",
      vercelMarker: undefined
    })).toBe(false);
  });
});
