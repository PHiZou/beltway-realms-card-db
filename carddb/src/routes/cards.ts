import { Hono } from 'hono';
import { getDb } from '../db.js';
import { searchCards } from '../search.js';
import type { Card, CardFilter, PaginatedResponse } from '../types.js';

const cards = new Hono();

// GET /api/cards — list, filter, search
cards.get('/', (c) => {
  const db = getDb();
  const query = c.req.query();

  const filter: CardFilter = {
    type: query.type as CardFilter['type'],
    rarity: query.rarity ? (query.rarity.split(',') as CardFilter['rarity']) : undefined,
    region: query.region,
    modifier_min: query.modifier_min ? parseInt(query.modifier_min) : undefined,
    modifier_max: query.modifier_max ? parseInt(query.modifier_max) : undefined,
    tags: query.tags ? query.tags.split(',') : undefined,
    q: query.q,
    sort: query.sort || 'name',
    order: (query.order as 'asc' | 'desc') || 'asc',
    page: Math.max(1, parseInt(query.page || '1')),
    limit: Math.min(100, Math.max(1, parseInt(query.limit || '50'))),
  };

  // If full-text search, get matching IDs first
  let searchIds: Set<string> | null = null;
  if (filter.q) {
    const results = searchCards(filter.q, 500);
    searchIds = new Set(results.map(r => r.id));
    if (searchIds.size === 0) {
      return c.json({ data: [], total: 0, page: filter.page!, limit: filter.limit!, totalPages: 0 });
    }
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.type) {
    conditions.push('c.type = ?');
    params.push(filter.type);
  }
  if (filter.rarity && filter.rarity.length > 0) {
    conditions.push(`c.rarity IN (${filter.rarity.map(() => '?').join(',')})`);
    params.push(...filter.rarity);
  }
  if (filter.region) {
    conditions.push('c.region_id = ?');
    params.push(filter.region);
  }
  if (filter.modifier_min !== undefined) {
    conditions.push('c.modifier >= ?');
    params.push(filter.modifier_min);
  }
  if (filter.modifier_max !== undefined) {
    conditions.push('c.modifier <= ?');
    params.push(filter.modifier_max);
  }
  if (filter.tags && filter.tags.length > 0) {
    for (const tag of filter.tags) {
      conditions.push('c.id IN (SELECT card_id FROM card_tags WHERE tag = ?)');
      params.push(tag);
    }
  }
  if (searchIds) {
    const placeholders = [...searchIds].map(() => '?').join(',');
    conditions.push(`c.id IN (${placeholders})`);
    params.push(...searchIds);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const validSorts = ['name', 'modifier', 'rarity', 'clout', 'hustle', 'standing', 'cunning', 'insight', 'influence', 'primary_ability', 'action_type', 'recharge', 'type', 'region_id'];
  const sortField = validSorts.includes(filter.sort || '') ? filter.sort : 'name';
  const sortOrder = filter.order === 'desc' ? 'DESC' : 'ASC';

  // Handle rarity sort (custom order)
  let orderClause: string;
  if (sortField === 'rarity') {
    orderClause = `ORDER BY CASE c.rarity 
      WHEN 'legendary' THEN 5 
      WHEN 'epic' THEN 4 
      WHEN 'rare' THEN 3 
      WHEN 'uncommon' THEN 2 
      WHEN 'common' THEN 1 END ${sortOrder}`;
  } else {
    orderClause = `ORDER BY c.${sortField} ${sortOrder}`;
  }

  // Count total
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM cards c ${whereClause}`).get(...params) as { total: number };
  const total = countRow.total;

  const limit = filter.limit!;
  const page = filter.page!;
  const offset = (page - 1) * limit;

  // Fetch cards with tags
  const rows = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    ${whereClause}
    GROUP BY c.id
    ${orderClause}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as (Card & { tag_list: string | null })[];

  const data = rows.map(row => ({
    ...row,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    tag_list: undefined,
  }));

  const response: PaginatedResponse<Card> = {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  return c.json(response);
});

// GET /api/cards/compare?ids=a,b,c — must be before /:id
cards.get('/compare', (c) => {
  const db = getDb();
  const ids = c.req.query('ids')?.split(',') || [];

  if (ids.length < 2 || ids.length > 4) {
    return c.json({ error: 'Provide 2-4 card IDs' }, 400);
  }

  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE c.id IN (${placeholders})
    GROUP BY c.id
  `).all(...ids) as (Card & { tag_list: string | null })[];

  return c.json(rows.map(row => ({
    ...row,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    tag_list: undefined,
  })));
});

// GET /api/cards/:id — single card detail
cards.get('/:id', (c) => {
  const db = getDb();
  const id = c.req.param('id');

  const card = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) as (Card & { tag_list: string | null }) | undefined;

  if (!card) {
    return c.json({ error: 'Card not found' }, 404);
  }

  const tags = card.tag_list ? card.tag_list.split(',') : [];
  const variants = db.prepare('SELECT * FROM card_variants WHERE base_card_id = ?').all(id);
  const usageStats = db.prepare('SELECT * FROM card_usage_stats WHERE card_id = ?').get(id);
  const ratings = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
    FROM card_ratings WHERE card_id = ?
  `).get(id) as { avg_rating: number | null; rating_count: number };

  return c.json({
    ...card,
    tags,
    tag_list: undefined,
    variants,
    usage_stats: usageStats,
    avg_rating: ratings.avg_rating,
    rating_count: ratings.rating_count,
  });
});

// GET /api/cards/:id/similar — similar cards
cards.get('/:id/similar', (c) => {
  const db = getDb();
  const id = c.req.param('id');
  const limit = Math.min(10, parseInt(c.req.query('limit') || '5'));

  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card | undefined;
  if (!card) {
    return c.json({ error: 'Card not found' }, 404);
  }

  // Find cards that share tags, same type/region, or similar modifier
  const similar = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ct.tag) as tag_list,
      (CASE WHEN c.type = ? THEN 2 ELSE 0 END) +
      (CASE WHEN c.region_id = ? THEN 2 ELSE 0 END) +
      (CASE WHEN c.rarity = ? THEN 1 ELSE 0 END) +
      (CASE WHEN ABS(c.modifier - ?) <= 1 THEN 1 ELSE 0 END) +
      (SELECT COUNT(*) FROM card_tags ct2 
        WHERE ct2.card_id = c.id 
        AND ct2.tag IN (SELECT tag FROM card_tags WHERE card_id = ?)) as score
    FROM cards c
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE c.id != ?
    GROUP BY c.id
    ORDER BY score DESC
    LIMIT ?
  `).all(card.type, card.region_id, card.rarity, card.modifier, id, id, limit) as (Card & { tag_list: string | null; score: number })[];

  return c.json(similar.map(row => ({
    ...row,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    tag_list: undefined,
  })));
});

export default cards;
