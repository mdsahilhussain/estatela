# Offline-First Audit

## Current Data Flow

The app uses Expo Router with Clerk for auth, Supabase for reads and writes, Zustand for local state, and TanStack Query for only part of the remote data path.

- Home properties use `useHomeProperties` and `fetchHomeProperties`, backed by TanStack Query.
- Favorite status uses `useSavedProperty`, a TanStack Query read plus a direct mutation for save/unsave.
- Saved favorites list fetches directly in `app/(tabs)/favorite.tsx` on focus and stores results in component state.
- Search fetches directly in `app/(tabs)/search.tsx` whenever filters change and stores results in component state.
- Property detail fetches directly in `app/property/[id].tsx` and stores results in component state.
- Admin actions in property detail update/delete directly through the authenticated Supabase client.
- User sync runs after Clerk loads and upserts/reads the Supabase user row, then writes `isAdmin` to Zustand.

## Cache Policy

Cache in React Query:

- Public property lists: home featured/recommended, search results, property detail.
- User-specific favorites list and favorite status, scoped by Clerk user id.
- Non-sensitive derived profile flags such as `isAdmin`, with short TTL and server revalidation.

Always server authoritative:

- Clerk session and tokens.
- Admin authorization and role checks.
- Property create/update/delete outcomes.
- Sold/deleted property state before irreversible admin actions.
- User sync/upsert state.

Do not cache:

- Clerk auth tokens or sensitive auth payloads.
- Transient loading/error UI state.
- One-off form submission errors.

## Offline Actions

Should work offline:

- Browse already cached home, search, favorites, and property detail data.
- Change local filters and recent search preferences.
- Toggle favorite status using an offline mutation queue after an optimistic local update.
- Save a property draft locally before creating it on the server.

Must require internet:

- Sign in, sign up, sign out token revocation, and Clerk verification flows.
- Initial account/user sync.
- Contact agent through external WhatsApp URL.
- Admin mark sold/delete unless a later product decision explicitly allows queued admin operations.
- Image upload for new properties unless a local draft queue with upload retry is implemented.

## PR Plan

1. Network detection and offline banner.
2. Persist TanStack Query cache with AsyncStorage.
3. Make queries network-aware and migrate remaining direct reads into query hooks.
4. Add an offline mutation queue for favorite save/unsave.
5. Sync queued mutations on reconnect and invalidate affected queries.

## Target Architecture

```text
Clerk auth
  |
Root providers
  |-- NetworkProvider (single NetInfo listener)
  |-- QueryClientProvider
  |-- App screens
        |
        |-- Query hooks -> Supabase services -> React Query cache -> AsyncStorage persistence
        |
        |-- Mutations -> offline queue -> Supabase services -> query invalidation
```

## Sync Flow

```text
User toggles favorite
  |
Network offline?
  |-- yes: write queued operation, optimistic cache update, show pending state
  |-- no: send mutation immediately
  |
Internet restored
  |
Drain queue by idempotency key
  |
Invalidate favorites list/status and property queries
  |
Remove completed queue item
```

## Testing Checklist

- Launch online, load home, search, property detail, and favorites.
- Disable network in the simulator/device.
- Confirm the offline banner appears once at the root.
- Navigate to cached screens and confirm cached data remains visible where already loaded.
- Confirm sign-in/sign-up and uncached fetches show connection-aware messaging in later PRs.
- Re-enable network and confirm the banner disappears.
- In PR 4/5, toggle a favorite offline, restart the app, reconnect, and confirm the queued change syncs once.
