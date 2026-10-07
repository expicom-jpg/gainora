# Gainora Profit Intelligence Framework v1

## Mission
Gainora searches broadly for profit across the whole business and follows each material finding from observation to realized economic value. Profit Audit is not a cost scanner; it analyzes the company's economic engine.

## Analysis domains
1. Revenue & growth: trends, seasonality, concentration, mix, upsell and lost revenue.
2. Pricing & discounts: price development, discount patterns, price/mix effects and margin erosion.
3. Gross margin & contribution: margin by period, customer, product, department and channel.
4. Customers: concentration, retention/churn, purchase frequency, order size and profitability.
5. Purchasing & suppliers: price increases, concentration, fragmentation and negotiation potential.
6. People & capacity: payroll share, overtime, staffing versus activity, productivity and utilization.
7. Fixed operating costs: software, subscriptions, telecom, insurance, leasing, premises and advisory spend.
8. Inventory & working capital: inventory tied up, turnover, debtor/creditor days and releasable capital.
9. Cash flow & liquidity: inflows/outflows, timing, liquidity trends and recurring cash pressure.
10. Anomalies & leakage: unusual transactions, duplicates, sudden increases and new recurring costs.
11. Benchmark & trends: periods, targets and later lawful aggregated peer/industry benchmarks.
12. Profit opportunities: estimated annual value, confidence, priority and recommended action.

## Finding lifecycle
Observation -> Driver -> Economic impact -> Recommended action -> Estimated potential -> Approval -> Execution -> Realized value.

Every material finding should store its organization, sources, period, domain/type, evidence, driver, baseline/current value, estimated annual value, confidence/evidence quality, action, priority, status, owner, approval state, realized value, measurement period and attribution method.

## Evidence levels
- Observed: directly supported by connected/imported data.
- Calculated: deterministic calculation from observed data.
- Estimated: modeled opportunity with explicit assumptions.
- Hypothesis: plausible driver requiring human verification.

Gainora must never present an estimate or hypothesis as realized savings.

## Data requirements
### Accounting: Dinero / e-conomic first
Ledger entries, chart of accounts, invoices/credit notes, customers, suppliers, relevant VAT/tax coding, products/items where available, dates, amounts, currencies and available dimensions/departments/projects.

### Banking / BankView layer
Balances, booked transactions, counterparties, dates, amounts and recurring payment patterns, subject to consent, access controls and applicable banking/data requirements.

### Optional business data
Payroll summaries, inventory, POS/orders, CRM/customer data, budgets and operational KPIs extend analysis depth.

## Cross-source intelligence
Examples: revenue growth vs payroll growth; invoice revenue vs cash receipts; supplier ledger vs bank payments; accounting margin vs product/order mix; receivables vs actual payment behavior.

## Guardrails
- Deterministic calculations before AI interpretation.
- AI may explain/prioritize findings but must not invent financial facts.
- Show assumptions behind estimated value.
- Human approval before a finding becomes an active opportunity.
- Track realized value separately from estimated value.
- Tenant isolation and least privilege remain mandatory.
- No real customer data until production readiness is explicitly opened.

## Product outcome
Gainora continuously answers: Where is profit lost or unrealized? Why? What should the company do and what could it be worth? Did the action actually create the expected value?

This framework is the contract for future Profit Audit modules and determines what data Dinero, e-conomic and banking integrations need to retrieve.
