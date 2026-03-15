# Beltway Realms Card Database

A FUTBin-style searchable card database for **Beltway Realms** — roughly 700 cards covering every region, encounter, and mechanic in the game.

Think of this as the community hub where players browse, filter, compare, and theory-craft card loadouts before diving into encounters.

---

## What FUTBin Does (and What We're Borrowing)

FUTBin is the gold standard for game-card databases. The features worth stealing:

| FUTBin Feature | Our Equivalent |
|---|---|
| Player cards with stats (pace, shooting, etc.) | Cards with attributes (modifier, affinity, rarity, etc.) |
| Position / league / nation filters | Type / region / tier / keyword filters |
| Card comparison tool | Side-by-side card compare |
| SBC solutions (squad-building) | **Loadout builder** — pick a hand of cards for an encounter |
| Price tracking over time | _Not needed (no marketplace)_ — replace with **usage stats** and **win-rate per card** |
| Community ratings & reviews | Player ratings, comments, "best in slot" votes |
| Card "versions" (TOTW, TOTY, etc.) | Card **variants** — base, upgraded, legendary |

---

## Card Taxonomy

### Types (4 core + 2 new)

| Type | Count Target | Role |
|---|---|---|
| **Quest** | ~120 | Drives story forward, grants XP |
| **Dialogue** | ~160 | Played before a roll for a one-time modifier |
| **Skill** | ~160 | Passive bonus; can be "focused" for extra effect |
| **Insight** | ~100 | One-time consumable, high-impact modifier |
| **Event** | ~80 | Triggered by game conditions (region entry, streak, combo) |
| **Artifact** | ~80 | Persistent items that modify rules (e.g. "re-roll once per encounter") |

### Rarity Tiers

| Tier | Color | Drop Rate | Modifier Range |
|---|---|---|---|
| Common | Gray | 40% | +0 to +1 |
| Uncommon | Green | 30% | +1 to +2 |
| Rare | Blue | 18% | +2 to +3 |
| Epic | Purple | 9% | +3 to +4 |
| Legendary | Gold | 3% | +4 to +6 |

### Attributes (per card)

Every card has a stat block:

```
{
  id:            "card-skill-arlington-bureaucratic-judo"
  name:          "Bureaucratic Judo"
  type:          "skill"
  rarity:        "rare"
  region:        "arlington"
  modifier:      2
  tags:          ["government", "defense", "redirect"]
  flavor:        "Use their own process against them."
  description:   "Passive +2 to encounters involving government contracts."
  unlockMethod:  "Complete 'The Clearance Gauntlet' quest"

  // FUTBin-style derived stats
  versatility:   3    // 1-5, how many encounter types it helps
  synergy:       4    // 1-5, how well it combos with other cards
  reliability:   5    // 1-5, how consistent the effect is
  ceiling:       2    // 1-5, max potential in ideal conditions
}
```

---

## Database Schema

### Option A: SQLite (Recommended for MVP)

Simple, zero-config, ships as a single file. Perfect for a browseable card DB.

```sql
CREATE TABLE cards (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('quest','dialogue','skill','insight','event','artifact')),
  rarity        TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  region_id     TEXT,
  modifier      INTEGER DEFAULT 0,
  versatility   INTEGER DEFAULT 3 CHECK (versatility BETWEEN 1 AND 5),
  synergy       INTEGER DEFAULT 3 CHECK (synergy BETWEEN 1 AND 5),
  reliability   INTEGER DEFAULT 3 CHECK (reliability BETWEEN 1 AND 5),
  ceiling       INTEGER DEFAULT 3 CHECK (ceiling BETWEEN 1 AND 5),
  flavor        TEXT,
  description   TEXT NOT NULL,
  unlock_method TEXT,
  image_url     TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE card_tags (
  card_id TEXT NOT NULL REFERENCES cards(id),
  tag     TEXT NOT NULL,
  PRIMARY KEY (card_id, tag)
);

CREATE TABLE card_variants (
  id            TEXT PRIMARY KEY,
  base_card_id  TEXT NOT NULL REFERENCES cards(id),
  variant_name  TEXT NOT NULL,           -- e.g. "Upgraded", "Legendary"
  modifier_delta INTEGER DEFAULT 0,      -- bonus on top of base
  special_effect TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regions (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  theme    TEXT,
  color    TEXT                          -- hex color for UI
);

-- FUTBin-style community features
CREATE TABLE card_ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id    TEXT NOT NULL REFERENCES cards(id),
  user_id    TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id, user_id)
);

-- Usage / win-rate tracking (replaces FUTBin price history)
CREATE TABLE card_usage_stats (
  card_id         TEXT PRIMARY KEY REFERENCES cards(id),
  times_played    INTEGER DEFAULT 0,
  times_won       INTEGER DEFAULT 0,    -- encounter ended in success/critical
  avg_roll_with   REAL,                 -- average d20 result when this card was active
  popular_rank    INTEGER               -- computed weekly
);

-- Indexes for fast filtering
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_region ON cards(region_id);
CREATE INDEX idx_card_tags_tag ON card_tags(tag);
```

### Option B: PostgreSQL (If You Want a Hosted API)

Same schema as above but swap `TEXT` primary keys for `UUID`, add `pg_trgm` for fuzzy search, and use `JSONB` for flexible metadata.

### Option C: JSON Flat File (Simplest)

A single `cards.json` with 700 entries. Good for prototyping, bad for querying. Use this only to seed the real database.

---

## Tech Stack (Recommended)

| Layer | Tech | Why |
|---|---|---|
| **Database** | SQLite via `better-sqlite3` | Zero config, fast reads, single file |
| **API** | Node.js + Hono (or Express) | Lightweight, TypeScript-native |
| **Frontend** | React + Vite (same stack as main game) | Consistency, shared types |
| **Search** | SQLite FTS5 full-text search | Built-in, no extra service |
| **Hosting** | Cloudflare Pages + D1 (SQLite at edge) | Free tier, fast, serverless |

---

## Feature Roadmap

### Phase 1: Core Database (Week 1-2)

- [ ] Define card schema and seed script
- [ ] Generate 700 cards (see "Card Generation" below)
- [ ] Build API endpoints: list, filter, search, get-by-id
- [ ] Card list page with table view and grid view
- [ ] Filter sidebar: type, rarity, region, modifier range
- [ ] Full-text search across name, description, tags
- [ ] Sort by: name, modifier, rarity, versatility, synergy, reliability, ceiling

### Phase 2: Card Detail & Compare (Week 3)

- [ ] Card detail page with full stat block, flavor text, unlock info
- [ ] Stat radar chart (versatility, synergy, reliability, ceiling)
- [ ] "Similar cards" recommendations
- [ ] Side-by-side comparison tool (pick 2-4 cards)
- [ ] Shareable card URLs (e.g. `/card/card-skill-arlington-bureaucratic-judo`)

### Phase 3: Loadout Builder (Week 4)

- [ ] Drag-and-drop hand builder (3-5 cards)
- [ ] Encounter simulator — pick a quest, see estimated roll outcome
- [ ] Show total modifier, synergy score, and coverage gaps
- [ ] Save/share loadouts via URL
- [ ] "Best loadout for X encounter" community suggestions

### Phase 4: Community Features (Week 5+)

- [ ] User accounts (simple OAuth — GitHub/Google)
- [ ] Card ratings and comments
- [ ] "Best in slot" voting per encounter/region
- [ ] Usage stats dashboard (most played, highest win-rate)
- [ ] Card tier list builder
- [ ] Weekly meta report (auto-generated from usage data)

---

## Card Generation Strategy (Getting to 700)

You're not hand-writing 700 cards. Here's the pipeline:

### Step 1: Define Templates

Create card templates per type and region. Example:

```typescript
const SKILL_TEMPLATES = [
  { pattern: "{region} {noun}", desc: "Passive +{mod} to {situation} encounters.", tags: ["{domain}"] },
  { pattern: "{adjective} {noun}", desc: "When focused, gain +{mod} against {enemy_type}.", tags: ["{domain}", "focus"] },
  // ...20-30 templates per type
]
```

### Step 2: Build Vocabularies

Per-region word banks:

```typescript
const VOCAB = {
  arlington: {
    nouns: ["Clearance", "Briefing", "Memo", "Protocol", "Directive", "Badge", "Redaction"],
    adjectives: ["Classified", "Bipartisan", "Sequestered", "Expedited", "Redacted"],
    situations: ["government", "security", "bureaucratic", "defense"],
    enemies: ["Red Tape", "Oversight Committee", "Audit Trail"],
  },
  reston: {
    nouns: ["Sprint", "Standup", "Pipeline", "Deployment", "Incident", "Retro", "On-call"],
    adjectives: ["Agile", "Distributed", "Async", "Deprecated", "Legacy"],
    situations: ["technical", "process", "infrastructure"],
    enemies: ["Technical Debt", "Scope Creep", "Production Outage"],
  },
  // ...per region
}
```

### Step 3: Generate + Curate

```bash
# Generate 900 candidates
npx tsx scripts/generate-cards.ts --count 900 --output cards-raw.json

# Review and curate down to 700
# (Remove duplicates, fix flavor, adjust stats)
npx tsx scripts/curate-cards.ts --input cards-raw.json --output cards-final.json

# Seed the database
npx tsx scripts/seed-db.ts --input cards-final.json
```

### Step 4: Manual Polish

The best 50-100 cards (legendaries, boss quest cards, key story cards) should be hand-written with unique flavor text and mechanics. The generated cards fill out the common/uncommon tiers.

### Target Distribution

| Region | Quest | Dialogue | Skill | Insight | Event | Artifact | Total |
|---|---|---|---|---|---|---|---|
| Arlington | 20 | 28 | 28 | 18 | 14 | 14 | 122 |
| Reston | 20 | 28 | 28 | 18 | 14 | 14 | 122 |
| Tysons | 20 | 28 | 28 | 18 | 14 | 14 | 122 |
| Ashburn | 20 | 28 | 28 | 18 | 14 | 14 | 122 |
| Citadel (DC) | 20 | 24 | 24 | 14 | 12 | 12 | 106 |
| Neutral / Cross-region | 20 | 24 | 24 | 14 | 12 | 12 | 106 |
| **Total** | **120** | **160** | **160** | **100** | **80** | **80** | **700** |

---

## API Design

### Endpoints

```
GET    /api/cards                    List/filter/search cards
GET    /api/cards/:id                Single card detail
GET    /api/cards/:id/similar        Similar cards
GET    /api/cards/compare?ids=a,b,c  Compare multiple cards
GET    /api/regions                  List regions
GET    /api/tags                     List all tags (for autocomplete)
GET    /api/stats/popular            Most-played cards
GET    /api/stats/winrate            Highest win-rate cards
POST   /api/loadouts                 Save a loadout
GET    /api/loadouts/:id             Get a saved loadout
POST   /api/cards/:id/rate           Rate a card (authed)
GET    /api/cards/:id/ratings        Get ratings for a card
```

### Filter Query Parameters

```
GET /api/cards?type=skill&rarity=rare,epic&region=arlington&modifier_min=2&tags=government&q=clearance&sort=synergy&order=desc&page=1&limit=50
```

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by card type |
| `rarity` | string (comma-separated) | Filter by rarity tier(s) |
| `region` | string | Filter by region |
| `modifier_min` | number | Minimum modifier value |
| `modifier_max` | number | Maximum modifier value |
| `tags` | string (comma-separated) | Filter by tag(s), AND logic |
| `q` | string | Full-text search (name, description, tags) |
| `sort` | string | Sort field (name, modifier, rarity, versatility, synergy, reliability, ceiling, popular_rank) |
| `order` | `asc` or `desc` | Sort direction |
| `page` | number | Pagination page (default 1) |
| `limit` | number | Results per page (default 50, max 100) |

---

## Project Structure

```
carddb/
├── README.md              ← you are here
├── package.json
├── tsconfig.json
├── db/
│   ├── schema.sql         ← table definitions
│   ├── seed.sql           ← initial region data
│   └── beltway-cards.db   ← SQLite database file (gitignored)
├── scripts/
│   ├── generate-cards.ts  ← template-based card generator
│   ├── curate-cards.ts    ← dedup + quality filter
│   └── seed-db.ts         ← load JSON into SQLite
├── src/
│   ├── index.ts           ← API entry point
│   ├── routes/
│   │   ├── cards.ts
│   │   ├── regions.ts
│   │   ├── stats.ts
│   │   └── loadouts.ts
│   ├── db.ts              ← database connection + helpers
│   ├── types.ts           ← shared TypeScript types
│   └── search.ts          ← FTS5 search logic
├── client/                ← frontend (Vite + React)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── CardListPage.tsx
│   │   │   ├── CardDetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   └── LoadoutBuilderPage.tsx
│   │   ├── components/
│   │   │   ├── CardGrid.tsx
│   │   │   ├── CardTable.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── StatRadar.tsx
│   │   │   └── CardPreview.tsx
│   │   └── hooks/
│   │       ├── useCards.ts
│   │       └── useFilters.ts
│   └── index.html
├── data/
│   ├── cards-raw.json     ← generated candidates
│   └── cards-final.json   ← curated 700
└── .gitignore
```

---

## Getting Started

```bash
# 1. Initialize the project
cd carddb
npm init -y
npm install better-sqlite3 hono @hono/node-server
npm install -D typescript tsx @types/better-sqlite3

# 2. Create the database
npx tsx scripts/seed-db.ts

# 3. Start the API server
npx tsx src/index.ts
# → http://localhost:3001

# 4. Start the frontend (in a second terminal)
cd client
npm install
npm run dev
# → http://localhost:5173
```

---

## Key Differences from FUTBin

| FUTBin | Beltway Realms Card DB |
|---|---|
| Millions of cards, EA-sourced data | 700 hand-crafted + generated cards |
| Real-money marketplace + price tracking | No marketplace — focus on usage stats and win-rates |
| Squad chemistry system | **Synergy system** — cards from the same region or with matching tags boost each other |
| SBC solutions | **Loadout builder** — optimize a 3-5 card hand for a specific encounter |
| Seasonal content (TOTW, TOTY) | **Expansion drops** — new cards per region release |
| Player position constraints | **Card type slots** — max 1 dialogue, max 3 skills, etc. |

---

## Card Synergy System (Unique to Beltway Realms)

FUTBin has chemistry. We have **synergy**. When cards share traits, they boost each other:

| Synergy Rule | Bonus |
|---|---|
| 2+ cards from the same region | +1 to all modifiers |
| 3+ cards sharing a tag | +1 to all modifiers |
| Full hand of matching rarity | +2 to all modifiers |
| Artifact + matching Skill | Artifact effect triggers twice |
| Event + matching Quest | Event triggers automatically |

This gives the loadout builder real depth — it's not just "pick the highest numbers."
