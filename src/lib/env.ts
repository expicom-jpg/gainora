import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  REAL_CUSTOMER_DATA_READY: z.enum(["true", "false"]).default("false")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  REAL_CUSTOMER_DATA_READY: process.env.REAL_CUSTOMER_DATA_READY
});

export const isRealCustomerDataReady = env.REAL_CUSTOMER_DATA_READY === "true";
