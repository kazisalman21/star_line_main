# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

Starline Wayfinder is the official online booking platform for **Star Line Group**, an established intercity bus operator in Bangladesh. The platform enables passengers to search routes, select seats, pay via mobile financial services (bKash, Nagad, Rocket) or card, and receive digital tickets — all through a premium, modern web experience. The system includes a backend API for real data, user authentication with SSO, and an admin dashboard for operations management.

## Goals

1. **Production-Ready Booking Flow** — Complete end-to-end journey: route search → bus selection → seat picking → payment → digital ticket with QR code
2. **User Authentication** — Account creation, login, SSO (Google/Facebook), profile management, and booking history
3. **Payment Integration** — bKash, Nagad, Rocket (MFS), and card payments with secure checkout
4. **Backend API** — Node.js + Express + PostgreSQL (Supabase) API for real route data, bookings, user management, and admin operations
5. **Admin Dashboard** — Manage routes, schedules, fleet, view bookings, revenue analytics, and operational metrics
6. **Live Tracking** — Real-time bus location tracking for active trips
7. **Polish & Bug Fixes** — Fix all existing bugs in the Lovable-generated prototype, improve accuracy, and bring to production quality
8. **Responsive & Premium Design** — World-class UI that works flawlessly on desktop, tablet, and mobile

## Non-Goals (Out of Scope)

- Native mobile app (responsive web only for v1)
- Multi-language support (English + Bangla only for v1, English primary)
- Driver/crew management portal
- Inventory/maintenance tracking
- Loyalty/rewards program (future phase)
- Real-time chat support (v1 uses static FAQ + contact form)

## Users

| User Type | Description |
|-----------|-------------|
| **Passenger** | Searches routes, books tickets, manages bookings, views travel history. Must create account. |
| **Admin** | Manages routes, schedules, bus fleet, views booking analytics, handles support. |

## Constraints

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/UI (existing stack)
- **Backend:** Node.js + Express + Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel (frontend) + Supabase (backend/DB) for testing phase
- **Payment:** MFS (bKash/Nagad/Rocket) integration via SSLCommerz or similar BD gateway
- **Auth:** Supabase Auth with Google/Facebook SSO + email/password
- **Performance:** Pages must load under 3 seconds, animations at 60fps
- **Accessibility:** Keyboard navigation, proper ARIA labels, reduced-motion support

## Backend Recommendation

**Supabase** is recommended as the backend platform because:
- Built-in PostgreSQL database with Row Level Security
- Built-in Auth with SSO providers (Google, Facebook)
- Real-time subscriptions (useful for live tracking)
- Edge Functions for serverless API logic
- Free tier suitable for testing, scales to production
- Pairs perfectly with Vercel deployment
- Client libraries for React/TypeScript

## Success Criteria

- [ ] User can create an account and log in (email + Google/Facebook SSO)
- [ ] User can search routes by origin, destination, and date
- [ ] User can view available buses with departure times, prices, and amenities
- [ ] User can select seats on an interactive bus seat map with real-time availability
- [ ] User can complete payment via bKash, Nagad, Rocket, or card
- [ ] User receives a digital ticket with QR code after booking
- [ ] User can view and manage booking history from their profile
- [ ] Admin can manage routes, schedules, and fleet
- [ ] Admin can view booking statistics and revenue analytics
- [ ] All existing bugs from Lovable prototype are fixed
- [ ] All pages are fully responsive (desktop → tablet → mobile)
- [ ] Backend API serves real data (not mock data)
- [ ] App deploys successfully to Vercel + Supabase
