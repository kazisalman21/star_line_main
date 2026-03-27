## Plan 1.4 Summary: Light/Dark Mode Toggle & Reduced Motion

**Status:** ✅ Complete

### Tasks Completed
1. **Light mode CSS variables** — `.light` class in `src/index.css` with warm premium palette. Brand colors (starline-red, starline-gold) consistent across themes.
2. **Theme toggle** — Sun/Moon button in Navbar using `useTheme()` from `next-themes`. `ThemeProvider` wraps app in `main.tsx` with `defaultTheme="dark"`.
3. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables all animations (traveler-idle, fog, glow, headlight). AnimatedHero respects preference.

### Files Modified
- `src/index.css`
- `src/components/Navbar.tsx`
- `src/main.tsx`
- `src/components/AnimatedHero.tsx`
