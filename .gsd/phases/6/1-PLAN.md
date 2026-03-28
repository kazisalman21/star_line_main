---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Admin Service Layer + Real-Time Analytics

## Objective
Create a comprehensive `adminService.ts` that replaces all mock data in the admin dashboard with live Supabase queries. This is the data backbone for the entire admin panel — every widget, chart, and table will pull from here.

## Context
- `AdminDashboard.tsx` currently imports `adminStats` from `mockData.ts` — hardcoded numbers.
- Database has `routes`, `buses`, `schedules`, `bookings`, `booking_seats`, `payments` tables.
- Admin access is already protected via `<ProtectedRoute requireAdmin>` in `App.tsx`.
- Profile role check: `profile?.role === 'admin'`.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    adminService.ts                            │
│                                                               │
│  getDashboardStats()     →  8 KPI cards (live aggregates)    │
│  getRevenueChart(days)   →  Revenue bar chart (grouped)      │
│  getUpcomingDepartures() →  Today's departures with status   │
│  getRecentBookings(n)    →  Latest n bookings for feed       │
│  getRoutePerformance()   →  Revenue + occupancy per route    │
│  getFleetStatus()        →  Bus status breakdown             │
│  getBookingTrends(days)  →  Daily booking count trend        │
│  getPaymentBreakdown()   →  Revenue by payment method        │
└─────────────────────────────────────────────────────────────┘
```

## Tasks

<task type="auto">
  <name>Create adminService.ts with all analytics functions</name>
  <files>src/services/adminService.ts</files>
  <action>
    Implement 8 analytics functions:

    **1. getDashboardStats()** → returns:
    ```typescript
    {
      todayTrips: number;        // COUNT schedules for today's day_of_week
      activeBookings: number;    // COUNT bookings WHERE status='confirmed' AND travel_date=today
      totalPassengers: number;   // SUM of confirmed bookings today
      revenue: number;           // SUM payments.amount WHERE status='success' AND paid_at >= today
      weeklyRevenue: number;     // SUM payments for last 7 days
      occupancyRate: number;     // AVG(booked_seats / total_seats) for today's schedules
      pendingPayments: number;   // COUNT bookings WHERE status='pending'
      totalRoutes: number;       // COUNT routes WHERE status='active'
    }
    ```
    Uses aggregate queries with Supabase `.select('count')` and `.select('total_fare.sum()')`.

    **2. getRevenueChart(days = 7)** → returns:
    ```typescript
    { date: string; revenue: number; bookings: number }[]
    ```
    Groups payments by date for the last N days. Uses a single query with date filtering and client-side grouping.

    **3. getUpcomingDepartures()** → returns:
    ```typescript
    {
      id: string;
      route: string;        // "Dhaka → Chattogram"
      time: string;         // departure_time
      coach: string;        // bus name
      occupancy: number;    // percentage
      passengers: number;   // count of booked seats
      totalSeats: number;
    }[]
    ```
    Joins schedules → routes → buses, filtered by today's day_of_week. Counts bookings per schedule.

    **4. getRecentBookings(limit = 10)** → latest bookings with passenger name, route, fare, status.

    **5. getRoutePerformance()** → revenue + booking count per route for the current month.

    **6. getFleetStatus()** → count of buses by status (active/maintenance/retired).

    **7. getBookingTrends(days = 30)** → daily booking count for trend chart.

    **8. getPaymentBreakdown()** → revenue grouped by payment method (bKash, Nagad, etc.)
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All 8 analytics functions compile and return typed data.</done>
</task>

## Success Criteria
- [ ] All 8 functions compile with TypeScript
- [ ] Queries use efficient Supabase operations (aggregates, joins, date filters)
- [ ] Return types are fully typed — no `any`
