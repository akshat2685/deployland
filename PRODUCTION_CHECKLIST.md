# Production Readiness Checklist

## APPLICATION
- [ ] Production build succeeds without errors (`npm run build`).
- [ ] Environment variables configured for Production (Supabase, Stripe).
- [ ] Error monitoring integrated (e.g., Sentry) and verified.
- [ ] Analytics integrated (e.g., PostHog) and event tracking verified.

## DATABASE
- [ ] Supabase Migrations are up to date in the production project.
- [ ] Row Level Security (RLS) is ENFORCED on all tables (especially `purchases`, `entitlements`, `course_progress`, `mission_progress`).
- [ ] Point-in-time recovery / Backups enabled on Supabase.

## AUTH
- [ ] Guest flow works cleanly without errors.
- [ ] Signup / Login / Logout flows verified via Github OAuth (or chosen provider).
- [ ] Guest-to-User progress merge functions deterministically.

## PAYMENTS
- [ ] Stripe Checkout creates orders successfully in Live Mode.
- [ ] Webhook endpoint is publicly accessible and configured in Stripe Dashboard.
- [ ] Stripe Webhook Signing Secret is correctly set.
- [ ] Idempotency verified: Webhook replay does not duplicate records.
- [ ] Entitlements grant correctly after payment.

## SECURITY
- [ ] Security headers applied (via hosting provider or meta tags).
- [ ] CORS policies restrict API access to the production frontend domain.
- [ ] Rate limits configured on critical API routes (Checkout).
- [ ] No secrets exposed in the frontend bundle.

## LEGAL
- [ ] Privacy Policy published and accessible.
- [ ] Terms of Service published and accessible.
- [ ] Refund information clear.
- [ ] Support email functional.

## GAME
- [ ] Levels 1-10 playable and completable.
- [ ] Progression engine accurately unlocks subsequent levels.
- [ ] Engineer Mode active for all levels.
- [ ] Persistence functions correctly across reloads and devices.
