export type AuditFindingSummary = {id:string;status:string;estimated_annual_value:number|null};
export type AuditPipelineSummary = {total:number;newCount:number;approvedCount:number;implementedCount:number;rejectedCount:number;estimatedAnnualOpportunity:number;estimatedOpportunityCount:number};
export function summarizeAuditPipeline(findings:AuditFindingSummary[]):AuditPipelineSummary {
 const active=findings.filter(f=>f.status==="identified"||f.status==="approved");
 return {
  total:findings.length,
  newCount:findings.filter(f=>f.status==="identified").length,
  approvedCount:findings.filter(f=>f.status==="approved").length,
  implementedCount:findings.filter(f=>f.status==="implemented").length,
  rejectedCount:findings.filter(f=>f.status==="rejected").length,
  estimatedAnnualOpportunity:Math.round(active.reduce((sum,f)=>sum+(typeof f.estimated_annual_value==="number"&&Number.isFinite(f.estimated_annual_value)&&f.estimated_annual_value>0?f.estimated_annual_value:0),0)*100)/100,
  estimatedOpportunityCount:active.filter(f=>typeof f.estimated_annual_value==="number"&&Number.isFinite(f.estimated_annual_value)&&f.estimated_annual_value>0).length
 };
}
export function sortAuditFindings<T extends AuditFindingSummary>(findings:T[]):T[] {
 return [...findings].sort((a,b)=>{
  const av=typeof a.estimated_annual_value==="number"&&Number.isFinite(a.estimated_annual_value)?Math.max(0,a.estimated_annual_value):0;
  const bv=typeof b.estimated_annual_value==="number"&&Number.isFinite(b.estimated_annual_value)?Math.max(0,b.estimated_annual_value):0;
  return bv-av||a.id.localeCompare(b.id);
 });
}
