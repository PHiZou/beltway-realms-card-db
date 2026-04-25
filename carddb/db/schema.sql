-- Beltway Realms Card Database Schema

CREATE TABLE IF NOT EXISTS regions (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  theme    TEXT,
  color    TEXT
);

CREATE TABLE IF NOT EXISTS cards (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('quest','dialogue','skill','insight','event','artifact')),
  rarity          TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  region_id       TEXT REFERENCES regions(id),
  modifier        INTEGER DEFAULT 0,
  -- Six BG3-style ability scores (1-20). Primary ability is the card's "casting stat".
  clout           INTEGER DEFAULT 10 CHECK (clout BETWEEN 1 AND 20),
  hustle          INTEGER DEFAULT 10 CHECK (hustle BETWEEN 1 AND 20),
  standing        INTEGER DEFAULT 10 CHECK (standing BETWEEN 1 AND 20),
  cunning         INTEGER DEFAULT 10 CHECK (cunning BETWEEN 1 AND 20),
  insight         INTEGER DEFAULT 10 CHECK (insight BETWEEN 1 AND 20),
  influence       INTEGER DEFAULT 10 CHECK (influence BETWEEN 1 AND 20),
  primary_ability TEXT CHECK (primary_ability IN ('clout','hustle','standing','cunning','insight','influence')),
  action_type     TEXT CHECK (action_type IN ('action','bonus','reaction','passive')),
  recharge        TEXT CHECK (recharge IN ('at-will','short-rest','long-rest','one-shot')),
  flavor          TEXT,
  description     TEXT NOT NULL,
  unlock_method   TEXT,
  image_url       TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_tags (
  card_id TEXT NOT NULL REFERENCES cards(id),
  tag     TEXT NOT NULL,
  PRIMARY KEY (card_id, tag)
);

CREATE TABLE IF NOT EXISTS card_variants (
  id             TEXT PRIMARY KEY,
  base_card_id   TEXT NOT NULL REFERENCES cards(id),
  variant_name   TEXT NOT NULL,
  modifier_delta INTEGER DEFAULT 0,
  special_effect TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id    TEXT NOT NULL REFERENCES cards(id),
  user_id    TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id, user_id)
);

CREATE TABLE IF NOT EXISTS card_usage_stats (
  card_id         TEXT PRIMARY KEY REFERENCES cards(id),
  times_played    INTEGER DEFAULT 0,
  times_won       INTEGER DEFAULT 0,
  avg_roll_with   REAL,
  popular_rank    INTEGER
);

CREATE TABLE IF NOT EXISTS loadouts (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  card_ids    TEXT NOT NULL,  -- JSON array of card IDs
  total_modifier INTEGER DEFAULT 0,
  synergy_bonus  INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
  name,
  description,
  flavor,
  tags,
  content='',
  tokenize='porter unicode61'
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_region ON cards(region_id);
CREATE INDEX IF NOT EXISTS idx_cards_modifier ON cards(modifier);
CREATE INDEX IF NOT EXISTS idx_card_tags_tag ON card_tags(tag);
