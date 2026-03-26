---
phase: 2
plan: 3
wave: 2
depends_on: ["1", "2"]
files_modified:
  - src/contexts/AuthContext.tsx
  - src/components/ProtectedRoute.tsx
  - src/pages/Profile.tsx
  - src/pages/Login.tsx
  - src/pages/Register.tsx
  - src/components/Navbar.tsx
  - src/App.tsx
autonomous: true

must_haves:
  truths:
    - "AuthContext provides user state across the app"
    - "Login page calls Supabase signInWithPassword"
    - "Register page calls Supabase signUp"
    - "SSO buttons call Supabase signInWithOAuth (google/facebook)"
    - "Protected routes redirect to /login if not authenticated"
    - "Navbar shows user avatar + name when logged in, login button when not"
    - "Profile page displays user info"
  artifacts:
    - "src/contexts/AuthContext.tsx exists"
    - "src/components/ProtectedRoute.tsx exists"
    - "src/pages/Profile.tsx exists"
---

# Plan 2.3: Auth Context, Protected Routes & Profile

<objective>
Wire Supabase Auth into the app. Create AuthContext for global auth state, connect Login/Register to Supabase, add protected routes, update Navbar with auth state, and create Profile page.

Purpose: This completes the auth flow — users can register, login, see their profile, and access protected areas.
Output: Working auth with persistence, protected routes, and profile page.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/lib/supabase.ts (from Plan 2.1)
- src/types/database.ts (from Plan 2.1)
- src/pages/Login.tsx (from Plan 2.2)
- src/pages/Register.tsx (from Plan 2.2)
- src/components/Navbar.tsx
- src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Create AuthContext and ProtectedRoute</name>
  <files>
    src/contexts/AuthContext.tsx
    src/components/ProtectedRoute.tsx
    src/App.tsx
  </files>
  <action>
    1. Create `src/contexts/AuthContext.tsx`:
       - React context with: user, session, profile, loading, signOut
       - On mount: `supabase.auth.getSession()` to restore session
       - Subscribe to `supabase.auth.onAuthStateChange`
       - When user authenticates, fetch profile from `profiles` table
       - Export `useAuth()` hook
       - Handle loading state (show nothing while checking session)
    
    2. Create `src/components/ProtectedRoute.tsx`:
       - Wraps children with auth check
       - If loading: show spinner
       - If not authenticated: redirect to /login with return URL
       - If authenticated: render children
    
    3. Update `src/App.tsx`:
       - Wrap routes with `<AuthProvider>`
       - Add protected routes for: /profile, /checkout, /ticket, /manage-booking
       - Keep public routes: /, /search, /seat-selection, /routes, /support, /login, /register
       - Admin routes: protect with role check (profile.role === 'admin')

    AVOID: Blocking the entire app on auth loading — only block protected routes.
    AVOID: Using localStorage for auth — Supabase handles session persistence.
  </action>
  <verify>
    - `npm run build` succeeds
    - Visiting /profile without login redirects to /login
    - Public routes remain accessible without login
  </verify>
  <done>
    Auth context provides user state globally. Protected routes redirect unauthenticated users.
  </done>
</task>

<task type="auto">
  <name>Wire Login/Register to Supabase and create Profile page</name>
  <files>
    src/pages/Login.tsx
    src/pages/Register.tsx
    src/pages/Profile.tsx
    src/components/Navbar.tsx
    src/App.tsx
  </files>
  <action>
    1. Update `src/pages/Login.tsx`:
       - Import supabase client and useAuth
       - On form submit: `supabase.auth.signInWithPassword({ email, password })`
       - Google button: `supabase.auth.signInWithOAuth({ provider: 'google' })`
       - Facebook button: `supabase.auth.signInWithOAuth({ provider: 'facebook' })`
       - On success: redirect to return URL or home
       - On error: show error message

    2. Update `src/pages/Register.tsx`:
       - On form submit: `supabase.auth.signUp({ email, password, options: { data: { full_name, phone } } })`
       - SSO buttons same as Login
       - On success: show "check your email" message (Supabase email confirmation)
       - On error: show error

    3. Create `src/pages/Profile.tsx`:
       - Protected route
       - Show user avatar, name, email, phone
       - Edit profile form (name, phone, avatar)
       - Update via `supabase.from('profiles').update()`
       - Booking history section (placeholder, wired in Phase 4)
       - Sign out button
       - Premium card design matching the theme

    4. Update `src/components/Navbar.tsx`:
       - Import useAuth
       - If logged in: show user avatar + dropdown (Profile, My Bookings, Sign Out)
       - If not logged in: show Login button
       - Dropdown uses existing shadcn/ui DropdownMenu

    5. Add route in App.tsx: `<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />`

    AVOID: Redirecting to login on public pages.
    AVOID: Storing auth tokens manually — Supabase handles this.
  </action>
  <verify>
    - `npm run build` succeeds
    - Login form submits to Supabase (visible in network tab)
    - Register creates user in Supabase
    - Navbar updates when logged in/out
    - Profile page shows user info
  </verify>
  <done>
    Full auth flow works: register → confirm email → login → see profile → sign out.
    SSO buttons trigger OAuth flow. Navbar reflects auth state.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] Google/Facebook SSO buttons trigger OAuth
- [ ] Auth state persists across page refreshes
- [ ] Protected routes redirect to /login
- [ ] Navbar shows user info when logged in
- [ ] Profile page displays and edits user data
- [ ] Sign out works and clears session
</verification>

<success_criteria>
- [ ] End-to-end auth flow works
- [ ] Protected routes enforced
- [ ] `npm run build` succeeds
</success_criteria>
