# RSVP'd — Demo Notes

Verified on a clean clone, macOS (darwin 27), Node v24.20.0, Yarn 4.18.0, Docker 29.7.2 — 2026-09-19.

**Status: fully demoable.** App builds, boots, serves real pages. Database seeded with **552 LLM-generated events / 10,367 RSVPs**. **All three live AI features verified working locally.** Total LLM spend to get here: **$0.1624**.

Two things to know before Monday, both explained below: **production's AI is calling a retired model** (§7), and **the production database is over quota and refusing all connections** (§8).

---

## 1. Cold start — fresh clone to running app

| # | Command | Time | Note |
|---|---|---|---|
| 1 | `git clone git@github.com:SrivastavaSrijan/rsvped.git && cd rsvped` | ~20s | HTTPS fallback works |
| 2 | `yarn install` | 39s | auto-migrates lockfile → gotcha A |
| 3 | `docker compose up -d` | ~60s first / ~3s after | pulls `postgres:15`, binds host **5433** |
| 4 | `cp .env.example .env` | — | then apply gotchas B–E |
| 5 | `yarn db:push` | 2s | **not** `migrate deploy` → gotcha D |
| 6 | `set -a && . ./.env && set +a && USE_LLM=true yarn db:seed all` | ~12 min | **the `set -a` part is required** → gotcha F |
| 7 | `yarn dev` | ready in 0.9s | first page compile +4.3s |

**The database is already seeded — steps 5–6 do not need re-running** unless the local DB is wiped. To just demo: `docker compose up -d && yarn dev`.

Open <http://localhost:3000> → **Try the Demo**, or `demo@rsvped.app` / `DemoUser123!` (committed on purpose, `lib/config/demo.ts`).

### Setup gotchas the README does not mention

**A. Lockfile migrates itself.** Repo ships a **Yarn v1** `yarn.lock`; Yarn 4.x rewrites it to v10 and adds `.yarnrc.yml`. Dirties `git status` — **don't commit mid-demo**. Restore: `git checkout yarn.lock && rm .yarnrc.yml`.

**B. Wrong Postgres port.** Compose publishes **5433**, `.env.example` says **5432**:
```
DATABASE_URL="postgresql://postgres:password@localhost:5433/rsvped"
```

**C. `DATABASE_URL_UNPOOLED` missing from `.env.example` entirely.** `schema.prisma` declares it as `directUrl`; every Prisma command dies with `P1012` without it:
```
DATABASE_URL_UNPOOLED="postgresql://postgres:password@localhost:5433/rsvped"
```

**D. Use `db:push`, not `migrate deploy`.** `prisma/migrations/` stops at `20250816110356`. `schema.prisma` has since added `Friendship`, `UserActivity`, `User.username` / `role` / `isDemo` with **no migration**. `migrate deploy` silently omits them.

**E. `yarn db:seed` alone does nothing** — prints a subcommand menu, exits 0. Needs `yarn db:seed all` (or `seed`).

**F. The seed pipeline never loads `dotenv`** — the one that actually bites. Nothing in `prisma/seed/**` imports `dotenv`. `DATABASE_URL` works only because **Prisma Client loads `.env` itself**; `prisma/seed/utils/config.ts` parses `ANTHROPIC_API_KEY` before that happens, so it is **always empty no matter what you put in `.env`**, and the seed silently degrades:

> `Warning: USE_LLM=true but ANTHROPIC_API_KEY is not set. LLM generation will be skipped.`

…then `generate` writes no batches and `process` hard-fails with `Required batches directory not found`. **Workaround: source `.env` into the environment first** — `set -a && . ./.env && set +a` — which is why step 6 looks the way it does. Real fix (not applied, it's a code change): `import 'dotenv/config'` at the top of `prisma/seed/utils/config.ts`.

**G. `UNSPLASH_COLLECTION_IDS` is plural in code, singular in `.env.example`.** `server/api/routers/image.ts` reads `UNSPLASH_COLLECTION_IDS`; the example ships `UNSPLASH_COLLECTION_ID`. Already fixed in the local `.env`.

---

## 2. What's in `.env` now

All pulled from his own Vercel project (`vercel env pull`) into the **gitignored** `.env`. Nothing secret is tracked by git — verified with `git check-ignore`.

| Var | Source | Status |
|---|---|---|
| `DATABASE_URL` / `_UNPOOLED` | hand-set | **localhost:5433** — never production |
| `ANTHROPIC_API_KEY` | his Vercel production env | working (all 3 AI features verified) |
| `UNSPLASH_ACCESS_KEY` / `_COLLECTION_IDS` | his Vercel production env | set; see §7 image note |
| `AUTH_SECRET`, `CRON_SECRET`, `SECRET_COOKIE_PASSWORD` | generated locally | 64-hex each |
| `SEED_BUDGET_USD` | set to **3** | hard cap, enforced by the seed |

Production credentials also sit in `.vercel/prod.env` (gitignored) if they need re-pulling.

---

## 3. What needs network or a service

| Thing | Needed for | Risk on venue wifi |
|---|---|---|
| Docker + `postgres:15` | everything | **Pull before travelling.** Then fully local. |
| **Anthropic API** | the 3 live AI features | **Needs internet at demo time.** No network → AI chat is dead, everything else fine. |
| dicebear.com | user avatars | CDN; avatars break offline, pages don't |
| Google OAuth | "Sign in with Google" | unset → use credentials login |
| Unsplash | event cover images | see §7 |

**Everything except the AI chat works fully offline.** If wifi is bad, demo the Forge artifacts and the manage dashboard (§4) and skip the chat, or screen-record the chat beforehand.

---

## 4. The Forge demo path — open these four, in this order

All in `context/plans/active/event-manage-phase2/`. The point: **a written plan, then commits that match it one-to-one.**

| # | File | The one-line point |
|---|---|---|
| 1 | `research.md` | **Recon before code.** Field-level schema inventory, the exact auth/slot/tab patterns to copy — and it caught that `createEventMessages()` and `createEventReferrals()` were writing columns that don't exist. Found by reading, before a line was written. |
| 2 | `analysis.md` | **Feasibility + risk per feature.** A ready/broken grid, and the call to put the chart *inside* Insights instead of adding a 7th tab. |
| 3 | `handoff.md` | **The contract given to the implementing agent.** 6 hard rules, the 8 files to read first, design tokens. |
| 4 | `progress.md` | **The receipts.** 7 steps, each with files, test state, and a commit SHA. Every SHA resolves — §5. |

Keep `state.md` open alongside: status `DONE`, PR link, and a **decisions log** of 6 questions and the answer chosen. `plan.md` (297 lines) is the full spec — open only if asked how deep the plan goes.

**Then close the loop — and now you can do it live in the UI:**

```
# log in as the Bangalore market host (has feedback + messages + chart data)
marcus.chen+1@example.com / YmJ5qPA0nWSA
→ http://localhost:3000/events/collective-artisan-market-spring-edition-bangalo/manage
```

Click through **Insights → Feedback → Messages** — those three tabs *are* the Forge phase-2 deliverable, now backed by real data (23 feedback rows, 8 messages, 91 daily-stat rows). Then show the plan said so first, and:

```
git show 600d5cd --stat     # Step 4 in progress.md, exactly the files it promised
gh pr view 43
```

**Caveat:** Forge itself is **not documented anywhere in this repo** — only its output. Be ready to explain the four phases verbally.

**Adjacent:** `.agents/skills/` has 13 `SKILL.md` files codifying house conventions; `.claude/commands/` has 6 scaffolding commands. Good answer to "how do you keep an agent consistent across a codebase?"

---

## 5. Verification results — every claim checked

### Seven step SHAs — **all 7 hold**

All resolve, titles match `progress.md`, authored by Srijan Srivastava, dated 2026-04-08, all ancestors of `main`.

| Step | SHA | Commit title | Stat |
|---|---|---|---|
| 1 | `f9a02f2` | Install recharts + fix broken EventMessage and EventReferral seeds | 9 files, +775/−29 |
| 2 | `a6fe59c` | Add dailyStats, feedback, and messages tRPC procedures | 1 file, +125 |
| 3 | `76da3b6` | Add analytics time-series chart to Insights tab | 5 files, +209/−53 |
| 4 | `600d5cd` | Add Feedback tab with rating summary and comments list | 6 files, +216/−2 |
| 5 | `da563eb` | Add Messages tab with threaded message display | 5 files, +150 |
| 6 | `28492cd` | Wire Feedback and Messages tabs into ManageTabs and layout | 2 files, +24 |
| 7 | `beed87e` | Add react-is peer dependency, verify build passes | 2 files, +6 |

### PR #43 — **all three numbers hold exactly**

| Claim | Actual (`gh pr view 43`) | Verdict |
|---|---|---|
| merged 2026-04-08 | `2026-04-08T13:54:44Z`, `MERGED` | ✅ |
| +1505 / −82 | `additions: 1505`, `deletions: 82` | ✅ |
| 23 files | `changedFiles: 23` | ✅ |

**Have this ready — it looks like a discrepancy and isn't:** the diff from base `e55cbc1` through Step 7 is **+1503/−82 across 23 files**, two short of the PR total. The missing 2 lines are the two `chore:` commits marking the Forge plan done. **The 7 engineering steps are 1503 of 1505 lines; the last 2 are the artifacts recording their own completion.**

PR #43 holds exactly 10 commits: 7 steps, 2 chores, 1 merge. The `stir-ai` commits are **not** on this branch — they came via `main` and only appear if you naively run `git log e55cbc1..a76707c`. Don't run that in front of anyone.

Also: base `e55cbc1` resolves (merge of PR #41) — `state.md` says parent is PR **#40**, which is the parent *feature*, not the base *commit*. Every file `plan.md` promised exists. Step 7 claimed "build PASS" — **still passes**, 28s.

---

## 6. Three things worth showing a senior engineer

### 1. Six parallel routes, each streaming independently
`app/(main)/events/[slug]/manage/layout.tsx` · `manage/@{overview,guests,insights,team,feedback,messages}/page.tsx`

Every tab is a Next.js parallel-route slot with its own `Suspense` boundary and skeleton, so tabs stream independently instead of blocking on the slowest query. Each slot self-guards with `if (tab !== 'x') return null` and ships a `default.tsx` so a hard refresh on any tab resolves. Trade-off worth defending: per-tab streaming bought with an unusual file layout.

### 2. An intent classifier that avoids the LLM when it can
`lib/ai/agent/classifier.ts` · `lib/ai/agent/tools/` (11 typed tools) · `lib/ai/agent/stir-agent.ts`

Queries hit `SHORT_CIRCUIT_PATTERNS` first — a 1–2 word query routes on a table lookup with **zero tokens**; longer queries fall through to LLM classification with a timeout. The resolved intent scopes `activeTools`, so the model is offered only the tools its intent needs, not all 11. Guardrails are real: `stopWhen: stepCountIs(10)`, 30s `maxDuration`, in-memory rate limiting. **Measured live: `"trending"` (short-circuit) answered in 4.8s vs `"what events are happening in Bangalore"` (full LLM classify) in 14.9s — the optimization is visible in the demo.**

### 3. A seed pipeline with a budget and a resume
`prisma/seed/workflow.ts` · `prisma/seed/utils/profiles.ts` · `prisma/seed/ARCHITECTURE.md`

Three stages (`generate` → `process` → `seed`), independently runnable and checkpointed. Four profiles (`dev`/`demo`/`full`/`stress`) each declaring user count, LLM usage, **estimated runtime and dollar cost**, plus a hard `SEED_BUDGET_USD` cap and `SEED_DRY_RUN`. Generation uses the **Anthropic Batch API** in 3 passes (communities → users → venues). Real numbers from this run: **142 batch requests, 0 errors, $0.1624 total.**

Honourable mention: `zod-prisma` generates Zod schemas from the Prisma schema into `server/api/routers/zod/`, so DB types and runtime validation can't drift — also the source of the lint noise in §7.

---

## 7. Known breakage

| Severity | What | Detail |
|---|---|---|
| 🔴 **Affects production** | **The AI agent was calling a retired model** | `lib/ai/agent/constants.ts` hard-coded `claude-sonnet-4-20250514` for the `quality` tier. That model is **no longer served** — it is absent from `GET /v1/models`, and every agent call failed with `STREAM ERROR: model: claude-sonnet-4-20250514`. **I changed it to `claude-sonnet-4-5-20250929`** (uncommitted, working tree only) and the feature immediately worked. **The same constant is what's deployed, so production's AI chat is almost certainly broken right now.** The `fast` tier (`claude-haiku-4-5-20251001`) is still valid and was unaffected. |
| 🔴 **Affects production** | **Production DB is over quota** | Neon rejects every connection — pooled and unpooled — with `Your account or project has exceeded the quota. Upgrade your plan to increase limits.` The live site still returns 200 because pages are cached/static, but `/events/discover` in production serves **76KB vs 877KB locally** — i.e. empty states. **Don't demo the deployed URL; demo localhost.** |
| 🟡 | e2e suite: **21/21 fail** | Not app code — Playwright 1.59.1 wants `chromium_headless_shell-1217`; cache has `-1234`. Fix: `yarn playwright install chromium` (~1 min). Unit tests are the safe thing to run live. |
| 🟡 | `yarn lint:check` red after any `db:push` | All flagged files are generated `server/api/routers/zod/*` — **0 hand-written files**. `zod-prisma` emits unformatted code. `yarn lint` fixes all 32; currently **exit 0**. |
| 🟡 | Unsplash image fetch failed during seed | `ExternalAPIError: Failed to fetch images from page 1`. Non-fatal (seed continued), but event cover images fall back to placeholders. Key is wired; likely rate-limited or the collection ID is stale. Cosmetic only. |
| 🟡 | `vercel:build` runs `prisma migrate deploy` | With stale migrations (gotcha D), a deploy from an empty DB would lack `Friendship`, `UserActivity`, `User.isDemo/role/username`. Have an answer ready — a senior reviewer will spot this. |
| 🟢 | WritingAssistant returns fenced JSON + commentary | `/api/ai/enhance` replies with a ```json block *and* a bulleted rationale. Works, but the UI may render the extra prose awkwardly. Prompt-tightening job, not a break. |
| 🟢 | Some seeded titles are geographically incoherent | City-suffixing produces e.g. *"Morning Movement Flow in Old Town Geneva - Hong Kong"* and a Geneva-described event listed under Bangalore. Artifact of the seed's city fan-out. Don't zoom in on those rows. |
| 🟢 | Doubled page titles | `Discover Events · RSVP'd · RSVP'd`. Cosmetic. |
| 🟢 | README undercounts tests | Says "13 tests"; actual **103 passed / 6 skipped** across 9 files. |

### Green, verified today

| Check | Result |
|---|---|
| `yarn type-check` | **exit 0** (4.7s) |
| `yarn lint:check` | **exit 0** |
| `yarn test` | **103 passed, 6 skipped, 0 failed** (3.3s) |
| `yarn build` | **passes** (28s) |
| Dev server | ready in **897ms** |

Only source file modified: `lib/ai/agent/constants.ts` (the model fix). **No commits, no pushes.**

---

## 8. Why the database is seeded and not cloned

Cloning production was the first choice and is **not currently possible**. Every connection string in his Vercel project — `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, pooled and direct — is refused by Neon:

```
ERROR: Your account or project has exceeded the quota. Upgrade your plan to increase limits.
```

That is account/project level, so `pg_dump` cannot run either. **No dump file exists.** Nothing was ever written to the remote; the only statements attempted were `select version()` and `select 1`, both rejected before execution. If the Neon quota is lifted, the clone path becomes: `vercel env pull .vercel/prod.env` → `pg_dump` the unpooled URL → restore into localhost:5433. Until then, the local seed **is** the better demo anyway — it's fresh, complete, and offline.

---

## 9. AI features — wiring and live evidence

**Only one provider is used: Anthropic.** No OpenAI, no vector DB, no embeddings service. Nothing is missing. (`TOGETHER_API_KEY` exists in the Vercel project but no code reads it — dead config.)

| Runtime path | File | Env needed | Verified |
|---|---|---|---|
| Stir agent (chat + 11 DB tools) | `app/api/ai/stir/route.ts` → `lib/ai/agent/stir-agent.ts` | `ANTHROPIC_API_KEY` | ✅ |
| AI Discovery | `app/api/ai/discover/route.ts` | `ANTHROPIC_API_KEY` | ✅ |
| WritingAssistant | `app/api/ai/enhance/route.ts` | `ANTHROPIC_API_KEY` | ✅ |
| Provider construction | `lib/ai/llm.ts` → `createAnthropic({ apiKey })` | `ANTHROPIC_API_KEY` | — |
| Seed generation | `prisma/seed/generator.ts` | same key, **but see gotcha F** | ✅ |

### Live evidence (real HTTP against the running app)

**Short-circuit path — zero-token classification, 4.8s:**
```
POST /api/ai/stir  {"text":"trending"}          → HTTP 200 · TOOLS: searchEvents
"Here are the most popular events happening right now! The **Collective Artisan Market**
 series is taking over cities worldwide... plus a **24-hour hardware hackathon** in Phoenix"
```

**Full LLM classification + tool use, 14.9s:**
```
POST /api/ai/stir  {"text":"what events are happening in Bangalore"} → HTTP 200 · TOOLS: searchEvents
"There's a great mix of wellness and food events happening in Bangalore! From artisan
 markets and fermentation workshops to alpine wellness retreats and morning yoga flows..."
```

**AI Discovery, 5.0s:**
```
POST /api/ai/discover {"text":"any wellness events in Bangalore?"} → HTTP 200 · TOOLS: searchEvents
"**Moonlit Dinner Series: Nourish & Connect - Bangalore Edition** - ...October 1st, 2026..."
```

**WritingAssistant, 4.5s:** `"come to our meetup its gonna be fun we have snacks"` → *"Join us for our upcoming meetup! We're excited to bring together our community… Light refreshments will be provided."*

Every response cites **real seeded rows**, proving the model is querying this database through the typed tools — not improvising.

---

## 10. The data

**Seeded via `USE_LLM=true yarn db:seed all`, dev profile — 142 Batch API requests, 0 errors, $0.1624.**

| Table | Rows |
|---|---|
| Event | **552** (276 in the future) |
| Rsvp | 10,367 |
| Order / Payment | 10,799 / 2,954 |
| EventDailyStat | 35,348 |
| EventMessage | 2,255 |
| EventFeedback | 1,522 |
| TicketTier | 631 |
| User | 70 |
| Location | 69 |
| CommunityMembership | 64 |
| Community | 10 |

Content is genuine, not lorem — real titles, descriptions, dates, venues:

> *Biohacking Masterclass: Sleep, Stress & Longevity* — "A 3-hour workshop at the Geneva Science Museum…"
> *5-Day Alpine Detox & Rewire Retreat* — "Unplug from screens at a luxury eco-lodge…"
> *Roppongi After-Hours: Midnight Sessions* — "Members-only listening session featuring unreleased…"

Communities read the same way: *Basement Beats Tokyo*, *Mumbai Midnight Diaries*, *Madrid Esports Alliance*, *Bogotá Fitness & Wellness Collective*.

### Accounts

| Login | Password | Use for |
|---|---|---|
| `demo@rsvped.app` | `DemoUser123!` | general demo; hosts 5 events |
| `marcus.chen+1@example.com` | `YmJ5qPA0nWSA` | **the Forge manage demo** — Bangalore market, 23 feedback + 8 messages + 91 daily stats |

All 69 seeded accounts and passwords: `prisma/.local/test-accounts.json` (gitignored).

**Re-seed** (only if the local DB breaks): `set -a && . ./.env && set +a && USE_LLM=true yarn db:seed all` — ~12 min, ~$0.17, `SHOULD_WIPE=true` handles the reset. `SEED_BUDGET_USD=3` caps spend.

---

## 11. Pre-demo checklist

- [ ] `docker compose up -d` — confirm `rsvped-postgres` is `Up` on 5433
- [ ] `yarn dev` → <http://localhost:3000>
- [ ] Confirm internet (AI chat needs it); if not, skip the chat and demo Forge + manage tabs
- [ ] Sanity-check AI: ask the Stir chat *"what events are happening in Bangalore"* — expect real event names
- [ ] Open the Bangalore manage page as `marcus.chen+1@example.com` and click Insights → Feedback → Messages
- [ ] Have `context/plans/active/event-manage-phase2/` open in four tabs, in order
- [ ] Have `git show 600d5cd --stat` and `gh pr view 43` ready in a terminal
- [ ] `git status` — expect `lib/ai/agent/constants.ts`, `yarn.lock`, `.yarnrc.yml`, `DEMO-NOTES.md`. **Don't commit.**
- [ ] Know the answers to: "why `db:push` not `migrate deploy`?", "why is prod's AI down?", "why is prod's DB down?"
