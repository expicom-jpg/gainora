# Password recovery release checklist

Status: implementation PR #47; **not yet verified in deployment**.

1. Review and merge only after green TypeScript, tests, production build and deployment checks. The Vercel status must be green.
2. Supabase Auth > URL Configuration: set the exact deployed Gainora site URL and allowlist the exact `https://<actual-host>/reset-password` redirect for the appropriate environment. Do not use the unrelated Spanish gainora.vercel.app site.
3. Supabase Auth > Email Templates > Reset Password: verify the template supports the configured redirect and the recovery link reaches the new-password page. If the template uses `token_hash`, use the existing `/auth/confirm?token_hash=...&type=recovery` endpoint, which routes recovery to `/reset-password`.
4. Verify email provider/SMTP and sending limits using a test mailbox. Never publish credentials, passwords or recovery tokens in issues or screenshots.
5. Browser test: request reset for test user, receive mail, follow link, enter a new 10+ character password twice, sign in with the new password; verify old password fails.
6. Negative tests: expired/reused link, unknown email (no account enumeration), wrong confirmation, mismatched/short passwords, missing session, rate limiting and unauthenticated protected pages.
7. Record test date, environment, deployed SHA and outcomes. Real customer data remains disabled.

Known limitation: Recovery email delivery and Supabase redirect allowlist cannot be proven by code review alone.
