import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeFinancialRows } from "@/lib/profit-audit/analysis";
import { generateRecommendations } from "@/lib/profit-audit/recommendations";

const params = z.object({ organizationId:z.string().uuid(), importId:z.string().uuid() });
export async function GET(request:NextRequest) {
 try {
  await requireUser();
  const parsed=params.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if(!parsed.success)return NextResponse.json({error:"invalid_request"},{status:400});
  const supabase=await createSupabaseServerClient();
  const {organizationId,importId}=parsed.data;
  // RLS applies to both queries. Never use a service-role client for this endpoint.
  const rows: {account:string;description:string;amount:number;transaction_date:string|null}[]=[];
  for(let offset=0;;offset+=1000){
   const {data,error}=await supabase.from("financial_rows").select("account,description,amount,transaction_date").eq("organization_id",organizationId).eq("import_id",importId).order("id").range(offset,offset+999);
   if(error)throw error;
   rows.push(...(data??[]).map(r=>({account:String(r.account),description:String(r.description??""),amount:Number(r.amount),transaction_date:r.transaction_date})));
   if(!data||data.length<1000)break;
   if(offset>=99000)return NextResponse.json({error:"import_too_large"},{status:413});
  }
  if(rows.length===0)return NextResponse.json({error:"no_rows"},{status:404});
  const analysis = analyzeFinancialRows(rows.map(r=>({account:r.account,description:r.description,amount:r.amount,transactionDate:r.transaction_date})));
  return NextResponse.json({analysis,recommendations:generateRecommendations(analysis)});
 }catch(error){
  if(error instanceof Error&&error.message==="UNAUTHENTICATED")return NextResponse.json({error:"unauthenticated"},{status:401});
  return NextResponse.json({error:"audit_detail_failed"},{status:500});
 }
}
