import {NextResponse} from "next/server";
import {z} from "zod";
import type {SupabaseClient} from "@supabase/supabase-js";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const schema=z.object({leadId:z.string().uuid(),partnerId:z.string().uuid(),status:z.enum(["new","contacted","qualified","demo","offer","lost"])});
export async function PATCH(request:Request){
 const supabase=await createSupabaseServerClient();
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)return NextResponse.json({error:"Log ind for at fortsætte."},{status:401});
 let raw:unknown;
 try{raw=await request.json()}catch{return NextResponse.json({error:"Ugyldig anmodning."},{status:400})}
 const parsed=schema.safeParse(raw);
 if(!parsed.success)return NextResponse.json({error:"Ugyldigt lead, partner eller status."},{status:400});
 const db=supabase as unknown as SupabaseClient;
 const {data:member,error:membershipError}=await db.from("partner_members").select("role")
  .eq("user_id",user.id).eq("partner_id",parsed.data.partnerId).in("role",["admin","seller"]).maybeSingle();
 if(membershipError||!member)return NextResponse.json({error:"Ingen adgang til at ændre dette lead."},{status:403});
 const {data:partner,error:partnerError}=await db.from("partners").select("status")
  .eq("id",parsed.data.partnerId).maybeSingle();
 if(partnerError||partner?.status!=="active")return NextResponse.json({error:"Denne partner er ikke aktiv."},{status:403});
 // Database grants permit updating *only* status, and RLS must independently verify ownership.
 const {data,error}=await db.from("leads").update({status:parsed.data.status})
  .eq("id",parsed.data.leadId).eq("partner_id",parsed.data.partnerId).select("id,status").maybeSingle();
 if(error)return NextResponse.json({error:"Leadstatus kunne ikke opdateres."},{status:400});
 if(!data)return NextResponse.json({error:"Leaddata er ikke tilgængelige for denne partner."},{status:404});
 return NextResponse.json({id:data.id,status:data.status});
}
