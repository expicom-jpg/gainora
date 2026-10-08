import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeFinancialRows } from "@/lib/profit-audit/analysis";
import { generateRecommendations } from "@/lib/profit-audit/recommendations";
import { loadFinancialRows } from "@/lib/profit-audit/load-rows";

const params = z.object({ organizationId:z.string().uuid(), importId:z.string().uuid() });
export async function GET(request:NextRequest) {
 try {
  await requireUser();
  const parsed=params.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if(!parsed.success)return NextResponse.json({error:"invalid_request"},{status:400});
  const supabase=await createSupabaseServerClient();
  const {organizationId,importId}=parsed.data;
  // The session client preserves RLS; both endpoints use identical scoped inputs.
  const rows = await loadFinancialRows(supabase, organizationId, importId);
  const analysis = analyzeFinancialRows(rows);
  return NextResponse.json({analysis,recommendations:generateRecommendations(analysis)});
 }catch(error){
  if(error instanceof Error){
   const status=error.message==="no_rows"?404:error.message==="import_too_large"?413:["audit_rows_incomplete","audit_rows_changed"].includes(error.message)?409:null;
   if(status)return NextResponse.json({error:error.message},{status});
  }
  if(error instanceof Error&&error.message==="UNAUTHENTICATED")return NextResponse.json({error:"unauthenticated"},{status:401});
  return NextResponse.json({error:"audit_detail_failed"},{status:500});
 }
}
