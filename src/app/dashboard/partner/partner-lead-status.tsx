"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
const options=[["new","Ny"],["contacted","Kontaktet"],["qualified","Kvalificeret"],["demo","Demo"],["offer","Tilbud"],["lost","Tabt"]] as const;
export function PartnerLeadStatus({leadId,partnerId,initialStatus,canEdit}:{leadId:string;partnerId:string;initialStatus:string;canEdit:boolean}){
 const router=useRouter();
 const [status,setStatus]=useState(initialStatus);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 if(!canEdit||!options.some(([value])=>value===initialStatus))return <span className="status">{initialStatus}</span>;
 async function change(next:string){
  setBusy(true);setError("");
  try{
   const response=await fetch("/api/partner/leads/status",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({leadId,partnerId,status:next})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error??"Kunne ikke gemme");
   setStatus(result.status);router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Fejl ved opdatering");}
  finally{setBusy(false)}
 }
 return <div><select aria-label="Leadstatus" value={status} disabled={busy} onChange={e=>void change(e.target.value)}>
  {options.map(([value,label])=><option key={value} value={value}>{label}</option>)}
 </select>{error?<small role="alert" style={{color:"var(--bad)"}}>{error}</small>:null}</div>;
}
