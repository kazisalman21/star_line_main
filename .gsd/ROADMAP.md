# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 — Production Launch

## Must-Haves (from SPEC)

- [ ] User authentication (email + Google/Facebook SSO)
- [ ] Complete booking flow (search → seats → payment → ticket)
- [ ] Payment gateway integration (bKash, Nagad, Rocket, card)
- [ ] Backend API with real database
- [ ] Admin dashboard with route/fleet management
- [ ] All Lovable prototype bugs fixed
- [ ] Responsive design across all devices
- [ ] Deployed to Vercel + Supabase

## Phases

### Phase 1: Frontend Polish & Bug Fixes
**Status**: ✅ Complete
**Objective**: Fix all bugs in the Lovable-generated prototype, improve code quality, fix the React hooks violation in AnimatedHero, remove hardcoded dates, add loading states, error boundaries, and SEO meta tags.
**Deliverable**: A polished, bug-free frontend running on mock data.

---

### Phase 2: Supabase Backend Setup & Auth
**Status**: 🔄 In Progress
**Objective**: Set up Supabase project, design database schema (users, routes, buses, bookings, seats), implement authentication (email/password + Google + Facebook SSO), and create Row Level Security policies.
**Deliverable**: Working auth flow with user registration, login, SSO, and profile page.

---

### Phase 3: API Integration — Routes & Search
**Status**: ✅ Complete
**Objective**: Replace mock data with real Supabase queries. Implement route management API, bus schedule CRUD, and search functionality with filters. Connect SearchResults page to live data.
**Deliverable**: Real route search returning data from PostgreSQL.

---

### Phase 4: Booking Engine & Seat Selection
**Status**: ✅ Complete
**Objective**: Build the booking engine — real-time seat availability, seat locking during selection, booking creation, and status management. Connect SeatSelection and Checkout pages to backend.
**Deliverable**: End-to-end booking flow with real seat availability.

---

### Phase 5: Payment Integration
**Status**: ✅ Complete
**Objective**: Integrate SSLCommerz (or similar BD payment gateway) for bKash, Nagad, Rocket, and card payments. Implement payment verification, booking confirmation, and digital ticket generation with QR codes.
**Deliverable**: Working payment flow with real MFS and card processing.

---

### Phase 6: Admin Dashboard & Live Tracking
**Status**: ⬜ Not Started
**Objective**: Connect admin dashboard to real data — route management CRUD, booking analytics, revenue charts, fleet management. Implement live bus tracking with Supabase real-time subscriptions.
**Deliverable**: Fully functional admin panel with real operational data.

---

### Phase 7: Testing, Optimization & Deployment
**Status**: ⬜ Not Started
**Objective**: End-to-end testing (Playwright), performance optimization, Lighthouse audit, security review, and production deployment to Vercel + Supabase.
**Deliverable**: Production-ready app deployed and accessible.
