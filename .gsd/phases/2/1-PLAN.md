---
phase: 2
plan: 1
wave: 1
depends_on: []
files_modified:
  - src/lib/supabase.ts
  - src/types/database.ts
  - .env.local
  - supabase/schema.sql
autonomous: false
user_setup:
  - service: supabase
    why: "Database and authentication backend"
    env_vars:
      - name: VITE_SUPABASE_URL
        source: "Supabase Dashboard → Settings → API → Project URL"
      - name: VITE_SUPABASE_ANON_KEY
        source: "Supabase Dashboard → Settings → API → anon public key"
    dashboard_config:
      - task: "Create a new Supabase project"
        location: "https://supabase.com/dashboard → New Project"
      - task: "Enable Google OAuth provider"
        location: "Supabase Dashboard → Authentication → Providers → Google"
      - task: "Enable Facebook OAuth provider"
        location: "Supabase Dashboard → Authentication → Providers → Facebook"

must_haves:
  truths:
    - "Supabase client connects successfully from the frontend"
    - "Database schema contains all required tables"
    - "TypeScript types match the database schema"
    - "RLS policies are defined for all tables"
  artifacts:
    - "src/lib/supabase.ts exists and exports createClient"
    - "src/types/database.ts exports Database type"
    - "supabase/schema.sql contains CREATE TABLE statements"
---

# Plan 2.1: Supabase Client + Database Schema

<objective>
Set up the Supabase client library, create the complete database schema for Starline Wayfinder, and generate TypeScript types for type-safe queries.

Purpose: This is the foundation — every other Phase 2+ plan depends on the Supabase connection and schema.
Output: Working Supabase client, SQL schema file, and TypeScript database types.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/data/mockData.ts (existing mock data structure to match)
</context>

<tasks>

<task type="auto">
  <name>Install Supabase and create client + types</name>
  <files>
    src/lib/supabase.ts
    src/types/database.ts
    .env.local
  </files>
  <action>
    1. Install: `npm install @supabase/supabase-js`
    2. Create `.env.local` with placeholder vars:
       ```
       VITE_SUPABASE_URL=your-project-url
       VITE_SUPABASE_ANON_KEY=your-anon-key
       ```
    3. Create `src/lib/supabase.ts`:
       - Import createClient from @supabase/supabase-js
       - Read env vars with `import.meta.env.VITE_SUPABASE_URL`
       - Export typed supabase client using Database type
       - Add error check if env vars are missing
    4. Create `src/types/database.ts`:
       - Define full Database type matching the schema below
       - Tables: profiles, routes, buses, schedules, seats, bookings, booking_seats, payments
       - Each table has Row, Insert, Update types
       
    AVOID: Using `process.env` — Vite uses `import.meta.env` for client-side vars.
    AVOID: Hardcoding URLs — must come from env vars.
  </action>
  <verify>
    - `npm run build` compiles without TypeScript errors
    - `src/lib/supabase.ts` exports supabase client
    - `src/types/database.ts` exports Database type
  </verify>
  <done>
    Supabase client is importable and TypeScript types match planned schema.
    Build succeeds with no TS errors.
  </done>
</task>

<task type="auto">
  <name>Create complete database schema SQL</name>
  <files>supabase/schema.sql</files>
  <action>
    Create `supabase/schema.sql` with:

    1. **profiles** — extends Supabase auth.users
       - id (UUID, FK to auth.users)
       - full_name, phone, email, avatar_url
       - role (enum: 'passenger', 'admin')
       - created_at, updated_at

    2. **routes** — bus routes
       - id, origin, destination, distance_km, duration_minutes
       - base_fare, status ('active', 'inactive')

    3. **buses** — fleet
       - id, name, type ('AC', 'Non-AC', 'Sleeper')
       - total_seats, amenities (JSONB), registration_number
       - status ('active', 'maintenance', 'retired')

    4. **schedules** — bus assignments to routes with times
       - id, route_id (FK), bus_id (FK)
       - departure_time, arrival_time, fare_override
       - days_of_week (integer[]), status

    5. **seats** — per-bus seat layout
       - id, bus_id (FK), seat_number, row_label
       - seat_type ('standard', 'premium', 'ladies')
       - is_active

    6. **bookings** — passenger bookings
       - id, user_id (FK to profiles), schedule_id (FK)
       - booking_date, travel_date, status ('pending', 'confirmed', 'cancelled')
       - total_fare, boarding_point, dropping_point
       - passenger_name, passenger_phone, passenger_email
       - created_at

    7. **booking_seats** — junction table
       - id, booking_id (FK), seat_id (FK), fare

    8. **payments** — payment records
       - id, booking_id (FK), amount, method ('bkash', 'nagad', 'rocket', 'card')
       - transaction_id, status ('pending', 'success', 'failed')
       - paid_at

    Add RLS policies:
    - profiles: users can read/update own, admins can read all
    - bookings: users can read own, admins can read all
    - routes/buses/schedules/seats: public read, admin write
    - payments: users can read own, admins can read all

    Add trigger: auto-create profile on auth.users insert
    
    AVOID: Using serial IDs — use UUID (gen_random_uuid()) for all PKs.
    AVOID: Missing ON DELETE CASCADE on foreign keys.
  </action>
  <verify>
    - File exists at `supabase/schema.sql`
    - Contains CREATE TABLE for all 8 tables
    - Contains RLS policies for all tables
    - Contains trigger for auto-profile creation
  </verify>
  <done>
    Complete SQL schema with 8 tables, RLS policies, and auto-profile trigger.
    Schema is ready to paste into Supabase SQL Editor.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>User creates Supabase project and runs schema</name>
  <action>
    User needs to:
    1. Create Supabase project at supabase.com
    2. Copy Project URL and anon key into .env.local
    3. Run schema.sql in Supabase SQL Editor
    4. Enable Google/Facebook auth providers
  </action>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Supabase client imports without errors
- [ ] TypeScript Database type covers all 8 tables
- [ ] Schema SQL has all tables with proper relationships
- [ ] RLS policies defined for all tables
- [ ] Build passes (`npm run build`)
</verification>

<success_criteria>
- [ ] `npm run build` succeeds
- [ ] Supabase client is configured and type-safe
- [ ] Database schema covers full booking workflow
</success_criteria>
