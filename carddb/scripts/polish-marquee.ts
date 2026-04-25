// Hand-written rewrites for every legendary and epic card. These are the
// top-of-curve cards that anchor the deck's voice — worth real care, not
// templates. Keeps stats/types/regions/IDs intact; only changes name,
// description, flavor, and (occasionally) tags.
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

type Patch = { name: string; flavor: string; description: string; tags?: string[] };

const MARQUEE: Record<string, Patch> = {
  // ---------- ARLINGTON ----------
  'card-insight-arlington-the-badge-gambit': {
    name: 'The Polygraph Gamble',
    flavor: 'Six hours, the same three questions, slightly rephrased.',
    description: 'Declare before any roll: +8 on a clean answer, -6 on a flinch. Card and badge both leave the table either way.',
    tags: ['arlington', 'clearance', 'gambit', 'one-shot'],
  },
  'card-artifact-arlington-strategic-gauntlet': {
    name: 'Continuity-of-Operations Binder',
    flavor: 'Tabbed for the day after the worst day.',
    description: 'Persistent. Absorbs 4 setbacks per encounter. Once per game, ignore an event entirely — the binder has a section for that.',
    tags: ['arlington', 'defense', 'persistent', 'bureaucracy'],
  },
  'card-artifact-arlington-crystal-city-keystone': {
    name: 'Crystal City Building Pass',
    flavor: 'Spot 4-C. Every weekday since 2003.',
    description: 'Persistent place-anchor. While you remain in Arlington, all your modifiers double. Base +3.',
    tags: ['arlington', 'persistent', 'bureaucracy'],
  },
  'card-dialogue-arlington-with-all-due-respect-mk2': {
    name: '"With all due respect," MK2',
    flavor: 'Six syllables that mean: I am about to get loud.',
    description: 'Play before any roll: +3 to bureaucratic encounters this turn. If you also hold an Arlington skill, the next foe must skip its first reveal.',
    tags: ['arlington', 'dialogue', 'bureaucracy'],
  },
  'card-dialogue-arlington-envoy-whisperer': {
    name: 'Envoy Backchannel',
    flavor: 'The decision was made before the meeting started.',
    description: 'Read the room. +4 when diplomatic encounters resolve; reveal one opponent card the first time one comes up this game.',
    tags: ['arlington', 'diplomatic', 'reveal'],
  },
  'card-dialogue-arlington-expedited-charm': {
    name: 'Expedited Polish',
    flavor: 'Send it to Legal. Legal already knows.',
    description: 'Open with confidence. +3 to bureaucratic encounters this turn; on a clear, draw a card.',
    tags: ['arlington', 'bureaucracy', 'draw'],
  },
  'card-dialogue-arlington-authorize-and-deflect': {
    name: 'Authority Cited',
    flavor: 'You will not even know who you talked to.',
    description: 'Cite a higher authority. Reduce the next hit by 4 and pass the consequence to Red Tape.',
    tags: ['arlington', 'redirect', 'reactive'],
  },
  'card-dialogue-arlington-i-know-a-guy': {
    name: '"I know a guy."',
    flavor: 'He owes you. Or his brother does.',
    description: 'Once per game, treat any encounter as if you held its region tag. +4 to your next roll there.',
    tags: ['arlington', 'networking', 'one-shot'],
  },
  'card-dialogue-arlington-fortified-bluff': {
    name: 'Fortified Tell',
    flavor: 'The bluff that has receipts.',
    description: 'Set the posture. +3 to defense encounters this turn; if revealed, this card returns to hand instead of discarding.',
    tags: ['arlington', 'defense', 'reactive'],
  },
  'card-event-arlington-crystal-city-lockdown': {
    name: 'Crystal City Cordoned',
    flavor: 'Roads closed for an exercise. Or so the email said.',
    description: 'Area event: Crystal City sealed for two turns. Players inside gain +3; players outside lose 1 action per turn.',
    tags: ['arlington', 'area', 'lockdown'],
  },
  'card-insight-arlington-decrypt-the-communiqu': {
    name: 'Communiqué, On Background',
    flavor: 'Not for attribution. Definitely for use.',
    description: 'Skip a compliance check; the communiqué resolves at +4 free. Reveal one tag of your choice on the next encounter.',
    tags: ['arlington', 'reveal', 'one-shot'],
  },
  'card-quest-arlington-confront-the-shadow-bureau': {
    name: 'Defuse Shadow Bureau',
    flavor: 'An office on the fourth floor that is not on the directory.',
    description: 'Three rounds against Shadow Bureau. Each clear: +2. On completion, +4 permanent on every clearance-tagged card you hold.',
    tags: ['arlington', 'clearance', 'multi-step'],
  },
  'card-skill-arlington-hardened-patrol': {
    name: 'Crystal City Foot Patrol',
    flavor: 'They know which kiosks open early.',
    description: 'Always-on +4 in Arlington. Once per encounter, peek the next foe before committing cards.',
    tags: ['arlington', 'defense', 'peek'],
  },
  'card-skill-arlington-classified-oath': {
    name: 'Classified Oath',
    flavor: 'Signed once. Read aloud once. Filed forever.',
    description: 'Passive +3 on clearance-tagged rolls. Cannot be discarded by opponent effects.',
    tags: ['arlington', 'clearance', 'passive'],
  },

  // ---------- ASHBURN ----------
  'card-dialogue-ashburn-partition-and-deflect': {
    name: 'Shard the Blame',
    flavor: 'Half the cluster failed. The other half blamed it.',
    description: 'After a setback, split the loss across two foes: each takes 4. You take none.',
    tags: ['ashburn', 'redirect', 'infrastructure'],
  },
  'card-insight-ashburn-decrypt-the-bandwidth': {
    name: 'Bandwidth, Walked Back',
    flavor: 'The traffic graph is a circle. The explanation is a Gantt chart.',
    description: 'Skip an infrastructure check; the bandwidth incident resolves at +5 free. The next outage event is delayed by one turn.',
    tags: ['ashburn', 'infrastructure', 'one-shot'],
  },
  'card-insight-ashburn-redundant-epiphany': {
    name: 'Redundant Epiphany',
    flavor: 'The other thing was also broken. We just had not noticed.',
    description: 'Reveal the next two encounters. If both share a tag, gain +5 against each.',
    tags: ['ashburn', 'reveal', 'infrastructure'],
  },
  'card-quest-ashburn-breach-the-loudoun-tech-corridor': {
    name: 'Breach the Loudoun Tech Corridor',
    flavor: 'Forty minutes from Reston. Forty acres of warehouse.',
    description: 'Infiltrate Equinix DC across three tightening security tiers. +2 per tier; +6 on completion. Failure: lose your strongest infrastructure card.',
    tags: ['ashburn', 'infiltration', 'multi-step'],
  },
  'card-dialogue-ashburn-colocated-retort': {
    name: 'Colocated Retort',
    flavor: 'Same rack, different SLA.',
    description: 'Reactive. When a foe commits an infrastructure card, neutralize one of its tags. +4 on your next roll.',
    tags: ['ashburn', 'reactive', 'infrastructure'],
  },
  'card-dialogue-ashburn-cache-and-deflect': {
    name: 'Stale Cache Excuse',
    flavor: 'The bug is fixed in production. The cache thinks it is January.',
    description: 'After a setback, reduce the hit by 3 and route the fallout upstream — the next infrastructure foe takes the difference.',
    tags: ['ashburn', 'redirect', 'infrastructure'],
  },
  'card-event-ashburn-redundant-wave': {
    name: 'Redundant Wave',
    flavor: 'Two of everything. One of them is currently lying.',
    description: 'All your Persistent items reset their break counters. +4 to the first roll involving any of them.',
    tags: ['ashburn', 'persistent', 'infrastructure'],
  },
  'card-event-ashburn-overheating-strikes': {
    name: 'Overheating Lashes Out',
    flavor: 'The HVAC sees you and decides today is the day.',
    description: 'Cooling Failure arrives. All players take 4 damage. The player with the most infrastructure cards in hand draws 1.',
    tags: ['ashburn', 'outage', 'area'],
  },
  'card-insight-ashburn-the-shard-gambit': {
    name: 'The Shard Gambit',
    flavor: 'Half the data, twice the confidence.',
    description: 'All-or-nothing. Pick a shard before rolling: +6 if it succeeds, -4 if it does not. Card consumed either way.',
    tags: ['ashburn', 'gambit', 'one-shot'],
  },
  'card-quest-ashburn-enterprise-grade-investigation': {
    name: 'Enterprise-Grade Postmortem',
    flavor: 'Five-page doc. Three slides. One person who reads it.',
    description: 'Open a formal incident probe. Resolve three rolls; the third lands at +5. On completion, any one foe permanently drops a tag.',
    tags: ['ashburn', 'multi-step', 'infrastructure'],
  },
  'card-quest-ashburn-the-rack-mandate': {
    name: 'Rack Push',
    flavor: 'Four-foot lift. Three-person job. Two of them on PTO.',
    description: 'Multi-rack rollout. Two clears in a row grant +5 for the rest of the encounter.',
    tags: ['ashburn', 'multi-step', 'infrastructure'],
  },
  'card-skill-ashburn-silver-failover': {
    name: 'Silver Failover',
    flavor: 'Tested monthly. Used annually. Loved always.',
    description: 'Once per encounter, ignore one outage effect entirely. +4 to the recovery roll that follows.',
    tags: ['ashburn', 'reactive', 'uptime'],
  },
  'card-skill-ashburn-aws-east-savvy': {
    name: 'AWS East Regular',
    flavor: 'Has root in three accounts and admin in twelve.',
    description: 'In or adjacent to Ashburn, +4 to all rolls. Once per game, scout an upcoming Ashburn encounter.',
    tags: ['ashburn', 'cloud', 'peek'],
  },

  // ---------- CITADEL ----------
  'card-skill-citadel-ratify-protocol': {
    name: 'Ratify Protocol',
    flavor: 'The signature room is colder than the floor.',
    description: 'Ratify any one of your own cards: it becomes immune to discard for the rest of the game. +4 the first time it triggers after.',
    tags: ['citadel', 'ceremonial', 'persistent'],
  },
  'card-dialogue-citadel-the-unconstitutional-monologue': {
    name: 'The Unconstitutional Monologue',
    flavor: 'Ten minutes of confidence. Three minutes of arguments.',
    description: 'Play before any political encounter: +3 and the foe must skip its first reveal.',
    tags: ['citadel', 'political', 'reactive'],
  },
  'card-dialogue-citadel-inauguration-whisperer': {
    name: 'Inauguration Closer',
    flavor: 'Knows which staffer to text. Knows which one is listening.',
    description: 'Read the room. +4 when ceremonial encounters resolve; reveal one opponent card the first time one comes up.',
    tags: ['citadel', 'ceremonial', 'reveal'],
  },
  'card-dialogue-citadel-sovereign-bluff': {
    name: 'Sovereign Front',
    flavor: 'The face you wear two minutes before the cameras find it.',
    description: 'Set the posture. +4 to political encounters this turn; if revealed, returns to hand instead of discarding.',
    tags: ['citadel', 'political', 'reactive'],
  },
  'card-event-citadel-ratified-surge': {
    name: 'Ratified Surge',
    flavor: 'The bill passed. The reaction is still landing.',
    description: 'Region trigger: all political rolls gain +4 for three turns. Forces one opponent card with a Diplomatic tag to reveal.',
    tags: ['citadel', 'political', 'reveal'],
  },
  'card-event-citadel-diplomatic-wave': {
    name: 'Diplomatic Wave',
    flavor: 'Six embassies, one news cycle, zero answers.',
    description: 'All players draw 1. The player with the most ceremonial-tagged cards must reveal one of them.',
    tags: ['citadel', 'ceremonial', 'draw'],
  },
  'card-insight-citadel-ceremonial-revelation': {
    name: 'Ceremonial Revelation',
    flavor: 'What is said in the rotunda always travels twice.',
    description: 'Consume mid-roll for +4, then reveal one tag on every encounter currently in play.',
    tags: ['citadel', 'ceremonial', 'reveal'],
  },
  'card-insight-citadel-bipartisan-epiphany': {
    name: 'Bipartisan Epiphany',
    flavor: 'Both sides agreed on Tuesday. Wednesday is a different problem.',
    description: 'Skip a political check; resolves at +4 free. Two opponents must each discard one card from hand.',
    tags: ['citadel', 'political', 'discard'],
  },
  'card-quest-citadel-the-ballot-mandate': {
    name: 'Ballot Push',
    flavor: 'Counts to 218 the way you count steps in the dark.',
    description: 'Three rounds of vote-counting. Each clear: +1. On completion, any one of your cards becomes immune to opponent reveals.',
    tags: ['citadel', 'political', 'multi-step'],
  },
  'card-skill-citadel-white-house-savvy': {
    name: 'White House Block-Walker',
    flavor: 'Knows the alleys, the staffers, and the staff entrance.',
    description: 'In or adjacent to the Citadel, +3 to all rolls. Once per game, see an opponent\'s hand size and one tag.',
    tags: ['citadel', 'political', 'peek'],
  },
  'card-skill-citadel-expert-coalition-handler': {
    name: 'Coalition Whip',
    flavor: 'If she counts you, you are counted.',
    description: '+4 to political rolls. Once per encounter, force any one of your party members to gain or lose 2 progress (your choice).',
    tags: ['citadel', 'political', 'team'],
  },
  'card-skill-citadel-monumental-monument': {
    name: 'Monumental Monument',
    flavor: 'Stands still longer than any administration.',
    description: 'Persistent skill. +4 to ceremonial rolls. Cannot be discarded; cannot be re-tagged.',
    tags: ['citadel', 'ceremonial', 'persistent'],
  },

  // ---------- NEUTRAL ----------
  'card-dialogue-neutral-merge-and-deflect': {
    name: 'Late Merge',
    flavor: 'From the wrong lane, on purpose, with no signal.',
    description: 'Reactive. Reduce any inbound hit by 6; the player who triggered it loses one action next turn (eats the brake lights).',
    tags: ['neutral', 'transit', 'reactive'],
  },
  'card-dialogue-neutral-shortcut-and-deflect': {
    name: 'Old Town Shortcut',
    flavor: 'The route everyone knows about and uses anyway.',
    description: 'Reactive. Reduce a hit by 5; the foe who delivered it goes to the back of the encounter queue.',
    tags: ['neutral', 'transit', 'reactive'],
  },
  'card-dialogue-neutral-off-the-record-prime': {
    name: '"Off the record." (First Time)',
    flavor: 'First time. Last time. Fill in the rest.',
    description: 'One-time. Negate the next reveal effect targeting you, then add +5 to your next dialogue roll. Reveal one opponent card.',
    tags: ['neutral', 'press', 'one-shot'],
  },
  'card-artifact-neutral-traffic-amplifier': {
    name: 'Traffic Amplifier',
    flavor: "When the radio says 'minor delays,' close the laptop.",
    description: 'Persistent. The first transit-tagged event each encounter does double damage to opponents and is reduced by 3 against you.',
    tags: ['neutral', 'transit', 'persistent'],
  },
  'card-dialogue-neutral-the-unaligned-monologue': {
    name: 'The Unaligned Monologue',
    flavor: 'Both sides annoyed. Neither side disagreeing.',
    description: 'Play before any non-region encounter: +3 and force a re-roll on the foe\'s strongest die.',
    tags: ['neutral', 'social', 'reroll'],
  },
  'card-dialogue-neutral-off-the-record-redux-v2': {
    name: '"Off the record." (Variant)',
    flavor: 'It was off the record the first six times.',
    description: 'Reactive. After any reveal effect, re-conceal one of your cards and gain +4 to your next roll.',
    tags: ['neutral', 'press', 'reactive'],
  },
  'card-event-neutral-tysons-corner-mall-lockdown': {
    name: 'Tysons Corner Mall Cordoned',
    flavor: 'The ribbon is up. The brunch is on hold.',
    description: 'Area event: Tysons Corner Mall sealed for two turns. Players inside gain +4; outside players cannot draw networking cards.',
    tags: ['neutral', 'area', 'lockdown'],
  },
  'card-event-neutral-missed-exit-strikes': {
    name: 'Missed Exit Lands',
    flavor: 'You will loop. You will always loop.',
    description: 'All players lose one action this turn. Any player with no transit-tagged cards in hand draws 2.',
    tags: ['neutral', 'transit', 'area'],
  },
  'card-insight-neutral-decrypt-the-strip-mall': {
    name: 'Strip Mall, On Background',
    flavor: 'Behind the dry cleaner. Past the H-Mart. Do not ask why.',
    description: 'Skip a transit check; the strip-mall meeting resolves at +4 free. Peek any opponent\'s hand size.',
    tags: ['neutral', 'social', 'peek'],
  },
  'card-skill-neutral-dulles-airport-savvy': {
    name: 'Dulles Airport Local',
    flavor: 'Knows the secret long-term lot, the secret short-term lot, and the secret no-fee lot.',
    description: 'In or adjacent to neutral regions, +4 to all rolls. Once per game, swap your active region for one turn.',
    tags: ['neutral', 'transit', 'one-shot'],
  },
  'card-skill-neutral-expert-parking-deck-handler': {
    name: 'Garage Spiral Veteran',
    flavor: 'Always one ramp lower than you think. And one over.',
    description: '+3 to everyday rolls. Cannot be ambushed by transit-tagged events.',
    tags: ['neutral', 'transit', 'reactive'],
  },
  'card-skill-neutral-express-rush-hour': {
    name: 'Express Rush Hour',
    flavor: 'The reverse-commute on the express side, both directions, all month.',
    description: '+4 to transit rolls. Once per encounter, treat a "lose an action" effect as "lose 1 progress" instead.',
    tags: ['neutral', 'transit', 'reactive'],
  },

  // ---------- RESTON ----------
  'card-event-reston-wiehle-station-lockdown': {
    name: 'Wiehle Station on Hold',
    flavor: 'Single-tracking is a state of mind.',
    description: 'Area event: Wiehle Station closed. All players in Reston gain +6 for two turns; arriving players draw 1 instead of taking their turn.',
    tags: ['reston', 'transit', 'area'],
  },
  'card-insight-reston-decrypt-the-hotfix': {
    name: 'Hotfix, Source Confirms',
    flavor: 'The fix is verified. The verification is unverified.',
    description: 'One-time. Skip an engineering check; the hotfix resolves at +5 free. Reveal the next two encounters.',
    tags: ['reston', 'debugging', 'reveal'],
  },
  'card-quest-reston-polymorphic-investigation': {
    name: 'Polymorphic Audit',
    flavor: 'Same audit. Different shape every page.',
    description: 'Three rounds, each with a different tag. Each clear: +2. On completion, any one of your skills permanently picks up a second tag.',
    tags: ['reston', 'debugging', 'multi-step'],
  },
  'card-skill-reston-benchmark-mastery': {
    name: 'Quiet Benchmark Pro',
    flavor: 'On the right hardware, on the right Tuesday.',
    description: '+5 to debugging rolls. Once per game, declare the winner of a tied roll without rolling.',
    tags: ['reston', 'debugging', 'one-shot'],
  },
  'card-artifact-reston-wiehle-station-keystone': {
    name: 'Wiehle Park-and-Ride Plate',
    flavor: 'Lot Two, Level B, Spot 142. Do not ask.',
    description: 'Persistent place-anchor. While you remain at Wiehle Station, all your modifiers double. Base +4.',
    tags: ['reston', 'transit', 'persistent'],
  },
  'card-artifact-reston-the-endpoint-engine': {
    name: 'The Endpoint Engine',
    flavor: 'Eighty percent of the agents check in. The other twenty percent are why you are here.',
    description: 'Persistent. The first deploy-tagged effect each turn gains +4. After 5 deploys, exhaust.',
    tags: ['reston', 'deployment', 'persistent'],
  },
  'card-dialogue-reston-the-open-source-monologue': {
    name: 'The Open-Source Monologue',
    flavor: 'Cite the README. Do not read the README.',
    description: 'Play before a debugging encounter: +4 and copy one tag from any opponent card revealed this game.',
    tags: ['reston', 'debugging', 'reveal'],
  },
  'card-dialogue-reston-invoke-retro': {
    name: 'Retro, Played',
    flavor: 'Action items: 4. Action items completed: 0. Discussion: rich.',
    description: 'Cite the retro: +3 to all party members this turn. Then this card exhausts; everyone moves on, somehow.',
    tags: ['reston', 'team', 'one-shot'],
  },
  'card-dialogue-reston-scale-and-deflect': {
    name: 'Auto-Scale the Blame',
    flavor: 'The graph went up. So did the blame.',
    description: 'Reactive. Reduce a hit by 3; the foe who delivered it absorbs the rest plus 1 (the spotlight scales).',
    tags: ['reston', 'redirect', 'debugging'],
  },
  'card-dialogue-reston-invoke-on-call': {
    name: 'Pull the On-call Card',
    flavor: 'There is a person whose week is now your week.',
    description: 'Cite the pager: +3 to all party members this turn; the next opponent reveal triggers on you instead.',
    tags: ['reston', 'team', 'reactive'],
  },
  'card-event-reston-reston-town-center-lockdown': {
    name: 'Reston Town Center Cordoned',
    flavor: 'Outdoor concert moved. Crab cakes still happening.',
    description: 'Area event: Reston Town Center sealed for two turns. Players inside gain +3; outside players cannot draw debugging cards.',
    tags: ['reston', 'area', 'lockdown'],
  },
  'card-insight-reston-decrypt-the-standup': {
    name: 'Standup, Read-In',
    flavor: 'Yesterday: nothing. Today: nothing. Blockers: yes.',
    description: 'Skip an engineering check; the standup resolves at +3 free. Peek one opponent\'s next two encounter cards.',
    tags: ['reston', 'team', 'peek'],
  },
  'card-insight-reston-flash-of-hotfix': {
    name: 'Sudden Hotfix',
    flavor: 'It compiled. It deployed. It half-worked.',
    description: 'Reveal the next encounter; gain +3 if it shares any tag with a card in your hand.',
    tags: ['reston', 'debugging', 'reveal'],
  },
  'card-quest-reston-recursive-operation': {
    name: 'Recursive Operation',
    flavor: 'The fix introduces the bug that the fix fixes.',
    description: 'Multi-step. Each clear unlocks a sub-encounter at the same difficulty. +3 per nested clear.',
    tags: ['reston', 'debugging', 'multi-step'],
  },
  'card-quest-reston-the-incident-conspiracy': {
    name: 'The Incident Conspiracy',
    flavor: 'Three engineers in the room. Each remembers a different cause.',
    description: 'Open a multi-source postmortem. Each round reveal a different opponent card; on the third, the conspiracy resolves at +4.',
    tags: ['reston', 'debugging', 'reveal'],
  },
  'card-quest-reston-confront-the-zero-day': {
    name: 'Counter Zero-Day',
    flavor: 'The patch was published an hour ago. The exploit was published last month.',
    description: 'Three rounds against Zero-Day. +1 per clear. On completion, gain +3 to any one card with the debugging tag.',
    tags: ['reston', 'debugging', 'multi-step'],
  },
  'card-quest-reston-the-on-call-gambit': {
    name: 'The On-call Gambit',
    flavor: 'Pager flips. Coffee flips. Dignity flips.',
    description: 'Declare on the first clear: +6 on completion or -3 on failure. Either way, exhaust any one of your skills.',
    tags: ['reston', 'gambit', 'one-shot'],
  },

  // ---------- TYSONS ----------
  'card-artifact-tysons-opulent-amulet': {
    name: 'Patek Philippe Backup Watch',
    flavor: 'You never own one. You wear it for the next generation.',
    description: 'Persistent. Absorbs 5 setbacks per encounter. Counts as a status item in any networking encounter; cannot be discarded.',
    tags: ['tysons', 'luxury', 'persistent'],
  },
  'card-artifact-tysons-mclean-estate-keystone': {
    name: 'McLean Gate Code',
    flavor: '1207. Same as the year. Of his bourbon.',
    description: 'Persistent place-anchor. While in Tysons, all your modifiers double. Base +4.',
    tags: ['tysons', 'luxury', 'persistent'],
  },
  'card-artifact-tysons-vested-token': {
    name: 'Vested Token',
    flavor: 'Four years. One cliff. Several lawsuits.',
    description: 'Persistent. After 4 turns of holding it, the token grants permanent +4 to corporate rolls. Until then, +1.',
    tags: ['tysons', 'corporate', 'persistent'],
  },
  'card-dialogue-tysons-lobby-and-deflect-redux': {
    name: 'K Street Pivot, Take Two',
    flavor: 'First call was a courtesy. This one is not.',
    description: 'Reactive. Reduce a hit by 3 and pass the consequence to the next dialogue foe — the second call always lands.',
    tags: ['tysons', 'lobbying', 'redirect'],
  },
  'card-dialogue-tysons-acquire-and-deflect': {
    name: 'Hostile Acquisition Talk',
    flavor: 'Friendly. Until the term sheet.',
    description: 'Threaten an acquisition. Reduce the hit by 3 and force the next corporate foe to reveal a tag.',
    tags: ['tysons', 'corporate', 'reveal'],
  },
  'card-insight-tysons-the-golden-parachute-gambit': {
    name: 'The Golden Parachute Gambit',
    flavor: 'Sign on Friday. Free on Monday.',
    description: 'Declare before the encounter: +6 if it resolves on its first turn, 0 otherwise. Card consumed.',
    tags: ['tysons', 'corporate', 'gambit'],
  },
  'card-insight-tysons-accredited-revelation': {
    name: 'Accredited Revelation',
    flavor: 'Only the licensed are allowed to know.',
    description: 'Consume mid-roll for +4. Reveal one tag of every encounter currently in play.',
    tags: ['tysons', 'corporate', 'reveal'],
  },
  'card-skill-tysons-mclean-estate-savvy': {
    name: 'Lifelong McLean Resident',
    flavor: 'Born here. Schooled here. Will retire to Florida and lie about it.',
    description: '+4 to corporate and luxury rolls. Once per game, treat any networking encounter as a tied roll automatically.',
    tags: ['tysons', 'luxury', 'one-shot'],
  },
};

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));
let touched = 0;
const missing: string[] = [];

for (const [id, patch] of Object.entries(MARQUEE)) {
  const card = cards.find((c) => c.id === id);
  if (!card) { missing.push(id); continue; }
  card.name = patch.name;
  card.flavor = patch.flavor;
  card.description = patch.description;
  if (patch.tags) card.tags = [...new Set(patch.tags)].sort();
  touched++;
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Marquee pass: rewrote ${touched} cards.`);
if (missing.length) console.log(`Missing IDs (skipped):`, missing);
