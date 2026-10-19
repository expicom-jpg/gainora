import {describe,it,expect} from "vitest";
import {summarizeAuditPipeline,sortAuditFindings} from "./pipeline-summary";
describe("audit pipeline summary",()=>{
 it("counts stages and only totals positive finite estimates for open findings",()=>{
  const items=[
   {id:"a",status:"identified",estimated_annual_value:100},
   {id:"b",status:"approved",estimated_annual_value:200},
   {id:"c",status:"implemented",estimated_annual_value:1000},
   {id:"d",status:"rejected",estimated_annual_value:500},
   {id:"e",status:"identified",estimated_annual_value:null},
   {id:"f",status:"approved",estimated_annual_value:NaN},
   {id:"g",status:"identified",estimated_annual_value:-20}
  ];
  expect(summarizeAuditPipeline(items)).toEqual({total:7,newCount:3,approvedCount:2,implementedCount:1,rejectedCount:1,estimatedAnnualOpportunity:300,estimatedOpportunityCount:2});
 });
 it("sorts by potential without mutating input",()=>{
  const items=[{id:"a",status:"identified",estimated_annual_value:null},{id:"b",status:"identified",estimated_annual_value:90}];
  expect(sortAuditFindings(items).map(x=>x.id)).toEqual(["b","a"]);
  expect(items[0].id).toBe("a");
 });
});
