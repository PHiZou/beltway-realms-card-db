// One-shot cleanup pass: fix the ~140 zero-modifier "+0" template cards,
// give them rarity-appropriate modifiers and region-flavored descriptions.
// Also applies a small set of hand-crafted rewrites for the worst-named cards.
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
  versatility: number;
  synergy: number;
  reliability: number;
  ceiling: number;
  flavor: string;
  description: string;
  unlock_method: string | null;
  tags: string[];
}

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

// Region-specific vocabulary used to flavor rewritten templates.
const region = {
  arlington: {
    rollNoun: 'compliance',
    targetNoun: 'audit',
    place: 'the Pentagon corridor',
    flair: 'a stamped memo',
    enemyExample: 'Whistleblower',
  },
  tysons: {
    rollNoun: 'networking',
    targetNoun: 'pitch deck',
    place: 'a Capital Grille booth',
    flair: 'a folded business card',
    enemyExample: 'SEC Investigation',
  },
  reston: {
    rollNoun: 'debugging',
    targetNoun: 'incident',
    place: 'the campus war room',
    flair: 'a stale build artifact',
    enemyExample: 'Memory Leak',
  },
  ashburn: {
    rollNoun: 'uptime',
    targetNoun: 'outage',
    place: 'a Loudoun data hall',
    flair: 'a cooling-loop diagram',
    enemyExample: 'Power Surge',
  },
  citadel: {
    rollNoun: 'press',
    targetNoun: 'leak',
    place: 'a marble hallway',
    flair: 'an off-the-record source',
    enemyExample: 'Subpoena',
  },
  neutral: {
    rollNoun: 'commute',
    targetNoun: 'detour',
    place: 'a Metro platform',
    flair: 'a SmarTrip card',
    enemyExample: 'Single-Tracking',
  },
} as const;

// Templates the generator clearly used. We rewrite each into something
// non-zero, varied, and slightly regional.
function rewriteDescription(card: Card): string {
  const r = region[card.region_id as keyof typeof region] ?? region.neutral;
  const d = card.description;

  // "A branching X quest. Choose wisely — wrong path costs 0 progress."
  if (/^A branching .+? quest\. Choose wisely/.test(d)) {
    return `Branching encounter. Pick a path: success grants +2 progress, failure burns a turn and reveals your hand.`;
  }
  // "Navigate a chain of X encounters. Grants +0 XP on completion."
  if (/^Navigate a chain of /.test(d)) {
    return `Chain of three ${r.rollNoun} encounters. Each cleared encounter grants +1 to your next ${r.rollNoun} roll.`;
  }
  // "A X quest requiring N successful rolls to complete."
  if (/^A .+? quest requiring \d+ successful rolls/.test(d)) {
    return `Multi-step quest in ${r.place}. Two clears in a row grants +2 modifier for the rest of the encounter.`;
  }
  // "Track down a X. +0 modifier to tracking rolls."
  if (/^Track down /.test(d)) {
    return `Track ${r.flair} across ${r.place}. +1 to each tracking roll; double on the final.`;
  }
  // "Face X head-on. Success grants +0 and unlocks a rare card."
  if (/^Face .+? head-on/.test(d)) {
    return `Confront a known ${r.targetNoun}. Success grants +2 and reveals one card from the encounter deck.`;
  }
  // "Infiltrate X. +0 to all rolls during this quest."
  if (/^Infiltrate /.test(d)) {
    return `Infiltrate ${r.place}. +1 to all rolls during this quest; doubled if you remain unrevealed.`;
  }
  // "Deliver a X speech. +0 if audience is impressed."
  if (/^Deliver a .+? speech/.test(d)) {
    return `Deliver the talking points. +1; +1 more if any opponent reveals a ${r.rollNoun}-tagged card.`;
  }
  // "One-time dialogue card. Adds +0 to your next X roll."
  if (/^One-time dialogue card\. Adds \+0/.test(d)) {
    return `One-time line. Adds +2 to your next ${r.rollNoun} roll.`;
  }
  // "Whisper the right words: +0 against X."
  if (/^Whisper the right words/.test(d)) {
    return `The right words at the right table: +2 against ${r.enemyExample}, +0 against everything else.`;
  }
  // "A well-timed remark gives +0 and forces X to reroll."
  if (/^A well-timed remark/.test(d)) {
    return `A well-timed remark gives +1 and forces ${r.enemyExample} to reroll its highest die.`;
  }
  // "Play after taking damage: reduce by 0 and redirect to X."
  if (/^Play after taking damage/.test(d)) {
    const m = d.match(/redirect to (.+?)\.$/);
    const target = m?.[1] ?? r.enemyExample;
    return `After a setback, redirect blame to ${target}: reduce loss by 1 and skip its next trigger.`;
  }
  // "Invoke the power of X: +0 to all party members this turn."
  if (/^Invoke the power of /.test(d)) {
    return `Invoke ${r.place}: +1 to all party members this turn, then exhaust this card.`;
  }
  // "Play before a roll: +0 to X encounters this turn."
  if (/^Play before a roll/.test(d)) {
    return `Play before a roll: +1 to ${r.rollNoun} encounters this turn.`;
  }
  // "Passive +0. Automatically detect X traps and ambushes."
  if (/^Passive \+0\. Automatically detect/.test(d)) {
    return `Passive: peek at the next encounter's tags before committing cards.`;
  }
  // "Passive +0 to X."
  if (/^Passive \+0 to /.test(d)) {
    return d.replace('+0', '+1');
  }
  // "+0 to X rolls. Stacks with region bonuses."
  if (/^\+0 to .+? rolls\. Stacks with region bonuses/.test(d)) {
    return d.replace('+0', '+1');
  }
  // "When you X, gain +0. Combo: +1 if another skill is active."
  if (/gain \+0\. Combo:/.test(d)) {
    return d.replace('gain +0', 'gain +1').replace('+1 if another skill', '+2 if another skill');
  }
  // "Consumable: instant +0 to your current roll."
  if (/^Consumable: instant \+0/.test(d)) {
    return `Consume for +2 to your current roll, or convert a failure into a reroll.`;
  }
  // "One-time use: gain +0 and reveal the next encounter's difficulty."
  if (/^One-time use: gain \+0 and reveal/.test(d)) {
    return `One-time use: peek at the next encounter's difficulty and gain +1 against it.`;
  }
  // "Consume to bypass a X check entirely. Worth +0 XP."
  if (/^Consume to bypass a /.test(d)) {
    return `Consume to bypass one ${r.rollNoun} check entirely. The skipped check counts as a clear.`;
  }
  // "Consume to reroll any die and add +0 to the new result."
  if (/^Consume to reroll any die/.test(d)) {
    return `Consume to reroll any die and take the better of the two results.`;
  }
  // "High-risk insight: +2 on success, -0 on failure."
  if (/^High-risk insight/.test(d)) {
    return `High-risk insight: +3 on success, -1 on failure. Consumed either way.`;
  }
  // "While in X, all modifiers doubled. Base +0."
  if (/^While in .+? all modifiers doubled\. Base \+0/.test(d)) {
    return d.replace('Base +0', 'Base +1');
  }
  // "Triggers when 2+ cards share a tag: +0 synergy bonus this encounter."
  if (/^Triggers when 2\+ cards share a tag/.test(d)) {
    return `Triggers when 2+ cards share a tag: +2 synergy across the chain.`;
  }
  // "Triggers after 3 consecutive wins: +0 to all stats..."
  if (/^Triggers after 3 consecutive wins/.test(d)) {
    return `Triggers after 3 consecutive wins: +2 to all stats next encounter, then exhaust.`;
  }
  // "Triggers on region entry: all X rolls get +0 for 3 turns."
  if (/^Triggers on region entry/.test(d)) {
    return d.replace('+0', '+1');
  }
  // "Persistent item: absorb 0 damage per encounter. Breaks after 5 uses."
  if (/^Persistent item: absorb 0/.test(d)) {
    return `Persistent: absorb 1 setback per encounter. Breaks after 5 uses.`;
  }
  // "Persistent: re-roll once per encounter. +0 to the re-rolled result."
  if (/^Persistent: re-roll once per encounter/.test(d)) {
    return `Persistent: re-roll once per encounter and take the better result.`;
  }
  // "Area event: all players in X get +0 defense for 2 turns."
  if (/^Area event: all players in /.test(d)) {
    return d.replace('+0', '+1');
  }
  // "When X appears, gain +0 and draw an extra card."
  if (/^When .+? appears, gain \+0/.test(d)) {
    return d.replace('gain +0', 'gain +1');
  }

  // Fallback: just delete any literal "+0" or " by 0 " noise.
  return d.replace(/\s*\+0\s*/g, ' ').replace(/ by 0 /g, ' by 1 ').replace(/\s+/g, ' ').trim();
}

// Set a sensible modifier when the card was 0. Commons get +1; if a card's
// rewritten description references a higher number, bump to match.
function newModifier(card: Card, rewritten: string): number {
  if (card.modifier !== 0) return card.modifier;
  const m = rewritten.match(/\+(\d+)/);
  if (m) return Math.min(parseInt(m[1]), 3);
  return 1;
}

// A handful of hand-crafted rewrites for the most generically-named cards.
// Keyed by id so we preserve URLs.
const handcrafted: Record<string, Partial<Card>> = {
  'card-quest-arlington-armored-mission': {
    name: 'Polygraph Marathon',
    flavor: 'Six hours, the same three questions, slightly rephrased.',
    description: 'Survive five contradicting rounds. Each clean answer grants +1; one slip and you forfeit a card from your hand.',
    modifier: 2,
    tags: ['arlington', 'clearance', 'quest', 'endurance'],
  },
  'card-quest-arlington-tactical-mission': {
    name: 'SCIF Lockdown Drill',
    flavor: 'Phones in the lockers. Watches in the lockers. Ideas, optional.',
    description: 'Resolve three encounters without revealing any card. Reward: +3 modifier and a sealed Insight.',
    modifier: 3,
    tags: ['arlington', 'clearance', 'quest', 'stealth'],
  },
  'card-skill-arlington-quick-intel': {
    name: 'Need-to-Know Reflex',
    flavor: 'You only knew enough to deny knowing.',
    description: 'Passive +1 to compliance rolls. When questioned, discard one card from your hand to ignore one reveal effect.',
    modifier: 1,
    tags: ['arlington', 'clearance', 'skill', 'reactive'],
  },
  'card-dialogue-arlington-let-me-be-clear': {
    name: '"Let me be clear,"',
    flavor: 'Six words that mean: I am about to not be.',
    description: 'One-time line. Negate a single reveal effect targeting you, then gain +2 to your next bureaucratic roll.',
    modifier: 2,
    tags: ['arlington', 'dialogue', 'misdirection'],
  },
  'card-quest-reston-the-pipeline-dilemma': {
    name: 'Friday Deploy Hubris',
    flavor: 'It worked in staging. Staging is also offline now.',
    description: 'Roll a die at end of turn: 1-3, lose 2 progress and trigger an outage; 4-6, gain +3 and unlock a rare card.',
    modifier: 0,
    tags: ['reston', 'deployment', 'quest', 'gamble'],
  },
  'card-quest-reston-the-cache-dilemma': {
    name: 'Stale Cache Postmortem',
    flavor: 'The bug was fixed in February. The cache thinks it is still January.',
    description: 'Reveal one resolved encounter from the discard pile and replay it for half rewards.',
    modifier: 1,
    tags: ['reston', 'debugging', 'quest', 'replay'],
  },
  'card-skill-reston-kernel-whisperer': {
    name: 'Stack Overflow Ritual',
    flavor: 'Paste the error. Wait. Pretend you read all six replies.',
    description: 'Reveal your hand to gain +3 to one debugging roll this turn.',
    modifier: 3,
    tags: ['reston', 'debugging', 'skill', 'reveal'],
  },
  'card-quest-tysons-the-valuation-conspiracy': {
    name: 'The Tysons Galleria Walk-Through',
    flavor: 'Lap one is recon. Lap two is the deal.',
    description: 'Each turn you remain in Tysons, gain +1 networking. After three turns, draw a Dialogue card.',
    modifier: 1,
    tags: ['tysons', 'networking', 'quest', 'tempo'],
  },
  'card-dialogue-tysons-divest-and-deflect': {
    name: 'Capital Grille Handshake',
    flavor: 'Nothing on the record. Everything on the tab.',
    description: 'After a setback, convert it into a tied roll once per game. Reveal one opponent card.',
    modifier: 2,
    tags: ['tysons', 'dialogue', 'reveal'],
  },
  'card-quest-citadel-the-tribunal-dilemma': {
    name: 'Continuing Resolution',
    flavor: 'Funded through Friday. Or maybe the Friday after that.',
    description: 'Freeze quest progress for two rounds. Each round, draw 1. You may end the freeze early.',
    modifier: 0,
    tags: ['citadel', 'political', 'quest', 'tempo'],
  },
  'card-dialogue-citadel-let-me-be-clear': {
    name: 'Off-the-Record Source',
    flavor: 'You did not get this from me. You got it from the room.',
    description: 'Reveal one card from each opponent\'s hand. You may copy a Dialogue effect from those revealed.',
    modifier: 2,
    tags: ['citadel', 'press', 'dialogue', 'reveal'],
  },
  'card-event-ashburn-hardened-storm': {
    name: 'Loudoun Power Surge',
    flavor: 'us-east-1 is having a moment. So is the rest of the country.',
    description: 'All Artifact cards are inert this round. You draw 2; the player with the most Artifacts loses one.',
    modifier: 0,
    tags: ['ashburn', 'cloud', 'event', 'disable'],
  },
  'card-skill-ashburn-classified-garrison': {
    name: 'Fiber Backbone',
    flavor: 'Forty-eight strands of glass. Twelve of them in use, in theory.',
    description: 'Passive +1 to all uptime rolls. Once per encounter, treat a synergy roll as if it shared one extra tag.',
    modifier: 1,
    tags: ['ashburn', 'infrastructure', 'skill', 'passive'],
  },
  'card-event-neutral-hardened-storm': {
    name: 'Metro Single-Tracking',
    flavor: 'Shuttle bus service is provided.',
    description: 'All players lose one action this round. The player with the fewest cards in hand draws 1.',
    modifier: 0,
    tags: ['neutral', 'transit', 'event', 'tempo'],
  },
  'card-insight-neutral-flash-of-warrant': {
    name: 'I-66 Reverse Commute',
    flavor: 'Everyone else is going the other way. That is the point.',
    description: 'Switch the region you are scoring against this turn. Costs 1 progress.',
    modifier: 0,
    tags: ['neutral', 'transit', 'insight', 'utility'],
  },
};

let rewrites = 0;
let handcraftedApplied = 0;
const beforeAfter: { id: string; before: { name: string; description: string; modifier: number }; after: { name: string; description: string; modifier: number } }[] = [];

for (const card of cards) {
  const before = { name: card.name, description: card.description, modifier: card.modifier };

  if (handcrafted[card.id]) {
    Object.assign(card, handcrafted[card.id]);
    handcraftedApplied++;
    beforeAfter.push({ id: card.id, before, after: { name: card.name, description: card.description, modifier: card.modifier } });
    continue;
  }

  if (card.modifier === 0 || /\+0|by 0 |costs 0 |get \+0/.test(card.description)) {
    const newDesc = rewriteDescription(card);
    const newMod = newModifier(card, newDesc);
    if (newDesc !== card.description || newMod !== card.modifier) {
      card.description = newDesc;
      card.modifier = newMod;
      rewrites++;
      if (beforeAfter.length < 30) {
        beforeAfter.push({ id: card.id, before, after: { name: card.name, description: card.description, modifier: card.modifier } });
      }
    }
  }
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');

console.log(`Rewrote ${rewrites} templated cards.`);
console.log(`Hand-crafted ${handcraftedApplied} marquee cards.`);
console.log(`\n--- Sample before/after (first 15) ---`);
for (const ba of beforeAfter.slice(0, 15)) {
  console.log(`\n[${ba.id}]`);
  console.log(`  BEFORE: ${ba.before.name} (mod ${ba.before.modifier}) — ${ba.before.description}`);
  console.log(`  AFTER : ${ba.after.name} (mod ${ba.after.modifier}) — ${ba.after.description}`);
}
