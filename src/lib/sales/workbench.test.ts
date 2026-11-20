import { describe, expect, it } from "vitest";
import { prioritizeLead, summarizePipeline, type LeadSignal } from "./workbench";

const lead: LeadSignal = {
  id: "synthetic-01", company: "Demo ApS", stage: "qualified",
  sectorFit: 2, valuePotential: 2, buyingSignal: 2,
  nextActionAt: "2026-11-18", blocked: false, ownership: "mine"
};

describe("synthetic sales workbench safety", () => {
  it("scores an overdue qualified lead with an explainable next action", () => {
    expect(prioritizeLead(lead, "2026-11-20")).toMatchObject({
      score: 110, priority: "high", nextStep: "Gennemgå opfølgning manuelt"
    });
  });
  it("never suggests contacting a blocked lead", () => {
    expect(prioritizeLead({ ...lead, blocked: true }, "2026-11-20")).toMatchObject({
      score: 0, nextStep: "Ingen automatisk kontakt"
    });
  });
  it("does not expose another seller's lead as actionable", () => {
    expect(prioritizeLead({ ...lead, ownership: "other" }, "2026-11-20").priority).toBe("low");
  });
  it("does not trigger actions for won or lost leads", () => {
    for (const stage of ["won", "lost"] as const) {
      expect(prioritizeLead({ ...lead, stage }, "2026-11-20").nextStep).toBe("Ingen automatisk kontakt");
    }
  });
  it("excludes owned-elsewhere and blocked rows from personal metrics", () => {
    expect(summarizePipeline([lead, { ...lead, id: "2", ownership: "other" }, { ...lead, id: "3", blocked: true }])).toEqual({
      active: 1, qualified: 1, won: 0, blockedOrOwnedElsewhere: 2
    });
  });
});
