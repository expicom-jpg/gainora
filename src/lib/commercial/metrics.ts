export type CommissionEntry = { paymentEventId: string; partnerId: string; amountMinor: number; currency: string; status: "paid" | "failed" | "pending" | "refunded" | "reversed"; percentage: number };
export type CommissionResult = { eligible: boolean; commissionMinor: number; reason: string };

/** Pure calculation. Persistence must enforce unique payment event + partner + entry type. */
export function calculateEarnedCommission(input: CommissionEntry): CommissionResult {
  if (input.status !== "paid") return { eligible: false, commissionMinor: 0, reason: "payment_not_paid" };
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0)
    return { eligible: false, commissionMinor: 0, reason: "invalid_payment_amount" };
  if (!Number.isFinite(input.percentage) || input.percentage < 0 || input.percentage > 100)
    return { eligible: false, commissionMinor: 0, reason: "invalid_commission_rate" };
  if (!input.paymentEventId || !input.partnerId || !input.currency)
    return { eligible: false, commissionMinor: 0, reason: "missing_attribution" };
  return { eligible: true, commissionMinor: Math.round(input.amountMinor * input.percentage / 100), reason: "paid_and_attributed" };
}

export type PartnerMetricsInput = {
  leads: { status: string }[];
  subscriptions: { status: string; amountMinor: number; billingInterval: string; currency: string }[];
  ledger: { entryType: "earned" | "reversal" | "paid_adjustment"; amountMinor: number; currency: string }[];
  payouts: { status: string; amountMinor: number; currency: string }[];
};

/** All monetary amounts are minor units. Never combine currencies in one total. */
export function calculatePartnerMetrics(data: PartnerMetricsInput, currency = "DKK") {
  const active = data.subscriptions.filter(s => s.status === "active" && s.currency === currency);
  const mrrMinor = active.reduce((sum, s) => sum + (s.billingInterval === "year" ? Math.round(s.amountMinor / 12) : s.billingInterval === "month" ? s.amountMinor : 0), 0);
  const earnedMinor = data.ledger.filter(e => e.currency === currency && e.entryType === "earned").reduce((s,e) => s + e.amountMinor, 0);
  const reversedMinor = data.ledger.filter(e => e.currency === currency && e.entryType === "reversal").reduce((s,e) => s + e.amountMinor, 0);
  const paidMinor = data.payouts.filter(p => p.currency === currency && p.status === "paid").reduce((s,p) => s + p.amountMinor, 0);
  return {
    leads: data.leads.length,
    convertedLeads: data.leads.filter(l => l.status === "won").length,
    activeSubscriptions: active.length,
    mrrMinor,
    netEarnedMinor: earnedMinor - reversedMinor,
    paidMinor,
    outstandingMinor: earnedMinor - reversedMinor - paidMinor
  };
}
