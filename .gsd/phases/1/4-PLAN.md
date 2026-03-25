---
phase: 1
plan: 4
wave: 2
---

# Plan 1.4: Light/Dark Mode Toggle & Reduced Motion

## Objective
Add light/dark mode theme toggle and prefers-reduced-motion accessibility support.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md (Phase 1 Decisions)
- src/index.css
- src/components/Navbar.tsx
- tailwind.config.ts

## Tasks

<task type="auto">
  <name>Add light mode CSS variables and theme toggle</name>
  <files>src/index.css, src/components/Navbar.tsx, src/main.tsx, src/App.tsx</files>
  <action>
    1. In `src/index.css`, add a `.light` class (or no class for light) with light mode CSS variables:
       The existing `:root` variables are dark theme. Add a new block:
       ```css
       .light {
         --background: 0 0% 98%;
         --foreground: 220 28% 12%;
         --card: 0 0% 100%;
         --card-foreground: 220 28% 12%;
         /* ... all other tokens for light mode */
       }
       ```
       Design a warm, premium light palette that complements the existing dark theme.
       Keep the starline-red and starline-gold brand colors consistent.
    
    2. The project already has `next-themes` installed. In main.tsx, wrap `<App>` with `<ThemeProvider attribute="class" defaultTheme="dark">` from next-themes.
    
    3. In Navbar.tsx, add a theme toggle button (Sun/Moon icon from lucide-react):
       - Desktop: Place before the Admin link
       - Mobile: Add at the bottom of the mobile menu
       - Use `useTheme()` from next-themes to toggle between "light" and "dark"
       - Animate the icon swap with Framer Motion
  </action>
  <verify>Click theme toggle — app switches between light and dark mode. Both modes look polished with proper contrast.</verify>
  <done>Light/dark mode toggle works. Light mode has a well-designed warm palette. Theme persists across page reloads.</done>
</task>

<task type="auto">
  <name>Add prefers-reduced-motion support</name>
  <files>src/index.css, src/components/AnimatedHero.tsx, src/pages/Index.tsx</files>
  <action>
    1. In `src/index.css`, add a reduced motion media query at the end:
       ```css
       @media (prefers-reduced-motion: reduce) {
         .traveler-idle,
         .lamppost-glow,
         .fog-drift,
         .headlight-bloom {
           animation: none !important;
         }
         * {
           animation-duration: 0.01ms !important;
           animation-iteration-count: 1 !important;
           transition-duration: 0.01ms !important;
         }
       }
       ```
    
    2. In AnimatedHero.tsx, check for reduced motion preference:
       - Use `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
       - If reduced motion: skip parallax mouse tracking, disable layer entry animations
       - Still show all content, just without motion
    
    3. In Index.tsx, add `viewport={{ once: true }}` to all `motion.div` elements that don't already have it (most already do — verify).
  </action>
  <verify>Enable "Reduce motion" in OS accessibility settings or browser dev tools. Reload app — no animations play, content still visible.</verify>
  <done>All animations respect prefers-reduced-motion. Content is fully accessible without animations.</done>
</task>

## Success Criteria
- [ ] Light/dark mode toggle works and persists
- [ ] Light mode palette is well-designed and premium
- [ ] All animations disabled when prefers-reduced-motion is set
