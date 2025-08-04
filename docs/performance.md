# Performance Audit

This document summarizes performance considerations and improvements for the RSVPed Next.js application.

## Static Generation

- Converted marketing and policy pages to static routes with Incremental Static Regeneration.
  - `app/(static)/page.tsx` revalidates every hour.
  - `app/(static)/privacy-policy/page.tsx` and `app/(static)/terms-of-service/page.tsx` revalidate daily.

## Server Data Caching

- Introduced `server/cache.ts` leveraging Next.js `unstable_cache` to cache server-side API calls.
- Cached data sets:
  - Nearby events (revalidate every 60 seconds, tagged per location).
  - Nearby categories and communities (revalidate every 5 minutes, tagged per location).
  - Location list and default location (revalidate every hour).
- Updated the events discovery page to use these cached helpers for parallel data fetching.

## Additional Notes

- Dynamic user-specific lookups (e.g., current user, cookie inspection) remain uncached.
- Future optimizations can include cache tag revalidation on create/update operations and analyzing bundle size with `next build`.
