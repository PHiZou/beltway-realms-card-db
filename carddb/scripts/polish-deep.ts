// Deep polish pass: fixes the remaining 258 templated names
// (X and Deflect, Decrypt the X, Confront the X, X Whisperer, X Mastery,
// X Savvy, X Keystone, X Bluff, X Mandate, X Investigation, X Charm,
// X Lockdown, X Strikes, Invoke X, Flash of X). Each gets a unique-feeling
// name plus a description that matches.
//
// Picks are deterministic by card.id so the run is idempotent.
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
  const h = createHash('sha1').update(id).digest();
  return options[h.readUInt32BE(0) % options.length];
}

// ---------- "X and Deflect" — reactive dialogue, redirects damage to Y ----------
// Preserve the redirect target Y; rename based on the original verb X.
const DEFLECT_RENAMES: Record<string, { name: string; line: (n: number, target: string) => string }> = {
  Authorize:    { name: 'Authority Cited',         line: (n, t) => `Cite a higher authority. Reduce the hit by ${n} and pass the consequence to ${t}.` },
  Declassify:   { name: 'Selective Declass',       line: (n, t) => `Declassify a single line of context to absorb ${n} damage; ${t} catches the rest.` },
  Encrypt:      { name: 'Burner Phone Pivot',      line: (n, t) => `Switch channels mid-conversation. Reduce the hit by ${n} and route the fallout to ${t}.` },
  Intercept:    { name: 'Intercept Order',         line: (n, t) => `Intercept the inbound problem; ${t} takes ${n} of it.` },
  Filibuster:   { name: 'Procedural Filibuster',   line: (n, t) => `Talk past the moment. Reduce the hit by ${n} and stall ${t} for a turn.` },
  Negotiate:    { name: 'Counter-Offer',           line: (n, t) => `Counter the terms. Reduce the hit by ${n} and bind ${t} to the new ones.` },
  Debug:        { name: 'Reroute the Stack',       line: (n, t) => `Reroute the call. ${n} damage absorbed; ${t} ends up with the trace.` },
  Deploy:       { name: 'Roll to Canary',          line: (n, t) => `Send the change to canary. Reduce the hit by ${n}; ${t} sees it first.` },
  Iterate:      { name: 'Pivot the Sprint',        line: (n, t) => `Reframe the work. Reduce the hit by ${n}; ${t} carries the rescheduled load.` },
  Refactor:     { name: 'Refactor the Blast Radius', line: (n, t) => `Wrap the broken module. Reduce the hit by ${n}; ${t} touches it next.` },
  Scale:        { name: 'Auto-Scale the Blame',    line: (n, t) => `Spin extra capacity for the spotlight. Reduce the hit by ${n}; ${t} absorbs the rest.` },
  Throttle:     { name: 'Rate-Limit the Hit',      line: (n, t) => `Throttle the inbound. Reduce the hit by ${n}; ${t} queues for it instead.` },
  Optimize:     { name: 'Optimize Around It',      line: (n, t) => `Sidestep the problem cleanly. ${n} absorbed; ${t} faces the unoptimized path.` },
  Cache:        { name: 'Stale Cache Excuse',      line: (n, t) => `Blame the cache. Reduce the hit by ${n}; ${t} is the actual upstream.` },
  Failover:     { name: 'Hot-Site Pivot',          line: (n, t) => `Cut to the hot site. Reduce the hit by ${n}; ${t} takes traffic instead.` },
  Partition:    { name: 'Shard the Blame',         line: (n, t) => `Split the failure across shards. ${n} absorbed; ${t} handles the rest.` },
  Provision:    { name: 'Spin a Standby',          line: (n, t) => `Provision a parallel path. Reduce the hit by ${n}; ${t} waits in queue.` },
  Replicate:    { name: 'Replicate to Standby',    line: (n, t) => `Replicate the read traffic. Reduce the hit by ${n}; ${t} handles the writes.` },
  Acquire:      { name: 'Hostile Acquisition Talk',line: (n, t) => `Threaten an acquisition. Reduce the hit by ${n}; ${t} sweats the close.` },
  Liquidate:    { name: 'Liquidity Redirect',      line: (n, t) => `Sell into the panic. Reduce the hit by ${n}; ${t} clears the inventory.` },
  Lobby:        { name: 'K Street Pivot',          line: (n, t) => `One call to a friend. Reduce the hit by ${n}; ${t} gets the next call.` },
  Underwrite:   { name: 'Underwriter\'s Out',      line: (n, t) => `Cite the indemnity clause. Reduce the hit by ${n}; ${t} carries the risk.` },
  Leverage:     { name: 'Leveraged Pivot',         line: (n, t) => `Use the position you already had. Reduce the hit by ${n}; ${t} absorbs the wobble.` },
  Detour:       { name: 'Sudden Detour',           line: (n, t) => `Take the side street. Reduce the hit by ${n}; ${t} catches the lights.` },
  Carpool:      { name: 'Slug-Line Pivot',         line: (n, t) => `Slug the carpool. Reduce the hit by ${n}; ${t} takes the bridge alone.` },
  Merge:        { name: 'Late Merge',              line: (n, t) => `Merge from the wrong lane on purpose. Reduce the hit by ${n}; ${t} eats the brake lights.` },
  Navigate:     { name: 'Off-the-Map Route',       line: (n, t) => `Route around the alert. Reduce the hit by ${n}; ${t} stays in the jam.` },
  Shortcut:     { name: 'Old Town Shortcut',       line: (n, t) => `Cut through Old Town. Reduce the hit by ${n}; ${t} gets stopped at the light.` },
  Inaugurate:   { name: 'Inaugural Bypass',        line: (n, t) => `Slip past the cordon. Reduce the hit by ${n}; ${t} catches the press scrum.` },
};

// ---------- "Decrypt the X" — insight, bypass a check ----------
const DECRYPT_NAMES = ['Read-In', 'Walked Back', 'On Background', 'Footnote Surfaces', 'Source Confirms', 'Off-Site Backup', 'Plain-Text Copy', 'Quiet Disclosure'];
const DECRYPT_LINE = (subject: string, m: number, region: string) =>
  `Skip a ${region} check; the ${subject.toLowerCase()} resolves at +${m} for free.`;

// ---------- "Confront the X" — quest, face a foe ----------
const CONFRONT_NAMES = ['Counter %s', 'Stand Down %s', 'Quash %s', 'Defuse %s', 'Run Down %s', 'Out-Maneuver %s'];
const CONFRONT_LINE = (foe: string, m: number) =>
  `Face ${foe} across three rounds. Each clear grants +${Math.max(1, Math.floor(m / 2))}; on completion, gain +${m} permanently against its tag.`;

// ---------- "X Whisperer" — dialogue/skill ----------
const WHISPERER_NAMES = ['%s Insider', '%s Diplomat', 'Quiet Authority on %s', '%s Closer', '%s Fixer', '%s Backchannel'];
const WHISPERER_LINE_DIALOGUE = (subject: string, m: number) =>
  `Read the room. +${m} when ${subject} comes up; reveal one opponent card the first time it does.`;
const WHISPERER_LINE_SKILL = (subject: string, m: number) =>
  `Passive +${m} on rolls involving ${subject}. Once per encounter, treat a tied roll as a clear.`;

// ---------- "X Mastery" — skill ----------
const MASTERY_NAMES = ['Career %s Specialist', '%s Veteran', '%s Authority', 'Ten-Year %s Hand', 'Quiet %s Pro'];
const MASTERY_LINE = (subject: string, m: number) =>
  `Always-on +${m} on ${subject} rolls. Once per encounter, ignore one opponent reveal effect.`;

// ---------- "X Savvy" — skill, place knowledge ----------
const SAVVY_NAMES = ['%s Regular', '%s Local', 'Knows %s Backward', '%s Block-Walker', 'Lifelong %s Resident'];
const SAVVY_LINE = (place: string, m: number) =>
  `In or adjacent to ${place}, gain +${m} to all rolls. Once per game, scout an upcoming ${place} encounter.`;

// ---------- "X Bluff" — dialogue, pre-roll boost ----------
const BLUFF_NAMES = ['%s Posture', '%s Cover', '%s Front', '%s Tell'];
const BLUFF_LINE = (kind: string, m: number) =>
  `Set the posture. +${m} to ${kind} encounters this turn; if revealed, this card returns to hand instead of discarding.`;

// ---------- "X Charm" — dialogue, pre-roll boost ----------
const CHARM_NAMES = ['%s Polish', '%s Pitch', '%s Smile', '%s Open'];
const CHARM_LINE = (kind: string, m: number) =>
  `Open with confidence. +${m} to ${kind} encounters this turn; on a clear, draw a card.`;

// ---------- "X Mandate" — quest, multi-step ----------
const MANDATE_NAMES = ['%s Directive', '%s Initiative', '%s Push', '%s Workstream'];
const MANDATE_LINE = (subject: string, m: number) =>
  `Multi-step ${subject.toLowerCase()} push. Two clears in a row grant +${m + 1} for the rest of the encounter.`;

// ---------- "X Investigation" — quest ----------
const INVESTIGATION_NAMES = ['%s Probe', '%s Inquiry', '%s Audit', '%s Postmortem'];
const INVESTIGATION_LINE = (subject: string, m: number) =>
  `Open a formal ${subject.toLowerCase()} probe. Resolve three rolls; the third lands at +${m + 1}.`;

// ---------- "X Lockdown" — event, area ----------
const LOCKDOWN_NAMES = ['%s Cordoned', '%s Sealed', '%s on Hold', '%s Closed for the Day'];
const LOCKDOWN_LINE = (place: string, m: number) =>
  `Area event: while ${place} is sealed, all players inside it gain +${m}. Resolves after 2 turns.`;

// ---------- "X Strikes" — event, foe-arrival ----------
const STRIKES_NAMES = ['%s Hits', '%s Lands', '%s Lashes Out', '%s, Right on Schedule'];
const STRIKES_LINE = (foe: string, m: number) =>
  `${foe} arrives unannounced. All active players take ${m} damage; the player with the most ${foe.toLowerCase()}-tagged cards in hand draws 1.`;

// ---------- "Invoke X" — dialogue, party buff ----------
const INVOKE_NAMES = ['Call on %s', 'Pull the %s Card', '%s, Played', 'Cite %s'];
const INVOKE_LINE = (subject: string, m: number) =>
  `Invoke ${subject}: +${m} to all party members this turn, then exhaust this card.`;

// ---------- "Flash of X" — insight, peek + buff ----------
const FLASH_NAMES = ['%s Spark', '%s Aha', '%s Clarity', '%s Snap', 'Sudden %s'];
const FLASH_LINE = (subject: string, m: number) =>
  `A flash of clarity around ${subject.toLowerCase()}. Peek the next encounter; gain +${m} if it shares any tag.`;

// ---------- "X Keystone" — artifact, place-anchor ----------
// Rename to a concrete object that *belongs* to the place.
const KEYSTONE_RENAMES: Record<string, string> = {
  'Crystal City Keystone': 'Crystal City Building Pass',
  'Pentagon Keystone': 'Pentagon River Entrance Badge',
  'AWS East Keystone': 'us-east-1 Root Account Token',
  'Data Center Alley Keystone': 'Cage Key, Row 47',
  'Equinix DC Keystone': 'Equinix Crossconnect Tag',
  'Loudoun Tech Corridor Keystone': 'Loudoun Master Card Key',
  'Capitol Hill Keystone': 'Capitol Hill Driver\'s Permit',
  'Smithsonian Keystone': 'Smithsonian After-Hours Pass',
  'The Mall Keystone': 'National Mall Mile Marker',
  'Route 66 Keystone': 'I-66 EZ-Pass Transponder',
  'Tysons Corner Mall Keystone': 'Galleria Concierge Key',
  'Dulles Corridor Keystone': 'Dulles Toll Road Plate',
  'Innovation Center Keystone': 'Innovation Center Founder\'s Coin',
  'Lake Anne Keystone': 'Lake Anne Co-Op Key',
  'Reston Town Center Keystone': 'RTC Resident Card',
  'Wiehle Station Keystone': 'Wiehle Park-and-Ride Plate',
  'Capital One HQ Keystone': 'Capital One Tower Lanyard',
  'McLean Estate Keystone': 'McLean Gate Code',
  'The Greensboro Keystone': 'Greensboro Lobby Pass',
  'Tysons Galleria Keystone': 'Galleria VIP Validation',
  'Wolf Trap Keystone': 'Wolf Trap Box-Seat Token',
};

// Region noun for various templates.
const REGION_DOMAIN: Record<string, string> = {
  arlington: 'compliance',
  tysons: 'corporate',
  reston: 'engineering',
  ashburn: 'infrastructure',
  citadel: 'political',
  neutral: 'transit',
};

// ---------- main pass ----------
const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));
let touched = 0;
const samples: { id: string; before: string; after: string }[] = [];

for (const card of cards) {
  const before = card.name;
  let changed = false;

  // X and Deflect
  let m = card.name.match(/^(.+?) and Deflect(\s+\(?Redux\)?)?$/);
  if (m) {
    const verb = m[1].replace(/\s*Redux.*$/, '').trim();
    const def = DEFLECT_RENAMES[verb];
    if (def) {
      const targetMatch = card.description.match(/redirect (?:to|blame to) ([^.:]+?)(?:[.:]|$)/);
      const target = targetMatch ? targetMatch[1].trim() : 'the next foe';
      card.name = def.name;
      card.description = def.line(card.modifier || 1, target);
      changed = true;
    }
  }

  // Decrypt the X
  m = !changed ? card.name.match(/^Decrypt the (.+)$/) : null;
  if (m) {
    const subj = m[1];
    const tail = pick(card.id, DECRYPT_NAMES);
    card.name = `${subj}, ${tail}`;
    card.description = DECRYPT_LINE(subj, card.modifier || 1, REGION_DOMAIN[card.region_id] ?? 'unknown');
    changed = true;
  }

  // Confront the X
  m = !changed ? card.name.match(/^Confront the (.+)$/) : null;
  if (m) {
    const foe = m[1];
    const tmpl = pick(card.id, CONFRONT_NAMES);
    card.name = tmpl.replace('%s', foe);
    card.description = CONFRONT_LINE(foe, card.modifier || 1);
    changed = true;
  }

  // X Whisperer
  m = !changed ? card.name.match(/^(.+?) Whisperer$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, WHISPERER_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = card.type === 'dialogue'
      ? WHISPERER_LINE_DIALOGUE(subj, card.modifier || 1)
      : WHISPERER_LINE_SKILL(subj, card.modifier || 1);
    changed = true;
  }

  // X Mastery
  m = !changed ? card.name.match(/^(.+?) Mastery$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, MASTERY_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = MASTERY_LINE(subj, card.modifier || 1);
    changed = true;
  }

  // X Savvy
  m = !changed ? card.name.match(/^(.+?) Savvy(?:\s+\w+)?$/) : null;
  if (m) {
    const place = m[1];
    const tmpl = pick(card.id, SAVVY_NAMES);
    card.name = tmpl.replace('%s', place);
    card.description = SAVVY_LINE(place, card.modifier || 1);
    changed = true;
  }

  // X Bluff
  m = !changed ? card.name.match(/^(.+?) Bluff$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, BLUFF_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = BLUFF_LINE(subj.toLowerCase(), card.modifier || 1);
    changed = true;
  }

  // X Charm
  m = !changed ? card.name.match(/^(.+?) Charm$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, CHARM_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = CHARM_LINE(subj.toLowerCase(), card.modifier || 1);
    changed = true;
  }

  // X Mandate
  m = !changed ? card.name.match(/^(?:The )?(.+?) Mandate$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, MANDATE_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = MANDATE_LINE(subj, card.modifier || 1);
    changed = true;
  }

  // X Investigation
  m = !changed ? card.name.match(/^(?:The )?(.+?) Investigation$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, INVESTIGATION_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = INVESTIGATION_LINE(subj, card.modifier || 1);
    changed = true;
  }

  // X Lockdown
  m = !changed ? card.name.match(/^(.+?) Lockdown$/) : null;
  if (m) {
    const place = m[1];
    const tmpl = pick(card.id, LOCKDOWN_NAMES);
    card.name = tmpl.replace('%s', place);
    card.description = LOCKDOWN_LINE(place, card.modifier || 1);
    changed = true;
  }

  // X Strikes
  m = !changed ? card.name.match(/^(.+?) Strikes$/) : null;
  if (m) {
    const foe = m[1];
    const tmpl = pick(card.id, STRIKES_NAMES);
    card.name = tmpl.replace('%s', foe);
    card.description = STRIKES_LINE(foe, card.modifier || 1);
    changed = true;
  }

  // Invoke X
  m = !changed ? card.name.match(/^Invoke (.+)$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, INVOKE_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = INVOKE_LINE(subj, card.modifier || 1);
    changed = true;
  }

  // Flash of X
  m = !changed ? card.name.match(/^Flash of (.+)$/) : null;
  if (m) {
    const subj = m[1];
    const tmpl = pick(card.id, FLASH_NAMES);
    card.name = tmpl.replace('%s', subj);
    card.description = FLASH_LINE(subj, card.modifier || 1);
    changed = true;
  }

  // X Keystone (artifact place-anchor)
  if (!changed && KEYSTONE_RENAMES[card.name]) {
    const place = card.name.replace(/ Keystone$/, '');
    card.name = KEYSTONE_RENAMES[card.name];
    card.description = `Place-anchor. While in ${place}, all your modifiers are doubled. Base +${card.modifier || 1}.`;
    changed = true;
  }

  if (changed) {
    touched++;
    if (samples.length < 20) samples.push({ id: card.id, before, after: card.name });
  }
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Deep polish touched ${touched} cards.`);
for (const s of samples) console.log(`  ${s.before}  ->  ${s.after}`);
