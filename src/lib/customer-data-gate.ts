/**
 * This is a deployment guard, not proof of privacy/legal readiness.
 * REAL_CUSTOMER_DATA_READY must still be approved through the release checklist.
 * Unknown or mismatched Vercel deployment contexts fail closed.
 */
export function evaluateRealCustomerDataGate(input: {
  appEnvironment: string | undefined;
  approvalFlag: string | undefined;
  vercelEnvironment: string | undefined;
  vercelMarker: string | undefined;
}): boolean {
  if (input.appEnvironment !== "production" || input.approvalFlag !== "true") return false;
  // A preview deployment must never become customer-data-ready through a
  // misconfigured NEXT_PUBLIC_APP_ENV or copied production environment variable.
  if (input.vercelEnvironment !== undefined && input.vercelEnvironment !== "production") return false;
  // Vercel supplies VERCEL=1 and VERCEL_ENV. Missing VERCEL_ENV is not proof of production.
  if (input.vercelMarker === "1" && input.vercelEnvironment !== "production") return false;
  return true;
}
