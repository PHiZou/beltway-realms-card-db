// Second polish pass: rename ~60 cards with generic prefixes (Expert/Quick/
// Hardened/Sworn/Tactical/etc.) to specific, regionally-flavored names.
// Preserves IDs, stats, type, region, rarity. Lightly rewrites description/
// flavor to match the new name.
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

type Patch = { name: string; flavor: string; description: (mod: number) => string; tags?: string[] };

const renames: Record<string, Patch> = {
  // ---------- Arlington ----------
  'card-artifact-arlington-strategic-gauntlet': {
    name: 'Continuity-of-Operations Binder',
    flavor: 'Tabbed for end-of-the-world. Updated quarterly.',
    description: (m) => `Persistent: absorb ${m} setbacks per encounter. Once per game, ignore an event entirely.`,
    tags: ['arlington', 'artifact', 'defense'],
  },
  'card-artifact-arlington-clandestine-compass': {
    name: 'Pentagon Visitor Badge',
    flavor: 'Escort required at all times.',
    description: (m) => `Persistent: absorb ${m} setback per encounter. Reveals one tag of incoming events.`,
  },
  'card-artifact-arlington-ironclad-token': {
    name: 'TS/SCI Lanyard',
    flavor: 'Heavier than it looks.',
    description: (m) => `Persistent: re-roll once per encounter; +${m} to the better result.`,
  },
  'card-artifact-arlington-authorized-relic': {
    name: 'Crystal City Parking Pass',
    flavor: 'Spot 4-C, every weekday since 2003.',
    description: (m) => `Persistent: re-roll once per encounter and keep the better result. +${m} when used in Arlington.`,
  },
  'card-artifact-arlington-tactical-badge': {
    name: 'DoD Common Access Card',
    flavor: 'Works on doors, vending machines, and bureaucrats.',
    description: (m) => `Persistent: re-roll once per encounter. +${m} to the re-rolled result.`,
  },
  'card-artifact-arlington-strategic-badge': {
    name: 'Compartmented Briefing Slip',
    flavor: 'Initial here, here, and here. Then forget you saw it.',
    description: (m) => `Persistent: re-roll once per encounter. +${m} to the re-rolled result.`,
  },
  'card-dialogue-arlington-sworn-charm': {
    name: 'On Background',
    flavor: 'Not for attribution. Definitely for use.',
    description: (m) => `Play before a roll: +${m} to security encounters this turn; opponents cannot reveal your hand.`,
  },
  'card-event-arlington-hardened-surge': {
    name: 'Snap Inspection',
    flavor: 'Clipboard, badge, no warning.',
    description: (m) => `Triggers on region entry: all diplomatic rolls get +${m} for 3 turns.`,
  },
  'card-event-arlington-sworn-convergence': {
    name: 'Joint Task Force',
    flavor: 'Three agencies, one whiteboard.',
    description: (m) => `Triggers when 2+ cards share a tag: +${m} synergy across the chain.`,
  },
  'card-event-arlington-ironclad-convergence': {
    name: 'Inter-Agency Standup',
    flavor: 'Twelve people, one decision, two hours.',
    description: (m) => `Triggers when 2+ cards share a tag: +${m} synergy across the chain.`,
  },
  'card-event-arlington-hardened-storm': {
    name: 'Iron Mountain Drill',
    flavor: 'In the event of an actual emergency, this drill would cancel.',
    description: (m) => `Triggers on region entry: all intel rolls get +${m} for 3 turns.`,
  },
  'card-insight-arlington-sequestered-revelation': {
    name: 'Vault Read-In',
    flavor: 'Phones surrender. Notes stay.',
    description: (m) => `Consume for +${m} to your current roll, or convert a failure into a reroll.`,
  },
  'card-insight-arlington-hardened-revelation': {
    name: 'Redacted Footnote',
    flavor: 'The black bar is the document.',
    description: (m) => `Consumable: instant +${m} to your current roll. Reveal one tag of the next encounter.`,
  },
  'card-insight-arlington-clandestine-revelation': {
    name: 'Source Walks Back',
    flavor: 'They never said that. They specifically did not say that.',
    description: (m) => `Consume for +${m} to your current roll, or convert a failure into a reroll.`,
  },
  'card-insight-arlington-sequestered-epiphany': {
    name: 'After-Action Whisper',
    flavor: 'The real meeting starts in the parking lot.',
    description: (m) => `Consume to reroll any die and add +${m} to the new result.`,
  },
  'card-quest-arlington-armored-sanction-hunt': {
    name: 'Sanctions List Tracedown',
    flavor: 'Treasury list, Tuesday update, three new names.',
    description: (m) => `Track a flagged entity across the federal record. +${m} to each tracking roll.`,
  },
  'card-quest-arlington-authorized-directive-hunt': {
    name: 'OPM Records Pull',
    flavor: 'The form to request the form.',
    description: (m) => `Pull a personnel file across three offices. +${m} to each tracking roll.`,
  },
  'card-quest-arlington-hardened-expedition': {
    name: 'Pentagon Loop Recon',
    flavor: 'A walk that becomes a run-around.',
    description: (m) => `Multi-step quest in Arlington. Two clears in a row grants +${m + 1} for the rest of the encounter.`,
  },
  'card-quest-arlington-armored-envoy-hunt': {
    name: 'Foreign National Trace',
    flavor: 'Visa, vehicle, vendor — pick the thread.',
    description: (m) => `Track an embassy contact across three encounters. +${m} per tracking roll.`,
  },
  'card-skill-arlington-sequestered-directive': {
    name: 'Compartmentalize',
    flavor: 'Even your other self does not need to know.',
    description: (m) => `Passive +${m} to government checks. Once per encounter, hide one of your cards from reveal effects.`,
  },
  'card-skill-arlington-armored-summons': {
    name: 'Cleared Caller',
    flavor: 'They know who is asking. Eventually.',
    description: (m) => `Passive +${m} to encounters involving security checks.`,
  },
  'card-skill-arlington-expert-cipher-handler': {
    name: 'Crypto Officer',
    flavor: 'Keys in the safe. Safe in the SCIF. SCIF in the basement.',
    description: (m) => `+${m} to security rolls. Stacks with region bonuses.`,
  },
  'card-skill-arlington-expert-sanction-handler': {
    name: 'Sanctions Desk',
    flavor: 'A list, alphabetized, weaponized.',
    description: (m) => `+${m} to diplomatic rolls. Stacks with region bonuses.`,
  },
  'card-skill-arlington-expert-dossier-handler': {
    name: 'Dossier Curator',
    flavor: 'Filed, cross-filed, and one copy in the safe.',
    description: (m) => `+${m} to diplomatic rolls. Stacks with region bonuses.`,
  },
  'card-skill-arlington-expert-sentry-handler': {
    name: 'Pentagon Sentry',
    flavor: 'You will pause at the line. You will not see the line.',
    description: (m) => `+${m} to government rolls. Stacks with region bonuses.`,
  },
  'card-skill-arlington-quick-warrant': {
    name: 'FISA Fast-Track',
    flavor: 'Stamped before the coffee cools.',
    description: (m) => `Passive +${m} to military and security encounters.`,
  },
  'card-skill-arlington-hardened-patrol': {
    name: 'Crystal City Foot Patrol',
    flavor: 'They know which kiosks open early.',
    description: (m) => `Passive +${m} to encounters involving defense checks.`,
  },
  'card-skill-arlington-hardened-memo': {
    name: 'Memo Stamped In Triplicate',
    flavor: 'Three colors of ink, three reading orders.',
    description: (m) => `Passive +${m} to encounters involving defense checks.`,
  },

  // ---------- Reston ----------
  'card-dialogue-reston-compiled-charm': {
    name: 'Demo Day Polish',
    flavor: 'It worked once on the laptop. We will run that one again.',
    description: (m) => `Play before a roll: +${m} to deployment encounters this turn.`,
  },
  'card-event-reston-agile-surge': {
    name: 'Sprint Crunch',
    flavor: 'It is not technical debt if you call it velocity.',
    description: (m) => `Triggers on region entry: all code rolls get +${m} for 3 turns.`,
  },
  'card-event-reston-virtualized-eruption': {
    name: 'Container Restart Cascade',
    flavor: 'One pod restarts. Then the next. Then the cluster.',
    description: (m) => `Triggers on region entry: all code rolls get +${m} for 3 turns.`,
  },
  'card-insight-reston-compiled-revelation': {
    name: 'Stack Trace Eureka',
    flavor: 'Line 47. Always line 47.',
    description: (m) => `Consumable: instant +${m} to your current roll. Discard after use.`,
  },
  'card-quest-reston-virtualized-operation': {
    name: 'Containerization Migration',
    flavor: 'Six months. Two outages. One promotion.',
    description: (m) => `Multi-step quest in Reston. Two clears in a row grants +${m + 1} for the rest of the encounter.`,
  },
  'card-quest-reston-compiled-rollback-hunt': {
    name: 'Rollback Forensics',
    flavor: 'Find what shipped. Find who shipped it. Stop asking.',
    description: (m) => `Trace a bad release through three commits. +${m} to each tracking roll.`,
  },
  'card-skill-reston-virtualized-instinct': {
    name: 'Sandbox Reflex',
    flavor: 'Try it on staging. Staging is also production now.',
    description: (m) => `Passive: peek at the next encounter's tags. +${m} when peek reveals a code tag.`,
  },
  'card-skill-reston-expert-hotfix-handler': {
    name: 'Hotfix Specialist',
    flavor: 'Ships at 4:55. Reverts at 5:05. Re-ships at 5:15.',
    description: (m) => `+${m} to debugging rolls. Stacks with region bonuses.`,
  },
  'card-skill-reston-quick-deployment': {
    name: 'One-Click Deploy',
    flavor: 'The click is fine. The pipeline is the problem.',
    description: (m) => `Passive +${m} to process and technical encounters.`,
  },
  'card-skill-reston-expert-deployment-handler': {
    name: 'Release Engineer',
    flavor: 'Owns the button. Pretends not to.',
    description: (m) => `+${m} to code rolls. Stacks with region bonuses.`,
  },
  'card-skill-reston-expert-standup-handler': {
    name: 'Standup Filibuster',
    flavor: 'Fifteen minutes, scheduled. Forty-two, delivered.',
    description: (m) => `+${m} to infrastructure rolls. Once per game, skip an opponent\'s reveal.`,
  },
  'card-skill-reston-expert-benchmark-handler': {
    name: 'Benchmark Cherry-Picker',
    flavor: 'On the right hardware, on the right Tuesday.',
    description: (m) => `+${m} to debugging rolls. Stacks with region bonuses.`,
  },
  'card-skill-reston-expert-handshake-handler': {
    name: 'TLS Handshake Whisperer',
    flavor: 'Cert chain reads like a family tree.',
    description: (m) => `+${m} to debugging rolls. Stacks with region bonuses.`,
  },

  // ---------- Tysons ----------
  'card-artifact-tysons-opulent-amulet': {
    name: 'Patek Philippe Backup Watch',
    flavor: 'You never own one. You only wear it for the next generation.',
    description: (m) => `Persistent: absorb ${m} setbacks per encounter. Counts as a status item in dialogue.`,
  },
  'card-dialogue-tysons-opulent-charm': {
    name: 'Tysons Corner Smile',
    flavor: 'Fifty percent eye contact, one hundred percent teeth.',
    description: (m) => `Play before a roll: +${m} to financial encounters this turn.`,
  },
  'card-skill-tysons-expert-brunch-handler': {
    name: 'Brunch Power Broker',
    flavor: 'The deal closes between the eggs and the third bellini.',
    description: (m) => `+${m} to financial rolls. Stacks with region bonuses.`,
  },
  'card-skill-tysons-expert-lobby-handler': {
    name: 'Lobby Concierge',
    flavor: 'Knows the elevator code. Knows the elevator codes.',
    description: (m) => `+${m} to political rolls. Stacks with region bonuses.`,
  },
  'card-skill-tysons-quick-brunch': {
    name: 'Sunday Brunch Pivot',
    flavor: 'Bottomless mimosas, top-shelf intel.',
    description: (m) => `Passive +${m} to corporate and financial encounters.`,
  },
  'card-skill-tysons-expert-dividend-handler': {
    name: 'Dividend Strategist',
    flavor: 'Quarterly. Reinvested. Untouchable.',
    description: (m) => `+${m} to corporate rolls. Stacks with region bonuses.`,
  },
  'card-skill-tysons-expert-gala-handler': {
    name: 'Gala Seating Diplomat',
    flavor: 'Table 4 is power. Table 12 is exile.',
    description: (m) => `+${m} to financial rolls. Stacks with region bonuses.`,
  },
  'card-skill-tysons-quick-merger': {
    name: 'M&A Sprint',
    flavor: 'Term sheet Tuesday, leak by Thursday, closed by Friday.',
    description: (m) => `Passive +${m} to political and corporate encounters.`,
  },

  // ---------- Ashburn ----------
  'card-skill-ashburn-expert-ups-handler': {
    name: 'Battery Plant Lead',
    flavor: 'Twelve hundred lead-acid bricks, one bored technician.',
    description: (m) => `+${m} to hardware rolls. Stacks with region bonuses.`,
  },
  'card-skill-ashburn-expert-latency-handler': {
    name: 'Latency Whisperer',
    flavor: 'Forty milliseconds is forever in this hallway.',
    description: (m) => `+${m} to physical rolls. Stacks with region bonuses.`,
  },
  'card-skill-ashburn-expert-generator-handler': {
    name: 'Diesel Standby Tech',
    flavor: 'Tested monthly. Used annually. Loved always.',
    description: (m) => `+${m} to infrastructure rolls. Stacks with region bonuses.`,
  },
  'card-skill-ashburn-expert-backup-handler': {
    name: 'Hot Site Operator',
    flavor: 'Two of everything. One of them is currently lying.',
    description: (m) => `+${m} to hardware rolls. Stacks with region bonuses.`,
  },

  // ---------- Citadel ----------
  'card-skill-citadel-expert-coalition-handler': {
    name: 'Coalition Whip',
    flavor: 'Counts to 218 the way you count steps in the dark.',
    description: (m) => `+${m} to espionage rolls. Stacks with region bonuses.`,
  },
  'card-skill-citadel-expert-amendment-handler': {
    name: 'Amendment Drafter',
    flavor: 'Strike "shall." Insert "may." Watch the room exhale.',
    description: (m) => `+${m} to ceremonial rolls. Stacks with region bonuses.`,
  },

  // ---------- Neutral ----------
  'card-skill-neutral-expert-parking-deck-handler': {
    name: 'Garage Spiral Veteran',
    flavor: 'Always one ramp lower than you think.',
    description: (m) => `+${m} to everyday rolls. Stacks with region bonuses.`,
  },
  'card-skill-neutral-expert-interchange-handler': {
    name: 'Springfield Mixing Bowl Native',
    flavor: 'Knows which lane becomes exit-only without warning.',
    description: (m) => `+${m} to transit rolls. Stacks with region bonuses.`,
  },
  'card-skill-neutral-expert-bypass-handler': {
    name: 'Beltway Detour Rat',
    flavor: 'Will use the gas-station shortcut without a second thought.',
    description: (m) => `+${m} to mixed rolls. Stacks with region bonuses.`,
  },
  'card-skill-neutral-expert-coffee-run-handler': {
    name: 'Foggy Bottom Coffee Run',
    flavor: 'Six orders. Three modifiers each. One missing oat milk.',
    description: (m) => `+${m} to universal rolls. Stacks with region bonuses.`,
  },
  'card-skill-neutral-expert-rush-hour-handler': {
    name: 'Reverse-Commute Sage',
    flavor: 'Sees the gridlock from the open lane.',
    description: (m) => `+${m} to transit rolls. Stacks with region bonuses.`,
  },
};

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

let renamed = 0;
const samples: { id: string; before: string; after: string }[] = [];
for (const card of cards) {
  const patch = renames[card.id];
  if (!patch) continue;
  const beforeName = card.name;
  card.name = patch.name;
  card.flavor = patch.flavor;
  card.description = patch.description(card.modifier);
  if (patch.tags) card.tags = patch.tags;
  renamed++;
  if (samples.length < 12) samples.push({ id: card.id, before: beforeName, after: card.name });
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Renamed ${renamed} cards.`);
for (const s of samples) console.log(`  ${s.before}  ->  ${s.after}`);
