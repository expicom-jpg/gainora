# Gainora decision log

## 2026-11-20 — Approved prioritized execution backlog

**Decision:** Adopt the ordered ten-workstream execution list in [ROADMAP.md](ROADMAP.md#approved-execution-priorities--2026-11-20). No tasks were manually marked complete.

**P0 before pilot:** (1) security/RLS/Master Control, (2) contact form and CRM, (3) safe Excel import and Profit Audit.

**P1 before pilot:** (4) pilot readiness, (5) Morten's CRM/interview workflow, (6) landing page and branding.

**P2 after pilot:** (7) Partner Hub/commissions, (8) Google Workspace, (9) Compliance Portal/chatbot. Security or compliance controls necessary for the pilot are still release blockers and cannot be deferred simply because a broader product area is P2.

**P3 ongoing:** (10) evidence-based competitor monitoring of Clockwork, Payfriend, Fathom, Jirav and relevant alternatives; only original, high-value improvements supporting Profit Audit → recommendation → customer approval → documented impact.

**Rationale:** Minimize pilot risk and duplicate development, focus on a secure demonstrable customer journey.

**Open decisions:** 5 versus 7 pilot companies; 30 versus 90 days; subscription/result-based pricing; partner commission and lead-lock policy. No change to customer terms implied.

**Constraints:** Documentation-only change on a development branch/draft PR. No production change, migration, purchase, live customer onboarding, or permission to use real financial data.

**Next action:** Compare main against existing P0 security PRs, identify missing independent evidence, run synthetic tenant/CRM/import tests and document results before proposing any merge.


## 2026-11-20 — Dinero selected for Gainora's own accounting

**Decision:** Use Dinero as Gainora's accounting software for bookkeeping, invoices, VAT and accounts.

**Scope:** Gainora's own business administration only. This does not select Dinero as a mandatory accounting platform for Gainora customers and does not authorize an API connection.

**Follow-up:** Confirm company registration, VAT and invoicing requirements, roles/access, plan and setup before the first paid invoice. Evaluate API integration separately after security and business review.

**Guardrails:** No Dinero account creation, subscription purchase, real financial-data transfer, production integration or database change from this documentation decision. P0 security gates retain priority.


## 2026-11-20 — Confirmed Danish ApS formation plan

**Decision:** Retain planned Gainora ApS with 51% founder ownership and 49% Morten ownership. CVR not yet available; no assertion that the entity has been incorporated.

**Accounting:** Dinero remains the intended accounting system. Stripe is planned for payments, subject to separate setup and approval.

**Priority:** P1 company formation/accounting preparation before paid operations, subordinate to P0 security gates. Prepare incorporation/ownership and budget documents, but do not file, purchase, open accounts, process live transactions or use real financial data without authorization and review.


## 2026-11-20 — Profit retention after commissions and costs

**Decision:** Gainora's actual net profit, after seller/partner commissions, other operating expenses, taxes and obligations, should normally remain in Gainora ApS for liquidity, reserves, development and growth.

**Clarification:** Revenue less sales commission is not net profit. Profit and available cash must be tracked separately. Ownership at 51/49 does not trigger automatic payouts.

**Controls:** Any dividends or owner remuneration require separate documented approval and compliance with Danish corporate/tax rules. Dinero reporting should distinguish revenue, commissions, expenses, tax, net profit, cash and retained earnings. Commission rates, bases and payout dates remain subject to approved agreements.
