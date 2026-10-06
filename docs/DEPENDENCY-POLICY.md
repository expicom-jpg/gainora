# Dependency Policy

Gainora uses supported, actively maintained framework versions and treats dependency security warnings as release blockers when they affect production code.

## Rules
- Stay on a supported Next.js LTS/security-patched line.
- Review npm audit output in CI.
- Avoid adding parsing or AI dependencies without a clear need.
- Prefer server-side-only dependencies for financial file processing.
- Pin framework major/minor versions intentionally and review updates before production rollout.
- Critical or high vulnerabilities affecting reachable production paths block REAL_CUSTOMER_DATA_READY.

## Current decisions
- Next.js 16.3.8 is the baseline framework version.
- React 19.3 is the baseline UI runtime.
- Supabase SSR and Supabase JS are kept on current supported releases.
- Excel parsing remains server-side only.
