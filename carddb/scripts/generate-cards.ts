import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CardType, Rarity } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Seeded RNG for reproducibility ──────────────────────────────────────────
let seed = 42;
function rng(): number {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ── Region Vocabularies ─────────────────────────────────────────────────────
interface RegionVocab {
  nouns: string[];
  adjectives: string[];
  situations: string[];
  enemies: string[];
  landmarks: string[];
  verbs: string[];
  flavors: string[];
}

const VOCAB: Record<string, RegionVocab> = {
  arlington: {
    nouns: ['Clearance', 'Briefing', 'Memo', 'Protocol', 'Directive', 'Badge', 'Redaction',
            'Dossier', 'Cipher', 'Mandate', 'Sanction', 'Debrief', 'Communiqué', 'Tribunal',
            'Summons', 'Oath', 'Warrant', 'Intel', 'Garrison', 'Patrol', 'Sentry', 'Envoy'],
    adjectives: ['Classified', 'Bipartisan', 'Sequestered', 'Expedited', 'Redacted',
                 'Covert', 'Tactical', 'Armored', 'Encrypted', 'Fortified', 'Strategic',
                 'Clandestine', 'Sworn', 'Ironclad', 'Vetted', 'Hardened', 'Authorized'],
    situations: ['government', 'security', 'bureaucratic', 'defense', 'military', 'intel', 'diplomatic'],
    enemies: ['Red Tape', 'Oversight Committee', 'Audit Trail', 'Rogue Agent', 'Double Agent',
              'Sleeper Cell', 'Whistleblower', 'Shadow Bureau', 'Classified Leak'],
    landmarks: ['Pentagon', 'Arlington Cemetery', 'Crystal City', 'Rosslyn', 'Fort Myer'],
    verbs: ['intercept', 'authorize', 'debrief', 'fortify', 'encrypt', 'declassify', 'mobilize'],
    flavors: [
      'The paperwork is the real weapon.',
      'Somewhere in those files, the truth waits.',
      'Clearance isn\'t given — it\'s earned.',
      'Even ghosts need a badge here.',
      'The chain of command bends but never breaks.',
      'They didn\'t redact the important parts by accident.',
      'In Arlington, silence is a form of power.',
      'Every memo has a hidden directive.',
      'Trust is measured in security levels.',
    ],
  },
  reston: {
    nouns: ['Sprint', 'Standup', 'Pipeline', 'Deployment', 'Incident', 'Retro', 'On-call',
            'Commit', 'Pull Request', 'Hotfix', 'Rollback', 'Benchmark', 'Throughput', 'Kernel',
            'Payload', 'Endpoint', 'Handshake', 'Refactor', 'Runtime', 'Stack Trace', 'Cache'],
    adjectives: ['Agile', 'Distributed', 'Async', 'Deprecated', 'Legacy', 'Scalable',
                 'Containerized', 'Serverless', 'Polymorphic', 'Recursive', 'Compiled',
                 'Open-Source', 'Virtualized', 'Decoupled', 'Immutable', 'Fault-Tolerant'],
    situations: ['technical', 'process', 'infrastructure', 'code', 'debugging', 'deployment'],
    enemies: ['Technical Debt', 'Scope Creep', 'Production Outage', 'Memory Leak', 'Race Condition',
              'Dependency Hell', 'Zero-Day', 'DDoS Attack', 'Broken Build'],
    landmarks: ['Reston Town Center', 'Dulles Corridor', 'Innovation Center', 'Lake Anne', 'Wiehle Station'],
    verbs: ['deploy', 'refactor', 'optimize', 'debug', 'scale', 'iterate', 'containerize'],
    flavors: [
      'Ship it, fix it later. (The later never comes.)',
      'The pipeline doesn\'t care about your feelings.',
      'Another sprint, another story point.',
      'It works on my machine.',
      'The standup was supposed to be 15 minutes.',
      'Legacy code: here be dragons.',
      'Move fast and break things. Then fix things. Then break them again.',
      'The real bug was the friends we made along the way.',
      'Ctrl+Z is the most powerful spell in Reston.',
    ],
  },
  tysons: {
    nouns: ['Merger', 'Portfolio', 'Leverage', 'Prospectus', 'Valuation', 'Syndicate', 'Dividend',
            'Acquisition', 'Equity', 'Stakeholder', 'Lobby', 'Brunch', 'Gala', 'Penthouse',
            'Motorcade', 'Contract', 'Trust Fund', 'Board Seat', 'Corner Office', 'Golden Parachute'],
    adjectives: ['Hostile', 'Leveraged', 'Blue-Chip', 'Boutique', 'Private', 'Platinum',
                 'Gilded', 'Premium', 'Bespoke', 'Vested', 'Accredited', 'Influential',
                 'Opulent', 'Exclusive', 'Preeminent', 'Magnate-Grade'],
    situations: ['corporate', 'financial', 'political', 'luxury', 'networking', 'lobbying'],
    enemies: ['Hostile Takeover', 'Market Crash', 'Whistleblower', 'SEC Investigation',
              'Bad Press', 'Activist Investor', 'PR Crisis', 'Board Revolt'],
    landmarks: ['Tysons Galleria', 'Capital One HQ', 'McLean Estate', 'The Greensboro', 'Wolf Trap'],
    verbs: ['acquire', 'leverage', 'negotiate', 'liquidate', 'lobby', 'underwrite', 'divest'],
    flavors: [
      'Money talks. In Tysons, it shouts.',
      'The deal was sealed over a $200 brunch.',
      'Every handshake here comes with a clause.',
      'In Tysons, your net worth IS your hit points.',
      'The lobbyists never lose. They just rebrand.',
      'Power isn\'t taken — it\'s leveraged.',
      'The real treasure is the connections you made.',
      'Nobody here plays cards. They play people.',
      'The corner office has the best view of the battlefield.',
    ],
  },
  ashburn: {
    nouns: ['Rack', 'Fiber', 'Uptime', 'Failover', 'Coolant', 'Cluster', 'Node',
            'Latency', 'Bandwidth', 'Redundancy', 'Backup', 'Shard', 'Partition',
            'Heartbeat', 'Datacenter', 'Switch', 'Router', 'Load Balancer', 'UPS', 'Generator'],
    adjectives: ['Redundant', 'Hyper-Converged', 'Air-Gapped', 'Mirrored', 'Bare-Metal',
                 'Edge-Deployed', 'Colocated', 'Shielded', 'Overclocked', 'Thermal-Cooled',
                 'Enterprise-Grade', 'Hardwired', 'Nuclear-Backed', 'Fiber-Lit'],
    situations: ['infrastructure', 'hardware', 'networking', 'data', 'power', 'physical'],
    enemies: ['Power Outage', 'Fiber Cut', 'Overheating', 'Cascade Failure', 'Data Corruption',
              'Ransomware', 'Physical Breach', 'Cooling Failure', 'Capacity Crisis'],
    landmarks: ['Data Center Alley', 'Equinix DC', 'AWS East', 'Loudoun Tech Corridor', 'One Loudoun'],
    verbs: ['provision', 'replicate', 'failover', 'partition', 'shard', 'cache', 'throttle'],
    flavors: [
      'The cloud is just someone else\'s warehouse in Ashburn.',
      '99.999% uptime. The .001% is where it gets interesting.',
      'Every byte that crosses the Atlantic passes through here.',
      'Cool air in, hot air out. That\'s the whole job.',
      'The blinking lights never sleep.',
      'Redundancy isn\'t paranoia — it\'s survival.',
      'In Ashburn, latency is measured in heartbeats.',
      'They built the internet\'s backbone right here.',
      'When Ashburn goes dark, the world notices.',
    ],
  },
  citadel: {
    nouns: ['Filibuster', 'Amendment', 'Caucus', 'Subpoena', 'Inauguration', 'Pardon',
            'Executive Order', 'Monument', 'Embargo', 'Coalition', 'Manifesto', 'Ballot',
            'Diplomat', 'Summit', 'Treaty', 'Veto', 'Quorum', 'Embargo', 'Sanction'],
    adjectives: ['Bipartisan', 'Unconstitutional', 'Ratified', 'Filibustered', 'Impeached',
                 'Inaugurated', 'Embargoed', 'Declassified', 'Sovereign', 'Diplomatic',
                 'Monumental', 'Hallowed', 'Ceremonial', 'Electrified'],
    situations: ['political', 'legal', 'ceremonial', 'diplomatic', 'espionage', 'historical'],
    enemies: ['Filibuster', 'Scandal', 'Impeachment', 'Shutdown', 'Leak', 'Smear Campaign',
              'Constitutional Crisis', 'Foreign Agent', 'Electoral Upset'],
    landmarks: ['The Mall', 'Capitol Hill', 'Georgetown', 'K Street', 'Smithsonian', 'White House'],
    verbs: ['legislate', 'ratify', 'veto', 'filibuster', 'campaign', 'inaugurate', 'pardon'],
    flavors: [
      'In DC, truth is just the first draft.',
      'The marble halls remember everything.',
      'Every monument was once a promise.',
      'The Beltway doesn\'t forgive. It forgets — selectively.',
      'Power flows downhill from the Capitol dome.',
      'They said it was bipartisan. Nobody laughed.',
      'History is written by the winners of the vote.',
      'The city was built on a swamp. The metaphor holds.',
      'Behind every great law is a greater compromise.',
    ],
  },
  neutral: {
    nouns: ['Commute', 'Metro', 'Beltway', 'Traffic', 'Tollbooth', 'Interchange', 'Bypass',
            'Suburb', 'Strip Mall', 'Coffee Run', 'Happy Hour', 'Carpool', 'GPS',
            'Detour', 'Rush Hour', 'Overpass', 'Exit Ramp', 'Rideshare', 'Parking Deck'],
    adjectives: ['Gridlocked', 'Carpooled', 'Express', 'Commuter', 'Regional', 'Cross-Town',
                 'Rush-Hour', 'All-Access', 'Toll-Free', 'HOV-Lane', 'Scenic', 'Detoured',
                 'Universal', 'Wandering', 'Nomadic', 'Unaligned'],
    situations: ['travel', 'social', 'everyday', 'mixed', 'universal', 'transit'],
    enemies: ['Traffic Jam', 'Missed Exit', 'Toll Spike', 'Metro Delay', 'Road Rage',
              'Construction Zone', 'Wrong Turn', 'Flat Tire', 'Parking Ticket'],
    landmarks: ['The Beltway', 'Dulles Airport', 'Metro Center', 'Tysons Corner Mall', 'Route 66'],
    verbs: ['commute', 'navigate', 'merge', 'detour', 'carpool', 'transfer', 'shortcut'],
    flavors: [
      'The Beltway connects everything. And traps everyone.',
      'Nobody beats the traffic. You just learn to live in it.',
      'HOV lane: the fast track for the well-connected.',
      'Every exit leads somewhere interesting — if you survive the merge.',
      'The real quest is finding parking.',
      'In the DMV, everyone\'s a traveler.',
      'The Beltway is the one true neutral zone.',
      'Some cards don\'t pick sides. They pick opportunities.',
      'Works in every region. Excels in none. That\'s the point.',
    ],
  },
};

// ── Card templates per type ─────────────────────────────────────────────────
interface CardTemplate {
  namePattern: (v: RegionVocab) => string;
  descPattern: (v: RegionVocab, mod: number) => string;
  tagDomains: (v: RegionVocab) => string[];
}

const QUEST_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `The ${pick(v.nouns)} ${pick(['Gambit', 'Affair', 'Conspiracy', 'Trail', 'Mandate'])}`,
    descPattern: (v, mod) => `Navigate a chain of ${pick(v.situations)} encounters. Grants +${mod} XP on completion.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'xp'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(['Operation', 'Mission', 'Assignment', 'Investigation', 'Expedition'])}`,
    descPattern: (v, mod) => `A ${pick(v.situations)} quest requiring ${mod + 2} successful rolls to complete.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'multi-step'],
  },
  {
    namePattern: (v) => `Breach the ${pick(v.landmarks)}`,
    descPattern: (v, mod) => `Infiltrate ${pick(v.landmarks)}. +${mod} to all rolls during this quest.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'infiltration'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(v.nouns)} Hunt`,
    descPattern: (v, mod) => `Track down a ${pick(v.adjectives).toLowerCase()} ${pick(v.nouns).toLowerCase()}. +${mod} modifier to tracking rolls.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'tracking'],
  },
  {
    namePattern: (v) => `The ${pick(v.nouns)} Dilemma`,
    descPattern: (v, mod) => `A branching ${pick(v.situations)} quest. Choose wisely — wrong path costs ${mod} progress.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'branching'],
  },
  {
    namePattern: (v) => `Confront the ${pick(v.enemies)}`,
    descPattern: (v, mod) => `Face ${pick(v.enemies)} head-on. Success grants +${mod} and unlocks a rare card.`,
    tagDomains: (v) => [pick(v.situations), 'quest', 'boss'],
  },
];

const DIALOGUE_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(['Retort', 'Persuasion', 'Bluff', 'Negotiation', 'Charm'])}`,
    descPattern: (v, mod) => `Play before a roll: +${mod} to ${pick(v.situations)} encounters this turn.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'one-time'],
  },
  {
    namePattern: (v) => `"${pick(['Trust me on this', 'I know a guy', 'Read the fine print', 'Off the record', 'Between us', 'Let me be clear', 'With all due respect'])}"`,
    descPattern: (v, mod) => `One-time dialogue card. Adds +${mod} to your next ${pick(v.situations)} roll.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'speech'],
  },
  {
    namePattern: (v) => `${pick(v.nouns)} Whisperer`,
    descPattern: (v, mod) => `Whisper the right words: +${mod} against ${pick(v.enemies)}.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'counter'],
  },
  {
    namePattern: (v) => `Invoke ${pick(v.nouns)}`,
    descPattern: (v, mod) => `Invoke the power of ${pick(v.nouns).toLowerCase()}: +${mod} to all party members this turn.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'team'],
  },
  {
    namePattern: (v) => `${pick(['Sharp', 'Smooth', 'Cutting', 'Sly', 'Bold', 'Measured'])} ${pick(v.nouns)}`,
    descPattern: (v, mod) => `A well-timed remark gives +${mod} and forces ${pick(v.enemies)} to reroll.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'disrupt'],
  },
  {
    namePattern: (v) => `The ${pick(v.adjectives)} Monologue`,
    descPattern: (v, mod) => `Deliver a ${pick(v.adjectives).toLowerCase()} speech. +${mod} if audience is impressed.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'performance'],
  },
  {
    namePattern: (v) => `${pick(v.verbs).replace(/^./, c => c.toUpperCase())} and Deflect`,
    descPattern: (v, mod) => `Play after taking damage: reduce by ${mod} and redirect to ${pick(v.enemies)}.`,
    tagDomains: (v) => [pick(v.situations), 'dialogue', 'redirect'],
  },
];

const SKILL_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(v.nouns)}`,
    descPattern: (v, mod) => `Passive +${mod} to encounters involving ${pick(v.situations)} checks.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'passive'],
  },
  {
    namePattern: (v) => `${pick(v.nouns)} Mastery`,
    descPattern: (v, mod) => `Passive +${mod}. When focused, gain an additional +1 against ${pick(v.enemies)}.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'focus'],
  },
  {
    namePattern: (v) => `Expert ${pick(v.nouns)} Handler`,
    descPattern: (v, mod) => `+${mod} to ${pick(v.situations)} rolls. Stacks with region bonuses.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'stackable'],
  },
  {
    namePattern: (v) => `${pick(v.landmarks)} Savvy`,
    descPattern: (v, mod) => `+${mod} to all rolls while in ${pick(v.landmarks)}. Focus: extend to adjacent areas.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'location'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} Instinct`,
    descPattern: (v, mod) => `Passive +${mod}. Automatically detect ${pick(v.adjectives).toLowerCase()} traps and ambushes.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'detection'],
  },
  {
    namePattern: (v) => `${pick(v.verbs).replace(/^./, c => c.toUpperCase())} Protocol`,
    descPattern: (v, mod) => `When you ${pick(v.verbs)}, gain +${mod}. Combo: +1 if another skill is active.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'combo'],
  },
  {
    namePattern: (v) => `${pick(['Iron', 'Silver', 'Quick', 'Deep', 'Keen', 'True'])} ${pick(v.nouns)}`,
    descPattern: (v, mod) => `Passive +${mod} to ${pick(v.situations)} and ${pick(v.situations)} encounters.`,
    tagDomains: (v) => [pick(v.situations), 'skill', 'versatile'],
  },
];

const INSIGHT_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `${pick(v.adjectives)} Revelation`,
    descPattern: (v, mod) => `Consumable: instant +${mod} to your current roll. Discard after use.`,
    tagDomains: (v) => [pick(v.situations), 'insight', 'consumable'],
  },
  {
    namePattern: (v) => `Flash of ${pick(v.nouns)}`,
    descPattern: (v, mod) => `One-time use: gain +${mod} and reveal the next encounter's difficulty.`,
    tagDomains: (v) => [pick(v.situations), 'insight', 'reveal'],
  },
  {
    namePattern: (v) => `The ${pick(v.nouns)} Gambit`,
    descPattern: (v, mod) => `High-risk insight: +${mod + 2} on success, -${mod} on failure. Consumed either way.`,
    tagDomains: (v) => [pick(v.situations), 'insight', 'gambit'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} Epiphany`,
    descPattern: (v, mod) => `Consume to reroll any die and add +${mod} to the new result.`,
    tagDomains: (v) => [pick(v.situations), 'insight', 'reroll'],
  },
  {
    namePattern: (v) => `Decrypt the ${pick(v.nouns)}`,
    descPattern: (v, mod) => `Consume to bypass a ${pick(v.situations)} check entirely. Worth +${mod} XP.`,
    tagDomains: (v) => [pick(v.situations), 'insight', 'bypass'],
  },
];

const EVENT_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(['Storm', 'Surge', 'Cascade', 'Eruption', 'Tremor', 'Wave'])}`,
    descPattern: (v, mod) => `Triggers on region entry: all ${pick(v.situations)} rolls get +${mod} for 3 turns.`,
    tagDomains: (v) => [pick(v.situations), 'event', 'region-trigger'],
  },
  {
    namePattern: (v) => `The ${pick(v.nouns)} Incident`,
    descPattern: (v, mod) => `Triggers after 3 consecutive wins: +${mod} to all stats for the next encounter.`,
    tagDomains: (v) => [pick(v.situations), 'event', 'streak'],
  },
  {
    namePattern: (v) => `${pick(v.enemies)} Strikes`,
    descPattern: (v, mod) => `When ${pick(v.enemies)} appears, gain +${mod} and draw an extra card.`,
    tagDomains: (v) => [pick(v.situations), 'event', 'reactive'],
  },
  {
    namePattern: (v) => `${pick(v.landmarks)} Lockdown`,
    descPattern: (v, mod) => `Area event: all players in ${pick(v.landmarks)} get +${mod} defense for 2 turns.`,
    tagDomains: (v) => [pick(v.situations), 'event', 'area'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} Convergence`,
    descPattern: (v, mod) => `Triggers when 2+ cards share a tag: +${mod} synergy bonus this encounter.`,
    tagDomains: (v) => [pick(v.situations), 'event', 'synergy-trigger'],
  },
];

const ARTIFACT_TEMPLATES: CardTemplate[] = [
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(['Talisman', 'Relic', 'Badge', 'Sigil', 'Token', 'Keycard', 'Device'])}`,
    descPattern: (v, mod) => `Persistent: re-roll once per encounter. +${mod} to the re-rolled result.`,
    tagDomains: (v) => [pick(v.situations), 'artifact', 'reroll'],
  },
  {
    namePattern: (v) => `The ${pick(v.nouns)} Engine`,
    descPattern: (v, mod) => `Persistent: +${mod} to all ${pick(v.situations)} rolls while equipped.`,
    tagDomains: (v) => [pick(v.situations), 'artifact', 'persistent'],
  },
  {
    namePattern: (v) => `${pick(v.landmarks)} Keystone`,
    descPattern: (v, mod) => `While in ${pick(v.landmarks)}, all modifiers doubled. Base +${mod}.`,
    tagDomains: (v) => [pick(v.situations), 'artifact', 'location-boost'],
  },
  {
    namePattern: (v) => `${pick(v.adjectives)} ${pick(['Shield', 'Codex', 'Compass', 'Lens', 'Amulet', 'Gauntlet'])}`,
    descPattern: (v, mod) => `Persistent item: absorb ${mod} damage per encounter. Breaks after 5 uses.`,
    tagDomains: (v) => [pick(v.situations), 'artifact', 'defense'],
  },
  {
    namePattern: (v) => `${pick(v.nouns)} Amplifier`,
    descPattern: (v, mod) => `Doubles the effect of the next Insight card played. Base modifier +${mod}.`,
    tagDomains: (v) => [pick(v.situations), 'artifact', 'amplifier'],
  },
];

const TEMPLATES: Record<CardType, CardTemplate[]> = {
  quest: QUEST_TEMPLATES,
  dialogue: DIALOGUE_TEMPLATES,
  skill: SKILL_TEMPLATES,
  insight: INSIGHT_TEMPLATES,
  event: EVENT_TEMPLATES,
  artifact: ARTIFACT_TEMPLATES,
};

// ── Rarity distribution ─────────────────────────────────────────────────────
const RARITY_WEIGHTS: { rarity: Rarity; weight: number; modRange: [number, number] }[] = [
  { rarity: 'common',    weight: 40, modRange: [0, 1] },
  { rarity: 'uncommon',  weight: 30, modRange: [1, 2] },
  { rarity: 'rare',      weight: 18, modRange: [2, 3] },
  { rarity: 'epic',      weight: 9,  modRange: [3, 4] },
  { rarity: 'legendary', weight: 3,  modRange: [4, 6] },
];

function pickRarity(): { rarity: Rarity; modRange: [number, number] } {
  const total = RARITY_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let roll = rng() * total;
  for (const w of RARITY_WEIGHTS) {
    roll -= w.weight;
    if (roll <= 0) return { rarity: w.rarity, modRange: w.modRange };
  }
  return RARITY_WEIGHTS[0];
}

// ── Stat generation ─────────────────────────────────────────────────────────
function generateStats(rarity: Rarity): { versatility: number; synergy: number; reliability: number; ceiling: number } {
  const base: Record<Rarity, number> = { common: 1, uncommon: 2, rare: 3, epic: 3, legendary: 4 };
  const b = base[rarity];
  return {
    versatility: Math.min(5, Math.max(1, b + randInt(-1, 1))),
    synergy: Math.min(5, Math.max(1, b + randInt(-1, 1))),
    reliability: Math.min(5, Math.max(1, b + randInt(-1, 1))),
    ceiling: Math.min(5, Math.max(1, b + randInt(-1, 1))),
  };
}

// ── Unlock method generation ────────────────────────────────────────────────
function generateUnlockMethod(rarity: Rarity, regionId: string): string | null {
  if (rarity === 'common') return null;
  const methods = [
    `Complete a ${pick(VOCAB[regionId].situations)} quest in ${VOCAB[regionId].landmarks ? pick(VOCAB[regionId].landmarks) : regionId}`,
    `Win ${randInt(3, 10)} encounters in ${regionId}`,
    `Achieve a ${randInt(3, 5)}-win streak`,
    `Collect ${randInt(3, 5)} ${regionId} cards`,
    `Defeat ${pick(VOCAB[regionId].enemies)}`,
    `Reach level ${randInt(5, 20)} in ${regionId}`,
  ];
  return pick(methods);
}

// ── Target distribution per region ──────────────────────────────────────────
interface RegionTarget {
  quest: number; dialogue: number; skill: number; insight: number; event: number; artifact: number;
}

const REGION_TARGETS: Record<string, RegionTarget> = {
  arlington: { quest: 20, dialogue: 28, skill: 28, insight: 18, event: 14, artifact: 14 },
  reston:    { quest: 20, dialogue: 28, skill: 28, insight: 18, event: 14, artifact: 14 },
  tysons:    { quest: 20, dialogue: 28, skill: 28, insight: 18, event: 14, artifact: 14 },
  ashburn:   { quest: 20, dialogue: 28, skill: 28, insight: 18, event: 14, artifact: 14 },
  citadel:   { quest: 20, dialogue: 24, skill: 24, insight: 14, event: 12, artifact: 12 },
  neutral:   { quest: 20, dialogue: 24, skill: 24, insight: 14, event: 12, artifact: 12 },
};

// ── Slugify ─────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Main generation ─────────────────────────────────────────────────────────
interface RawCard {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
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

function generateCards(): RawCard[] {
  const cards: RawCard[] = [];
  const usedNames = new Set<string>();

  for (const [regionId, targets] of Object.entries(REGION_TARGETS)) {
    const vocab = VOCAB[regionId];

    for (const [cardType, count] of Object.entries(targets) as [CardType, number][]) {
      const templates = TEMPLATES[cardType];

      for (let i = 0; i < count; i++) {
        const template = pick(templates);
        const { rarity, modRange } = pickRarity();
        const modifier = randInt(modRange[0], modRange[1]);
        const stats = generateStats(rarity);

        let name = template.namePattern(vocab);
        // Deduplicate names
        let attempt = 0;
        while (usedNames.has(name) && attempt < 20) {
          name = template.namePattern(vocab);
          attempt++;
        }
        if (usedNames.has(name)) {
          name = `${name} ${pick(['II', 'III', 'MK2', 'Redux', 'Prime', 'Omega', 'Alpha', 'Neo'])}`;
        }
        usedNames.add(name);

        const id = `card-${cardType}-${regionId}-${slugify(name)}`;
        const description = template.descPattern(vocab, modifier);
        const tags = [...new Set(template.tagDomains(vocab))];
        const flavor = pick(vocab.flavors);
        const unlock_method = generateUnlockMethod(rarity, regionId);

        cards.push({
          id,
          name,
          type: cardType,
          rarity,
          region_id: regionId,
          modifier,
          ...stats,
          flavor,
          description,
          unlock_method,
          tags,
        });
      }
    }
  }

  return cards;
}

// ── Run ─────────────────────────────────────────────────────────────────────
const cards = generateCards();
const outputPath = join(__dirname, '..', 'data', 'cards-raw.json');
writeFileSync(outputPath, JSON.stringify(cards, null, 2));
console.log(`Generated ${cards.length} cards → ${outputPath}`);

// Stats summary
const byRegion: Record<string, number> = {};
const byType: Record<string, number> = {};
const byRarity: Record<string, number> = {};

for (const card of cards) {
  byRegion[card.region_id] = (byRegion[card.region_id] || 0) + 1;
  byType[card.type] = (byType[card.type] || 0) + 1;
  byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1;
}

console.log('\nBy Region:', byRegion);
console.log('By Type:', byType);
console.log('By Rarity:', byRarity);
