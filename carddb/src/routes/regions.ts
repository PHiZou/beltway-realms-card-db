import { Hono } from 'hono';
import { getDb } from '../db.js';

const regions = new Hono();

regions.get('/', (c) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, COUNT(c.id) as card_count
    FROM regions r
    LEFT JOIN cards c ON c.region_id = r.id
    GROUP BY r.id
    ORDER BY r.name
  `).all();
  return c.json(rows);
});

regions.get('/:id', (c) => {
  const db = getDb();
  const id = c.req.param('id');

  const region = db.prepare('SELECT * FROM regions WHERE id = ?').get(id);
  if (!region) {
    return c.json({ error: 'Region not found' }, 404);
  }

  const typeBreakdown = db.prepare(`
    SELECT type, COUNT(*) as count FROM cards WHERE region_id = ? GROUP BY type
  `).all(id);

  const rarityBreakdown = db.prepare(`
    SELECT rarity, COUNT(*) as count FROM cards WHERE region_id = ? GROUP BY rarity
  `).all(id);

  return c.json({ ...region, types: typeBreakdown, rarities: rarityBreakdown });
});

export default regions;
