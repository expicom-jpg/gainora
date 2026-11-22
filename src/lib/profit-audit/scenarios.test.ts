import { describe, expect, it } from "vitest";
import { projectScenario } from "./scenarios";
const base={monthlyRevenue:100000,monthlyCosts:80000,revenueChangePct:5,costChangePct:-3,months:12};
describe("scenario modelling",()=>{
 it("calculates projected profit and change without claiming verified savings",()=>{
  expect(projectScenario(base)).toMatchObject({baselineMonthlyProfit:20000,projectedMonthlyRevenue:105000,projectedMonthlyCosts:77600,projectedMonthlyProfit:27400,monthlyProfitDifference:7400,periodProfitDifference:88800});
  expect(projectScenario(base).disclaimer).toContain("Ikke en prognose");
 });
 it("handles zero revenue without a fabricated margin",()=>{expect(projectScenario({...base,monthlyRevenue:0,revenueChangePct:0}).projectedMonthlyMarginPct).toBeNull()});
 it("rejects invalid numbers and time horizons",()=>{
  expect(()=>projectScenario({...base,months:37})).toThrow();
  expect(()=>projectScenario({...base,revenueChangePct:-101})).toThrow();
  expect(()=>projectScenario({...base,monthlyCosts:NaN})).toThrow();
 });
});
