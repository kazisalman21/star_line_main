# Star Line Group — Premium Intercity Bus Booking

A full-stack intercity bus booking platform for Star Line Group (Bangladesh). Search routes, select seats, pay online, and get instant digital tickets.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-org/starline.git
cd starline

# 2. Copy environment template
cp .env.example .env.local

# 3. Fill in your Supabase credentials in .env.local
#    Get them from: Supabase Dashboard → Settings → API

# 4. Install dependencies
npm install

# 5. Start dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source files |

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - Email (enabled by default)
   - Google OAuth
   - Facebook OAuth
4. Copy your project URL and anon key into `.env.local`

## Deploying to Vercel

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Set environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-builds on every push
5. Add the Vercel domain to **Supabase → Authentication → URL Configuration → Redirect URLs**

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Shared components (Navbar, Footer, SearchForm, etc.)
│   ├── ui/          # Shadcn/UI component library
│   └── __tests__/   # Component unit tests
├── contexts/        # React contexts (AuthContext)
├── data/            # Mock data (legacy)
├── hooks/           # Custom React hooks
├── lib/             # Supabase client, utilities
├── pages/           # Route page components
│   └── __tests__/   # Page unit tests
├── services/        # API service layer (routeService, bookingService)
├── test/            # Test setup and utilities
└── types/           # TypeScript types (database schema)
supabase/
└── schema.sql       # Database schema with RLS policies
```

## License

Private — Star Line Group © 2026
