// Derive BG3-style stats for every card from its description, tags, and type.
// - 6 ability scores (1-20): clout, hustle, standing, cunning, insight, influence
// - primary_ability: the card's "casting stat"
// - action_type: action | bonus | reaction | passive
// - recharge: at-will | short-rest | long-rest | one-shot
//
// Old fields (versatility, synergy, reliability, ceiling) are dropped from the JSON.
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsPath = join(__dirname, '..', 'data', 'cards-final.json');

type Ability = 'clout' | 'hustle' | 'standing' | 'cunning' | 'insight' | 'influence';
type ActionType = 'action' | 'bonus' | 'reaction' | 'passive';
type Recharge = 'at-will' | 'short-rest' | 'long-rest' | 'one-shot';

interface OldCard {
  id: string;
  name: string;
  type: string;
  rarity: string;
  region_id: string;
  modifier: number;
  versatility?: number;
  synergy?: number;
  reliability?: number;
  ceiling?: number;
  description: string;
  flavor: string;
  tags: string[];
  unlock_method: string | null;
  [k: string]: unknown;
}

interface NewCard extends Omit<OldCard, 'versatility' | 'synergy' | 'reliability' | 'ceiling'> {
  clout: number;
  hustle: number;
  standing: number;
  cunning: number;
  insight: number;
  influence: number;
  primary_ability: Ability;
  action_type: ActionType;
  recharge: Recharge;
}

// Tag → ability affinity. A card's primary is whichever ability has the highest score.
const TAG_AFFINITY: Record<string, Partial<Record<Ability, number>>> = {
  // Arlington / clearance / defense
  clearance:        { clout: 3, standing: 2 },
  defense:          { clout: 3, standing: 2 },
  bureaucracy:      { clout: 2, standing: 2, cunning: 1 },
  surveillance:     { insight: 3, cunning: 2 },
  diplomatic:       { influence: 2, standing: 1 },
  // Tysons / corporate / networking
  corporate:        { influence: 2, standing: 2, clout: 1 },
  lobbying:         { influence: 3, clout: 1 },
  networking:       { influence: 3 },
  luxury:           { standing: 3, influence: 1 },
  // Reston / Ashburn / engineering
  debugging:        { cunning: 3 },
  deployment:       { hustle: 2, cunning: 1 },
  infrastructure:   { standing: 2, cunning: 1 },
  uptime:           { standing: 3 },
  cloud:            { cunning: 2, standing: 1 },
  outage:           { hustle: 2, cunning: 1 },
  contractor:       { cunning: 1, hustle: 1 },
  // Citadel / political / press
  political:        { influence: 2, clout: 2 },
  press:            { influence: 3, insight: 1 },
  ceremonial:       { standing: 2, influence: 1 },
  historical:       { standing: 2 },
  legal:            { cunning: 2, standing: 1 },
  // Neutral / transit
  transit:          { hustle: 3 },
  social:           { influence: 2, insight: 1 },
  civic:            { standing: 1, influence: 1 },
  // Mechanic tags
  reactive:         { hustle: 1, insight: 1 },
  reveal:           { insight: 2 },
  peek:             { insight: 3 },
  redirect:         { influence: 1, hustle: 1 },
  reroll:           { hustle: 1, cunning: 1 },
  draw:             { cunning: 1, insight: 1 },
  discard:          { clout: 1 },
  consumable:       { hustle: 1 },
  persistent:       { standing: 3 },
  passive:          { standing: 2 },
  'one-shot':       { hustle: 1 },
  gambit:           { hustle: 1, cunning: 1 },
  'multi-step':     { standing: 2, cunning: 1 },
  area:             { clout: 1, standing: 1 },
  team:             { influence: 2 },
};

// Type → small affinity nudges.
const TYPE_AFFINITY: Record<string, Partial<Record<Ability, number>>> = {
  dialogue: { influence: 2 },
  skill:    { cunning: 1, standing: 1 },
  quest:    { clout: 1, standing: 1 },
  insight:  { insight: 3 },
  event:    { hustle: 1, clout: 1 },
  artifact: { standing: 3 },
};

// Rarity controls the overall power level of the primary stat.
// Primary = base + 2; secondary stats hover near base with deterministic noise.
const RARITY_BASE: Record<string, number> = {
  common:    11,
  uncommon:  12,
  rare:      14,
  epic:      16,
  legendary: 18,
};

function hashBytes(id: string): Buffer {
  return createHash('sha1').update(id).digest();
}

function clamp(n: number, lo = 3, hi = 20): number {
  return Math.max(lo, Math.min(hi, n));
}

function pickPrimary(card: OldCard): Ability {
  const scores: Record<Ability, number> = {
    clout: 0, hustle: 0, standing: 0, cunning: 0, insight: 0, influence: 0,
  };

  // Tag-based weight.
  for (const tag of card.tags ?? []) {
    const aff = TAG_AFFINITY[tag];
    if (!aff) continue;
    for (const [k, v] of Object.entries(aff)) {
      scores[k as Ability] += v ?? 0;
    }
  }
  // Type nudges.
  for (const [k, v] of Object.entries(TYPE_AFFINITY[card.type] ?? {})) {
    scores[k as Ability] += v ?? 0;
  }

  // Description keyword nudges (kept light — tags do most of the work).
  const text = card.description.toLowerCase();
  if (/passive|always-on|persistent/.test(text)) scores.standing += 1;
  if (/peek|reveal|scout|see an opponent/.test(text)) scores.insight += 1;
  if (/once per game|one-time|consume/.test(text)) scores.hustle += 1;
  if (/cite|read the room|backchannel/.test(text)) scores.influence += 1;
  if (/debug|trace|forensics|audit|postmortem/.test(text)) scores.cunning += 1;
  if (/cleared|clearance|polygraph|scif/.test(text)) scores.clout += 1;

  // Pick highest, break ties deterministically by id.
  let best: Ability = 'standing';
  let bestScore = -Infinity;
  const order: Ability[] = ['clout', 'hustle', 'standing', 'cunning', 'insight', 'influence'];
  const tiebreak = hashBytes(card.id)[0];
  for (let i = 0; i < order.length; i++) {
    const a = order[(i + tiebreak) % order.length];
    if (scores[a] > bestScore) {
      best = a;
      bestScore = scores[a];
    }
  }
  return best;
}

function deriveScores(card: OldCard, primary: Ability): Record<Ability, number> {
  const base = RARITY_BASE[card.rarity] ?? 11;
  const h = hashBytes(card.id);

  const primaryScore = clamp(base + 2 + ((h[1] % 3) - 1)); // base+1..base+3
  const out: Record<Ability, number> = {
    clout: base, hustle: base, standing: base, cunning: base, insight: base, influence: base,
  };
  out[primary] = primaryScore;

  // Secondary stats: nudge by tag affinities and add deterministic noise.
  const order: Ability[] = ['clout', 'hustle', 'standing', 'cunning', 'insight', 'influence'];
  for (let i = 0; i < order.length; i++) {
    const a = order[i];
    if (a === primary) continue;
    let nudge = 0;
    for (const tag of card.tags ?? []) {
      const aff = TAG_AFFINITY[tag];
      if (aff && aff[a]) nudge += Math.min(2, aff[a] ?? 0);
    }
    const noise = (h[2 + i] % 5) - 2; // -2..+2
    out[a] = clamp(base + nudge + noise - 2, 6, base + 1);
  }
  return out;
}

function deriveActionType(card: OldCard): ActionType {
  const text = card.description.toLowerCase();
  if (/passive|always-on|persistent place-anchor|persistent\.|persistent skill|in or adjacent to/i.test(text)) return 'passive';
  if (/^reactive\.|after a setback|when (?:[a-z ]+) commits|when (?:[a-z ]+) appears|after any reveal|after the encounter/i.test(text)) return 'reaction';
  if (/once per game|once per encounter|one-time|consume mid-roll|one-time use/i.test(text)) return 'bonus';
  return 'action';
}

function deriveRecharge(card: OldCard): Recharge {
  const text = card.description.toLowerCase();
  if (/once per game|one-time|consumed either way|card consumed|card and badge both leave|exhaust(s|\b)|consume to|consume mid-roll|one-time use|one-time line|one-time recon|burn (?:this|for|during|mid-roll)/.test(text)) return 'one-shot';
  if (/once per encounter/.test(text)) return 'short-rest';
  if (/multi-step|three rounds|three tightening|chain of three|three encounters|two-path encounter/.test(text)) return 'long-rest';
  return 'at-will';
}

const cards: OldCard[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));
const out: NewCard[] = [];

for (const card of cards) {
  const { versatility, synergy, reliability, ceiling, ...rest } = card;
  const primary = pickPrimary(card);
  const scores = deriveScores(card, primary);
  const action_type = deriveActionType(card);
  const recharge = deriveRecharge(card);
  out.push({
    ...rest,
    ...scores,
    primary_ability: primary,
    action_type,
    recharge,
  } as NewCard);
}

writeFileSync(cardsPath, JSON.stringify(out, null, 2) + '\n', 'utf-8');

// Summary
const primaryCounts: Record<string, number> = {};
const actionCounts: Record<string, number> = {};
const rechargeCounts: Record<string, number> = {};
for (const c of out) {
  primaryCounts[c.primary_ability] = (primaryCounts[c.primary_ability] ?? 0) + 1;
  actionCounts[c.action_type] = (actionCounts[c.action_type] ?? 0) + 1;
  rechargeCounts[c.recharge] = (rechargeCounts[c.recharge] ?? 0) + 1;
}
console.log(`Derived stats for ${out.length} cards.`);
console.log('Primary ability:', primaryCounts);
console.log('Action type:    ', actionCounts);
console.log('Recharge:       ', rechargeCounts);
