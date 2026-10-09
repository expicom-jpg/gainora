# Gainora cash model — use and limitations

Status: draft planning tool extending SALES-POLICY-DECISION-PACK.md. No hiring or payout authorization. Python 3 standard library only.

## Run

From the repository root:

```sh
python3 docs/sales_cash_model.py --self-test
python3 docs/sales_cash_model.py --template > /tmp/gainora-private-inputs.json
python3 docs/sales_cash_model.py --input /tmp/gainora-private-inputs.json
python3 docs/sales_cash_model.py --demo
```

Keep actual bank balances, employment details and private financial inputs outside the repository. The committed template deliberately has null values; a verified zero must be entered explicitly. The demo has invented scenarios and is always labelled ILLUSTRATIVE_ONLY. Its zero opening cash exposes funding needs; it is not a statement about Gainora's actual balance.

## What it calculates

- Three separate 18-month monthly cash ledgers: base, downside, severe.
- Opening cash, cash receipts/payments, closing cash and reserve breaches.
- Minimum opening cash needed to preserve the entered reserve over all 18 months.
- A six-month cash check starting at the proposed commitment month, also checking the lead-up to that month. Commitment month must be 1–13 so all six months fit.
- Proposed policy checks: channel contribution >=70%, CAC payback <=12 months, 90-day paid retention >=90%, at least three mature paid cohorts. These are unapproved internal proposals from the decision pack.

The lowest channel contribution/retention and highest channel CAC payback must be supplied from supporting cohort calculations, not inferred from company averages. The model does not calculate CAC or retention from underlying customer data. Review small sample sizes separately. Set evidence flags true only when the underlying review has actually been completed.

## Fill the monthly rows

Enter each payment in its actual expected cash month, not when revenue or expense is recognized. All cash amounts are nonnegative; outflows have their own fields. Months must be exactly 1–18 and no cash line may be missing.

| Input | Meaning |
|---|---|
| opening_unrestricted_cash | Available company cash at the start, excluding restricted funds |
| commitment_start_month | Month the proposed employment commitment begins; assess each proposed hire separately |
| subscription_collections | Subscription cash received excluding VAT, before separately entered refunds |
| committed_funding_received | Only committed funding, entered when available; omit speculative fundraising by entering zero |
| other_cash_received | Other verified receipts, including VAT collected where relevant |
| commissions_paid | Actual cash commissions after validated reversals; independent of accounting accrual date |
| fixed_gross_payroll | Salary cash for the roles actually employed that month |
| employer_costs | Employer costs on salary AND variable compensation where applicable; obtain actual amounts |
| founder_pay_and_costs | Founder compensation and associated employer costs, if any |
| platform_and_processing | Platform and payment-processing cash costs |
| fixed_operations | Fixed operations not included elsewhere |
| marketing | Acquisition spending excluding payroll already counted |
| onboarding_and_support | Incremental delivery costs excluding payroll/platform already counted |
| product_security_compliance | Additional product, security and compliance spending not elsewhere |
| tax_vat_payments | Tax/VAT cash payments; balance VAT collections under other_cash_received |
| refunds_and_chargebacks | Cash returned to customers; do not also subtract it from collections |
| capex_debt_and_other | Capex, debt and other cash obligations, including opening liabilities as they fall due |
| reserve_required | Approved minimum cash reserve for that month; proposed basis is two months of committed fixed cash costs |

Do not count a cost twice across fields. When processor payouts are net of fees, reconcile to gross receipts plus fees before input. Commission refunds reducing future payouts can be netted within nonnegative commissions_paid; a net cash recovery belongs in other_cash_received with a reconciliation. Track unpaid earned commission as a future cash obligation even if not yet paid.

The reserve is an INPUT, not automatically calculated: update it when commitments or fixed costs change and document the approved basis. An apparent cash PASS with an unjustifiably low reserve is not valid evidence. The model checks month-opening/month-closing balances only; maintain a separate within-month cash calendar and confirm the intramonth review flag.

## Result states

- NOT_READY: missing/invalid financial input or unconfirmed evidence/KPI. Missing cash inputs suppress calculations rather than treating them as zero.
- FAIL: a complete cash model breaches the downside gate or an entered KPI fails. Missing evidence is still reported alongside any failure.
- REVIEW_REQUIRED: entered checks pass and evidence is marked confirmed; human review remains necessary. Never interpreted as automatic spending authority.
- ILLUSTRATIVE_ONLY: demonstration, irrespective of numerical outcomes.

The severe scenario is reported separately and does not replace the mandatory downside gate. All 18 months remain visible even where the six-month gate passes. A later reserve breach must inform longer-term hiring/funding decisions.

## Demo assumptions and verification

Demo uses common progressive employee commissions, 2% subordinate override, 20% partner commissions, 40/40/20 customer attribution, 2,495/month, both full-time roles from month 1, 15% payroll burden, 10% platform expense and 20,000 fixed operations. Reserve is 183,750. Other cash costs are zero ONLY for reconciliation with the published illustration, not a complete cost forecast.

First six months reproduce the decision pack. Months 7–18 hold customers flat at 100 / 30 / 0 respectively; these extensions are illustrations, not sales targets or forecasts. No churn, collections delay, supplier revenue or growth spending is inferred. Progressive commission calculations assume equal-priced monthly settled subscriptions and one portfolio per role; they are NOT production commission ledger code.

Self-checks cover original reconciliations, four commission boundaries, missing and invalid inputs, six-month horizon availability, policy failures and the fact that sufficient cash alone cannot produce readiness. No application or deployment behavior changes.

## Inputs still needed

1. Dated available cash and outstanding obligations.
2. Actual settled customer revenue and channel/cohort evidence.
3. Intended hiring dates/hours and itemized employment costs.
4. Acquisition, onboarding, support and platform cost assumptions supported by evidence.
5. Approval or revision of the proposed policy thresholds and reserve.

These can be entered later without rebuilding the model. No live financial facts or contractual decisions have been invented.
