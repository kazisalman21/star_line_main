---
phase: 2
plan: 2
wave: 1
depends_on: []
files_modified:
  - src/pages/Login.tsx
  - src/pages/Register.tsx
  - src/components/AuthModal.tsx
autonomous: true

must_haves:
  truths:
    - "Login page has email/password form with validation"
    - "Register page has name, email, password, phone fields"
    - "Google and Facebook SSO buttons exist on both pages"
    - "Pages use the premium dark/gold design system"
  artifacts:
    - "src/pages/Login.tsx exists"
    - "src/pages/Register.tsx exists"
---

# Plan 2.2: Auth UI — Login & Register Pages

<objective>
Create production-quality Login and Register pages with the Starline premium design system. These pages will be wired to Supabase Auth in Plan 2.3.

Purpose: Auth UI must exist before we can wire auth context and protected routes.
Output: Login and Register pages with forms, SSO buttons, and validation.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/index.css (design system tokens)
- src/pages/SeatSelection.tsx (form patterns reference)
- src/App.tsx (routing)
</context>

<tasks>

<task type="auto">
  <name>Create Login page</name>
  <files>
    src/pages/Login.tsx
    src/App.tsx
  </files>
  <action>
    Create `src/pages/Login.tsx`:
    1. Full-page layout with Navbar and Footer
    2. Centered card with glass effect (bg-glass / premium-card)
    3. Star Line logo at top
    4. Email + password inputs with validation
    5. "Remember me" checkbox
    6. "Forgot password?" link (placeholder for now)
    7. Submit button with btn-gold styling
    8. Divider with "or continue with"
    9. Google SSO button (icon + text)
    10. Facebook SSO button (icon + text)
    11. "Don't have an account? Register" link
    12. Loading state on submit
    13. Error display for invalid credentials
    14. Use PageHead for SEO

    Add route in App.tsx: `<Route path="/login" element={<Login />} />`

    AVOID: Wiring to Supabase yet — just create the UI with placeholder handlers.
    AVOID: Using plain HTML forms — use existing design tokens (bg-secondary, text-foreground, etc.)
  </action>
  <verify>
    - `npm run build` succeeds
    - Navigate to `/login` renders the page
    - Form validation works (empty submit shows errors)
  </verify>
  <done>
    Login page renders with email/password form, SSO buttons, and matches premium theme.
  </done>
</task>

<task type="auto">
  <name>Create Register page</name>
  <files>
    src/pages/Register.tsx
    src/App.tsx
  </files>
  <action>
    Create `src/pages/Register.tsx`:
    1. Same layout as Login (Navbar + Footer + centered card)
    2. Fields: Full Name, Email, Phone (BD format), Password, Confirm Password
    3. Password strength indicator (weak/medium/strong)
    4. Terms & conditions checkbox
    5. Submit button with btn-gold
    6. Same SSO buttons (Google + Facebook)
    7. "Already have an account? Login" link
    8. Client-side validation:
       - Name required
       - Email format check
       - BD phone format: /^(\+?880|0)1[3-9]\d{8}$/
       - Password min 8 chars with uppercase + number
       - Passwords match
    9. Use PageHead for SEO

    Add route in App.tsx: `<Route path="/register" element={<Register />} />`

    AVOID: Server-side auth — just UI with placeholder handlers.
    AVOID: Different design language from Login page.
  </action>
  <verify>
    - `npm run build` succeeds
    - Navigate to `/register` renders the page
    - All validation rules work correctly
  </verify>
  <done>
    Register page renders with all fields, validation, SSO buttons, and premium styling.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Login page accessible at /login with form + SSO
- [ ] Register page accessible at /register with form + SSO
- [ ] Both pages match premium dark/gold design
- [ ] Form validation works on both pages
- [ ] Build succeeds
</verification>

<success_criteria>
- [ ] Both auth pages are production-quality
- [ ] Routing works for /login and /register
- [ ] `npm run build` succeeds
</success_criteria>
