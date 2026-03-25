---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: SEO Meta Tags & Page Titles

## Objective
Add proper SEO meta tags and page titles to all routes for production readiness.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx
- index.html

## Tasks

<task type="auto">
  <name>Create SEO head component and add to all pages</name>
  <files>src/components/PageHead.tsx, index.html, all page files in src/pages/</files>
  <action>
    1. Install `react-helmet-async` (lightweight library for managing document head):
       `npm install react-helmet-async`
    
    2. Create `src/components/PageHead.tsx`:
       ```tsx
       interface Props {
         title: string;
         description?: string;
       }
       ```
       - Uses `<Helmet>` to set `<title>` and `<meta name="description">`
       - Title format: `{title} | Star Line Group`
       - Default description: "Premium intercity bus booking in Bangladesh"
    
    3. Wrap `<App>` in main.tsx with `<HelmetProvider>`
    
    4. Add `<PageHead>` to every page with appropriate titles:
       - Index: "Book Intercity Bus Tickets"
       - SearchResults: "{from} to {to} Buses"
       - SeatSelection: "Select Your Seats"
       - Checkout: "Secure Checkout"
       - TicketConfirmation: "Booking Confirmed"
       - ManageBooking: "Manage Your Booking"
       - LiveTracking: "Live Trip Tracking"
       - RoutesFleet: "Routes & Fleet"
       - Support: "Help & Support"
       - AdminDashboard: "Operations Dashboard"
       - NotFound: "Page Not Found"
    
    5. Update `index.html` — set default title to "Star Line Group | Premium Bus Travel" and add meta description
  </action>
  <verify>Navigate to each page in browser — verify tab title changes correctly per page. View page source — meta description present.</verify>
  <done>Every page has unique title and meta description. Tab titles update on navigation.</done>
</task>

## Success Criteria
- [ ] All 11 pages have unique, descriptive titles
- [ ] Meta descriptions present on all pages
- [ ] index.html has default SEO metadata
