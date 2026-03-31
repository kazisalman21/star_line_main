---
phase: 7
plan: 1
wave: 1
depends_on: []
files_modified:
  - index.html
  - src/test/setup.ts
  - src/test/utils.tsx
  - src/components/__tests__/Navbar.test.tsx
  - src/components/__tests__/ProtectedRoute.test.tsx
  - src/contexts/__tests__/AuthContext.test.tsx
  - src/lib/__tests__/supabase.test.ts
  - src/pages/__tests__/Login.test.tsx
  - src/pages/__tests__/Register.test.tsx
autonomous: true

must_haves:
  truths:
    - "index.html has correct title, meta description, and OG tags for Star Line Group"
    - "Test utilities provide renderWithProviders helper for auth/router/query"
    - "Unit tests exist for core auth components (Navbar, ProtectedRoute, AuthContext)"
    - "Unit tests exist for auth pages (Login, Register)"
    - "All unit tests pass via npm test"
  artifacts:
    - "src/test/utils.tsx exists with renderWithProviders"
    - "At least 5 test files exist in src/**/__tests__/"
---

# Plan 7.1: Production Cleanup & Unit Test Foundation

<objective>
Fix remaining Lovable branding in index.html, create test utilities for the app's provider stack, and write unit tests for the core auth layer (the most critical user-facing feature).

Purpose: The app still ships with "Lovable App" title/meta. Tests are needed for the auth flow since it's the foundation of protected routes, payments, and bookings.
Output: Clean index.html with proper branding. Test utility. 5+ passing unit tests.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (provider stack order)
- src/test/setup.ts (existing test setup)
- src/contexts/AuthContext.tsx
- src/components/ProtectedRoute.tsx
- src/components/Navbar.tsx
- src/pages/Login.tsx
- src/pages/Register.tsx
- vitest.config.ts
</context>

<tasks>

<task type="auto">
  <name>Fix index.html branding & create test utilities</name>
  <files>
    index.html
    src/test/utils.tsx
  </files>
  <action>
    1. Update `index.html`:
       - Title: "Star Line Group — Premium Intercity Bus Booking"
       - Meta description: "Book intercity bus tickets across Bangladesh with Star Line Group. Search routes, select seats, pay via bKash/Nagad/card, and get instant digital tickets."
       - og:title: "Star Line Group — Premium Intercity Bus Booking"
       - og:description: same as meta description
       - Remove Lovable og:image URL, replace with "/starline-og.png" (placeholder path)
       - twitter:site: remove @Lovable, set to "@StarLineGroupBD"
       - Remove all TODO comments
       - Add favicon link: `<link rel="icon" type="image/png" href="/starline-logo.png" />`

    2. Create `src/test/utils.tsx`:
       - Import render from @testing-library/react
       - Create renderWithProviders wrapper that includes:
         - QueryClientProvider (new QueryClient per test with retry: false)
         - MemoryRouter (accept initialEntries prop)
         - TooltipProvider
       - Export renderWithProviders as custom render
       - Export a mockSupabase helper that mocks '@/lib/supabase' with:
         - supabase.auth.getSession → returns { data: { session: null } }
         - supabase.auth.onAuthStateChange → returns { data: { subscription: { unsubscribe: vi.fn() } } }
         - supabase.auth.signInWithPassword → vi.fn()
         - supabase.auth.signInWithOAuth → vi.fn()
         - supabase.auth.signUp → vi.fn()
         - supabase.auth.signOut → vi.fn()
         - supabase.from → vi.fn() returning { select: vi.fn(), update: vi.fn(), eq: vi.fn(), single: vi.fn() }
       - Do NOT import AuthProvider in the wrapper — let individual tests opt into it

    AVOID: Including AuthProvider in the default wrapper — it calls supabase on mount which needs mocking per-test.
    AVOID: Sharing QueryClient across tests — each test gets a fresh one.
  </action>
  <verify>
    - `npm run build` succeeds
    - index.html no longer contains "Lovable"
    - `src/test/utils.tsx` exports renderWithProviders
  </verify>
  <done>
    index.html has correct Star Line branding. Test utility ready for use.
  </done>
</task>

<task type="auto">
  <name>Write unit tests for auth layer</name>
  <files>
    src/components/__tests__/ProtectedRoute.test.tsx
    src/pages/__tests__/Login.test.tsx
    src/pages/__tests__/Register.test.tsx
  </files>
  <action>
    1. Create `src/components/__tests__/ProtectedRoute.test.tsx`:
       - Mock '@/lib/supabase' module
       - Mock useAuth to return different states
       - Test: renders children when user is authenticated
       - Test: redirects to /signin when user is null
       - Test: shows loading spinner when loading is true
       - Test: redirects to / when requireAdmin but user is not admin

    2. Create `src/pages/__tests__/Login.test.tsx`:
       - Mock '@/lib/supabase' module
       - Mock useAuth / AuthProvider
       - Test: renders email and password inputs
       - Test: shows error when submitting empty form
       - Test: shows Google and Facebook SSO buttons
       - Test: has link to register/signup page

    3. Create `src/pages/__tests__/Register.test.tsx`:
       - Mock '@/lib/supabase' module
       - Test: renders step 1 (email + password fields)
       - Test: shows password strength indicator when typing
       - Test: shows Google and Facebook SSO buttons
       - Test: has link to sign in page

    For ALL tests:
    - Mock `@/lib/supabase` at the top of every test file using vi.mock
    - Mock `@/contexts/AuthContext` where needed
    - Use renderWithProviders from src/test/utils.tsx
    - Use MemoryRouter with initialEntries for routing tests
    - Use screen.getByRole, getByText, getByPlaceholderText for queries

    AVOID: Importing the real supabase client — it throws on missing env vars.
    AVOID: Testing implementation details — test user-visible behavior.
    AVOID: Complex async flows that need real Supabase — save those for E2E.
  </action>
  <verify>
    - `npm test` passes all tests
    - At least 10 individual test cases across the 3 files
  </verify>
  <done>
    Auth layer has unit test coverage. All tests pass via `npm test`.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] index.html contains "Star Line Group" in title (no "Lovable")
- [ ] Test utilities export renderWithProviders
- [ ] Unit tests exist for ProtectedRoute, Login, Register
- [ ] `npm test` passes with 0 failures
- [ ] `npm run build` succeeds
</verification>

<success_criteria>
- [ ] index.html is production-branded
- [ ] 5+ test files with meaningful coverage
- [ ] `npm test` passes all tests
</success_criteria>
