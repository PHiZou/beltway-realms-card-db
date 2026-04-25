// Mid-tier description pass: vary the most-repeated templated descriptions
// so cards stop looking interchangeable. Each card picks a variant
// deterministically from its id (so re-running is stable).
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

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

function pick<T>(id: string, options: T[]): T {
  const h = createHash('sha1').update(id).digest()[0];
  return options[h % options.length];
}

const REGION_FLAVOR: Record<string, { place: string[]; foe: string[]; verb: string[] }> = {
  arlington: {
    place: ['the Pentagon corridor', 'a Crystal City SCIF', 'the Arlington courtyard'],
    foe: ['Audit Trail', 'Whistleblower', 'Polygraph Lane'],
    verb: ['stamps', 'logs', 'cross-references'],
  },
  tysons: {
    place: ['the Capital Grille booth', 'a Tysons rooftop', 'the Galleria atrium'],
    foe: ['SEC Investigation', 'Hostile Takeover', 'Activist Shareholder'],
    verb: ['negotiates', 'underwrites', 'pitches'],
  },
  reston: {
    place: ['the Reston war room', 'a Wiehle-Reston platform', 'a Town Center patio'],
    foe: ['Memory Leak', 'Scope Creep', 'Broken Build'],
    verb: ['debugs', 'rolls back', 'patches'],
  },
  ashburn: {
    place: ['a Loudoun data hall', 'the cooling loop', 'the cage corridor'],
    foe: ['Power Surge', 'Cooling Failure', 'BGP Flap'],
    verb: ['fails over', 'reroutes', 'spins up'],
  },
  citadel: {
    place: ['a marble hallway', 'a Capitol cloakroom', 'the press pen'],
    foe: ['Subpoena', 'Floor Vote', 'Cable News Cycle'],
    verb: ['leaks', 'gavels', 'amends'],
  },
  neutral: {
    place: ['a Metro platform', 'an Orange Line car', 'the Rosslyn tunnel'],
    foe: ['Single-Tracking', 'Construction Zone', 'Traffic Jam'],
    verb: ['detours', 'reroutes', 'waits out'],
  },
};

function flavor(card: Card) {
  return REGION_FLAVOR[card.region_id] ?? REGION_FLAVOR.neutral;
}

// Try to detect a template and return a varied replacement (or null if none matches).
function rewrite(card: Card): string | null {
  const d = card.description;
  const m = card.modifier;
  const f = flavor(card);

  // High-risk insight: +N on success, -M on failure. Consumed either way.
  let hr = d.match(/^High-risk insight: \+(\d+) on success, -(\d+) on failure\./);
  if (hr) {
    const win = +hr[1], lose = +hr[2];
    return pick(card.id, [
      `Commit to a single roll: +${win} on success, -${lose} on failure. Either way, exhaust.`,
      `All-or-nothing: declare before rolling. +${win} on a clear, -${lose} on a miss.`,
      `Burn this for a swing: +${win} on success, -${lose} on a fail. Takes effect immediately.`,
      `Push your luck — +${win} or -${lose}, then the card is gone regardless of outcome.`,
    ]);
  }

  // One-time use: gain +N and reveal the next encounter's difficulty.
  if (/^One-time use: gain \+\d+ and reveal the next encounter/.test(d)) {
    return pick(card.id, [
      `One-time: peek at the next encounter's tags, then gain +${m} when it resolves.`,
      `Once per game, reveal the next encounter and add +${m} to your first roll against it.`,
      `Burn for a preview: see what's coming and start the encounter at +${m}.`,
      `Discard to scout: read the next encounter's difficulty, gain +${m} preparing for it.`,
    ]);
  }

  // One-time use: peek at the next encounter's difficulty and gain +N against it.
  if (/^One-time use: peek at the next encounter/.test(d)) {
    return pick(card.id, [
      `Peek at the next encounter and gain +${m} against it.`,
      `Discard to scout the next encounter; +${m} when you commit to it.`,
      `One-time recon: reveal the next card and start the encounter at +${m}.`,
    ]);
  }

  // Consumable: instant +N to your current roll.
  if (/^Consumable: instant \+\d+ to your current roll/.test(d)) {
    return pick(card.id, [
      `Consume mid-roll for +${m}, then discard.`,
      `Spend immediately for +${m} on the active roll. No retake.`,
      `Burn during a roll to add +${m}; the card exhausts.`,
      `Quick consume: +${m} to whichever roll is on the table.`,
    ]);
  }

  // Triggers after 3 consecutive wins: +N to all stats.
  if (/^Triggers after 3 consecutive wins/.test(d)) {
    return pick(card.id, [
      `Hot streak: after three wins in a row, gain +${m} to every stat for the next encounter.`,
      `Momentum: third consecutive clear grants +${m} across the board next turn.`,
      `Reward streak. After three wins: +${m} to all stats; the streak resets.`,
      `Three-in-a-row triggers a +${m} all-stat surge next encounter, then exhausts.`,
    ]);
  }

  // Persistent: re-roll once per encounter. +N to the re-rolled result.
  if (/^Persistent: re-roll once per encounter\. \+\d+ to the re-rolled result/.test(d)) {
    return pick(card.id, [
      `Persistent. One re-roll per encounter; the new result lands at +${m}.`,
      `Stays in play. Once per encounter, redo a roll and add +${m} to it.`,
      `Keep this active. One free re-roll per encounter, +${m} on the second try.`,
    ]);
  }

  // Persistent item: absorb N damage per encounter.
  if (/^Persistent item: absorb \d+ damage per encounter/.test(d)) {
    const n = +d.match(/absorb (\d+)/)![1];
    return pick(card.id, [
      `Persistent: absorbs ${n} setbacks per encounter. Cracks after 5.`,
      `Soak ${n} hits per encounter; breaks on the fifth use.`,
      `Worn item: blocks ${n} damage every encounter, useful five times before it gives up.`,
    ]);
  }

  // Doubles the effect of the next Insight card played. Base modifier +N.
  if (/^Doubles the effect of the next Insight card played/.test(d)) {
    return pick(card.id, [
      `Amplifies your next Insight: doubled effect. Carries a base +${m}.`,
      `Charge an Insight: the next one you play resolves twice. Base +${m}.`,
      `Insight amplifier — next Insight triggers twice; this card adds +${m} alongside.`,
    ]);
  }

  // Consume to reroll any die and take the better of the two results.
  if (/^Consume to reroll any die and take the better of the two results/.test(d)) {
    return pick(card.id, [
      `Consume to redo a roll; keep whichever you prefer.`,
      `Burn for a free re-roll on any die. Take the better outcome.`,
      `Spend on a re-roll — you choose which die, and you keep the higher.`,
    ]);
  }

  // Consume to reroll any die and add +N to the new result.
  if (/^Consume to reroll any die and add \+\d+ to the new result/.test(d)) {
    return pick(card.id, [
      `Consume for a re-roll; the new die lands at +${m}.`,
      `Discard to redo a roll with a +${m} bonus to the second attempt.`,
      `Spend for a re-roll; add +${m} to whatever comes up.`,
    ]);
  }

  // Branching encounter. Pick a path: success grants +N progress, failure burns a turn and reveals your hand.
  if (/^Branching encounter\. Pick a path/.test(d)) {
    return pick(card.id, [
      `Two-path encounter at ${f.place[0]}. The right path: +2 progress. The wrong path: lose a turn and reveal your hand.`,
      `Branching choice. Clear one path for +2 progress; pick wrong and ${f.verb[0]} the loss across two turns.`,
      `${f.place[0]} forks. Right call grants +2 progress; wrong call costs a turn and a reveal.`,
    ]);
  }

  // Triggers when 2+ cards share a tag: +N synergy across the chain.
  if (/^Triggers when 2\+ cards share a tag/.test(d)) {
    return pick(card.id, [
      `When two of your cards share a tag, the chain gains +${m} synergy.`,
      `Synergy spike: any two cards sharing a tag gain +${m} together for the encounter.`,
      `Tag-match trigger: +${m} across cards sharing a tag this encounter.`,
    ]);
  }

  // While in X, all modifiers doubled. Base +N.
  let inX = d.match(/^While in (.+?), all modifiers doubled\. Base \+(\d+)/);
  if (inX) {
    const place = inX[1];
    const base = +inX[2];
    return pick(card.id, [
      `Anchored to ${place}: while you remain there, all modifiers double. Base +${base}.`,
      `Local advantage. In ${place}, every modifier you play counts twice. Base +${base}.`,
      `${place} bonus: doubled modifiers while present. Base +${base} on top.`,
    ]);
  }

  // When X appears, gain +N and draw an extra card.
  let appears = d.match(/^When (.+?) appears, gain \+(\d+) and draw an extra card/);
  if (appears) {
    const foe = appears[1];
    const n = +appears[2];
    return pick(card.id, [
      `Counter-prep for ${foe}: when it appears, gain +${n} and draw a card.`,
      `Triggered by ${foe}: gain +${n} and draw immediately.`,
      `Reactive vs. ${foe} — its arrival grants you +${n} and a card.`,
    ]);
  }

  // A well-timed remark gives +N and forces X to reroll.
  let remark = d.match(/^A well-timed remark gives \+(\d+) and forces (.+?) to reroll/);
  if (remark) {
    const n = +remark[1];
    const foe = remark[2];
    return pick(card.id, [
      `Cut in at the right moment: +${n} this turn and ${foe} must re-roll its highest die.`,
      `One sentence, well-placed. +${n}; ${foe} re-rolls its strongest result.`,
      `Land a remark — gain +${n} and force ${foe} into a re-roll.`,
    ]);
  }

  // When you X, gain +N. Combo: +M if another skill is active.
  let combo = d.match(/^When you (\w+), gain \+(\d+)\. Combo: \+(\d+) if another skill is active/);
  if (combo) {
    const verb = combo[1];
    const n = +combo[2];
    const c = +combo[3];
    return pick(card.id, [
      `Trigger on ${verb}: gain +${n}, or +${n + c} if any other skill is active.`,
      `When you ${verb}, +${n}; +${n + c} if you've stacked another skill this turn.`,
      `Active skill — ${verb} grants +${n}. Pair with another skill for +${n + c} total.`,
    ]);
  }

  // Triggers on region entry: all X rolls get +N for 3 turns.
  let entry = d.match(/^Triggers on region entry: all (.+?) rolls get \+(\d+) for 3 turns/);
  if (entry) {
    const kind = entry[1];
    const n = +entry[2];
    return pick(card.id, [
      `On entering this region, ${kind} rolls gain +${n} for three turns.`,
      `Region trigger: three turns of +${n} on every ${kind} roll once you arrive.`,
      `Arrive and ignite — ${kind} rolls run +${n} for three turns.`,
    ]);
  }

  // +N to X rolls. Stacks with region bonuses.
  let stacks = d.match(/^\+(\d+) to (.+?) rolls\. Stacks with region bonuses/);
  if (stacks) {
    const n = +stacks[1];
    const kind = stacks[2];
    return pick(card.id, [
      `+${n} on ${kind} rolls; stacks on top of region bonuses.`,
      `Adds +${n} to ${kind} rolls and layers with whatever the region grants.`,
      `Specialist boost: +${n} ${kind}, on top of any region bonus.`,
      `${kind.charAt(0).toUpperCase() + kind.slice(1)} expertise — +${n} that stacks regionally.`,
    ]);
  }

  // Passive +N to X.
  let passive = d.match(/^Passive \+(\d+) to (.+)/);
  if (passive) {
    const n = +passive[1];
    const kind = passive[2].replace(/\.$/, '');
    return pick(card.id, [
      `Always-on: +${n} to ${kind}.`,
      `Quiet bonus: +${n} whenever ${kind} comes up.`,
      `Passive +${n} on ${kind} — no action needed to trigger.`,
    ]);
  }

  return null;
}

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

let rewrites = 0;
for (const card of cards) {
  const next = rewrite(card);
  if (next && next !== card.description) {
    card.description = next;
    rewrites++;
  }
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Rewrote ${rewrites} mid-tier descriptions.`);
