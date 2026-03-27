## Plan 1.1 Summary: Critical Bug Fixes

**Status:** ✅ Complete

### Tasks Completed
1. **AnimatedHero hooks fix** — Extracted `ParallaxLayer` component so `useTransform` is no longer called inside `.map()`.
2. **Hardcoded dates replaced** — Created `getToday()` utility in `src/lib/utils.ts`. All pages use dynamic dates. Only `mockData.ts` retains sample dates.
3. **Rocket payment added** — Added to `paymentMethods` array in Checkout.tsx with purple Smartphone icon.
4. **Form validation in SeatSelection** — Name, phone (BD format), and email validation with inline error messages.

### Files Modified
- `src/components/AnimatedHero.tsx`
- `src/lib/utils.ts`
- `src/pages/SearchResults.tsx`, `SeatSelection.tsx`, `Checkout.tsx`, `TicketConfirmation.tsx`, `Index.tsx`, `LiveTracking.tsx`
- `src/components/SearchForm.tsx`
