---
phase: 7
plan: 3
wave: 2
depends_on: ["1", "2"]
files_modified:
  - vite.config.ts
  - src/main.tsx
  - src/App.tsx
  - src/pages/Index.tsx
autonomous: true

must_haves:
  truths:
    - "Vite build produces optimized chunks with code splitting"
    - "React.lazy is used for route-level code splitting on non-critical pages"
    - "Images referenced in the app use proper sizing and modern formats"
    - "lovable-tagger is removed from production config"
    - "Build output size is documented"
  artifacts:
    - "vite.config.ts has optimized build configuration"
    - "Build succeeds and dist/ is generated"
---

# Plan 7.3: Performance Optimization & Build Hardening

<objective>
Optimize the production build: add route-level code splitting with React.lazy, configure Vite's build for optimal chunking, remove dev-only dependencies from prod, and document the build output.

Purpose: The bundle is ~447 kB — route-level splitting will reduce initial load time. Lovable-tagger is a dev-only plugin that shouldn't leak to prod builds.
Output: Optimized build with code splitting, smaller initial bundle, clean prod config.
</objective>

<context>
Load for context:
- vite.config.ts
- src/App.tsx (all routes)
- src/main.tsx
- package.json (dependencies to audit)
- .gsd/ARCHITECTURE.md
</context>

<tasks>

<task type="auto">
  <name>Add route-level code splitting and optimize Vite build</name>
  <files>
    vite.config.ts
    src/App.tsx
  </files>
  <action>
    1. Update `src/App.tsx`:
       - Keep critical routes eager-loaded: Index, Login, Register, SearchResults
       - Use React.lazy() for non-critical routes:
         - SeatSelection, Checkout, TicketConfirmation
         - ManageBooking, Profile, PassengerDashboard
         - AdminDashboard, LiveTracking
         - RoutesFleet, Counters, Support
         - PaymentSuccess, PaymentFail, PaymentCancel
         - TermsOfService, PrivacyPolicy, NotFound
       - Wrap Routes with `<Suspense fallback={<LoadingSpinner />}>`
       - Create a minimal LoadingSpinner inline component:
         ```tsx
         const LoadingSpinner = () => (
           <div className="min-h-screen bg-background flex items-center justify-center">
             <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
           </div>
         );
         ```

    2. Update `vite.config.ts`:
       - Remove lovable-tagger import and usage entirely (it's only useful in the Lovable editor)
       - Add build optimization:
         ```ts
         build: {
           rollupOptions: {
             output: {
               manualChunks: {
                 'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                 'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
                 'vendor-animation': ['gsap', 'framer-motion'],
                 'vendor-charts': ['recharts'],
               },
             },
           },
           target: 'es2020',
           sourcemap: false,
         },
         ```

    AVOID: Lazy-loading the Index (homepage) — it's the entry point.
    AVOID: Lazy-loading Login/Register — they must load fast for auth redirects.
    AVOID: Over-splitting — keep vendor chunks to 4-5 max.
  </action>
  <verify>
    - `npm run build` succeeds
    - dist/ contains multiple chunk files (not one giant bundle)
    - No lovable-tagger references in build output
  </verify>
  <done>
    Build produces optimized chunks. Route-level splitting reduces initial load.
    lovable-tagger removed from prod config.
  </done>
</task>

<task type="auto">
  <name>Document build output and verify optimization</name>
  <files>
    .gsd/phases/7/BUILD-REPORT.md
  </files>
  <action>
    1. Run `npm run build` and capture full output
    2. Create `.gsd/phases/7/BUILD-REPORT.md` documenting:
       - Total bundle size (gzipped)
       - Individual chunk sizes
       - Number of chunks
       - Before vs after comparison (447 kB baseline)
    3. Verify no TypeScript errors in build
    4. Run `npm run preview` briefly to confirm the prod build serves correctly

    AVOID: Obsessing over micro-optimizations — document and move on.
  </action>
  <verify>
    - BUILD-REPORT.md exists with size data
    - Build completes without errors
  </verify>
  <done>
    Build report documents chunk sizes and optimization results.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Route-level code splitting with React.lazy
- [ ] Vite build produces multiple chunks
- [ ] lovable-tagger removed from prod
- [ ] Build report documents sizes
- [ ] `npm run build` succeeds
</verification>

<success_criteria>
- [ ] Multiple vendor + route chunks in dist/
- [ ] Build succeeds with no errors
- [ ] BUILD-REPORT.md documents the results
</success_criteria>
