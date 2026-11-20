# Decision record — AI-assisted sales and Pancake.ai evaluation
Date: 2026-11-20
Status: Approved for planning and controlled assessment; NOT approved for purchase, integration or production activation.
Owner: Gainora founder. Sales stakeholder: Morten.

## Decision
Explore Pancake.ai as an optional internal sales prospecting and outreach-assistance tool and adopt vendor-neutral sales-AI patterns for Gainora's CRM/Partner Hub. Gainora remains source of truth for lead ownership, sales activity, partner attribution, commissions and payments. Continue all P0 security/release gates unchanged.

## Work packages
1. Prepare an internal ideal-customer-profile and explainable lead scoring rubric for Danish SMEs.
2. Design suggested personalized outreach, human review and scheduled follow-up workflows with opt-out and audit.
3. Enforce duplicate detection, seller lock/expiry policy, reassignment authority and privacy-preserving collision notifications, consistent with current CRM decisions.
4. Assess the precise Pancake.ai vendor: data coverage, security, GDPR/DPA and transfers, deliverability, export limits, costs, cancellation, access management and API feasibility.
5. Only after P0 readiness and explicit approval, conduct a small trial, measure lead quality, meeting rates, pilot conversion, time saved, net contribution after commissions and retention.
6. Make continue/build/buy/stop decision based on measured results, not marketing claims.

## Guardrails
- Synthetic/demo test data only until separate privacy/security and pilot authorizations.
- No scraping, bulk marketing emails, unattended outreach, external processing of personal contact data, or AI-driven lead reassignment without legal and role review.
- Human approves outbound communications; log prospect source, communication basis, approval and opt-outs.
- No change to Stripe/Dinero configuration or commission calculations from this initiative.
- Do not represent the 5-customer pilot goal, DKK 2,495/mo target, or vendor pricing as completed or guaranteed.
- No production changes, vendor subscription, purchase, or live customer activation implied by this decision.

## Acceptance checkpoints
- P0 gates verified separately.
- Reviewed CRM access and lead-ownership test cases (same customer submitted by two partners, seller inactivity, expired lock, duplicate, opt-out, reassignment and audit).
- Recorded vendor review including true current pricing and signed privacy/security approvals where required.
- Written before/after KPI report and explicit go/no-go decision.

## Alternatives
- Build selected sales-assistant functions inside Partner Hub.
- Trial external tool without integration.
- Defer until after pilot. All remain possible until evidence supports a choice.
