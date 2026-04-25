import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbPath = join(__dirname, '..', 'db', 'beltway-cards.db');
const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
const seedPath = join(__dirname, '..', 'db', 'seed.sql');
const cardsPath = join(__dirname, '..', 'data', 'cards-final.json');

interface CardData {
  id: string;
  name: string;
  type: string;
  rarity: string;
  region_id: string;
  modifier: number;
  clout: number;
  hustle: number;
  standing: number;
  cunning: number;
  insight: number;
  influence: number;
  primary_ability: string;
  action_type: string;
  recharge: string;
  flavor: string;
  description: string;
  unlock_method: string | null;
  tags: string[];
}

console.log('Initializing database...');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Drop and recreate cards-related tables so schema changes always take.
db.pragma('foreign_keys = OFF');
db.exec(`
  DROP TABLE IF EXISTS card_tags;
  DROP TABLE IF EXISTS card_variants;
  DROP TABLE IF EXISTS card_ratings;
  DROP TABLE IF EXISTS card_usage_stats;
  DROP TABLE IF EXISTS cards_fts;
  DROP TABLE IF EXISTS cards;
`);
db.pragma('foreign_keys = ON');

// Run schema
console.log('Creating schema...');
db.exec(readFileSync(schemaPath, 'utf-8'));

// Seed regions
console.log('Seeding regions...');
db.exec(readFileSync(seedPath, 'utf-8'));

// Load cards
console.log('Loading cards...');
const cards: CardData[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

const insertCard = db.prepare(`
  INSERT OR REPLACE INTO cards (
    id, name, type, rarity, region_id, modifier,
    clout, hustle, standing, cunning, insight, influence,
    primary_ability, action_type, recharge,
    flavor, description, unlock_method
  ) VALUES (
    @id, @name, @type, @rarity, @region_id, @modifier,
    @clout, @hustle, @standing, @cunning, @insight, @influence,
    @primary_ability, @action_type, @recharge,
    @flavor, @description, @unlock_method
  )
`);

const insertTag = db.prepare(`
  INSERT OR REPLACE INTO card_tags (card_id, tag) VALUES (@card_id, @tag)
`);

const insertFts = db.prepare(`
  INSERT INTO cards_fts (rowid, name, description, flavor, tags) VALUES (@rowid, @name, @description, @flavor, @tags)
`);

const insertUsageStats = db.prepare(`
  INSERT OR REPLACE INTO card_usage_stats (card_id, times_played, times_won, avg_roll_with, popular_rank)
  VALUES (@card_id, @times_played, @times_won, @avg_roll_with, @popular_rank)
`);

const seedCards = db.transaction((cards: CardData[]) => {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    insertCard.run({
      id: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      region_id: card.region_id,
      modifier: card.modifier,
      clout: card.clout,
      hustle: card.hustle,
      standing: card.standing,
      cunning: card.cunning,
      insight: card.insight,
      influence: card.influence,
      primary_ability: card.primary_ability,
      action_type: card.action_type,
      recharge: card.recharge,
      flavor: card.flavor,
      description: card.description,
      unlock_method: card.unlock_method,
    });

    for (const tag of card.tags) {
      insertTag.run({ card_id: card.id, tag });
    }

    insertFts.run({
      rowid: i + 1,
      name: card.name,
      description: card.description,
      flavor: card.flavor || '',
      tags: card.tags.join(' '),
    });

    // Seed synthetic usage stats
    const timesPlayed = Math.floor(Math.random() * 1000) + 10;
    const winRate = 0.3 + Math.random() * 0.4;
    insertUsageStats.run({
      card_id: card.id,
      times_played: timesPlayed,
      times_won: Math.floor(timesPlayed * winRate),
      avg_roll_with: +(8 + Math.random() * 7).toFixed(1),
      popular_rank: i + 1,
    });
  }
});

seedCards(cards);

// Recompute popular_rank based on times_played
db.exec(`
  WITH ranked AS (
    SELECT card_id, ROW_NUMBER() OVER (ORDER BY times_played DESC) as rank
    FROM card_usage_stats
  )
  UPDATE card_usage_stats SET popular_rank = (
    SELECT rank FROM ranked WHERE ranked.card_id = card_usage_stats.card_id
  )
`);

console.log(`\nSeeded ${cards.length} cards into ${dbPath}`);

// Verification
const count = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
const tagCount = db.prepare('SELECT COUNT(*) as count FROM card_tags').get() as { count: number };
const regionCount = db.prepare('SELECT COUNT(*) as count FROM regions').get() as { count: number };

console.log(`  Cards: ${count.count}`);
console.log(`  Tags: ${tagCount.count}`);
console.log(`  Regions: ${regionCount.count}`);

db.close();
console.log('Done!');
