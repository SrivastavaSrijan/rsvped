Create a Next.js page for: $ARGUMENTS

## Steps
1. Determine route group: (auth), (main), (static), or (dev)
2. Create page.tsx as React Server Component:
   ```tsx
   import { getAPI } from '@/server/api'
   
   export default async function PageName({ params }: { params: Promise<{ slug: string }> }) {
     const { slug } = await params  // params is async in Next.js 15
     const api = await getAPI()
     const data = await api.domain.get({ slug })
     return <PageView data={data} />
   }
   ```
3. Create loading.tsx with Skeleton components
4. Add route to lib/config/routes.ts
5. Create colocated components/ directory with index.ts barrel if needed

## Rules
- RSC by default (no "use client" on pages)
- Always await params, cookies(), headers() (Next.js 15 async APIs)
- Use getAPI() for data fetching, never raw Prisma
- Use Routes.* constants, never hardcode paths
- Add loading.tsx for every page with async data

## Reference Skills
- nextjs-app-router
