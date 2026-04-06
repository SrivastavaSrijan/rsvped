# Prisma — Claude Code Rules

## Schema Conventions

### IDs & Fields
- All models use `@id @default(cuid())` for primary keys
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Soft delete: `deletedAt DateTime?` where applicable
- Long text: use `@db.Text` annotation (e.g., `description String? @db.Text`)
- Slugs: `slug String @unique` for URL-friendly identifiers

### Relations
- Always name relation fields clearly: `hostId` + `host` (not just `userId`)
- Use `@relation("Name")` for disambiguation when multiple relations exist to same model
- Cascading: handle in application code (tRPC routers), not Prisma schema

### Enums
- Defined in schema, used in app code via `@prisma/client` imports
- Examples: `ExperienceLevel`, `SpendingPower`, `CommunityExclusivity`, `LocationType`

### Zod Generator
- `generator zod` outputs to `server/api/routers/zod/`
- Use generated Zod models for input validation: `EventModel.pick({...}).partial({...})`
- Run `yarn db:push` or `yarn db:migrate` to regenerate

## Migrations

```bash
yarn db:migrate       # Create + apply named migration (production-safe)
yarn db:push          # Quick sync for dev (no migration file, lossy)
yarn db:studio        # GUI browser
```

- Use `db:push` during development for speed
- Use `db:migrate` before merging to main — creates a migration file for the PR
- Always check that migration is additive (no data loss) before applying

## Seed System

### Architecture
```
prisma/seed/
├── seed.ts           # Entry point — orchestrates the full pipeline
├── generator.ts      # DataGenerator class — coordinates LLM generation
├── creators/         # DB writers — take generated data, insert via Prisma
├── generators/       # LLM-powered data generation (Together AI, cached)
└── utils/            # Logger, config, database helpers, faker extensions
```

### Rules
- **Do not modify the seed system** unless explicitly asked — it's complex and works
- Seed generators use Together AI (Llama 3.1) via `together-ai` package — this is intentional and separate from app-level AI
- Generated data is cached in `prisma/seed/generators/cache.ts` to avoid re-calling LLMs
- Config in `prisma/seed/utils/config.ts` controls `NUM_USERS`, `NUM_COMMUNITIES`, `USE_LLM`
- The seed pipeline runs `wipeDb()` → create users → create communities → create events → create orders

### Image System
- Cover images for events and communities come from **Unsplash** via `utils/image-fetcher.ts`
- Uses a curated collection (`UNSPLASH_COLLECTION_ID`, default: `j7hIPPKdCOU`) for visual coherence
- Requires `UNSPLASH_ACCESS_KEY` env var; falls back to Picsum placeholders if missing
- Images are fetched once at seed start (up to 400, configurable via `MAX_UNSPLASH_IMAGES`) and randomly assigned to entities
- **Do not create events in demo.ts** — the image system is complex; instead reassign existing seeded events to the demo user
- Location images come from `prisma/seed/init/locations.csv`, not Unsplash

### Testing Seed Logic
- Seed matching logic (`findInterestedUsers`, `selectIntelligentAttendees`, `selectTierForUser`) is the most complex code in the seed system
- Tests for these go in `__tests__/seed/` — focus on behavior: "HIGH spending users never get FREE tier"
