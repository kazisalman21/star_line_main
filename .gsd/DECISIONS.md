# DECISIONS.md — Architecture Decision Records

> Track important architectural and technical decisions.

## ADR-001: Supabase as Backend Platform
- **Date:** 2026-03-25
- **Status:** Accepted
- **Context:** Need backend for auth, database, and real-time features. Options: custom Node.js/Express, Next.js API routes, Supabase, Firebase.
- **Decision:** Supabase — provides PostgreSQL, Auth with SSO, real-time subscriptions, Edge Functions, and pairs well with Vercel deployment.
- **Consequences:** Vendor dependency on Supabase. Can migrate to self-hosted Supabase or raw PostgreSQL if needed.

## ADR-002: Keep Vite + React (Not Migrate to Next.js)
- **Date:** 2026-03-25
- **Status:** Accepted
- **Context:** Frontend is already built with Vite + React 18. Considered migrating to Next.js for SSR/API routes.
- **Decision:** Keep Vite SPA. Use Supabase client SDK directly. Separate frontend (Vercel) from backend (Supabase).
- **Consequences:** No SSR/SSG benefits, but simpler architecture and no migration risk.

## ADR-003: SSLCommerz for Payment Gateway
- **Date:** 2026-03-25
- **Status:** Proposed
- **Context:** Need to support bKash, Nagad, Rocket, and card payments in Bangladesh.
- **Decision:** SSLCommerz (or AamarPay) — most widely used BD payment gateway supporting all required MFS providers.
- **Consequences:** Requires merchant account setup. Transaction fees apply.
