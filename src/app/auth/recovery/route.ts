import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function GET(request:NextRequest){
const tokenHash=request.nextUrl.searchParams.get("token_hash");
const type=request.nextUrl.searchParams.get("type");
const code=request.nextUrl.searchParams.get("code");
const destination=new URL("/reset-password",request.url);
const supabase=await createSupabaseServerClient();
if(tokenHash&&type==="recovery"){const{error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:"recovery"});if(!error)return NextResponse.redirect(destination);}
else if(code){const{error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(destination);}
const failure=new URL("/forgot-password",request.url);failure.searchParams.set("error","invalid_recovery_link");return NextResponse.redirect(failure);
}
