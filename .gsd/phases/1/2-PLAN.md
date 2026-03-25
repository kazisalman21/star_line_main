---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Error Boundaries & Loading States

## Objective
Add production-grade error handling and loading feedback across the app.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx
- src/main.tsx

## Tasks

<task type="auto">
  <name>Create ErrorBoundary component</name>
  <files>src/components/ErrorBoundary.tsx, src/App.tsx</files>
  <action>
    1. Create `src/components/ErrorBoundary.tsx`:
       - Class component (React error boundaries must be class components)
       - Catches errors via `componentDidCatch` and `getDerivedStateFromError`
       - Renders a user-friendly fallback UI:
         - Dark themed card matching existing glass-card style
         - "Something went wrong" heading
         - Error message in muted text
         - "Try Again" button that calls `window.location.reload()`
         - "Go Home" link to "/"
    
    2. Wrap the `<Routes>` in App.tsx with `<ErrorBoundary>`:
       ```
       <ErrorBoundary>
         <Routes>...</Routes>
       </ErrorBoundary>
       ```
  </action>
  <verify>Temporarily throw an error in a page component — verify ErrorBoundary catches it and shows fallback UI instead of white screen.</verify>
  <done>App shows friendly error page on any unhandled component error. No more white screen crashes.</done>
</task>

<task type="auto">
  <name>Add loading skeleton for SearchResults</name>
  <files>src/components/SearchResultsSkeleton.tsx, src/pages/SearchResults.tsx</files>
  <action>
    1. Create `src/components/SearchResultsSkeleton.tsx`:
       - Renders 4 placeholder bus result cards
       - Each card has animated pulse/shimmer effect using Tailwind `animate-pulse`
       - Match the layout of actual bus result cards (time, route line, price, button)
       - Use `bg-secondary rounded-md` for skeleton bars
    
    2. In SearchResults.tsx, add a brief loading state:
       - Add `const [loading, setLoading] = useState(true)` 
       - Use `useEffect` with a short timeout (300ms) to simulate load, then set loading false
       - When loading, show `<SearchResultsSkeleton />`
       - When loaded, show actual results
    
    This is a visual polish — real loading will come with backend in Phase 3.
  </action>
  <verify>Navigate to /search — skeleton shows briefly before results appear.</verify>
  <done>Search results page shows skeleton loading state before rendering results.</done>
</task>

## Success Criteria
- [ ] ErrorBoundary wraps the app and catches component errors
- [ ] SearchResults shows skeleton loading before rendering bus list
