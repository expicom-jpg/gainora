import { describe, expect, it } from "vitest";
import { analyzePublicProfile, ratio, type PublicCompanyProfile } from "./public-company-profile";
const metric = (value:number|null,year=2025)=>({value,year,source:"Fiktiv årsrapport",publishedAt:null});
describe("public company financial analysis",()=>{
 it("calculates ratios only when years match and denominator is positive",()=>{
   expect(ratio(metric(10),metric(100))).toBe(10);
   expect(ratio(metric(10),metric(100,2024))).toBeNull();
   expect(ratio(metric(10),metric(0))).toBeNull();
   expect(ratio(metric(null),metric(100))).toBeNull();
 });
 it("does not invent unavailable revenue or margins",()=>{
   const profile:PublicCompanyProfile={cvr:"12345678",name:"Demo",industry:null,status:null,foundedAt:null,municipality:null,employees:null,metrics:{grossProfit:metric(1200000),netProfit:metric(100000)}};
   const insights=analyzePublicProfile(profile);
   expect(insights.some(i=>i.title==="Overskudsgrad")).toBe(false);
   expect(insights.some(i=>i.title==="Bruttofortjeneste")).toBe(true);
 });
});
