---
phase: 6
plan: 3
wave: 3
---

# Plan 6.3: Live Bus Tracking with Supabase Realtime

## Objective
Transform the mock LiveTracking page into a real-time operational view. Since we don't have actual GPS hardware, we'll build a **simulation system** that an admin can control — setting bus positions, triggering status updates — which passengers see in real-time via Supabase Realtime subscriptions.

## Context
- `LiveTracking.tsx` currently shows hardcoded trip data with fake stops.
- Supabase has a built-in Realtime engine (WebSocket subscriptions on table changes).
- We need a new `trip_tracking` table to store live trip state.

## Architecture

```
┌────────────────────────────────────┐
│  Admin Dashboard — Live Tab        │
│                                    │
│  Select active schedule            │
│  Set current location (dropdown)   │
│  Toggle: On Time / Delayed         │
│  Update ETA                        │
│  [Update Status] button            │
│                                    │
│  writes to trip_tracking table ──────┐
└────────────────────────────────────┘  │
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  trip_tracking    │
                              │  table (Supabase) │
                              └──────────────────┘
                                        │
                          Supabase Realtime (WS)
                                        │
                                        ▼
┌────────────────────────────────────────────────────────┐
│  Passenger LiveTracking Page                            │
│                                                          │
│  Subscribes to trip_tracking changes                    │
│  Auto-updates: position, ETA, status, progress bar     │
│  Shows animated route progress with stops               │
│  Pulsing green dot on current position                  │
│  "Updated X seconds ago" timer                          │
└────────────────────────────────────────────────────────┘
```

## Tasks

<task type="auto">
  <name>Create trip_tracking table + migration</name>
  <files>supabase/schema.sql (append), src/types/database.ts</files>
  <action>
    Add to schema:
    ```sql
    CREATE TABLE trip_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      travel_date DATE NOT NULL DEFAULT CURRENT_DATE,
      current_stop TEXT NOT NULL DEFAULT '',
      next_stop TEXT,
      stops_completed INTEGER NOT NULL DEFAULT 0,
      total_stops INTEGER NOT NULL DEFAULT 6,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','boarding','in_transit','delayed','arrived','cancelled')),
      eta TEXT,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
      notes TEXT,
      UNIQUE(schedule_id, travel_date)
    );

    -- Enable realtime for this table
    ALTER PUBLICATION supabase_realtime ADD TABLE trip_tracking;
    ```

    Update `database.ts` to include `trip_tracking` in the Database interface.
  </action>
  <verify>SQL runs in Supabase; database.ts compiles</verify>
  <done>trip_tracking table exists with Realtime enabled.</done>
</task>

<task type="auto">
  <name>Create trackingService.ts</name>
  <files>src/services/trackingService.ts</files>
  <action>
    ```typescript
    // Admin functions
    export async function getActiveTrips(date: string)
    export async function updateTripStatus(trackingId: string, update: Partial<TripTracking>)
    export async function createTripTracking(scheduleId: string, stops: string[])

    // Passenger functions
    export async function getTripStatus(scheduleId: string, date: string)
    export function subscribeToTripUpdates(scheduleId: string, date: string, callback: (update) => void)
    ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Tracking service handles both admin updates and passenger subscriptions.</done>
</task>

<task type="auto">
  <name>Admin Live Tracking Tab</name>
  <files>src/pages/AdminDashboard.tsx (Live Tracking tab)</files>
  <action>
    **Control Panel for each active trip:**
    - Dropdown: select from today's schedules
    - Current stop selector (dropdown of route stops)
    - Status toggle: Scheduled → Boarding → In Transit → Delayed → Arrived
    - ETA input field
    - Progress slider (0-100%)
    - Notes field for delay reasons
    - [Update] button → writes to `trip_tracking`
    - Shows all active trips in a card grid with live status

    **Design:** Dark control panel with red accent buttons, status indicator LEDs.
  </action>
  <verify>Admin can update trip status; changes persist in DB</verify>
  <done>Admin can control trip status for any active schedule.</done>
</task>

<task type="auto">
  <name>Rebuild LiveTracking.tsx with Realtime</name>
  <files>src/pages/LiveTracking.tsx</files>
  <action>
    **Passenger-facing live tracking page:**

    1. **Booking lookup:** Enter PNR → fetches booking → gets schedule_id → subscribes to trip_tracking
    2. **OR** link from ticket page: `/live-tracking?scheduleId=xxx&date=yyyy-mm-dd`

    3. **Real-time UI:**
       - Route progress bar with animated stops (completed = green dot, current = pulsing green, upcoming = gray)
       - Current location text (large, prominent)
       - Status badge: In Transit / Boarding / Delayed / Arrived
       - ETA display with countdown
       - "Last updated X seconds ago" with live timer
       - Coach info card (name, type, amenities)

    4. **Supabase Realtime subscription:**
       ```typescript
       const channel = supabase.channel('trip-updates')
         .on('postgres_changes', {
           event: 'UPDATE',
           schema: 'public',
           table: 'trip_tracking',
           filter: `schedule_id=eq.${scheduleId}`,
         }, (payload) => {
           setTripData(payload.new);
         })
         .subscribe();
       ```

    5. **Premium animations:**
       - Smooth progress bar transitions (CSS transition 1s ease)
       - Fade-in for status changes
       - Pulsing current stop indicator
       - SVG route line with animated dash pattern
  </action>
  <verify>Visual browser check; realtime updates appear without page refresh</verify>
  <done>Passengers see live trip updates pushed in real-time.</done>
</task>

## Success Criteria
- [ ] Admin can set trip status from the dashboard
- [ ] Passengers see updates in real-time (no refresh needed)
- [ ] Progress bar animates smoothly between updates
- [ ] Status badges update atomically
- [ ] Works with Supabase Realtime (WebSocket)
- [ ] Graceful fallback if no tracking data exists for a trip
