import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface RawCard {
  id: string;
  name: string;
  type: string;
  rarity: string;
  region_id: string;
  modifier: number;
  versatility: number;
  synergy: number;
  reliability: number;
  ceiling: number;
  flavor: string;
  description: string;
  unlock_method: string | null;
  tags: string[];
}

const inputPath = join(__dirname, '..', 'data', 'cards-raw.json');
const outputPath = join(__dirname, '..', 'data', 'cards-final.json');

const raw: RawCard[] = JSON.parse(readFileSync(inputPath, 'utf-8'));
console.log(`Loaded ${raw.length} raw cards`);

// ── Deduplication ───────────────────────────────────────────────────────────
const seenNames = new Map<string, number>();
const deduped: RawCard[] = [];

for (const card of raw) {
  const normalizedName = card.name.toLowerCase().trim();
  const count = seenNames.get(normalizedName) || 0;
  if (count === 0) {
    deduped.push(card);
    seenNames.set(normalizedName, 1);
  } else if (count === 1) {
    // Keep the second one with a suffix
    card.name = `${card.name} (Variant)`;
    card.id = `${card.id}-v2`;
    deduped.push(card);
    seenNames.set(normalizedName, 2);
  }
  // Skip triples+
}

console.log(`After dedup: ${deduped.length} cards`);

// ── Quality filters ─────────────────────────────────────────────────────────
const filtered = deduped.filter(card => {
  if (card.name.length < 3) return false;
  if (card.name.length > 60) return false;
  if (card.description.length < 10) return false;
  return true;
});

console.log(`After quality filter: ${filtered.length} cards`);

// ── Trim to exactly 700 if over ─────────────────────────────────────────────
// Prioritize: keep all legendaries/epics, then distribute evenly
const target = 700;
let result: RawCard[];

if (filtered.length <= target) {
  result = filtered;
  console.log(`Under target (${filtered.length}/${target}), keeping all`);
} else {
  const legendaries = filtered.filter(c => c.rarity === 'legendary');
  const epics = filtered.filter(c => c.rarity === 'epic');
  const rest = filtered.filter(c => c.rarity !== 'legendary' && c.rarity !== 'epic');
  
  const remaining = target - legendaries.length - epics.length;
  result = [...legendaries, ...epics, ...rest.slice(0, remaining)];
  console.log(`Trimmed to ${result.length} cards (kept ${legendaries.length} legendaries, ${epics.length} epics)`);
}

// ── Re-index for clean IDs ──────────────────────────────────────────────────
const usedIds = new Set<string>();
for (const card of result) {
  if (usedIds.has(card.id)) {
    card.id = `${card.id}-${Math.random().toString(36).slice(2, 6)}`;
  }
  usedIds.add(card.id);
}

// ── Write output ────────────────────────────────────────────────────────────
writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`\nCurated ${result.length} cards → ${outputPath}`);

// Distribution report
const report: Record<string, Record<string, number>> = {};
for (const card of result) {
  if (!report[card.region_id]) report[card.region_id] = {};
  report[card.region_id][card.type] = (report[card.region_id][card.type] || 0) + 1;
}
console.log('\nDistribution:');
for (const [region, types] of Object.entries(report)) {
  const total = Object.values(types).reduce((a, b) => a + b, 0);
  console.log(`  ${region}: ${total} cards`, types);
}
