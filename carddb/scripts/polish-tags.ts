// Tag refactor: drop type-echo and over-generic tags, ensure every card has
// region-flavor + mechanic tags so filtering becomes interesting.
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsPath = join(__dirname, '..', 'data', 'cards-final.json');

interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  region_id: string;
  modifier: number;
  description: string;
  flavor: string;
  tags: string[];
  [k: string]: unknown;
}

// Tags to remove entirely.
const DROP = new Set([
  // type-echo (already in `type` column)
  'dialogue', 'skill', 'quest', 'insight', 'event', 'artifact',
  // meta-redundant / non-discriminating
  'versatile', 'universal', 'mixed', 'everyday', 'focus', 'xp',
  'location', 'location-boost', 'physical',
]);

// Region-default flavor tags. We only add the first that's missing so we
// don't bloat. Order matters — preferred default first.
const REGION_DEFAULTS: Record<string, string[]> = {
  arlington: ['clearance', 'bureaucracy', 'defense'],
  tysons: ['lobbying', 'luxury', 'networking'],
  reston: ['contractor', 'debugging', 'deployment'],
  ashburn: ['infrastructure', 'uptime', 'cloud'],
  citadel: ['political', 'press', 'ceremonial'],
  neutral: ['transit', 'social', 'civic'],
};

// Map description keywords → tags to enrich mechanic vocabulary.
const KEYWORD_TAGS: { match: RegExp; tag: string }[] = [
  { match: /\breroll\b/i, tag: 'reroll' },
  { match: /\breveal\b/i, tag: 'reveal' },
  { match: /\bredirect\b/i, tag: 'redirect' },
  { match: /\bpeek\b/i, tag: 'peek' },
  { match: /\bdraw\b/i, tag: 'draw' },
  { match: /\bdiscard\b/i, tag: 'discard' },
  { match: /\bconsume(able)?\b/i, tag: 'consumable' },
  { match: /\bpersistent\b/i, tag: 'persistent' },
  { match: /\bpassive\b/i, tag: 'passive' },
  { match: /\bonce per (game|encounter)\b/i, tag: 'one-shot' },
  { match: /\boutage\b/i, tag: 'outage' },
  { match: /\bdeploy\b/i, tag: 'deployment' },
  { match: /\bbrunch|gala|merger|dividend|brokerage\b/i, tag: 'luxury' },
  { match: /\bsubpoena|amendment|whip|coalition|filibuster|press\b/i, tag: 'political' },
  { match: /\bSCIF|clearance|polygraph|TS\/SCI|FISA\b/, tag: 'clearance' },
  { match: /\btraffic|metro|interchange|commute|beltway|detour|i-66|i-95\b/i, tag: 'transit' },
  { match: /\bdata center|fiber|cooling|generator|UPS|battery\b/i, tag: 'infrastructure' },
];

// Tag aliases — normalize equivalents to a single canonical form.
const ALIAS: Record<string, string> = {
  technical: 'debugging',
  code: 'debugging',
  process: 'bureaucracy',
  bureaucratic: 'bureaucracy',
  government: 'bureaucracy',
  speech: 'rhetoric',
  intel: 'surveillance',
  military: 'defense',
  financial: 'corporate',
  luxury: 'luxury',
  ceremonial: 'ceremonial',
  historical: 'historical',
  data: 'data',
  hardware: 'infrastructure',
};

function normalize(tag: string): string {
  return ALIAS[tag] ?? tag;
}

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

let totalBefore = 0;
let totalAfter = 0;
let bare = 0;

for (const card of cards) {
  totalBefore += card.tags.length;

  // 1) drop, normalize, dedupe.
  let next = new Set<string>();
  for (const raw of card.tags) {
    if (DROP.has(raw)) continue;
    next.add(normalize(raw));
  }

  // 2) keyword-derive new mechanic/flavor tags from text.
  const text = `${card.name} ${card.description} ${card.flavor}`;
  for (const { match, tag } of KEYWORD_TAGS) {
    if (match.test(text)) next.add(tag);
  }

  // 3) ensure card has at least one region-flavor tag.
  const defaults = REGION_DEFAULTS[card.region_id] ?? [];
  const hasFlavor = defaults.some((d) => next.has(d)) ||
                    [...next].some((t) => Object.values(REGION_DEFAULTS).flat().includes(t));
  if (!hasFlavor && defaults.length) {
    next.add(defaults[0]);
  }

  // 4) cards reduced to nothing — pad with region defaults.
  if (next.size === 0) {
    bare++;
    for (const d of defaults.slice(0, 2)) next.add(d);
  }

  card.tags = [...next].sort();
  totalAfter += card.tags.length;
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');

console.log(`Tags before: ${totalBefore}`);
console.log(`Tags after:  ${totalAfter}`);
console.log(`Cards padded with defaults: ${bare}`);
