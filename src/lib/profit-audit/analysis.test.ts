import { describe,it,expect } from "vitest";
import { analyzeFinancialRows,costReductionScenario } from "./analysis";
describe("audit detail",()=>{
 it("calculates monthly profit and cost concentrations",()=>{
  const x=analyzeFinancialRows([
   {account:"Salg",description:"",amount:1000,transactionDate:"2026-01-01"},
   {account:"Vareforbrug",description:"",amount:-400,transactionDate:"2026-01-02"},
   {account:"Løn",description:"",amount:-200,transactionDate:"2026-02-02"}
  ]);
  expect(x.profit).toBe(400);
  expect(x.accounts[0].shareOfCosts).toBeCloseTo(66.67);
  expect(x.monthly).toEqual([
   {month:"2026-01",revenue:1000,costs:400,profit:600,marginPct:60},
   {month:"2026-02",revenue:0,costs:200,profit:-200,marginPct:0}
  ]);
 });
 it("labels scenario as hypothetical and rejects invalid input",()=>{
  expect(costReductionScenario(100000,2)).toBe(2000);
  expect(()=>costReductionScenario(100000,-1)).toThrow();
 });
});
