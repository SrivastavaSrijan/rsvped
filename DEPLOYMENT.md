# Deployment Guide for RSVP'd

## Vercel Deployment Setup

### 1. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to your project → Storage
3. Create a new Postgres database
4. Copy the connection string

#### Option B: External PostgreSQL
Use any PostgreSQL provider (Supabase, Railway, Neon, etc.)

### 2. Environment Variables

Set these in your Vercel project settings:

```bash
DATABASE_URL="your-postgres-connection-string"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### 3. Vercel Project Settings

1. **Build Command**: `npm run vercel:build`
2. **Install Command**: `npm install`
3. **Root Directory**: `./` (if in root)

### 4. Deployment Process

The `vercel:build` script will:
1. Run `prisma migrate deploy` to apply migrations
2. Generate Prisma Client
3. Build the Next.js application

### 5. Manual Migration (if needed)

If you need to run migrations manually in production:

```bash
# In Vercel Functions or your server
npx prisma migrate deploy
```

## Troubleshooting

### Migration Issues
- Ensure `DATABASE_URL` is correctly set
- Check that migrations exist in `prisma/migrations/`
- Verify PostgreSQL version compatibility

### Build Failures
- Check all environment variables are set
- Ensure TypeScript builds without errors
- Verify Prisma schema is valid

## Local Development

```bash
# Start development
npm run dev

# Reset database (development only)
npm run db:migrate:reset

# Create new migration
npm run db:migrate

# Push schema changes (development only)
npm run db:push
```
