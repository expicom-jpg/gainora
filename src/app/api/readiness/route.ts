import { NextResponse } from "next/server";
import { env, isRealCustomerDataReady } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    environment: env.NEXT_PUBLIC_APP_ENV,
    realCustomerDataReady: isRealCustomerDataReady
  });
}
