import {describe,it,expect} from "vitest";
import {assessValue} from "./value-attribution";
const sample={baselineAmount:1000,followupAmount:800,baselineUnits:10,followupUnits:10,evidence:"measured" as const,approvedByCustomer:false,supportingDocumentIds:[]};
describe("value attribution",()=>{
 it("does not label an unverified improvement as realized savings",()=>{expect(assessValue(sample)).toMatchObject({observedDifference:200,potentialSaving:200,verifiedSaving:null})});
 it("adjusts for volume instead of comparing raw period totals",()=>{expect(assessValue({...sample,followupAmount:1600,followupUnits:20}).observedDifference).toBe(400)});
 it("does not report a negative saving",()=>{expect(assessValue({...sample,followupAmount:1200})).toMatchObject({observedDifference:-200,potentialSaving:0,verifiedSaving:null})});
 it("requires verification, customer approval and documents",()=>{expect(assessValue({...sample,evidence:"verified",approvedByCustomer:true,supportingDocumentIds:["doc-1"]}).verifiedSaving).toBe(200);expect(assessValue({...sample,evidence:"verified",approvedByCustomer:true}).verifiedSaving).toBeNull()});
 it("rejects invalid and zero-volume inputs",()=>{expect(()=>assessValue({...sample,baselineAmount:NaN})).toThrow();expect(assessValue({...sample,followupUnits:0})).toMatchObject({comparable:false,verifiedSaving:null})});
});
