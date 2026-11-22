# P0 release gate: Profit Audit leads and pilot data (2026-11-19)

Status: **BLOCKED for real customer data and automated lead processing**. This is a review checklist, not an approval.

## Verified development evidence
- Draft [#105](https://github.com/expicom-jpg/gainora/pull/105) introduces customer-facing trust principles; draft [#106](https://github.com/expicom-jpg/gainora/pull/106) is stacked on #105 and adds a browser-only contact form.
- Vercel preview for #106 commit `f7700e10b55c16ad5531492d89e36204253f7598` reported **READY** on 2026-11-19; this establishes build/deployment status only, **not** security or functional acceptance.
- #106 opens the visitor's own mail client to `expicom@gmail.com`; **no automatic email, secure lead storage, consent audit, Morten dashboard or reliable delivery confirmation exists**.
- The form contains personal contact data. A mailto link is not a privacy-approved production intake channel merely because no server storage is involved.
- Existing RLS work is in stacked draft [#104](https://github.com/expicom-jpg/gainora/pull/104); its CI, review and hosted behavior are not established by the landingpage preview.

## Release blockers (fail closed)
1. **Ownership and notice**: confirm controller legal entity, privacy notice at point of collection, lawful basis, purpose, retention, rights and actual contact destination. Explicit opt-in is not a substitute for clear privacy information.
2. **Lead submission**: implement a server-side endpoint with schema validation, strict payload limits, rate limiting/bot abuse controls, non-enumerating responses and safe logging. Do not put raw contact details into URLs, analytics or application logs.
3. **Lead storage and isolation**: approved schema, tenant/role policy, RLS deny-by-default and tested access limited to authorized staff. No service-role exposure to the browser. Review backup/deletion lifecycle and access audit.
4. **Email**: approve sender/domain and provider DPA, secure secrets, deliverability and error/retry behavior. Notify Morten only after successful durable submission; customer confirmation must not falsely imply an Audit is underway.
5. **Dashboard**: authenticated access, least privilege, status transitions, audit trail and cross-tenant denial tests. Verify partner roles cannot access leads without authorization.
6. **Financial pilot**: independent RLS/tenant tests, import validation, Excel abuse tests, Master Control approval, audit evidence, retention/deletion and explicit `REAL_CUSTOMER_DATA_READY` signoff before any financial uploads.
7. **Release evidence**: exact-head CI (dependency audit, typecheck, unit/integration tests, disposable DB tests), preview smoke test, independent security review and written production approval.

## Immediate decision
Keep #105 and #106 as drafts. **Do not merge to production or invite actual submissions** until the relevant lead-intake controls pass. The pilot size (five versus seven), pricing and verified-effect charging rules are proposals pending business signoff.

## Next implementation slice
On a separate development branch: pure lead-request schema/validation and synthetic tests for missing/oversized fields, hostile input, consent and invalid email; then server-side rate limits and safe persistence behind an off-by-default feature flag. Do not wire the public CTA to an unapproved endpoint.

## Competitive feature triage
No new competitor functionality is prioritized this run: P0 release gates precede Clockwork, Payfriend, Fathom, Jirav or other feature additions. For any future proposal record source URL, publication/observation date, customer value, differentiation, complexity, security and pilot relevance, and distinguish estimates from verified effect. Ventora remains deferred until after pilot start.
