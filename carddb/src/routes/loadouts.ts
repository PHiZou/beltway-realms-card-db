import { Hono } from 'hono';
import { getDb } from '../db.js';
import type { Card } from '../types.js';

const loadouts = new Hono();

function computeSynergyBonus(cards: Card[]): { bonus: number; rules: string[] } {
  let bonus = 0;
  const rules: string[] = [];

  // 2+ cards from the same region → +1
  const regionCounts: Record<string, number> = {};
  for (const card of cards) {
    if (card.region_id) {
      regionCounts[card.region_id] = (regionCounts[card.region_id] || 0) + 1;
    }
  }
  for (const [region, count] of Object.entries(regionCounts)) {
    if (count >= 2) {
      bonus += 1;
      rules.push(`Region synergy: ${count} cards from ${region} (+1)`);
    }
  }

  // 3+ cards sharing a tag → +1
  const tagCounts: Record<string, number> = {};
  for (const card of cards) {
    for (const tag of (card.tags || [])) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count >= 3) {
      bonus += 1;
      rules.push(`Tag synergy: ${count} cards with "${tag}" (+1)`);
    }
  }

  // Full hand of matching rarity → +2
  if (cards.length >= 3) {
    const firstRarity = cards[0].rarity;
    if (cards.every(c => c.rarity === firstRarity)) {
      bonus += 2;
      rules.push(`Rarity synergy: all ${firstRarity} (+2)`);
    }
  }

  // Artifact + matching Skill (same region) → artifact triggers twice
  const artifacts = cards.filter(c => c.type === 'artifact');
  const skills = cards.filter(c => c.type === 'skill');
  for (const artifact of artifacts) {
    if (skills.some(s => s.region_id === artifact.region_id)) {
      rules.push(`Combo: ${artifact.name} triggers twice (matching skill in same region)`);
    }
  }

  // Event + matching Quest (same region) → event auto-triggers
  const events = cards.filter(c => c.type === 'event');
  const quests = cards.filter(c => c.type === 'quest');
  for (const event of events) {
    if (quests.some(q => q.region_id === event.region_id)) {
      rules.push(`Combo: ${event.name} auto-triggers (matching quest in same region)`);
    }
  }

  return { bonus, rules };
}

// POST /api/loadouts — save a loadout
loadouts.post('/', async (c) => {
  const db = getDb();
  const body = await c.req.json<{ name: string; description?: string; card_ids: string[] }>();

  if (!body.name || !body.card_ids || body.card_ids.length < 1 || body.card_ids.length > 5) {
    return c.json({ error: 'Provide a name and 1-5 card_ids' }, 400);
  }

  const placeholders = body.card_ids.map(() => '?').join(',');
  const cards = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE c.id IN (${placeholders})
    GROUP BY c.id
  `).all(...body.card_ids) as (Card & { tag_list: string | null })[];

  const cardsWithTags = cards.map(card => ({
    ...card,
    tags: card.tag_list ? card.tag_list.split(',') : [],
  }));

  const totalModifier = cardsWithTags.reduce((sum, card) => sum + card.modifier, 0);
  const { bonus, rules } = computeSynergyBonus(cardsWithTags);
  const id = `loadout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  db.prepare(`
    INSERT INTO loadouts (id, name, description, card_ids, total_modifier, synergy_bonus)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, body.name, body.description || null, JSON.stringify(body.card_ids), totalModifier, bonus);

  return c.json({ id, name: body.name, card_ids: body.card_ids, cards: cardsWithTags, total_modifier: totalModifier, synergy_bonus: bonus, synergy_rules: rules }, 201);
});

// GET /api/loadouts/:id
loadouts.get('/:id', (c) => {
  const db = getDb();
  const id = c.req.param('id');

  const loadout = db.prepare('SELECT * FROM loadouts WHERE id = ?').get(id) as any;
  if (!loadout) {
    return c.json({ error: 'Loadout not found' }, 404);
  }

  const cardIds = JSON.parse(loadout.card_ids) as string[];
  const placeholders = cardIds.map(() => '?').join(',');
  const cards = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE c.id IN (${placeholders})
    GROUP BY c.id
  `).all(...cardIds) as (Card & { tag_list: string | null })[];

  const cardsWithTags = cards.map(card => ({
    ...card,
    tags: card.tag_list ? card.tag_list.split(',') : [],
    tag_list: undefined,
  }));

  const { bonus, rules } = computeSynergyBonus(cardsWithTags as unknown as Card[]);

  return c.json({
    ...loadout,
    card_ids: cardIds,
    cards: cardsWithTags,
    synergy_rules: rules,
  });
});

export default loadouts;
