---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Critical Bug Fixes

## Objective
Fix the most critical bugs that break React rules or produce incorrect behavior.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/components/AnimatedHero.tsx
- src/pages/SeatSelection.tsx
- src/pages/Checkout.tsx
- src/data/mockData.ts

## Tasks

<task type="auto">
  <name>Fix React hooks violation in AnimatedHero</name>
  <files>src/components/AnimatedHero.tsx</files>
  <action>
    The `useTransform` hook is called inside a `.map()` loop (line 51-52), violating React's rules of hooks.
    
    Fix by extracting each layer into a separate `ParallaxLayer` component that contains its own `useTransform` calls:
    
    1. Create a `ParallaxLayer` component above `AnimatedHero` that accepts `smoothX`, `smoothY`, `layer`, `index`, and `loaded` as props
    2. Move the `useTransform` calls into the new component
    3. Replace the `.map()` body in `AnimatedHero` with `<ParallaxLayer ... />`
    
    Do NOT change any visual behavior or animation parameters.
  </action>
  <verify>Run `npx tsc --noEmit` — no type errors. Run app in browser — parallax hero animates identically.</verify>
  <done>useTransform is no longer called inside a loop. TypeScript compiles cleanly.</done>
</task>

<task type="auto">
  <name>Replace hardcoded dates with dynamic values</name>
  <files>src/pages/SearchResults.tsx, src/pages/SeatSelection.tsx, src/pages/Checkout.tsx, src/pages/TicketConfirmation.tsx, src/components/SearchForm.tsx, src/pages/Index.tsx</files>
  <action>
    Replace all hardcoded "2026-03-25" fallback dates with dynamic today's date:
    
    1. Create a utility function in `src/lib/utils.ts`:
       `export const getToday = () => new Date().toISOString().split('T')[0];`
    2. In every file with `|| '2026-03-25'`, replace with `|| getToday()`
    3. In SearchForm.tsx, replace the hardcoded default date state with `getToday()`
    4. In Index.tsx popular routes links, replace the hardcoded date with dynamic date
    
    Import `getToday` from `@/lib/utils` in each file.
  </action>
  <verify>Search codebase for "2026-03-25" — zero results in source files except mockData.ts sample booking.</verify>
  <done>No hardcoded dates remain. All default to today's date dynamically.</done>
</task>

<task type="auto">
  <name>Add Rocket payment + fix form validation</name>
  <files>src/pages/Checkout.tsx, src/pages/SeatSelection.tsx</files>
  <action>
    1. In Checkout.tsx, add Rocket to the paymentMethods array:
       `{ id: 'rocket', name: 'Rocket', desc: 'Pay with Rocket mobile wallet', icon: Smartphone, color: 'text-purple-400' }`
       Add it after the Nagad entry.
    
    2. In SeatSelection.tsx, add basic form validation:
       - Add validation state: `const [errors, setErrors] = useState<Record<string, string>>({})` 
       - In the `proceed` function, validate before navigation:
         - passengerName must be non-empty
         - phone must match Bangladesh format (starts with +880 or 01, 11+ digits)
         - email must be valid format (contains @ and .)
       - Show error messages below each input field in red text
       - Clear errors on input change
  </action>
  <verify>Run app → go to Checkout → Rocket payment option visible. Go to SeatSelection → try to proceed with empty fields → validation errors shown.</verify>
  <done>Rocket is available as payment option. Form shows validation errors for empty/invalid fields.</done>
</task>

## Success Criteria
- [ ] No React hooks violations (AnimatedHero fixed)
- [ ] Zero hardcoded dates in source files  
- [ ] Rocket payment option available in checkout
- [ ] Form validation prevents invalid submissions
