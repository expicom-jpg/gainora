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

  // A non-Vercel production deployment has neither Vercel variable.
  // If either variable is present, require BOTH exact production markers.
  // Otherwise VERCEL_ENV=production with VERCEL missing/spoofed could
  // incorrectly make a misconfigured deployment customer-data-ready.
  if (input.vercelEnvironment === undefined && input.vercelMarker === undefined) return true;
  return input.vercelEnvironment === "production" && input.vercelMarker === "1";
}
