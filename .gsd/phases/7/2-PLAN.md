---
phase: 7
plan: 2
wave: 1
depends_on: []
files_modified:
  - src/pages/__tests__/Index.test.tsx
  - src/pages/__tests__/SearchResults.test.tsx
  - src/pages/__tests__/SeatSelection.test.tsx
  - src/components/__tests__/SearchForm.test.tsx
  - src/components/__tests__/ErrorBoundary.test.tsx
  - src/components/__tests__/PageHead.test.tsx
autonomous: true

must_haves:
  truths:
    - "Unit tests exist for core booking flow pages (Index, SearchResults, SeatSelection)"
    - "Unit tests exist for shared components (SearchForm, ErrorBoundary, PageHead)"
    - "All tests pass via npm test"
  artifacts:
    - "At least 6 test files covering booking flow and shared components"
---

# Plan 7.2: Unit Tests — Booking Flow & Shared Components

<objective>
Write unit tests for the core booking journey pages (homepage, search, seat selection) and critical shared components (SearchForm, ErrorBoundary, PageHead).

Purpose: The booking flow is the primary user journey. Tests ensure rendering, navigation, and key interactions work correctly.
Output: 6+ test files covering the booking pipeline and reusable components.
</objective>

<context>
Load for context:
- src/test/utils.tsx (from Plan 7.1)
- src/pages/Index.tsx
- src/pages/SearchResults.tsx
- src/pages/SeatSelection.tsx
- src/components/SearchForm.tsx
- src/components/ErrorBoundary.tsx
- src/components/PageHead.tsx
- src/App.tsx (routing structure)
</context>

<tasks>

<task type="auto">
  <name>Write tests for booking flow pages</name>
  <files>
    src/pages/__tests__/Index.test.tsx
    src/pages/__tests__/SearchResults.test.tsx
    src/pages/__tests__/SeatSelection.test.tsx
  </files>
  <action>
    1. Create `src/pages/__tests__/Index.test.tsx`:
       - Mock '@/lib/supabase' module
       - Mock AuthContext to return no user (public page)
       - Test: renders hero section / main heading
       - Test: renders Navbar and Footer
       - Test: renders SearchForm component
       - Test: renders key sections (features, routes, etc.)

    2. Create `src/pages/__tests__/SearchResults.test.tsx`:
       - Mock '@/lib/supabase' module
       - Mock AuthContext
       - Mock useSearchParams to return origin/destination/date
       - Test: renders search results page heading
       - Test: renders filter options or result cards
       - Test: handles empty/no results state

    3. Create `src/pages/__tests__/SeatSelection.test.tsx`:
       - Mock '@/lib/supabase' module
       - Mock AuthContext
       - Mock useSearchParams with required booking params
       - Test: renders seat selection heading
       - Test: renders seat grid / bus layout
       - Test: renders passenger info form

    For ALL tests:
    - Mock `@/lib/supabase` at the top
    - Mock `@/contexts/AuthContext` to return a baseline user or null
    - Use renderWithProviders from src/test/utils.tsx
    - Mock GSAP if needed (AnimatedHero uses it): vi.mock('gsap', () => ({ gsap: { ... } }))
    - Mock framer-motion if needed: vi.mock('framer-motion', () => ({ motion: { div: 'div', ... } }))

    AVOID: Testing internal component state — test what the user sees.
    AVOID: Deep interaction tests (clicking seats, booking) — that's E2E territory.
  </action>
  <verify>
    - `npm test` passes
    - 3 new test files exist
  </verify>
  <done>
    Booking flow pages have render + basic interaction tests. All pass.
  </done>
</task>

<task type="auto">
  <name>Write tests for shared components</name>
  <files>
    src/components/__tests__/SearchForm.test.tsx
    src/components/__tests__/ErrorBoundary.test.tsx
    src/components/__tests__/PageHead.test.tsx
  </files>
  <action>
    1. Create `src/components/__tests__/SearchForm.test.tsx`:
       - Test: renders From and To input fields
       - Test: renders date picker trigger
       - Test: renders passengers selector
       - Test: renders search / submit button
       - Test: all inputs are interactable (click, type)

    2. Create `src/components/__tests__/ErrorBoundary.test.tsx`:
       - Create a component that throws an error
       - Test: catches error and renders fallback UI
       - Test: renders children when no error

    3. Create `src/components/__tests__/PageHead.test.tsx`:
       - Mock react-helmet-async
       - Test: renders with title prop
       - Test: renders with description prop

    AVOID: Testing Shadcn/UI internals — test the wrapper behavior.
    AVOID: importing next-themes in tests — mock it if needed.
  </action>
  <verify>
    - `npm test` passes
    - 3 new shared component test files exist
  </verify>
  <done>
    Shared components have unit tests. All pass via npm test.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Index, SearchResults, SeatSelection have test files
- [ ] SearchForm, ErrorBoundary, PageHead have test files
- [ ] `npm test` passes with 0 failures
</verification>

<success_criteria>
- [ ] 6+ new test files covering booking flow + shared components
- [ ] All tests pass
</success_criteria>
