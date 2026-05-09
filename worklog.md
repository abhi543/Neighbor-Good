# Neighbor Good — Worklog

## Build Date: 2026-05-09

## Summary
Built a complete **Neighbor Good** hyperlocal mutual aid platform — a single-page Next.js 16 application with earth-tone design, interactive Leaflet map, bulletin board, real-time chat exchanges, and user profiles.

## What Was Built

### Database & Backend
- **Prisma Schema**: 5 models (User, Post, Exchange, Message, Flag) with full relations
- **Seed Data**: 6 users, 12 posts across all categories, 3 exchanges with 8 messages
- **Demo User**: Alex Rivera (ID: `demo_alex_cuid001`) pre-seeded

### API Routes (8 endpoints)
- `GET/POST /api/posts` — List with filters (type, category, search) and create
- `GET/PUT/DELETE /api/posts/[id]` — Individual post operations
- `GET/POST /api/exchanges` — List user exchanges and create handshake
- `GET/PUT /api/exchanges/[id]` — View/update exchange status, rating
- `GET/POST /api/exchanges/[id]/messages` — Chat messages
- `GET/POST /api/users` — User list and create
- `GET/PUT /api/users/[id]` — User profile
- `POST /api/flag` — Report user

### Components (9 total)
1. **AppShell** — Top nav + mobile bottom tabs + desktop sidebar navigation
2. **OnboardingView** — 3-step wizard (profile → location → terms)
3. **MapView** — Leaflet map with custom markers, geofence circle, popups, filter indicator
4. **BulletinBoard** — Card list with type/category filters, search, proximity display
5. **PostDetailSheet** — Bottom sheet with post info, respond button, similar posts, flag
6. **CreatePostSheet** — OFFER/ASK toggle, category selector, preview, expiration
7. **ChatView** — Exchange list + full chat screen with messages, accept/complete/rating flow
8. **ProfileView** — Avatar, stats, badges, editable profile, post/exchange history
9. **FlagDialog** — Report user with reason selection

### Design System
- **Earth-tone color palette**: warm amber primary, sage green secondary, terracotta accent
- **Custom CSS variables**: warmth, neighbor-green, neighbor-amber, neighbor-coral
- **Dark mode**: warm-toned dark theme
- **Custom scrollbar styling**
- **Leaflet popup overrides** for consistent warm aesthetic

### State Management
- **Zustand store** with views, user, posts, exchanges, filters, map center
- **View routing**: onboarding → map → list → create-post → chat → profile

## Technical Notes
- Leaflet loaded via `next/dynamic` with `ssr: false` to avoid window dependency
- Custom `divIcon` markers (green "G" for Give, orange "W" for Want)
- Framer Motion animations for page transitions and card lists
- Responsive: mobile bottom tabs, desktop sidebar nav
- All API routes return proper include relations for joined data

## Files Created/Modified
- `prisma/schema.prisma` — Full database schema
- `src/lib/seed.ts` — Demo data seeder
- `src/lib/store.ts` — Zustand store
- `src/app/page.tsx` — Main SPA entry
- `src/app/layout.tsx` — Updated metadata
- `src/app/globals.css` — Earth-tone theme + Leaflet CSS
- `src/app/api/posts/route.ts`, `[id]/route.ts`
- `src/app/api/exchanges/route.ts`, `[id]/route.ts`, `[id]/messages/route.ts`
- `src/app/api/users/route.ts`, `[id]/route.ts`
- `src/app/api/flag/route.ts`
- `src/components/app-shell.tsx`
- `src/components/onboarding-view.tsx`
- `src/components/map-view.tsx`
- `src/components/bulletin-board.tsx`
- `src/components/post-detail-sheet.tsx`
- `src/components/create-post-sheet.tsx`
- `src/components/chat-view.tsx`
- `src/components/profile-view.tsx`
- `src/components/flag-dialog.tsx`

## Lint Status
✅ All lint checks pass (0 errors, 0 warnings)
