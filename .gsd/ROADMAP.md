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
**Status**: ✅ Complete
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
**Status**: ✅ Complete
**Objective**: Connect admin dashboard to real data — route management CRUD, booking analytics, revenue charts, fleet management. Implement live bus tracking with Supabase real-time subscriptions.
**Deliverable**: Fully functional admin panel with real operational data.

---

### Phase 7: Testing, Optimization & Deployment
**Status**: ✅ Complete
**Objective**: End-to-end testing (Playwright), performance optimization, Lighthouse audit, security review, and production deployment to Vercel + Supabase.
**Deliverable**: Production-ready app deployed and accessible.

---

### Phase 8: AI Chat Widget (Star Line Care)
**Status**: ⬜ Not Started
**Objective**: Add a floating AI-powered customer support chat widget that appears on every page. Includes conversational UI with suggestion chips, automated responses for common queries (booking help, refund policy, counter info, delays), integrated complaint filing flow (9-step guided form), and a branded AI concierge avatar. Copy UI and process directly from the `starline-wayfinder` reference repo.
**Depends on**: Phase 7

**New Files**:
- `src/components/support/AIChatWidget.tsx` — Full chat widget with message rendering, complaint flow, chip-based navigation
- `src/components/support/AIConciergeAvatar.tsx` — Branded avatar component (xs/sm/md/lg/hero sizes, glow + online indicator)
- `src/data/supportData.ts` — Zustand store for complaints, complaint types/categories, Starline routes/counters lists, FAQ data, support categories
- `src/assets/ai-concierge-avatar.jpg` — Avatar image asset

**Modified Files**:
- `src/App.tsx` — Add `<AIChatWidget />` as a global floating component
- `src/pages/Support.tsx` — Replace with enhanced version featuring AI concierge hero, support categories, FAQ accordion, complaint CTA

**Tasks**:
- [ ] Copy `supportData.ts` with types, mock complaints, Zustand store, FAQ data
- [ ] Copy and adapt `AIConciergeAvatar.tsx` with avatar image asset
- [ ] Copy and adapt `AIChatWidget.tsx` (391 lines) — floating button + chat panel + complaint flow
- [ ] Update `Support.tsx` page with AI concierge hero and enhanced layout
- [ ] Add `<AIChatWidget />` to `App.tsx` layout
- [ ] Verify chat widget renders on all pages, complaint flow submits correctly

**Verification**:
- Chat widget button visible on all pages
- Opening chat shows greeting + suggestion chips
- Clicking "Submit complaint" triggers 9-step guided flow
- Complaint appears in support store after submission

---

### Phase 9: Complaint Management System
**Status**: ⬜ Not Started
**Objective**: Build a full complaint lifecycle — passenger-facing `MyComplaints` page for filing and tracking complaints, and an admin-facing `AdminComplaintsTab` for managing, assigning, and resolving complaints with analytics. Copy UI and process directly from the `starline-wayfinder` reference repo.
**Depends on**: Phase 8

**New Files**:
- `src/pages/MyComplaints.tsx` — Passenger complaint tracker with search, status filters, detail dialog with timeline
- `src/components/support/AdminComplaintsTab.tsx` — Admin complaint table with stats, search/filter, detail view, assign staff, status management
- `src/components/support/SupportAnalyticsTab.tsx` — Charts (Recharts) for complaints by category, route, status, priority + weekly trend + alert cards

**Modified Files**:
- `src/App.tsx` — Add `/my-complaints` route
- `src/pages/AdminDashboard.tsx` — Add "Complaints" and "Support Analytics" tabs

**Tasks**:
- [ ] Copy `MyComplaints.tsx` page (194 lines) with complaint cards, filters, detail dialog
- [ ] Copy `AdminComplaintsTab.tsx` (290 lines) with stats, table, detail/assign dialogs
- [ ] Copy `SupportAnalyticsTab.tsx` (165 lines) with Recharts analytics
- [ ] Add `/my-complaints` route to `App.tsx`
- [ ] Add Complaints + Analytics tabs to `AdminDashboard.tsx`
- [ ] Add "My Complaints" link to Navbar user menu
- [ ] Verify complaint flow: submit via chat → appears in MyComplaints → visible in AdminComplaintsTab

**Verification**:
- `/my-complaints` page shows complaint list with filters
- Admin dashboard shows complaint management table
- Analytics tab renders charts correctly
- End-to-end: file complaint via AI Chat → track in MyComplaints → manage in Admin

---

### Phase 10: Travel Updates & Notices System
**Status**: ⬜ Not Started
**Objective**: Build a comprehensive travel notices system — public-facing `TravelUpdates` page with category filtering, an `AnnouncementBar` for urgent site-wide alerts, inline notices in booking flow, and an `AdminNoticesTab` for creating/managing notices. Copy UI and process directly from the `starline-wayfinder` reference repo.
**Depends on**: Phase 9

**New Files**:
- `src/data/noticeData.ts` — Zustand store for notices, mock data (8 notices), types, category/priority configs, helper functions
- `src/pages/TravelUpdates.tsx` — Public notices page with hero, urgent banner, category filter tabs, search, notice detail view
- `src/components/notices/AnnouncementBar.tsx` — Rotating top-bar alert for urgent notices (auto-dismiss, priority-styled)
- `src/components/notices/TravelUpdateCard.tsx` — Notice card component with priority/category badges
- `src/components/notices/NoticeFilterTabs.tsx` — Horizontal scrollable filter tabs
- `src/components/notices/BookingNoticeInline.tsx` — Inline notice for booking flow pages
- `src/components/notices/AdminNoticesTab.tsx` — Full CRUD admin panel for notices (413 lines) — create, edit, view, delete, publish/archive, route/counter targeting

**Modified Files**:
- `src/App.tsx` — Add `/notices` and `/notices/:id` routes
- `src/pages/AdminDashboard.tsx` — Add "Notices" tab
- `src/components/Navbar.tsx` — Add "Travel Updates" link to navigation
- Homepage — Optionally surface active notices

**Tasks**:
- [ ] Copy `noticeData.ts` with types, mock notices, Zustand store, helpers
- [ ] Copy `TravelUpdates.tsx` page (211 lines) with list and detail views
- [ ] Copy all 5 notice components (AnnouncementBar, TravelUpdateCard, NoticeFilterTabs, BookingNoticeInline, AdminNoticesTab)
- [ ] Add `/notices` and `/notices/:id` routes to `App.tsx`
- [ ] Add "Notices" tab to `AdminDashboard.tsx`
- [ ] Add "Travel Updates" link to Navbar
- [ ] Add AnnouncementBar to main layout for urgent notices
- [ ] Verify notice CRUD in admin, public page rendering, announcement bar rotation

**Verification**:
- `/notices` page shows filtered notice list
- `/notices/:id` shows full notice detail with affected routes/counters
- AnnouncementBar rotates urgent notices at top of all pages
- Admin can create, edit, publish, archive, delete notices
- BookingNoticeInline shows relevant notices during checkout
