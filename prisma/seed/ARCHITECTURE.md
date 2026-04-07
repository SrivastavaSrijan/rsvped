# Seed Pipeline — Architecture

A multi-pass LLM generation pipeline that produces a coherent relational dataset where entities are linked by shared interests, economics, and geography — not random assignment.

## Pipeline Overview

```
workflow.ts (CLI entry point)
  ├── generate  →  generator.ts     (3 LLM passes via Batch API)
  ├── process   →  process.ts       (validate, distribute events by city)
  └── seed      →  seed.ts          (10-stage DB writer with checkpoint/resume)
```

Each stage is independently runnable and resumable. Run `yarn workflow all` for the full pipeline or individual stages to retry failures.

## Stage 1: Generate (generator.ts)

Three sequential LLM passes via Claude Batch API (50% cheaper than real-time, zero rate limit pressure):

### Pass 1: Communities

**Input**: Static categories (20) + location slugs (69 cities)
**Output**: ~420 communities, each with 2-4 nested events

Each batch request gets a subset of location slugs and category names. The LLM generates communities authentic to their city — real neighborhood references, local cultural flavor, venue styles appropriate to the location. Not "Tech Hub #47" but "Lisbon Underground Wine Collective."

Communities carry:
- `homeLocation` (enforced via `z.enum()` to valid slugs)
- `categories` (must include at least one from the provided taxonomy)
- `focusArea`, `description`, membership tiers
- 2-4 events with realistic titles, venues, and pricing for that city

### Pass 2: Users (with Community Digest)

**Input**: Location slugs + categories + **community digest from Pass 1**
**Output**: ~620 user personas

This is the key coherence mechanism. Before generating users, the pipeline builds a **community digest** — a compact summary of which communities exist in each location:

```
Lisbon:
  - Lisbon Underground Wine Collective (Wine & Beverage Culture, Food & Drinks)
  - Lisbon Digital Nomad Network (Remote Work, Tech & Startups)
```

This digest is injected into the user generation prompt, so the LLM creates users whose interests **align with the communities available in their city**. Users generated for Lisbon will have interests in food, wine, or tech — not random hobbies.

Users carry:
- `location` (enforced slug), culturally appropriate names
- `interests` aligned with local communities
- `spendingPower` (LOW/MEDIUM/HIGH) correlated with experience level
- `networkingStyle` (ACTIVE/SELECTIVE/CASUAL) affecting event attendance probability
- `bio`, `profession`, `industry`, `experienceLevel`

Social graph requirements are baked into the prompt: create 2-3 clusters of 3-5 users per location who share overlapping interests but different professions (a designer, developer, and PM who all love "Technology" and "Design"). Include "bridge" users who span clusters.

### Pass 3: Venues

**Input**: Location slugs
**Output**: 10-15 realistic venue names per city

Real or plausible venue names — conference centers, restaurants, parks, coworking spaces, rooftops — authentic to each city.

### Batch API Mechanics

All three passes use `generators/batch.ts`:
- Requests bundled into a single Anthropic Batch API call per pass
- Model: `claude-haiku-4-5-20251001`
- Structured output via `tool_use` with Zod→JSON Schema conversion
- Poll for completion (5s interval, 30min timeout)
- Cost tracked per-token with batch pricing ($0.40/M input, $2.00/M output)
- Total cost for full generation: ~$1.58

### Fallback

If `USE_LLM=false` or no API key, generation is skipped. The seed stage falls back to Faker for names/descriptions (loses coherence but still works).

## Stage 2: Process (process.ts)

Validates batch output, distributes events across cities:

1. Load and validate all batch files against Zod schemas (discard corrupt files gracefully)
2. Map community events to their cities via slug→name lookup (no fuzzy matching — slugs are enforced)
3. Ensure minimum events per city (clone templates with city-specific titles if needed)
4. Write timestamped processed files: `communities-final-*.json`, `users-final-*.json`, `events-distributed-*.json`

## Stage 3: Seed (seed.ts)

10-stage DB writer with `PipelineRunner` for checkpoint/resume:

| Stage | What | How |
|---|---|---|
| `wipe-db` | Clean slate (optional) | Skipped on resume |
| `load-static` | Categories + locations from JSON | Upsert (idempotent) |
| `create-users` | Insert users with interests | LLM personas or Faker fallback; bcrypt hashes cached to disk |
| `create-communities` | Insert communities + memberships | Match to locations, assign cover images from Unsplash |
| `create-events` | Insert events from batch data | Match to communities + categories, assign hosts from user pool |
| `create-tickets` | Ticket tiers + promo codes + registration questions | Pricing from LLM event data |
| `create-orders` | **Intelligent RSVPs** (see below) | Category matching + spending power + networking style |
| `create-friendships` | **Interest-based social graph** (see below) | Scored pairs by location + category overlap + industry |
| `backfill-activities` | Activity feed entries | Derive from RSVPs, friendships, community joins |
| `analytics` | Daily stats | Aggregate counts per event per day |
| `demo-user` | Demo login account | Reassign existing events (not create new — images are complex) |

Pipeline state persists to `pipeline-state.json`. If the seed crashes at stage 7, re-running resumes from stage 7.

## Intelligent Matching Algorithms

### RSVP Generation (order-helpers.ts)

Not random assignment. For each event:

1. **Find interested users**: Score every user against the event's categories. Category overlap contributes a base score, modified by:
   - `networkingStyle`: ACTIVE +0.3, SELECTIVE ±0.2 (depends on match), CASUAL +0.1
   - Professional relevance: +0.1 if user has a profession and event has categories
   - Filter out users with probability < 0.1

2. **Select attendees intelligently**: Target 70% of event capacity.
   - Top 40% of slots go to highest-interest users (probability-weighted coin flip)
   - Remaining slots filled by probability-based selection (0.7× modifier)
   - If still short, add filler users

3. **Select ticket tier by spending power**:
   - HIGH → top 2 price tiers
   - MEDIUM → middle tiers
   - LOW → cheapest tier
   - This means the data naturally shows "expensive events attract high-spending users"

4. **Determine order success by economics**:
   - Free events: always succeed
   - Base success rate: 85%, modified by spending power (HIGH: 95%, LOW: 75%)
   - High-price events ($100+) reduce success rate further
   - Failed orders get PENDING or CANCELLED status

### Friendship Generation (friendships.ts)

Score every user pair, keep top N:

- Same location: +3
- Shared category interest: +1 to +2 per category (higher if both have strong interest)
- Same industry: +1

Sort by score descending, select ~4 friends per user average. 80% are ACCEPTED, 20% PENDING.

### Collaborator Assignment (order-helpers.ts)

For each event, find potential collaborators by category relevance score (>0.3 threshold), then select for **diversity** — avoid multiple collaborators with the same profession. Roles assigned by persona: ACTIVE networkers more likely to be CO_HOST, users with "manager" in profession get MANAGER role.

## Why This Matters

The result is a dataset where:
- A food blogger in Lisbon RSVPs to wine tasting events (not random tech meetups)
- High-spending executives buy VIP tickets; students get free tier
- Friends share overlapping interests and locations (not random pairs)
- Event collaborators have relevant expertise
- Communities in each city match the local culture

This makes the platform demo feel real — browsing events, seeing RSVPs, checking friend lists — everything is internally consistent because the generation pipeline encodes the same domain logic that the application enforces.
