# DeployLand Deployment Guide

## Environments

We maintain three environments:
- **Development**: Localhot (Vite dev server), connecting to local Supabase / mock data.
- **Staging**: Hosted preview environment matching production infrastructure, connecting to staging Supabase project and Stripe Test Mode.
- **Production**: Live environment on the primary domain, connected to Production Supabase and Stripe Live Mode.

## Environment Variables

The following variables must be configured in each environment (keep frontend/backend separated securely):

### Frontend (`.env`)
- `VITE_SUPABASE_URL`: Public Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Public Supabase Anon Key

### Backend (`server/.env`)
- `SUPABASE_SERVICE_ROLE_KEY`: Secret Supabase Key (Bypasses RLS)
- `STRIPE_SECRET_KEY`: Secret Stripe API Key
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook Signing Secret

*Never commit `.env` files to the repository.*

## Deployment Steps

1. **Frontend**: The Vite frontend is a static bundle (`npm run build`). Deploy the `dist/` directory to a CDN/Host like Vercel, Netlify, or Cloudflare Pages.
2. **Backend**: The Express server (or eventually Supabase Edge Functions) handles Stripe webhooks and checkout creation. Deploy to a Node.js host (e.g. Render, Heroku) or translate to Edge Functions.
3. **Database**: Apply migrations to Supabase via Supabase CLI. Ensure RLS policies are enabled for `purchases` and `entitlements` before production launch.
