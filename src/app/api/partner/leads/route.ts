import {NextResponse} from "next/server";
import {z} from "zod";
import type {SupabaseClient} from "@supabase/supabase-js";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const schema=z.object({partnerId:z.string().uuid(),companyName:z.string().trim().min(2).max(120),contactEmail:z.string().email().max(254).nullable(),contactBasis:z.string().trim().min(10).max(500)});
export async function POST(request:Request){
 const supabase=await createSupabaseServerClient();
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)return NextResponse.json({error:"Du skal logge ind."},{status:401});
 let raw:unknown;
 try{raw=await request.json()}catch{return NextResponse.json({error:"Ugyldigt JSON."},{status:400})}
 const valid=schema.safeParse(raw);
 if(!valid.success)return NextResponse.json({error:"Kontrollér virksomhedsnavn og lovligt kontaktgrundlag."},{status:400});
 const db=supabase as unknown as SupabaseClient;
 const {data:membership,error:membershipError}=await db.from("partner_members").select("partner_id,role").eq("user_id",user.id).eq("partner_id",valid.data.partnerId).in("role",["admin","seller"]).maybeSingle();
 if(membershipError||!membership)return NextResponse.json({error:"Ingen godkendt adgang til denne partner."},{status:403});
 const {data:partner,error:partnerError}=await db.from("partners").select("id,status").eq("id",membership.partner_id).maybeSingle();
 if(partnerError||partner?.status!=="active")return NextResponse.json({error:"Denne partner er ikke aktiv."},{status:403});
 // No client-submitted status, owner, attribution, payout, or commission allowed.
 const {data:created,error:insertError}=await db.from("leads").insert({partner_id:membership.partner_id,company_name:valid.data.companyName,contact_email:valid.data.contactEmail,status:"new"}).select("id").single();
 if(insertError)return NextResponse.json({error:"Lead blev ikke registreret. Kontrollér partneradgangen."},{status:400});
 // The basis is deliberately not stored until the approved GDPR workflow has an audited field.
 // Therefore, leave contact details out of the lead until contact-basis storage is shipped.
 return NextResponse.json({id:created.id},{status:201});
}