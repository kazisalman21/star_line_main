---
phase: 7
plan: 4
wave: 2
depends_on: ["3"]
files_modified:
  - .env.local
  - .env.example
  - src/lib/supabase.ts
  - vercel.json
autonomous: false
user_setup:
  - service: vercel
    why: "Frontend hosting and deployment"
    dashboard_config:
      - task: "Create Vercel project linked to GitHub repo"
        location: "https://vercel.com/new"
      - task: "Set environment variables in Vercel dashboard"
        location: "Vercel → Settings → Environment Variables"
        vars:
          - VITE_SUPABASE_URL
          - VITE_SUPABASE_ANON_KEY

must_haves:
  truths:
    - ".env.example documents all required environment variables"
    - "vercel.json has SPA fallback rewrites"
    - "Supabase client gracefully handles missing env vars in production"
    - "Security headers are configured in vercel.json"
    - "README.md has deployment instructions"
  artifacts:
    - ".env.example exists with placeholder values"
    - "vercel.json has headers and rewrites"
    - "README.md has setup and deploy sections"
---

# Plan 7.4: Deployment Configuration & Production Readiness

<objective>
Prepare the app for production deployment on Vercel. Create .env.example, add security headers to vercel.json, update README with deployment instructions, and ensure graceful handling of configuration.

Purpose: The app needs to deploy cleanly to Vercel with proper security headers, env var documentation, and onboarding instructions.
Output: Production-ready deployment config. README with setup guide.
</objective>

<context>
Load for context:
- vercel.json (current config)
- .env.local (current vars — DO NOT expose values)
- src/lib/supabase.ts
- package.json
- .gsd/SPEC.md (deployment constraints)
</context>

<tasks>

<task type="auto">
  <name>Create deployment configuration files</name>
  <files>
    .env.example
    vercel.json
    src/lib/supabase.ts
  </files>
  <action>
    1. Create `.env.example`:
       ```
       # Supabase Configuration
       # Get these from: Supabase Dashboard → Settings → API
       VITE_SUPABASE_URL=https://your-project.supabase.co
       VITE_SUPABASE_ANON_KEY=your-anon-key-here
       ```

    2. Update `vercel.json`:
       ```json
       {
         "rewrites": [
           { "source": "/(.*)", "destination": "/index.html" }
         ],
         "headers": [
           {
             "source": "/(.*)",
             "headers": [
               { "key": "X-Content-Type-Options", "value": "nosniff" },
               { "key": "X-Frame-Options", "value": "DENY" },
               { "key": "X-XSS-Protection", "value": "1; mode=block" },
               { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
               { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
             ]
           },
           {
             "source": "/assets/(.*)",
             "headers": [
               { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
             ]
           }
         ]
       }
       ```

    3. Update `src/lib/supabase.ts`:
       - Instead of throwing on missing env vars, log a warning and export null
       - Or: keep the throw but make it clearer for debugging:
         ```ts
         if (!supabaseUrl || !supabaseAnonKey) {
           console.error(
             'Missing Supabase environment variables.',
             'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.',
             'See .env.example for reference.'
           );
           throw new Error('Missing Supabase configuration. See console for details.');
         }
         ```

    AVOID: Exposing actual env var values in .env.example.
    AVOID: Overly strict CSP that breaks Supabase auth redirects.
  </action>
  <verify>
    - `.env.example` exists with placeholder values
    - `vercel.json` has headers array
    - `npm run build` succeeds
  </verify>
  <done>
    Deployment config ready. Security headers configured. Env vars documented.
  </done>
</task>

<task type="auto">
  <name>Write production README</name>
  <files>
    README.md
  </files>
  <action>
    1. Rewrite `README.md` with:
       - Project name and one-line description
       - Tech stack summary (React + Vite + TypeScript + Supabase)
       - Prerequisites (Node.js 18+, npm)
       - Setup instructions:
         1. Clone repo
         2. Copy `.env.example` to `.env.local`
         3. Fill in Supabase credentials
         4. `npm install`
         5. `npm run dev`
       - Available scripts (dev, build, test, lint, preview)
       - Deployment to Vercel:
         1. Connect GitHub repo to Vercel
         2. Set env vars in Vercel dashboard
         3. Deploy (auto-builds on push)
       - Supabase setup:
         1. Create project at supabase.com
         2. Run `supabase/schema.sql` in SQL editor
         3. Enable Google/Facebook auth providers
       - Project structure (brief)
       - License placeholder

    AVOID: Including credentials or specific project URLs.
    AVOID: Overly long README — keep it practical.
  </action>
  <verify>
    - README.md has setup, dev, and deploy sections
    - No placeholder "Lovable" content remains
  </verify>
  <done>
    README has clear setup and deployment instructions for new developers.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>User deploys to Vercel</name>
  <action>
    User needs to:
    1. Push latest code to GitHub
    2. Create Vercel project linked to the repo
    3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables
    4. Deploy and verify the live URL works
    5. Test auth flow on production URL
    6. Confirm Supabase OAuth redirect URLs include the Vercel domain
  </action>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] .env.example exists with documented variables
- [ ] vercel.json has security headers
- [ ] README.md has setup + deployment instructions
- [ ] `npm run build` succeeds and dist/ is clean
- [ ] No "Lovable" references remain anywhere in the codebase
</verification>

<success_criteria>
- [ ] Deployment configuration is complete
- [ ] README is production-quality
- [ ] App is ready for Vercel deployment
</success_criteria>
