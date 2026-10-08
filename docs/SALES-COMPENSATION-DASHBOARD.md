# Gainora — Sales compensation dashboard specification

**Status:** Product specification, not an implemented dashboard or an approved employment contract. Designed for Sales Executive and Head of Sales.

## Recruitment proposition
Gainora competes on total compensation, transparency, flexibility and the ability to earn recurring income by creating durable customer value — not necessarily the highest base salary.

## Compensation
- Sales Executive base gross salary: **27,500 DKK/month**.
- Head of Sales base gross salary: **35,000 DKK/month**.
- Progressive **marginal** commission on employee-owned, active, paid SaaS portfolio: customers 1–20 8%, 21–40 10%, 41–60 12%, 61–100 14%, 101+ 16%.
- Head of Sales additionally receives **2% of collected net SaaS revenue from subordinate sellers' portfolios**, excluding own portfolio. Prevent multiple team overrides without explicit approval.
- All rates exclude VAT, refunds, credits and unpaid invoices. Pension and benefits are distinct and must be approved.

## Employee dashboard — requirements
1. Fixed monthly salary (contractual, role-specific).
2. Own active paying customer count, portfolio ARR/MRR, and churn.
3. Earned commission based only on reconciled, settled payment events; pending/accrued and forecast commission displayed separately and clearly labelled.
4. Progressive commission breakdown by band, rates, customers and net revenue.
5. Next tier threshold and remaining qualifying customer count.
6. Expected monthly total compensation: base + earned commission + separately identified forecast; not a payroll guarantee.
7. Portfolio history and drilldown with customer attribution, payments, refunds, chargebacks and adjustments.
8. Payout history, reconciliation state, disputes and downloadable statements.
9. Head of Sales team-only view: seller-level aggregated performance, 2% override calculation and exclusions of own accounts; avoid exposing unrelated salary or private data.
10. Role-scoped access: seller only own portfolio; Head of Sales only authorized reporting hierarchy; finance/admin auditable global access.

## Calculation and controls
- Source of truth: verified subscription payments and auditable attribution snapshots, not client-side customer counts.
- Calculate tier allocation deterministically, with effective-dated policies and payout-period snapshots.
- Clarify policy for partial payments, discounts, mid-month changes, multiple currencies, refunds, termination, leave, customer transfer and shared attribution.
- Store ledger entries for each payout and adjustment, idempotent on payment-event and beneficiary; no silent recalculation of historical earned amounts.
- Include the organization override in full contribution margin and customer acquisition economics alongside any external partner commission.
- No real customer data until privacy, RLS, tenant isolation and legal readiness checks pass.

## Implementation sequence
1. Approve compensation policy and employment/legal review.
2. Build schema for employee sales hierarchy, attribution and commission policy versions; migration + deny-by-default RLS.
3. Add tested pure progressive commission calculator, 2% organization override, reversals and idempotency tests.
4. Add tenant/role-scoped read APIs with no payroll data leakage.
5. Build employee and Head of Sales dashboards, with separate earned/pending/forecast totals.
6. Reconcile with payment provider and payroll; staged rollout on synthetic data, then authorized live accounts.

## Acceptance criteria
- At 2,495 DKK/month/customer, 20 own paying customers yield 3,992 DKK own commission; 50 yield 10,479 DKK; 100 yield 27,445 DKK.
- At 100 subordinate team customers and 2,495 DKK/customer, Head of Sales organization override is 4,990 DKK.
- No override on own customers, unpaid invoices or refunded revenue.
- Sellers cannot access other sellers' data; Head of Sales sees only their authorized organization.
- UI differentiates paid/earned vs projected and shows tier progress accurately.
