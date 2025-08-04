# Performance Audit

This document summarizes performance considerations and improvements for the RSVPed Next.js application.

## Static Generation

- Converted marketing and policy pages to static routes with Incremental Static Regeneration.
  - `app/(static)/page.tsx` revalidates every hour.
  - `app/(static)/privacy-policy/page.tsx` and `app/(static)/terms-of-service/page.tsx` revalidate daily.

## Server Data Caching

- Integrated Next.js `unstable_cache` directly within tRPC procedures using strongly-typed cache tags.
- Cached data sets:
  - Nearby events (revalidate every 60 seconds, tagged per location).
  - Nearby categories and communities (revalidate every 5 minutes, tagged per location).
  - Location list and default location (revalidate every hour).
- The events discovery page consumes these cached procedures for parallel data fetching.

## Additional Notes

- Dynamic user-specific lookups (e.g., current user, cookie inspection) remain uncached.
- Future optimizations can include cache tag revalidation on create/update operations and analyzing bundle size with `next build`.
