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
