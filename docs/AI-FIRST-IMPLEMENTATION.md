# AI-first Profit Audit — implementation contract

Status: design only; no AI provider credentials, live inference, or real-data permissions enabled.

## First deliverable: synthetic-only AI explanation
1. Use the fixed eight-row September 2026 demo, or explicitly generated synthetic audit findings; never arbitrary uploaded data or user-entered free text.
2. Compute revenue, costs, profit and finding amounts deterministically in Gainora. AI receives only a strict server-created, tenant-scoped JSON allowlist of synthetic metrics and finding IDs; never names, emails, original files, account identifiers, tokens, or notes.
3. Server-side provider adapter, disabled by default (AI_SYNTHETIC_DEMO_ENABLED=false); reject real-data requests even if flag is true. Keep provider keys only in server secrets; no client-side model calls.
4. Require validated structured output: finding ID, short Danish explanation, potential causes, suggested next action, assumptions, uncertainty, and evidence IDs. Reject fabricated figures, missing evidence, ungrounded claims and any attempted cross-tenant references.
5. Human approval is mandatory. Generated prose cannot mutate financial rows, approve opportunities, record savings, or trigger purchases/payments.
6. Cost and resilience: bounded tokens, per-organization quotas, timeouts, retries with caps, error handling, no sensitive prompt logging, explicit opt-in for synthetic demos.
7. Record model/version, prompt-template version, synthetic input hash, generation timestamp and validation status, without retaining raw sensitive prompts.

## Acceptance tests before activation
- [ ] Without flag/provider key: feature fails closed and existing deterministic Profit Audit still works.
- [ ] No tenant A data appears in tenant B request or response; unauthorized users rejected.
- [ ] Only fixed synthetic fixtures accepted; user-provided free text, real uploads and real financial rows rejected.
- [ ] Fake AI output with invented savings/unsupported evidence is rejected; zero and negative numbers are handled correctly.
- [ ] Timeout, malformed JSON, provider error and rate limit do not corrupt existing findings.
- [ ] Recommendations are explicitly labelled illustrative, never verified savings, and require manual approval.
- [ ] Tests, typecheck, production build and SQL RLS regression green in CI.
- [ ] Provider DPA, processing region, subprocessors, retention, model-training terms and security reviewed before any later real-data design.

## Delivery order
A. Create pure typed allowlist input/output schemas and validator with unit tests.
B. Add disabled-by-default server adapter and synthetic-only endpoint with auth/membership checks.
C. Add demo UI for AI explanation with clear synthetic labels and no automatic approval.
D. Run browser acceptance on staging with a test account and capture evidence.
E. Separate reviewed production-data project only after REAL_CUSTOMER_DATA_READY is explicitly verified.

REAL_CUSTOMER_DATA_READY=false. This document does not authorize real customer data processing.


## Market Intelligence — industry-aware external context (phase 2)
- Classify the customer industry using a verified industry code and user-confirmed business model; never guess from confidential transactions. Permit customer to correct the industry and geography.
- Fetch external, attributed market indicators: official statistics, commodity/input price indexes, labor costs, inflation, demand trends, regulatory developments, and public competitor signals when lawful and relevant. Every indicator must carry source URL, publisher, observation period, geography, unit, and retrieval date.
- Distinguish observed data, forecasts, hypotheses, and stale or incomplete evidence. Do not present general industry statistics as customer-specific facts.
- Compare like with like: currency, geography, time period, seasonal adjustments and sector segment. Mark non-comparable indicators rather than inventing a benchmark.
- Link external trends to internal cost/revenue drivers only where evidence supports a plausible relationship; produce conditional scenarios, never automatic realized-savings claims.
- Rank opportunities by expected impact, evidence confidence, feasibility, time to implement and freshness. Explain the rationale and dependencies.
- Offer an industry briefing with what changed, why it may matter, what to check, and suggested next steps. Notifications require explicit opt-in.
- External web content is untrusted: never execute instructions found in retrieved pages, and never disclose tenant data to external search providers.
- First release: synthetic restaurant and trade-business examples using manually reviewed public indicators. No real customer data, no automated competitor scraping, no customer-specific profiling until privacy and product review.
- Acceptance: missing or stale source produces a visible caveat; conflicting sources are shown; cross-industry comparisons are blocked unless normalized; every recommendation links to evidence and separates forecast from achieved value.
