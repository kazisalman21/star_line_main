# Phase 7 Build Report

Generated: 2026-04-01

## Build Configuration
- **Bundler**: Vite 5.4.19
- **Target**: ES2020
- **Sourcemaps**: Disabled
- **Code Splitting**: React.lazy (17 lazy routes) + manual vendor chunks

## Before (Phase 6 baseline)
- Single bundle: ~447 kB

## After (Phase 7 optimized)
- **Build time**: 8.41s
- **Total JS chunks**: 47 files
- **CSS**: 93.7 kB

### Vendor Chunks
| Chunk | Size |
|-------|------|
| vendor-react (react + react-dom + router) | 159.0 kB |
| vendor-animation (framer-motion) | 111.6 kB |
| vendor-ui (radix primitives) | 65.9 kB |
| vendor-charts (recharts) | 401.4 kB |

### Main App Chunk
| Chunk | Size |
|-------|------|
| index (core app + eager routes) | 446.0 kB |
| index.es (supabase + other libs) | 147.7 kB |

### Lazy Route Chunks (loaded on demand)
| Route | Size |
|-------|------|
| TicketConfirmation | 630.2 kB (includes jspdf + html2canvas) |
| AdminDashboard | 71.5 kB |
| Counters | 19.5 kB |
| PassengerDashboard | 17.4 kB |
| PrivacyPolicy | 13.1 kB |
| SeatSelection | 12.4 kB |
| Profile | 11.2 kB |
| TermsOfService | 11.1 kB |
| LiveTracking | 10.4 kB |
| Checkout | 8.8 kB |
| ManageBooking | 7.0 kB |
| RoutesFleet | 5.2 kB |
| Support | 5.1 kB |
| PaymentSuccess | 2.5 kB |
| PaymentFail | 2.1 kB |
| PaymentCancel | 1.9 kB |
| NotFound | 0.8 kB |

### Key Improvements
1. **Initial load reduced**: Homepage only loads index + vendor-react + vendor-animation. Charts, admin, ticket PDF, etc. are deferred.
2. **17 lazy-loaded routes**: Each produces its own chunk, loaded only when navigated to.
3. **4 vendor chunks**: Separates rarely-changing vendor code from app code for better caching.
4. **lovable-tagger removed**: No longer in production build pipeline.

### Notes
- TicketConfirmation is large (630 kB) due to jspdf + html2canvas. These are lazy-loaded so they don't affect initial page load.
- vendor-charts (recharts, 401 kB) is only loaded by AdminDashboard. Consider replacing with a lighter charting lib if admin dashboard isn't heavily used.
