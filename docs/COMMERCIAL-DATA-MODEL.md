# Gainora Commercial Data Model v1

## Goal
Support direct sales, referral partners, advisers and sales agencies with individual agents while preserving customer ownership, recurring revenue attribution and an auditable commission ledger.

## Attribution chain
Channel -> Partner/Agency -> Agent -> Lead -> Customer organization -> Subscription -> Paid invoice -> Commission entry.

## Core entities
- sales_channels: direct, partner, agency, adviser, inbound, integration and future channels.
- partners: legal/commercial partner account, status, agreement version and default commission plan.
- partner_agents: individual salesperson/adviser under a partner or agency.
- leads: source channel, partner, agent, attribution timestamp and conversion state.
- customer_attribution: durable ownership link from organization to channel/partner/agent with effective dates and change reason.
- subscriptions: customer organization, provider, external subscription id, plan, amount, currency, status and billing period.
- payment_events: immutable provider event/payment facts including paid/refunded/failed state.
- commission_plans: percentage/fixed rules, effective dates and eligibility rules.
- commission_ledger: immutable earned/reversed/paid entries linked to a successfully paid customer payment.
- partner_payouts: payout batches and status; payout mechanism remains separate from commission truth.

## Working commercial rule
Current working model is 20% recurring partner revenue share while the attributed customer remains an active paying Gainora customer. This percentage remains configurable until final unit economics and partner agreements are approved.

Commission is earned only from successfully collected eligible subscription revenue. Failed, refunded or reversed payments cannot create permanent earned commission.

## Ownership rules
Customer attribution must be explicit and durable. Changes require an effective date, reason and audit trail. Reactivation, partner termination, ownership transfer and disputed attribution must be handled by policy rather than silently rewriting history.

## Stripe boundary
Stripe is payment infrastructure, not the source of truth for partner ownership. Gainora stores attribution and the commission ledger. Stripe customer/subscription/payment identifiers are references on Gainora records. This allows future Stripe Connect payouts without coupling earned commission logic to Connect.

## Agency hierarchy
A partner may be an agency with many agents. Reporting must support both agency totals and individual agent performance: leads, meetings/qualified opportunities where introduced, Profit Audits, customers, active subscriptions, MRR, churn, earned commission and paid commission.

## Dashboard v1
Partner dashboard should show leads, converted customers, active subscriptions, attributed MRR, expected recurring commission, earned commission, paid commission and churn. Agency dashboards add agent-level breakdowns.

## Audit and security
Financial and commission mutations require tenant/role authorization and audit logging. Payment webhooks must be idempotent. Provider event ids must be unique. Historical ledger entries are reversed with new entries, not overwritten.
