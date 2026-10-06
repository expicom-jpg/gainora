import { env, isRealCustomerDataReady } from "@/lib/env";

export function assertRealCustomerDataAllowed() {
  if (env.NEXT_PUBLIC_APP_ENV !== "production") {
    throw new Error("Real customer data is not allowed outside production.");
  }

  if (!isRealCustomerDataReady) {
    throw new Error("REAL_CUSTOMER_DATA_READY is false.");
  }
}
