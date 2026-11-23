import { describe, expect, it } from "vitest";
import { canRequestPipelineClaim, normalizeCvr } from "./cvr-intake";

describe("CVR pipeline intake: fail closed", () => {
  it("normalizes Danish CVR formatting", () => {
    expect(normalizeCvr("DK 12 34 56 78")).toBe("12345678");
    expect(normalizeCvr("12-34-56-78")).toBe("12345678");
  });
  it("rejects invalid or ambiguous CVR input", () => {
    for (const input of ["", "1234567", "123456789", "DK 1234567x", "1234/5678"]) {
      expect(normalizeCvr(input)).toBeNull();
    }
  });
  it("only permits a request for verified available companies", () => {
    expect(canRequestPipelineClaim("available").allowed).toBe(true);
    for (const status of ["mine", "other", "pending", "blocked", null] as const) {
      expect(canRequestPipelineClaim(status).allowed).toBe(false);
    }
  });
});
