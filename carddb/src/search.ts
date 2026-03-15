import { getDb } from './db.js';

export interface SearchResult {
  id: string;
  rank: number;
}

export function searchCards(query: string, limit = 50): SearchResult[] {
  const db = getDb();

  // Sanitize the query for FTS5
  const sanitized = query
    .replace(/[^\w\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `"${term}"*`)
    .join(' OR ');

  if (!sanitized) return [];

  const stmt = db.prepare(`
    SELECT
      c.id,
      rank
    FROM cards_fts
    JOIN cards c ON c.rowid = cards_fts.rowid
    WHERE cards_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `);

  return stmt.all(sanitized, limit) as SearchResult[];
}

export function getAllTags(): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT tag FROM card_tags ORDER BY tag').all() as { tag: string }[];
  return rows.map(r => r.tag);
}
