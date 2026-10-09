# Gainora — Sales policy and cash decision pack

Date: 2026-10-09
Status: DRAFT RECOMMENDATIONS. Not approved compensation, contracts, hiring authority or a forecast of actual traction.

## Purpose and precedence

Consolidates the unresolved decisions in:
- [PR #30](https://github.com/expicom-jpg/gainora/pull/30), reviewed at b46cde5a6bcf6a3d3e0cb9e0c301f3ad446a5cc3.
- [PR #32](https://github.com/expicom-jpg/gainora/pull/32), reviewed at 4b08f0b7506e5dc3935b2a27ea2ebc1bb2177210.

Both remained open when reviewed. This pack does not silently amend either proposal. Proposed changes are explicit below. Adoption requires an approval record identifying policy version, effective date and decision owner; merging documentation alone does not authorize expenditure or contracts.

## 1. Recommended compensation policy

| Item | Recommendation | Approval/evidence still needed |
|---|---|---|
| Founder salary | 0 DKK in initial planning; review personal sustainability monthly and before each hire | Founder confirms duration and any later salary start month/amount |
| Sales Executive | 27,500 DKK gross/month at full time | Actual employer cost breakdown and contract review |
| Head of Sales / Morten | 35,000 DKK gross/month at full time | Role, hours, start date; part-time pay must be separately specified |
| Own-portfolio commission | Same progressive marginal schedule for both roles | Explicit approval: replaces PR #32's illustrative flat 10% employee rate |
| Head of Sales override | 2% on subordinate employed sellers' settled net subscription revenue | Reporting lines and effective dates |
| External referrals | Retain 20% as a stress-tested planning assumption only | Partner term, activity obligations and actual agreed rate |
| Exit bonus | Separate potential 5% transaction liability; no subscription commission | Beneficiary, payer, basis, trigger, vesting, cap and waterfall |

Progressive own-portfolio bands: customers 1–20: 8%; 21–40: 10%; 41–60: 12%; 61–100: 14%; 101+: 16%. Higher rates apply only to customers in the higher band, never retroactively to the entire portfolio.

Recommended calculation convention:
- Use a monthly portfolio snapshot of active, paying attributed customers, ranked by first paid activation date, then stable customer ID to break ties.
- Allocate each customer's collected net subscription revenue to its band. Document treatment of annual/prepaid subscriptions before they are sold; do not pay both on the upfront receipt and on subsequent monthly allocations.
- Credits, refunds and chargebacks reverse the original receipt's commission and override at their original rates; retain the original policy version.
- A churned customer leaves future active snapshots. Reactivation retains the original activation order and attribution unless a documented effective-date reassignment applies.
- Changes in employment, partner activity or portfolio ownership follow signed terms. No retroactive cancellation of earned compensation is assumed.
- Discounts reduce the net commission basis. VAT, credits and refunds are excluded. Supplier revenue is outside this policy.

Implementation must settle annual billing, partial payments, failed payments and month-boundary rules before payouts are enabled.

## 2. Attribution and stacking

| Customer acquisition channel | Own commission | Head of Sales override | Partner commission |
|---|---|---|---|
| Morten direct | Morten progressive bands | None | None |
| Employed seller | Seller progressive bands | 2% if assigned subordinate | None |
| External referral partner | None | None | Agreed partner rate; model currently assumes 20% |

One acquisition channel per customer at a time. The employee row intentionally contains two different compensation components; this is the only default permitted stacking.

Record customer ID, channel, credited seller/partner, reporting manager, effective dates, policy/contract version, receipt ID, commission basis, band, rate, reversal link and approval audit. Store original attribution and append effective-dated changes rather than overwriting history. A payment must not be commissioned twice; refunds must reconcile to the original ledger entry. Assisted sales require an explicitly approved split within an agreed total envelope before committing to it.

## 3. Partner term recommendation

Preferred discussion position: recurring commission while the customer remains paying AND the partner remains an active part of Gainora, subject to signed terms. This is a recommendation, not evidence of a signed agreement.

Define "active partner" objectively: ongoing account relationship, agreed review cadence and compliance with the partner agreement; do not rely on an arbitrary monthly new-sales quota. Define cure period, notice, post-termination treatment and reassignment before offering the arrangement.

Keep 20% recurring in the planning downside until a different agreement is approved. Also price a time-limited or stepped-down alternative for negotiation; do not assume savings from an unsigned change. Never add the 2% employed-sales override to this channel by default.

## 4. Reconciled 100-customer illustration

DKK/month excluding VAT. All 100 customers pay 2,495 each; attribution 40 Morten / 40 employee / 20 partner. Same source assumptions as PR #32 except the employee now uses the proposed progressive schedule.

| Item | PR #32 illustration | Recommended schedule illustration |
|---|---:|---:|
| Collected subscription revenue | 249,500 | 249,500 |
| Morten own commission | 8,982 | 8,982 |
| Employee own commission | 9,980 | 8,982 |
| Head of Sales override | 1,996 | 1,996 |
| Partner commissions | 9,980 | 9,980 |
| Total commissions | 30,938 | 29,940 |
| Variable platform/processing at 10% | 24,950 | 24,950 |
| Contribution before fixed payroll/operations | 193,612 | 194,610 |
| Fixed payroll with 15% placeholder burden | 71,875 | 71,875 |
| Other fixed operations | 20,000 | 20,000 |
| Residual before omitted costs and tax | 101,737 | 102,735 |

Reconciliation: 20 × 2,495 × 8% + 20 × 2,495 × 10% = 8,982 per 40-customer employee portfolio. The policy change saves 998/month in this example. No claim that it always costs less at larger portfolios.

Sensitivity, each applied independently to the recommended illustration:
- Employer burden 25% rather than 15%: residual 96,485.
- Variable platform/processing 20% rather than 10%: residual 77,785.
- Realized price 10% lower, with percentage expenses following receipts: residual 83,274.
- At 100 customers, every extra percentage point of revenue-based costs reduces residual by 2,495/month.

The illustration excludes incremental marketing, unallocated onboarding/support, bad debt, founder compensation, corporation tax, transaction-bonus funding and additional staff. These must become explicit lines, not silently remain zero.

## 5. Six-month ramp illustration — not an operating forecast

Assumes both full-time roles are paid from month 1; fixed monthly cost 91,875 including the 15% burden placeholder and 20,000 other operations. Customer channel mix stays 40/40/20. Progressive commission for both employees, 2% subordinate override, 20% referral and 10% platform cost.

Customer counts are full-month paying equivalents, NOT month-end logos. No payment delay, churn, growth acquisition expense or separately costed onboarding is included. Actual ramp, churn cohorts and collection timing must replace this example.

| Month | Faster ramp customers | Monthly residual | Cumulative cash movement | Slower ramp customers | Monthly residual | Cumulative cash movement |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 10 | -72,214.40 | -72,214.40 | 5 | -82,044.70 | -82,044.70 |
| 2 | 20 | -52,553.80 | -124,768.20 | 10 | -72,214.40 | -154,259.10 |
| 3 | 35 | -23,062.90 | -147,831.10 | 15 | -62,384.10 | -216,643.20 |
| 4 | 50 | 6,428.00 | -141,403.10 | 20 | -52,553.80 | -269,197.00 |
| 5 | 70 | 44,950.80 | -96,452.30 | 25 | -42,723.50 | -311,920.50 |
| 6 | 100 | 102,735.00 | 6,282.70 | 30 | -32,893.20 | -344,813.70 |

Peak funding needed before reserve and omitted costs:
- Faster ramp: 147,831.10, despite a positive total cash movement by month 6.
- Slower ramp: 344,813.70; still cash-negative in month 6.
- Zero revenue for six months: 551,250 using the same fixed-cost assumptions.

Recommendation for discussion: a liquidity reserve of two months of committed fixed cash expenses, recalculated after every hire. Under this simplified example the reserve is 183,750. Starting unrestricted cash needed to preserve that reserve throughout the six months is respectively 331,581.10 / 528,563.70 / 735,000, before omitted costs. The two-month reserve is NEW and unapproved.

These amounts are NOT a hiring clearance or actual Gainora funding requirement.

## 6. Actual cash workbook specification and gate

Build a rolling 18-month model, monthly, with separate base/downside/severe scenarios; review the first six months at every hiring decision. Maintain a short-term cash calendar for payroll, taxes and receipts because month-end solvency can hide intra-month shortfalls.

Required inputs:
- Unrestricted opening bank cash and unavoidable outstanding liabilities.
- Existing collected recurring revenue by channel and cohort, not pipeline or invoiced revenue.
- Net subscription price, discounts, billing frequency, paid start date and collection delays.
- New customers, churn, reactivation and refunds by cohort/channel; free pilots separate.
- Hiring start dates, part-time terms, fixed pay, variable pay and actual employer on-costs for BOTH salary and commission where applicable.
- Partner commissions, marketing, onboarding, support, platform, processing, product/security/compliance and other fixed expenses; define boundaries to prevent double counting.
- Founder salary start scenarios; actual tax/VAT payment timing; capex and debt payments.
- Committed funding and its receipt date; prospective fundraising shown separately and excluded from the hiring gate.

Monthly closing cash = opening cash + actual/forecast cash receipts + committed funding received - all cash payments.
Next month's opening cash = prior month's closing cash.
Required opening cash = approved reserve + maximum cumulative cash deficit across the gate horizon, with intra-month peaks also checked.

Recommended hiring/full-time transition gates — all must pass:
1. Downside forecast keeps available cash above the approved reserve for every month of at least six months AFTER the commitment begins, with full costs and no uncommitted financing.
2. Downside assumptions reflect evidenced sales-cycle delay, lower conversion, churn and payment timing; unknown material inputs produce NOT READY, never PASS.
3. Collected-revenue contribution margin >=70% per acquisition channel after commissions, platform, processing and attributable variable support/delivery. This is a proposed internal threshold, not a market benchmark.
4. Fully loaded CAC payback <=12 months, calculated by channel on conservative retained customer contribution. Include allocated acquisition payroll, tools, campaigns and onboarding. Do not count the same recurring commission both in CAC and in the contribution denominator.
5. At least three monthly paid cohort observations, with proposed 90-day paid-customer retention >=90%; record actual denominator and loss count. Small samples must be acknowledged and cannot alone authorize a hire.
6. Product/security readiness, customer-value evidence, contract review and founder approval recorded.

Partner channel has exactly 70% contribution before additional variable support under the 20% commission + 10% platform assumptions. ANY further attributable variable delivery cost would breach the proposed floor. Therefore the 20% partner rate cannot be offered automatically: price, service cost or rate must be reconciled first.

Pause new hiring/extra discretionary acquisition commitments if the six-month gate or channel floor fails. Existing contractual obligations remain budgeted; this is not a unilateral right to stop earned payouts.

## 7. Decision and evidence register

| Decision / evidence | Proposed position or next action | Owner | State |
|---|---|---|---|
| Employee schedule | Same progressive 8–16% bands as Morten | Founder | Proposed |
| Stacking | Exclusive channels; employee-only 2% override | Founder | Proposed |
| Partner term/rate | Active customer + active partner; stress-test 20% | Founder + partner, then contract adviser | Unresolved |
| Founder salary duration | Monthly sustainability review; model later salary separately | Founder | Unresolved |
| Actual employer cost | Itemized quote including variable compensation treatment | Payroll/accounting adviser | Missing |
| Current cash/MRR | Bank and settled-payment evidence, dated | Founder/accounting | Missing |
| Hiring timing | Start founder-led; each role separately clears gates | Founder | Proposed |
| Reserve and KPI gates | Two-month reserve; 70% floor; <=12-month payback; >=90% 90-day retention | Founder | Proposed |
| Exit bonus | Separate contract and transaction-waterfall scenario | Founder + contract adviser | Unresolved |
| Operating forecast | Fill actual inputs and rerun 18 months | Project finance owner | Blocked on actual inputs |

No invented current customers, cash, signed partner terms, employer costs or investor commitments.

## 8. Verification and next implementation

Arithmetic reconciled against both source PRs and recalculated for the proposed common commission schedule, independent sensitivities, monthly ramp and maximum cumulative deficits.

Ledger acceptance cases to implement when coding:
- Exactly 20/21, 40/41, 60/61 and 100/101 customers apply marginal bands correctly.
- Partner customers never earn employee commission or default override.
- Head of Sales own customers never earn subordinate override.
- Duplicate payment events do not duplicate commission.
- Refund after reassignment reverses original recipients/rates.
- Churn/reactivation, partial receipts, annual billing and effective-date changes reconcile to settled receipts.

Next concrete inputs needed from founder: available unrestricted cash and outstanding obligations; actual paying-customer/MRR status; intended employment start dates/hours. An anonymized summary suffices. Contracts and quotes can then replace placeholders without changing the structure.
