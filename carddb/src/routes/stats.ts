import { Hono } from 'hono';
import { getDb } from '../db.js';

const stats = new Hono();

// Most-played cards
stats.get('/popular', (c) => {
  const db = getDb();
  const limit = Math.min(50, parseInt(c.req.query('limit') || '20'));

  const rows = db.prepare(`
    SELECT c.*, s.times_played, s.times_won, s.avg_roll_with, s.popular_rank,
           GROUP_CONCAT(ct.tag) as tag_list
    FROM card_usage_stats s
    JOIN cards c ON c.id = s.card_id
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    GROUP BY c.id
    ORDER BY s.times_played DESC
    LIMIT ?
  `).all(limit);

  return c.json(rows.map((row: any) => ({
    ...row,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    tag_list: undefined,
  })));
});

// Highest win-rate cards (min 50 games played)
stats.get('/winrate', (c) => {
  const db = getDb();
  const limit = Math.min(50, parseInt(c.req.query('limit') || '20'));

  const rows = db.prepare(`
    SELECT c.*, s.times_played, s.times_won, s.avg_roll_with, s.popular_rank,
           ROUND(CAST(s.times_won AS REAL) / s.times_played * 100, 1) as win_rate,
           GROUP_CONCAT(ct.tag) as tag_list
    FROM card_usage_stats s
    JOIN cards c ON c.id = s.card_id
    LEFT JOIN card_tags ct ON ct.card_id = c.id
    WHERE s.times_played >= 50
    GROUP BY c.id
    ORDER BY win_rate DESC
    LIMIT ?
  `).all(limit);

  return c.json(rows.map((row: any) => ({
    ...row,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    tag_list: undefined,
  })));
});

export default stats;
