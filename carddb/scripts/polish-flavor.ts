// Flavor text pass: replace heavily-repeated flavor lines with a varied pool
// of region-specific quotes. Deterministic per card.id so re-running is stable.
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsPath = join(__dirname, '..', 'data', 'cards-final.json');

interface Card {
  id: string;
  name: string;
  region_id: string;
  flavor: string;
  [k: string]: unknown;
}

const POOLS: Record<string, string[]> = {
  arlington: [
    "The slides are red. The room is quieter than the room outside it.",
    "Your badge unlocks one door. The next door knows your badge.",
    "Filed in triplicate. Read in private. Acted on never.",
    "Compartmented means you do not know what your friend already signed.",
    "The Pentagon has corridors that loop back on you on purpose.",
    "Crystal City coffee, Crystal City secrets, Crystal City rent.",
    "Cleared, briefed, indemnified — in that order.",
    "The TS in TS/SCI does not stand for 'trust someone'.",
    "Twenty-three steps from the elevator to the SCIF door.",
    "Read the cover sheet. Do not read past the cover sheet.",
    "Need-to-know is a verb here.",
    "The footnote was redacted. So was the footnote about the footnote.",
  ],
  tysons: [
    "Nothing on the record. Everything on the tab.",
    "The deal closes between the eggs and the third bellini.",
    "Tysons has two parking lots: yours, and the one with the better cars.",
    "Money talks. In Tysons, it whispers, then talks, then sues.",
    "The Galleria is a war room with a Cheesecake Factory.",
    "Quarterly earnings. Quarterly excuses.",
    "K Street eats here on Fridays. So does the K Street press.",
    "Term sheet Tuesday. Leak by Thursday. Closed by Friday.",
    "If the steakhouse remembers your order, you have arrived.",
    "Two mergers, three lawsuits, one membership at the club.",
    "Wear the watch you do not own.",
    "Tysons doesn't sleep. It expense-accounts.",
  ],
  reston: [
    "It worked in staging. Staging is also offline now.",
    "The bug is fixed. The cache thinks it isn't.",
    "Ship it Friday. Page yourself Saturday. Promote yourself Monday.",
    "Reston knows what the wider internet knows, six hours later.",
    "On-call is a state of mind. Until the page actually fires.",
    "Stand-up was supposed to be fifteen minutes.",
    "Postmortem: blameless. Resolution: unblamed.",
    "Half the build, twice the meetings.",
    "Town Center patio knows what the war room won't admit.",
    "Two contracts, one badge, three NDAs.",
    "The Wiehle-Reston commute is the real on-call rotation.",
    "It compiled. That is not the same as working.",
  ],
  ashburn: [
    "us-east-1 is having a moment. So is the rest of the country.",
    "Ashburn doesn't sleep. It draws power.",
    "The cloud is a warehouse in Loudoun County.",
    "Cool air in. Hot air out. Repeat for forty years.",
    "Forty-eight strands of fiber. Twelve in use. In theory.",
    "The diesels run monthly. They worry annually.",
    "Two of everything. One of them is currently lying.",
    "The hum is the building thinking.",
    "Outage post-mortems are measured in lawsuits.",
    "BGP is a polite suggestion most days.",
    "The cooling tower vents into the parking lot. So does the blame.",
    "If you can hear the cluster, the cluster is in trouble.",
  ],
  citadel: [
    "Funded through Friday. Or maybe the Friday after that.",
    "Off the record. On the carpet. Either way, on tape.",
    "The whip's count is the only count that matters.",
    "Every monument was once a promise. Most still are.",
    "Subpoenas travel faster than reporters.",
    "The cloakroom outranks the floor.",
    "Bipartisan means everybody loses something different.",
    "The amendment is shorter than the press release about it.",
    "Cable cuts the clip in seven seconds. Make six count.",
    "K Street pays for the steak. M Street pays for the press.",
    "The marble does not care which party walks on it.",
    "Recess is when the real work happens.",
  ],
  neutral: [
    "Shuttle bus service is provided.",
    "Twenty-three miles. Four hours. One overturned chicken truck.",
    "The Beltway forgets — selectively.",
    "If you live here long enough, every exit becomes a memory.",
    "The Orange Line is a state of mind.",
    "DMV traffic is a class of weather.",
    "Reverse-commute is its own privilege.",
    "Every great DC story starts with parking.",
    "Single-tracking through your sense of time.",
    "There is always construction. There has always been construction.",
    "The escalator is broken. It was broken when you got here.",
    "Cherry blossoms last a week. Tourists last all spring.",
  ],
};

function pick(id: string, options: string[]): string {
  const h = createHash('sha1').update(id).digest();
  // use 4 bytes for better distribution
  const idx = h.readUInt32BE(0) % options.length;
  return options[idx];
}

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));

// Identify flavor lines that repeat heavily. Anything appearing 5+ times
// is a generator-template line worth replacing.
const counts = new Map<string, number>();
for (const c of cards) counts.set(c.flavor, (counts.get(c.flavor) ?? 0) + 1);
const REPLACE_IF = new Set([...counts].filter(([, n]) => n >= 5).map(([f]) => f));

let replaced = 0;
for (const card of cards) {
  if (!REPLACE_IF.has(card.flavor)) continue;
  const pool = POOLS[card.region_id] ?? POOLS.neutral;
  const next = pick(card.id, pool);
  if (next !== card.flavor) {
    card.flavor = next;
    replaced++;
  }
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Replaced flavor on ${replaced} cards.`);
