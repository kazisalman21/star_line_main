---
phase: 6
plan: 2
wave: 2
---

# Plan 6.2: Premium Admin Dashboard — Full Rebuild

## Objective
Transform the single-page admin dashboard into a multi-tab command center with real-time data, animated charts, management CRUD, and a premium dark operations aesthetic.

## Context
- Current `AdminDashboard.tsx` is a 115-line page with 8 stat cards, 1 bar chart, and 1 departure table — all mock data.
- `adminService.ts` (Plan 6.1) provides all real data.
- Design language: dark operations center with red/gold accents, glassmorphism cards, subtle animations.
- Chart library `recharts` is already installed.

## Design Vision

```
┌──────────────────────────────────────────────────────────────────────┐
│  STARLINE OPERATIONS CENTER                          [Live • Now]   │
├──────────────────────────────────────────────────────────────────────┤
│  [Overview]  [Routes & Fleet]  [Bookings]  [Revenue]  [Live Map]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │  │
│  │ Card │ │ Card │ │ Card │ │ Card │ │ Card │ │ Card │ │ Card │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                                      │
│  ┌────────────────────────┐  ┌────────────────────────────────────┐ │
│  │  Revenue Chart (Area)  │  │  Upcoming Departures (Live Feed)  │ │
│  │  7/30 day toggle       │  │  with status badges + occupancy   │ │
│  └────────────────────────┘  └────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐│
│  │ Payment Breakdown│ │ Route Performance│ │  Recent Bookings     ││
│  │ (Donut Chart)    │ │ (Horizontal Bar) │ │  (Live Feed Table)   ││
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

## Tasks

<task type="auto">
  <name>Rebuild AdminDashboard — Overview Tab</name>
  <files>src/pages/AdminDashboard.tsx</files>
  <action>
    Complete rebuild of the admin dashboard:

    **1. Header:**
    - "STARLINE OPERATIONS CENTER" with pulsing green dot
    - Tab navigation: Overview | Routes & Fleet | Bookings | Revenue | Live Tracking
    - Real last-updated timestamp with auto-refresh (every 60s)

    **2. KPI Cards (7 cards):**
    - Replace mock `adminStats` with real `getDashboardStats()` call
    - Each card: icon + animated counter (useEffect count-up) + label + trend indicator
    - Cards: Today's Trips, Active Bookings, Passengers, Revenue, Weekly Revenue, Occupancy Rate, Pending Payments

    **3. Revenue Chart (AreaChart, not BarChart):**
    - Toggle between 7-day and 30-day view
    - Gradient area fill (red → transparent)
    - Custom tooltip with ৳ formatting
    - Uses `getRevenueChart()`

    **4. Upcoming Departures (Right panel):**
    - Live feed of today's departures from `getUpcomingDepartures()`
    - Each row: time, route, coach, occupancy bar, passenger count
    - Status badges: On Time (green), Delayed (amber), Boarding (blue), Departed (gray)

    **5. Bottom Row — 3 widgets:**
    - **Payment Breakdown** (PieChart): Revenue split by method from `getPaymentBreakdown()`
    - **Route Performance** (Horizontal BarChart): Top routes by revenue from `getRoutePerformance()`
    - **Recent Bookings** (Live feed table): Latest 8 bookings from `getRecentBookings(8)`

    **6. Loading State:**
    - Skeleton cards with shimmer animation while data loads
    - Each section loads independently (parallel data fetching)

    **7. Premium Design Details:**
    - Glassmorphism cards (`glass-card` class)
    - `font-display` for all headings
    - Subtle entrance animations (staggered, 50ms delay between cards)
    - Accent glow on hover for KPI cards
    - Dark gradient backgrounds on chart areas
  </action>
  <verify>npx tsc --noEmit; visual browser check</verify>
  <done>Overview tab shows live data with premium design, no more mock imports.</done>
</task>

<task type="auto">
  <name>Create Routes & Fleet Management Tab</name>
  <files>src/pages/AdminDashboard.tsx (or separate component)</files>
  <action>
    **Routes Management Section:**
    - Table of all routes with: origin, destination, distance, fare, status (active/inactive toggle)
    - "Add Route" button → modal form with fields: origin, destination, distance_km, duration_minutes, base_fare
    - Edit/delete buttons per row
    - Uses Supabase CRUD: `supabase.from('routes').insert/update/delete`

    **Fleet Management Section:**
    - Grid of bus cards showing: name, type (AC/Non-AC/Sleeper), total_seats, registration_number, status badge
    - Status badges: Active (green), Maintenance (amber), Retired (red)
    - Add/Edit bus modal
    - Quick status toggle (active ↔ maintenance)

    **Schedule Management:**
    - Table showing schedule entries: route (origin→dest), bus name, departure/arrival, days of week, status
    - Add schedule: select route + bus + times + days
  </action>
  <verify>CRUD operations work against Supabase; npx tsc --noEmit</verify>
  <done>Routes, fleet, and schedules fully manageable via admin UI.</done>
</task>

<task type="auto">
  <name>Create Bookings Management Tab</name>
  <files>src/pages/AdminDashboard.tsx</files>
  <action>
    **Bookings Table:**
    - Paginated table of all bookings (most recent first)
    - Columns: PNR, Passenger, Route, Date, Seats, Fare, Status, Payment
    - Status filter: All | Pending | Confirmed | Cancelled | Completed
    - Search by PNR or passenger name
    - Click row → expand with full booking details
    - Admin actions: Cancel booking, Mark as completed

    **Booking Stats:**
    - Mini line chart: bookings per day (last 30 days) from `getBookingTrends(30)`
    - Total bookings badge
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Admin can view, search, filter, and manage all bookings.</done>
</task>

<task type="auto">
  <name>Create Revenue Analytics Tab</name>
  <files>src/pages/AdminDashboard.tsx</files>
  <action>
    **Revenue Overview:**
    - Large AreaChart: daily revenue for last 30 days
    - Summary cards: Total Revenue (month), Average Daily, Peak Day, Revenue Growth %
    - Payment method breakdown (PieChart)
    - Revenue by route (horizontal BarChart)
    - Revenue by bus type (AC vs Non-AC vs Sleeper)

    **All data from adminService functions.**
    Premium touches: gradient fills on charts, animated number counters, ৳ currency formatting.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Revenue analytics tab shows comprehensive financial overview.</done>
</task>

## Premium Design System

```css
/* Admin-specific design tokens */
--admin-surface: hsl(222, 25%, 8%);       /* Darker than main bg */
--admin-card: hsl(222, 20%, 12%);          /* Slightly elevated */
--admin-accent: hsl(350, 72%, 45%);        /* Starline red */
--admin-success: hsl(142, 71%, 45%);       /* Status green */
--admin-warning: hsl(38, 92%, 50%);        /* Alert amber */
--admin-chart-gradient: linear-gradient(180deg, var(--admin-accent) 0%, transparent 100%);
```

## Success Criteria
- [ ] All 5 tabs render with real Supabase data
- [ ] CRUD operations work for routes, buses, and schedules
- [ ] Charts are animated with premium aesthetics
- [ ] Bookings tab has search, filter, and pagination
- [ ] Revenue tab shows comprehensive analytics
- [ ] No mock data imports remain in AdminDashboard
