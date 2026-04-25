// Hand-written rewrites for all 126 rares plus 174 uncommons (300 total),
// matching each card's primary ability, action type, and recharge.
// Stats stay; only name/flavor/description/tags change.
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

type Patch = { name?: string; flavor: string; description: string; tags?: string[] };

const PATCHES: Record<string, Patch> = {
  // ============================================================
  // ARLINGTON RARES (19)
  // ============================================================
  'card-artifact-arlington-pentagon-keystone': {
    name: 'Pentagon River Entrance Badge',
    flavor: 'River entrance only. North parking only. Do not loiter.',
    description: 'Persistent place-anchor. While in Arlington, your standing rolls double. Base +2.',
  },
  'card-dialogue-arlington-with-all-due-respect': {
    flavor: 'Three syllables that empty a hallway.',
    description: 'Bonus, once per game: cite a higher authority. Deny one Insight reveal targeting you and gain +2 to your next clout roll.',
  },
  'card-dialogue-arlington-read-the-fine-print': {
    flavor: 'He read it. He did not sign it.',
    description: 'Bonus, once per game: invoke an unread clause. Cancel one bureaucratic effect targeting you.',
  },
  'card-dialogue-arlington-cutting-patrol': {
    flavor: 'Walks the perimeter. Reads the badges. Remembers.',
    description: 'Action: +2 on a defense roll; +3 if the encounter has a clearance tag.',
  },
  'card-dialogue-arlington-sworn-charm': {
    name: 'On Background',
    flavor: 'The decision was made before the meeting started.',
    description: 'Action: speak quietly to the right person. +3 to a clout roll; if any opponent has a press-tagged card in play, also reveal it.',
  },
  'card-dialogue-arlington-sharp-memo': {
    name: 'Sharp Memo',
    flavor: 'Routed to seven inboxes. Acted on by one.',
    description: 'Action: +3 on a bureaucratic roll. If you also hold a clearance-tagged card, the next foe skips one reveal.',
  },
  'card-event-arlington-classified-leak-strikes': {
    flavor: 'Two reporters. One conference room. Three lawyers.',
    description: 'Event: the leak lands. All players reveal one tag. Press-tagged holders draw 1; clearance-tagged holders lose 1 progress.',
  },
  'card-event-arlington-the-warrant-incident': {
    flavor: 'The judge signed at 4:58 a.m.',
    description: 'Event: a warrant lands at dawn. The player with the most surveillance-tagged cards may target one opponent card to reveal.',
  },
  'card-event-arlington-audit-trail-strikes': {
    flavor: 'Quarterly. Like clockwork. Like dread.',
    description: 'Event: every player loses 2 progress. Each clearance-tagged card you hold cancels 1 of that loss.',
  },
  'card-event-arlington-shadow-bureau-strikes': {
    flavor: 'An office on the fourth floor that is not on the directory.',
    description: 'Event: an unmarked office reviews your hand. Reveal one of your cards; gain +2 if it has a clearance tag.',
  },
  'card-insight-arlington-decrypt-the-clearance': {
    flavor: 'Need-to-know. You needed to know.',
    description: 'Action: skip a clearance check; resolves at +3 free. Reveal one tag of your next encounter.',
  },
  'card-insight-arlington-sequestered-epiphany': {
    name: 'After-Action Whisper',
    flavor: 'The real meeting starts in the parking lot.',
    description: 'Action: peek the next two encounters; pick one to face now at +2.',
  },
  'card-quest-arlington-armored-sanction-hunt': {
    flavor: 'Treasury list. Tuesday update. Three new names.',
    description: 'Quest. Three rounds tracking a flagged entity. +1 per clear; on completion, +3 against any foe with a clearance tag.',
  },
  'card-quest-arlington-tactical-mission': {
    name: 'SCIF Lockdown Drill',
    flavor: 'Phones in lockers. Watches in lockers. Ideas, optional.',
    description: 'Long-rest quest. Resolve three rolls without revealing any of your cards. Reward: +3 modifier and one sealed Insight.',
  },
  'card-quest-arlington-the-redaction-conspiracy': {
    flavor: 'The black bar grows. The page does not.',
    description: 'Quest. Branching. Right path: +2 progress and reveal one opponent card. Wrong path: lose a turn.',
  },
  'card-skill-arlington-sequestered-directive': {
    name: 'Compartmentalize',
    flavor: 'Even your other self does not need to know.',
    description: 'Passive +3 on government rolls. Once per encounter, hide one of your cards from reveal effects.',
  },
  'card-skill-arlington-expert-sanction-handler': {
    name: 'Sanctions Desk',
    flavor: 'A list, alphabetized, weaponized.',
    description: 'Action: +3 to diplomatic rolls. Stacks with region bonuses.',
  },
  'card-skill-arlington-arlington-cemetery-savvy': {
    name: 'Knows Arlington Cemetery Backward',
    flavor: 'The section, the row, the time of day with the right light.',
    description: 'One-time passive: +2 to all rolls in Arlington for the rest of the game.',
  },
  'card-skill-arlington-patrol-mastery': {
    name: 'Ten-Year Patrol Hand',
    flavor: 'Same shift, same coffee, same suspicions.',
    description: 'Passive +3 on defense rolls. Once per encounter, ignore one opponent reveal.',
  },

  // ============================================================
  // ASHBURN RARES (24)
  // ============================================================
  'card-dialogue-ashburn-the-hyper-converged-monologue': {
    flavor: 'Compute, storage, and networking, all in one unconvincing slide.',
    description: 'Action: pitch the architecture. +3 on an infrastructure roll; if any opponent rolls below 3 this turn, they lose 1 progress.',
  },
  'card-dialogue-ashburn-invoke-shard': {
    flavor: 'There are six shards. Three of them know.',
    description: 'Action, once per game: assign a teammate\'s load to a fresh shard. They gain +3 on their next roll; you draw 1.',
  },
  'card-dialogue-ashburn-sharp-router': {
    flavor: 'BGP is a polite suggestion. This one shouted.',
    description: 'Action: reroute traffic. +3 on a standing roll; the next outage event hits one less player.',
  },
  'card-dialogue-ashburn-off-the-record-redux': {
    flavor: 'The first time was off the record too.',
    description: 'Bonus, once per game: negate the next reveal effect targeting you, then gain +3 standing for the turn.',
  },
  'card-dialogue-ashburn-smooth-failover': {
    flavor: 'The customer never noticed. The on-call did.',
    description: 'Action: deliver an unbothered briefing during an outage. +3; force one infrastructure foe to reroll its highest die.',
  },
  'card-dialogue-ashburn-invoke-fiber': {
    flavor: 'Forty-eight strands of glass. We only need one to lie.',
    description: 'Action, once per game: cite the SLA. +3 to a corporate roll; ignore one opposing reveal.',
  },
  'card-dialogue-ashburn-mirrored-bluff': {
    name: 'Mirrored Tell',
    flavor: 'Both halves of the cluster nodding in sync.',
    description: 'Action: set the posture. +3 on a corporate roll; if revealed, this card returns to hand.',
  },
  'card-dialogue-ashburn-cluster-whisperer': {
    name: 'Cluster Diplomat',
    flavor: 'She knows which node is lying and why.',
    description: 'Action: +2; reveal one opponent card the first time an infrastructure encounter resolves.',
  },
  'card-dialogue-ashburn-invoke-node': {
    flavor: 'There is always one node that has been waiting.',
    description: 'Action, once per game: bring a hot-spare online. +3 to all party members this turn.',
  },
  'card-event-ashburn-hyper-converged-convergence': {
    flavor: 'Three vendors, one stack, two lawsuits.',
    description: 'Event: when 2+ of your cards share a tag, gain +3 synergy across the chain this encounter.',
  },
  'card-insight-ashburn-edge-deployed-revelation': {
    flavor: 'The truth is in PoP-19.',
    description: 'Action: peek the next encounter; gain +2 if it shares a tag with a card in your hand.',
  },
  'card-insight-ashburn-thermal-cooled-epiphany': {
    flavor: 'The chiller stops humming. Then thinking starts.',
    description: 'Action: consume mid-roll for +3, then peek one opponent\'s hand size.',
  },
  'card-insight-ashburn-decrypt-the-fiber': {
    flavor: 'Strand seventeen has been live since 2007. Nobody told leasing.',
    description: 'Action: skip a hardware check; resolves at +2 free. Peek one opponent tag.',
  },
  'card-insight-ashburn-decrypt-the-coolant': {
    flavor: 'It was not supposed to be sixty-eight in here.',
    description: 'Action: skip an infrastructure check; resolves at +3 free. The next outage event hits one less player.',
  },
  'card-quest-ashburn-the-uptime-dilemma': {
    flavor: 'Five nines is six lies.',
    description: 'Quest. Branching. Right: +2 standing roll and a 1-turn outage shield. Wrong: lose a turn.',
  },
  'card-quest-ashburn-the-heartbeat-conspiracy': {
    flavor: 'It checked in. The other one did not. Both insist they did.',
    description: 'Quest. Three rounds chasing a phantom heartbeat. +1 per clear; on completion, +2 permanent against any infrastructure foe.',
  },
  'card-quest-ashburn-the-partition-conspiracy': {
    flavor: 'Half the cluster swears it never happened.',
    description: 'Quest. Reveal three opponent tags across three turns; on completion, gain +3 to any infrastructure roll.',
  },
  'card-quest-ashburn-breach-the-equinix-dc': {
    flavor: 'Three security tiers. One smoking-area shortcut.',
    description: 'Quest. Infiltrate a colocation across three checks. +2 per clear. Failure: lose your strongest infrastructure card.',
  },
  'card-quest-ashburn-bare-metal-rack-hunt': {
    flavor: 'Forty-two U. None of them yours, technically.',
    description: 'Quest. Track an unprovisioned rack across three rounds. +1 per clear; on completion, take 1 infrastructure card from the discard pile.',
  },
  'card-skill-ashburn-shard-mastery': {
    name: 'Shard Authority',
    flavor: 'Half the data, twice the answers.',
    description: 'Passive +2 on infrastructure rolls. Once per encounter, ignore one shard-related setback.',
  },
  'card-skill-ashburn-overclocked-bandwidth': {
    flavor: 'Above the line. Below the bill.',
    description: 'Passive +3. The first transit-tagged roll each turn gets +1 extra.',
  },
  'card-skill-ashburn-overclocked-load-balancer': {
    flavor: 'Round-robin, but it learned a few names.',
    description: 'Passive +3 on infrastructure rolls. Reduce one teammate\'s setback by 1 each turn.',
  },
  'card-skill-ashburn-overclocked-instinct': {
    flavor: 'Felt the spike before the alert fired.',
    description: 'Passive +2. Once per encounter, peek the next foe\'s primary tag.',
  },

  // ============================================================
  // CITADEL RARES (21)
  // ============================================================
  'card-artifact-citadel-monumental-gauntlet': {
    flavor: 'Bronzed. Gauntleted. Probably from a 1958 reenactment.',
    description: 'Persistent. Absorbs 2 setbacks per encounter. Counts as a status item in ceremonial encounters.',
  },
  'card-artifact-citadel-sovereign-compass': {
    flavor: 'Always points to the next press conference.',
    description: 'Persistent. +1 to every standing roll while held; +3 against political-tagged foes.',
  },
  'card-dialogue-citadel-the-sovereign-monologue': {
    flavor: 'Twelve minutes. Three jokes. One actual answer.',
    description: 'Action: deliver the talking points. +3 to a political roll; force the foe to skip its first reveal.',
  },
  'card-dialogue-citadel-invoke-amendment': {
    flavor: 'Strike "shall." Insert "may." Watch the room exhale.',
    description: 'Action, once per game: insert a tactical clause. Cancel one effect on a teammate; they gain +2 next roll.',
  },
  'card-dialogue-citadel-summit-whisperer': {
    name: 'Summit Diplomat',
    flavor: 'Knows which embassy ordered the catering.',
    description: 'Action: +2; reveal one opponent card the first time a ceremonial encounter resolves.',
  },
  'card-dialogue-citadel-invoke-summit': {
    flavor: 'Six countries. One photo. Zero policy.',
    description: 'Action, once per game: convene the room. +2 to all party members this turn.',
  },
  'card-dialogue-citadel-filibuster-and-deflect': {
    name: 'Procedural Filibuster',
    flavor: 'Talk past the moment. Past the next moment too.',
    description: 'Action: stall for time. +3 to influence; delay the next opponent encounter by one turn.',
  },
  'card-event-citadel-monumental-convergence': {
    flavor: 'Three monuments. Two ceremonies. One funding fight.',
    description: 'Event: when 2+ of your cards share a tag, gain +2 across the chain.',
  },
  'card-event-citadel-the-caucus-incident': {
    flavor: 'The room was wrong. Then the room voted.',
    description: 'Event: a vote breaks unexpectedly. All players reveal one tag; the player with the most political-tagged cards draws 1.',
  },
  'card-event-citadel-the-amendment-incident': {
    flavor: 'Sixteen words. Three offices in flames.',
    description: 'Event: an amendment surprise-passes. Each player chooses: lose 1 progress or reveal one tag.',
  },
  'card-event-citadel-hallowed-wave': {
    flavor: 'A standing ovation that lasted ninety seconds.',
    description: 'Event: triggers on region entry. All ceremonial rolls gain +3 for three turns.',
  },
  'card-insight-citadel-ratified-revelation': {
    flavor: 'It passed at 2 a.m. Most of the room was asleep.',
    description: 'Action: consume mid-roll for +3 on a clout-tagged check. Reveal one tag of the next encounter.',
  },
  'card-insight-citadel-sovereign-revelation': {
    flavor: 'The cabinet meeting was, technically, in the cabinet.',
    description: 'One-time: peek any opponent\'s hand. +2 to your next insight roll.',
  },
  'card-quest-citadel-breach-the-smithsonian': {
    flavor: 'After hours. Through the loading dock. Nothing borrowed.',
    description: 'Quest. Three security checks. +1 per clear; on completion, draw 1 historical-tagged card.',
  },
  'card-quest-citadel-the-sanction-conspiracy': {
    flavor: 'The list grew. The list always grows.',
    description: 'Quest. Track sanctioned entities across three turns. +2 per clear; on completion, +3 against diplomatic foes.',
  },
  'card-quest-citadel-filibustered-mission': {
    flavor: 'Started Monday. Still going.',
    description: 'Quest. Two clears in a row grant +3 for the rest of the encounter.',
  },
  'card-quest-citadel-breach-the-white-house': {
    flavor: 'Through the East Wing. Past the press pool.',
    description: 'Quest. Three security tiers. +2 per clear. Failure: lose your strongest political card.',
  },
  'card-quest-citadel-the-monument-dilemma': {
    flavor: 'Statue stays, name comes off. Or vice versa.',
    description: 'Quest. Branching. Right: +3 historical roll. Wrong: lose a turn.',
  },
  'card-skill-citadel-inaugurate-protocol': {
    flavor: 'Right hand on the book, left hand on the message track.',
    description: 'Action: ratify any one of your own cards: it gains +1 standing permanently.',
  },
  'card-skill-citadel-veto-protocol': {
    flavor: 'A red line. Then a redder one.',
    description: 'Action: cancel one opponent effect this turn. +3 influence on your next roll.',
  },
  'card-skill-citadel-monumental-instinct': {
    flavor: 'Knows which statue gets cleaned and when.',
    description: 'Passive +3 on ceremonial rolls. Once per encounter, treat a tied roll as a clear.',
  },

  // ============================================================
  // NEUTRAL RARES (15)
  // ============================================================
  'card-artifact-neutral-nomadic-codex': {
    flavor: 'Folded once. Refolded incorrectly. Forever.',
    description: 'Persistent. Each turn, peek one tag of your next encounter; +1 if you face it.',
  },
  'card-artifact-neutral-regional-gauntlet': {
    flavor: 'Survived three commutes a day for fifteen years.',
    description: 'Persistent. Absorbs 3 setbacks per encounter; cracks after 5 uses.',
  },
  'card-dialogue-neutral-measured-exit-ramp': {
    flavor: 'Drift right. Take the exit. Do not look back.',
    description: 'Action: clean exit. +2 hustle; cancel one transit-tagged effect on yourself.',
  },
  'card-event-neutral-traffic-jam-strikes': {
    flavor: 'Unmoving for eleven minutes. The radio knew.',
    description: 'Event: all players lose one action this turn. Players holding a transit-tagged card lose 0 instead.',
  },
  'card-event-neutral-flat-tire-strikes': {
    flavor: 'Mile marker 142. Of course it is 142.',
    description: 'Event: each player exhausts one card with the lowest hustle. Drawback shared, broadly.',
  },
  'card-insight-neutral-flash-of-rideshare': {
    flavor: 'Surge pricing. Surge clarity.',
    description: 'Action: peek your next encounter. Gain +3 if it has a transit tag.',
  },
  'card-insight-neutral-all-access-epiphany': {
    flavor: 'Lanyard works on three different campuses.',
    description: 'Action: reveal one of your cards to gain +2 against any one foe this encounter.',
  },
  'card-quest-neutral-the-interchange-dilemma': {
    flavor: 'Three exits in two hundred yards. Pick.',
    description: 'Quest. Branching. Right: +2 hustle and one extra action. Wrong: lose a turn.',
  },
  'card-quest-neutral-the-rush-hour-dilemma': {
    flavor: 'Eight a.m. Or eight-fifteen. Same difference.',
    description: 'Quest. Branching. Right: +2 influence, draw 1. Wrong: discard 1.',
  },
  'card-quest-neutral-the-traffic-dilemma': {
    flavor: 'Express or HOV. Pick before the split.',
    description: 'Quest. Branching. Right path: +3 hustle. Wrong path: skip your next action.',
  },
  'card-skill-neutral-expert-interchange-handler': {
    name: 'Springfield Mixing Bowl Native',
    flavor: 'Knows which lane becomes exit-only without warning.',
    description: 'Action: +3 to transit rolls. Stacks with region bonuses.',
  },
  'card-skill-neutral-route-66-savvy': {
    name: 'Route 66 Block-Walker',
    flavor: 'Knows the alleys, the shortcuts, the dead-ends.',
    description: 'One-time passive: +2 to all rolls in Neutral regions for the rest of the game.',
  },
  'card-skill-neutral-detour-protocol': {
    flavor: 'Off the highway. Past the dry cleaner. Around.',
    description: 'Action: reroute around a transit-tagged event. Skip its trigger; +3 hustle.',
  },
  'card-skill-neutral-coffee-run-mastery': {
    name: 'Quiet Coffee Run Pro',
    flavor: 'Six orders. Three modifiers. One missing oat milk.',
    description: 'Passive +3 on standing rolls. Once per encounter, draw 1 if you complete a transit-tagged roll.',
  },
  'card-skill-neutral-gridlocked-coffee-run': {
    flavor: 'The latte arrives warm. The meeting started cold.',
    description: 'Action: deliver despite the jam. +3 hustle; if you cleared a transit roll this encounter, also gain +1 standing.',
  },

  // ============================================================
  // RESTON RARES (24)
  // ============================================================
  'card-artifact-reston-lake-anne-keystone': {
    name: 'Lake Anne Co-Op Key',
    flavor: 'Hangs by the door of every co-op since 1965.',
    description: 'Persistent place-anchor. While in Reston, your standing rolls double. Base +3.',
  },
  'card-artifact-reston-containerized-talisman': {
    flavor: 'Statelessness as a virtue. Mostly.',
    description: 'Persistent. Bonus, short rest: spin a fresh container. +2 to any one roll.',
  },
  'card-artifact-reston-innovation-center-keystone': {
    name: 'Innovation Center Founder\'s Coin',
    flavor: 'Minted in 2014. Worth less every quarter.',
    description: 'Persistent. While in Reston, +1 to all rolls; first cunning roll each encounter gets +2 extra.',
  },
  'card-dialogue-reston-invoke-deployment': {
    flavor: 'Click. The room held its breath.',
    description: 'Action, once per game: ship the change. +3 to all party members this turn.',
  },
  'card-dialogue-reston-the-agile-monologue': {
    flavor: 'Velocity is up. So is the technical debt.',
    description: 'Action: pitch the sprint. +2 influence; reveal one opponent card if a debugging-tagged encounter is active.',
  },
  'card-dialogue-reston-optimize-and-deflect': {
    name: 'Optimize Around It',
    flavor: 'The bug is fine. Build the rest faster.',
    description: 'Action: sidestep cleanly. +2 cunning; the next foe takes the unoptimized path (+1 against them).',
  },
  'card-dialogue-reston-refactor-whisperer': {
    name: 'Refactor Insider',
    flavor: 'Has read every TODO in the repo.',
    description: 'Action: read the room. +2; reveal one opponent card the first time a debugging encounter resolves.',
  },
  'card-dialogue-reston-refactor-and-deflect': {
    name: 'Refactor the Blast Radius',
    flavor: 'Wrap the broken module. Pretend it was always like this.',
    description: 'Action: reduce the next hit by 3; the foe touches only the wrapped module (+1 against them next turn).',
  },
  'card-event-reston-dulles-corridor-lockdown': {
    name: 'Dulles Corridor Cordoned',
    flavor: 'Construction season. Construction season is every season.',
    description: 'Area event: Dulles Corridor sealed for two turns. Players inside gain +3; outside players cannot draw transit cards.',
  },
  'card-event-reston-lake-anne-lockdown': {
    name: 'Lake Anne on Hold',
    flavor: 'Plaza closed. Geese unimpressed.',
    description: 'Area event: Lake Anne sealed for two turns. Players inside gain +3 standing; outside players lose 1 action per turn.',
  },
  'card-event-reston-the-incident-incident': {
    flavor: 'The incident about the incident is itself an incident.',
    description: 'Event, once per game: cascade. Reveal three of your tags; gain +3 standing against any foe matching one of them this encounter.',
  },
  'card-event-reston-innovation-center-lockdown': {
    name: 'Innovation Center on Hold',
    flavor: 'All-hands moved to Q2. Q2 was already full.',
    description: 'Area event: Innovation Center sealed. Inside players gain +2; outside players cannot draw deployment cards.',
  },
  'card-event-reston-scalable-wave': {
    flavor: 'Up and to the right. As predicted, by some.',
    description: 'Event: triggers on region entry. All cunning rolls gain +2 for three turns.',
  },
  'card-event-reston-fault-tolerant-storm': {
    flavor: 'Three replicas. One survived. Good enough.',
    description: 'Event: an outage ripples through. Players with a persistent-tagged card take 0; others take 2.',
  },
  'card-insight-reston-flash-of-kernel': {
    name: 'Kernel Clarity',
    flavor: 'Ring zero. Ring nothing.',
    description: 'Action: peek the next encounter; gain +2 if it shares any debugging tag.',
  },
  'card-quest-reston-open-source-hotfix-hunt': {
    flavor: 'Cherry-pick the patch. Pretend you wrote it.',
    description: 'Quest. Three rounds tracking an upstream fix. +1 per clear; on completion, take 1 debugging card from the discard pile.',
  },
  'card-quest-reston-the-incident-dilemma': {
    flavor: 'P0 or P1. Pick before the next page fires.',
    description: 'Quest. Branching. Right: +3 cunning. Wrong: lose 1 progress and reveal your hand.',
  },
  'card-skill-reston-expert-hotfix-handler': {
    name: 'Hotfix Specialist',
    flavor: 'Ships at 4:55. Reverts at 5:05. Re-ships at 5:15.',
    description: 'Action: +3 to debugging rolls. Stacks with region bonuses.',
  },
  'card-skill-reston-true-benchmark': {
    flavor: 'On the right hardware, on the right Tuesday.',
    description: 'Action: declare the criteria first. +3 to a standing roll; if it clears, draw 1.',
  },
  'card-skill-reston-scale-protocol': {
    flavor: 'Auto-scale set to suspicious-but-working.',
    description: 'Action: +3 cunning. The first multi-step quest each encounter advances 1 extra step.',
  },
  'card-skill-reston-expert-deployment-handler': {
    name: 'Release Engineer',
    flavor: 'Owns the button. Pretends not to.',
    description: 'Action: +2 cunning. Once per encounter, reduce the next deployment-tagged setback by 2.',
  },
  'card-skill-reston-expert-standup-handler': {
    name: 'Standup Filibuster',
    flavor: 'Fifteen minutes scheduled. Forty-two delivered.',
    description: 'Bonus, once per game: stall for time. The next opponent skips one reveal; +3 standing this turn.',
  },
  'card-skill-reston-recursive-payload': {
    flavor: 'The fix introduces the bug that the fix fixes.',
    description: 'Passive +2 on standing rolls. The first debugging-tagged roll each encounter gains +1 extra.',
  },
  'card-skill-reston-handshake-mastery': {
    name: 'Handshake Veteran',
    flavor: 'TLS, OAuth, and the kind that closes deals.',
    description: 'Passive +2 standing. Once per encounter, treat any networking encounter as if it shared one extra tag.',
  },
  'card-skill-reston-innovation-center-savvy': {
    name: 'Innovation Center Block-Walker',
    flavor: 'Knows the floors that have free coffee, by quarter.',
    description: 'One-time passive: +2 to all rolls in Reston for the rest of the game.',
  },

  // ============================================================
  // TYSONS RARES (23)
  // ============================================================
  'card-artifact-tysons-wolf-trap-keystone': {
    name: 'Wolf Trap Box-Seat Token',
    flavor: 'Section A. Aisle. Forever.',
    description: 'Persistent place-anchor. While in Tysons, your standing rolls double. Base +2.',
  },
  'card-artifact-tysons-brunch-amplifier': {
    flavor: 'Bottomless mimosas. Top-shelf intel.',
    description: 'Persistent. Each turn, the first networking-tagged roll gains +2 extra.',
  },
  'card-artifact-tysons-contract-amplifier': {
    flavor: 'Sixty-four pages. Two of them matter.',
    description: 'Persistent. The first influence roll each encounter gains +2; cracks after 5 contracts signed.',
  },
  'card-artifact-tysons-platinum-compass': {
    flavor: 'Always points to the senior partner.',
    description: 'Persistent. +1 every turn while held; +3 against any corporate-tagged foe.',
  },
  'card-dialogue-tysons-invoke-prospectus': {
    flavor: 'Page seven, paragraph four, footnote two.',
    description: 'Action, once per game: cite the prospectus. Cancel one financial effect; +3 influence.',
  },
  'card-dialogue-tysons-stakeholder-whisperer': {
    name: 'Quiet Authority on Stakeholders',
    flavor: 'Knows which stakeholder will escalate. And to whom.',
    description: 'Action: +3 to influence rolls; reveal one opponent card the first time a corporate encounter resolves.',
  },
  'card-dialogue-tysons-read-the-fine-print-iii': {
    flavor: 'It was on page eighty-three. He read it on page two.',
    description: 'Bonus, once per game: invoke the buried clause. Cancel one corporate effect targeting you.',
  },
  'card-event-tysons-capital-one-hq-lockdown': {
    name: 'Capital One HQ Sealed',
    flavor: 'Mason jars in the cafeteria. Lockdown in the lobby.',
    description: 'Area event: Capital One HQ sealed for two turns. Inside players gain +2 influence; outside players cannot draw corporate cards.',
  },
  'card-event-tysons-bad-press-strikes': {
    name: 'Bad Press Lashes Out',
    flavor: 'Cover story. By 6 p.m. it was the lead.',
    description: 'Event: a story breaks. All players lose 2 standing temporarily; press-tagged holders lose 0.',
  },
  'card-event-tysons-whistleblower-strikes': {
    name: 'Whistleblower, Right on Schedule',
    flavor: 'Q4 earnings. Q1 testimony.',
    description: 'Event: a leak lands. Each player reveals one tag; the player with the most clearance-tagged cards takes -1 standing.',
  },
  'card-insight-tysons-decrypt-the-lobby': {
    flavor: 'Two buttons. Both go to the same floor.',
    description: 'Action: skip a corporate check; resolves at +2 free. Peek any opponent\'s hand size.',
  },
  'card-insight-tysons-hostile-epiphany': {
    flavor: 'Friendly takeover. Until the term sheet.',
    description: 'Action: consume mid-roll for +3 influence; force the next corporate foe to reveal one tag.',
  },
  'card-insight-tysons-influential-epiphany': {
    flavor: 'A favor unspoken is a favor secured.',
    description: 'Action: peek your next encounter and gain +2 if it has any influence-relevant tag.',
  },
  'card-skill-tysons-deep-merger': {
    flavor: 'Approved by the board. Disapproved by accounting.',
    description: 'Passive +2. The first corporate-tagged roll each encounter gains +1 extra.',
  },
  'card-skill-tysons-iron-golden-parachute': {
    flavor: 'Cliff at four years. Glide at thirty.',
    description: 'Passive +3 standing. Once per game, ignore the next discard effect targeting you.',
  },
  'card-skill-tysons-dividend-mastery': {
    name: 'Dividend Veteran',
    flavor: 'Quarterly. Reinvested. Untouchable.',
    description: 'Passive +2 standing. Once per encounter, draw 1 when you clear a corporate roll.',
  },
  'card-skill-tysons-hostile-leverage': {
    flavor: 'You only have to threaten once. If you do it right.',
    description: 'Passive +2. Once per encounter, force one foe to reveal a tag.',
  },
  'card-skill-tysons-capital-one-hq-savvy': {
    name: 'Capital One HQ Local',
    flavor: 'Walks the lobby like she owns the floor. (She owns the floor.)',
    description: 'One-time passive: +2 to all influence rolls in Tysons for the rest of the game.',
  },
  'card-skill-tysons-wolf-trap-savvy': {
    name: 'Lifelong Wolf Trap Resident',
    flavor: 'Tailgate. Then the box seat. Then the after-after-party.',
    description: 'One-time passive: +2 standing in Tysons for the rest of the game.',
  },
  'card-skill-tysons-quick-brunch': {
    name: 'Sunday Brunch Pivot',
    flavor: 'Bottomless mimosas. Top-shelf intel.',
    description: 'Action: +2 standing. The first networking-tagged encounter this turn gains +1 extra.',
  },
  'card-skill-tysons-tysons-galleria-savvy': {
    name: 'Tysons Galleria Regular',
    flavor: 'Lap one is recon. Lap two is the deal.',
    description: 'One-time passive: +2 influence in Tysons for the rest of the game.',
  },
  'card-skill-tysons-gilded-prospectus': {
    flavor: 'Paper. Embossed. Printed only on Wednesdays.',
    description: 'Passive +2 standing. The first corporate roll each encounter cannot be reduced below +1.',
  },
  'card-skill-tysons-vested-golden-parachute': {
    flavor: 'Four years vested. Eternally tax-advantaged.',
    description: 'Passive +3 standing. Once per game, prevent your strongest card from being discarded.',
  },

  // ============================================================
  // ARLINGTON UNCOMMONS (34)
  // ============================================================
  'card-artifact-arlington-encrypted-gauntlet': {
    flavor: 'Locked. Counter-locked. Triple-locked.',
    description: 'Persistent. Absorbs 2 setbacks per encounter; cracks after 5.',
  },
  'card-artifact-arlington-the-oath-engine': {
    flavor: 'Sworn once. Re-sworn quarterly.',
    description: 'Persistent. +1 to every standing roll while held.',
  },
  'card-artifact-arlington-ironclad-token': {
    name: 'TS/SCI Lanyard',
    flavor: 'Heavier than it looks.',
    description: 'Persistent. Bonus, short rest: +2 to any one roll requiring a clearance tag.',
  },
  'card-artifact-arlington-the-protocol-engine': {
    flavor: 'Documented. Versioned. Largely ignored.',
    description: 'Persistent. +2 standing on the first roll of each turn.',
  },
  'card-artifact-arlington-strategic-badge': {
    name: 'Compartmented Briefing Slip',
    flavor: 'Initial here. And here. Then forget you saw it.',
    description: 'Passive +1 to all clearance rolls while held.',
  },
  'card-dialogue-arlington-invoke-mandate': {
    name: 'Invoke Directive',
    flavor: 'Standing order. Not for discussion.',
    description: 'Action, long rest: bring everyone to heel. +1 to all party members for the encounter.',
  },
  'card-dialogue-arlington-encrypt-and-deflect': {
    name: 'Burner Phone Pivot',
    flavor: 'New number. Same handler.',
    description: 'Action: switch channels mid-conversation. Reduce the next hit by 1; the next foe trips on the rerouted call.',
  },
  'card-dialogue-arlington-between-us': {
    flavor: 'The Pentagon has corridors that loop back on you on purpose.',
    description: 'Bonus, once per game: peek any opponent\'s next two encounters.',
  },
  'card-dialogue-arlington-the-clandestine-monologue': {
    flavor: 'Six paragraphs. None on the record.',
    description: 'Action: deliver discreetly. +2 clout; the foe must skip its first reveal.',
  },
  'card-dialogue-arlington-the-authorized-monologue': {
    flavor: 'Pre-approved by Legal. Twice.',
    description: 'Action: speak with sanction. +2 standing; the next foe loses 1 progress.',
  },
  'card-dialogue-arlington-bold-sentry': {
    flavor: 'Posts at the gate. Listens at the door.',
    description: 'Action: stand between teammate and trouble. +2; absorb the first 1 setback aimed at a teammate this turn.',
  },
  'card-insight-arlington-hardened-revelation': {
    name: 'Redacted Footnote',
    flavor: 'The black bar is the document.',
    description: 'One-time: peek any opponent tag and gain +2 against them on the next roll.',
  },
  'card-insight-arlington-fortified-epiphany': {
    flavor: 'A fact you remembered just in time.',
    description: 'Action: consume mid-roll for +2; reveal one of your own tags to copy it onto the encounter.',
  },
  'card-insight-arlington-flash-of-summons': {
    name: 'Summons Clarity',
    flavor: 'Hand-delivered. Ten minutes ago.',
    description: 'Action: peek the next encounter; +2 if it shares any clearance tag.',
  },
  'card-insight-arlington-the-tribunal-gambit': {
    flavor: 'Pleading the fifth before being asked.',
    description: 'All-or-nothing: declare before rolling. +3 on a clout clear, -2 on a miss.',
  },
  'card-insight-arlington-covert-revelation': {
    flavor: 'Walked through three lobbies to deliver one envelope.',
    description: 'Action: consume mid-roll for +2; the next opponent reveal is silent (effect skipped).',
  },
  'card-insight-arlington-flash-of-badge': {
    name: 'Badge Snap',
    flavor: 'Flick the wallet open. Wait two seconds. Move.',
    description: 'Action: peek the next encounter\'s difficulty. Gain +1 against it.',
  },
  'card-quest-arlington-the-debrief-conspiracy': {
    flavor: 'Every memo has a hidden directive.',
    description: 'Quest. Three rounds reading between the lines. +1 per clear; on completion, copy one tag from any revealed foe.',
  },
  'card-quest-arlington-confront-the-sleeper-cell': {
    name: 'Quash Sleeper Cell',
    flavor: 'They were on the second floor the whole time.',
    description: 'Long-rest quest. Three rounds against Sleeper Cell. +2 per clear; on completion, gain +2 permanent against surveillance foes.',
  },
  'card-quest-arlington-the-cipher-dilemma': {
    flavor: 'Two letters of the alphabet missing.',
    description: 'Quest. Branching. Right: +2 clout, draw 1. Wrong: lose 1 progress.',
  },
  'card-quest-arlington-the-directive-affair': {
    flavor: 'One memo, one signature, one career.',
    description: 'Quest. Two-step. Each clear grants +1 clout for the rest of the encounter.',
  },
  'card-quest-arlington-the-sanction-trail': {
    flavor: 'Follow the wire. Then the wire-thin lawyer.',
    description: 'Quest. Track three transactions across three turns. +1 per clear.',
  },
  'card-quest-arlington-hardened-expedition': {
    name: 'Pentagon Loop Recon',
    flavor: 'A walk that becomes a run-around.',
    description: 'Long-rest quest. Multi-step. Two clears grant +2 modifier for the rest of the encounter.',
  },
  'card-quest-arlington-the-badge-trail': {
    flavor: 'Three lobbies. Two elevators. One badge.',
    description: 'Quest. Track a missing badge across three rounds. +1 per clear.',
  },
  'card-skill-arlington-debrief-protocol': {
    flavor: 'After-action. Before-question.',
    description: 'Action: +2 clout. The next foe must skip its first reveal.',
  },
  'card-skill-arlington-classified-dossier': {
    flavor: 'Folded twice. Read once.',
    description: 'Action: +1 standing. Reveal one of your tags to gain +1 extra this turn.',
  },
  'card-skill-arlington-deep-directive': {
    flavor: 'Written before any of the principals were born.',
    description: 'Passive +1 standing. Once per encounter, treat a tied roll as a clear if it has a clearance tag.',
  },
  'card-skill-arlington-armored-summons': {
    name: 'Cleared Caller',
    flavor: 'They know who is asking. Eventually.',
    description: 'Passive +1 to encounters involving security checks.',
  },
  'card-skill-arlington-fortify-protocol': {
    flavor: 'Walls up. Then a second wall behind that.',
    description: 'Action: +1 standing; reduce the next setback aimed at you by 1.',
  },
  'card-skill-arlington-expert-sentry-handler': {
    name: 'Pentagon Sentry',
    flavor: 'You will pause at the line. You will not see the line.',
    description: 'Action: +1 to government rolls. Stacks with region bonuses.',
  },
  'card-skill-arlington-quick-warrant': {
    name: 'FISA Fast-Track',
    flavor: 'Stamped before the coffee cools.',
    description: 'Passive +2 to military and security encounters.',
  },
  'card-skill-arlington-sentry-mastery': {
    name: 'Ten-Year Sentry Hand',
    flavor: 'Same post. Same look. Same pause.',
    description: 'Passive +2 standing. Once per encounter, ignore one opponent reveal.',
  },
  'card-skill-arlington-debrief-mastery': {
    name: 'Debrief Authority',
    flavor: 'Asks the second question. The third too.',
    description: 'Passive +1 standing. Once per encounter, draw 1 if you clear a clearance roll.',
  },
  'card-skill-arlington-deep-warrant': {
    flavor: 'Six pages. Three judges. Two lifetimes ago.',
    description: 'Passive +2 standing. Once per encounter, peek the next surveillance-tagged foe.',
  },

  // ============================================================
  // ASHBURN UNCOMMONS (37)
  // ============================================================
  'card-artifact-ashburn-aws-east-keystone': {
    name: 'us-east-1 Root Account Token',
    flavor: 'One credential. Forty regions. Zero MFA.',
    description: 'Persistent place-anchor. While in Ashburn, your standing rolls double. Base +2.',
  },
  'card-artifact-ashburn-ups-amplifier': {
    flavor: 'Twelve hundred bricks of lead-acid optimism.',
    description: 'Persistent. The first power-loss event each game is reduced by 2.',
  },
  'card-artifact-ashburn-the-backup-engine': {
    flavor: 'Tested last in 2019. Mostly tested.',
    description: 'Persistent. Once per encounter, restore one teammate\'s discarded card to hand.',
  },
  'card-artifact-ashburn-the-heartbeat-engine': {
    flavor: 'Pings every second. Lies every other.',
    description: 'Persistent. +2 standing on the first roll each turn.',
  },
  'card-artifact-ashburn-equinix-dc-keystone': {
    name: 'Equinix Crossconnect Tag',
    flavor: 'Cage 47. Port 12. Don\'t touch the green one.',
    description: 'Persistent place-anchor. While in Ashburn, your influence rolls double. Base +2.',
  },
  'card-artifact-ashburn-load-balancer-amplifier': {
    flavor: 'Hashed by IP. Re-hashed by need.',
    description: 'Persistent. Each turn, redistribute one teammate\'s setback by 1.',
  },
  'card-dialogue-ashburn-the-enterprise-grade-monologue': {
    flavor: 'Three slides per syllable.',
    description: 'Action: pitch the architecture. +2 standing; reveal one opponent tag if any infrastructure encounter is active.',
  },
  'card-dialogue-ashburn-invoke-load-balancer': {
    flavor: 'Round-robin, but it learned a few names.',
    description: 'Action, once per game: redistribute. Each teammate gains +1 for the encounter.',
  },
  'card-dialogue-ashburn-provision-and-deflect': {
    name: 'Spin a Standby',
    flavor: 'New region. Same problem. New region anyway.',
    description: 'Action: provision a parallel path. Reduce the next hit by 1; the next foe queues behind it.',
  },
  'card-dialogue-ashburn-mirrored-persuasion': {
    flavor: 'Two readers. Same conclusion. Different rooms.',
    description: 'Action: +2 standing; reveal one of your tags to also reveal it on the next foe.',
  },
  'card-dialogue-ashburn-failover-and-deflect': {
    name: 'Hot-Site Pivot',
    flavor: 'Cut to the hot site. Pretend it was always hot.',
    description: 'Action: switch the spotlight. Reduce the next hit by 2; the foe takes traffic instead.',
  },
  'card-dialogue-ashburn-throttle-and-deflect': {
    name: 'Rate-Limit the Hit',
    flavor: 'They will get through. Just slower.',
    description: 'Action: throttle the inbound. Reduce the next hit by 2; the foe queues for it.',
  },
  'card-dialogue-ashburn-load-balancer-whisperer': {
    name: 'Load Balancer Insider',
    flavor: 'Knows which node is lying and why.',
    description: 'Action: +1 influence; reveal one tag the first time an infrastructure encounter resolves.',
  },
  'card-event-ashburn-data-center-alley-lockdown': {
    name: 'Data Center Alley on Hold',
    flavor: 'Power maintenance. Or so they told the tenants.',
    description: 'Area event: Data Center Alley sealed. Inside players gain +2 standing; outside players lose 1 action.',
  },
  'card-event-ashburn-colocated-convergence': {
    flavor: 'Same rack. Same SLA. Same bill.',
    description: 'Event: when 2+ of your cards share a tag, gain +1 across the chain.',
  },
  'card-event-ashburn-data-corruption-strikes': {
    name: 'Data Corruption Lands',
    flavor: 'The hash mismatched. Every hash mismatched.',
    description: 'Event: each player exhausts their lowest-standing card.',
  },
  'card-event-ashburn-enterprise-grade-surge': {
    flavor: 'Enterprise pricing. Enterprise excuses.',
    description: 'Event: triggers on region entry. Standing rolls gain +1 for three turns.',
  },
  'card-event-ashburn-equinix-dc-lockdown': {
    name: 'Equinix DC on Hold',
    flavor: 'Two-factor through the mantrap. Each time.',
    description: 'Area event: Equinix DC sealed. Inside players gain +2 standing; outside players cannot draw infrastructure cards.',
  },
  'card-event-ashburn-the-rack-incident': {
    flavor: 'Forty-two U. Forty-two unhappy customers.',
    description: 'Event, once per game: a rack burns out. The player with the most infrastructure cards loses one of them.',
  },
  'card-insight-ashburn-decrypt-the-heartbeat': {
    flavor: 'It pinged. The other one didn\'t.',
    description: 'Action: skip an infrastructure check; resolves at +2 free. Peek the next outage event.',
  },
  'card-insight-ashburn-redundant-revelation': {
    flavor: 'The other one was also broken. We just hadn\'t noticed.',
    description: 'Action: reveal two of your cards; gain +1 if they share a tag.',
  },
  'card-insight-ashburn-the-node-gambit': {
    flavor: 'Half the cluster, twice the confidence.',
    description: 'All-or-nothing: declare before rolling. +3 on a clear, -2 on a miss.',
  },
  'card-insight-ashburn-the-coolant-gambit': {
    flavor: 'Pull the chiller. Hope.',
    description: 'All-or-nothing: declare before rolling. +3 if the next outage misses, -2 if it lands.',
  },
  'card-insight-ashburn-hardwired-epiphany': {
    flavor: 'It is wired. It is plugged. It still doesn\'t work.',
    description: 'Action: peek the next encounter; +1 if it has any infrastructure tag.',
  },
  'card-insight-ashburn-air-gapped-revelation': {
    flavor: 'No network. No problem. No fix either.',
    description: 'Action: consume mid-roll for +1; ignore one opposing reveal effect.',
  },
  'card-insight-ashburn-the-redundancy-gambit': {
    flavor: 'Two of everything. Twice the failure modes.',
    description: 'Action: peek the next encounter; gain +1 against it. If it shares an infrastructure tag, gain +2 instead.',
  },
  'card-quest-ashburn-the-heartbeat-dilemma': {
    flavor: 'Pulse missing. Or maybe just the cable.',
    description: 'Quest. Branching. Right: +1 standing and a 1-turn outage shield. Wrong: lose 1 progress.',
  },
  'card-quest-ashburn-mirrored-operation': {
    flavor: 'Active-active. Until it isn\'t.',
    description: 'Quest. Two-step. Each clear grants +1 standing for the rest of the encounter.',
  },
  'card-quest-ashburn-breach-the-aws-east': {
    flavor: 'us-east-1 is a state of mind.',
    description: 'Quest. Three security tiers. +1 per tier; on completion, gain +2 against any cloud foe.',
  },
  'card-quest-ashburn-the-fiber-conspiracy': {
    flavor: 'Twelve strands lit. Six in use. The other six know things.',
    description: 'Quest. Reveal three opponent tags across three turns; on completion, +2 to any infrastructure roll.',
  },
  'card-skill-ashburn-provision-protocol': {
    flavor: 'Spin it up. Tear it down. Get the bill anyway.',
    description: 'Action: +2 standing. Once per encounter, treat a hardware roll as if it shared one extra tag.',
  },
  'card-skill-ashburn-switch-mastery': {
    name: 'Career Switch Specialist',
    flavor: 'Knows the layer. Knows the layers above.',
    description: 'Passive +1 standing. Once per encounter, ignore one infrastructure setback.',
  },
  'card-skill-ashburn-air-gapped-instinct': {
    flavor: 'No telemetry. Felt it anyway.',
    description: 'Passive +2. Once per encounter, peek the next foe\'s primary tag.',
  },
  'card-skill-ashburn-deep-backup': {
    flavor: 'Tape archive in a salt mine. Just in case.',
    description: 'Action: +1 standing. Once per game, restore one of your discarded cards to hand.',
  },
  'card-skill-ashburn-coolant-mastery': {
    name: 'Coolant Authority',
    flavor: 'Knows which loop to bleed and when.',
    description: 'Passive +1 standing. Once per encounter, reduce the next overheat-tagged setback by 2.',
  },
  'card-skill-ashburn-edge-deployed-cluster': {
    flavor: 'Latency in the single digits. Mostly.',
    description: 'Passive +2 standing. Once per encounter, the first transit-tagged roll gains +1.',
  },
  'card-skill-ashburn-shielded-instinct': {
    flavor: 'Behind the firewall. Behind that, another firewall.',
    description: 'Passive +1 standing. Once per encounter, reduce the next hit by 1.',
  },
  'card-skill-ashburn-deep-router': {
    flavor: 'Knows which packet asked for it.',
    description: 'Passive +2 standing. Once per encounter, peek the next infrastructure encounter\'s tags.',
  },
  'card-skill-ashburn-fiber-lit-router': {
    flavor: 'Single-mode. Multi-purpose.',
    description: 'Passive +2 standing. Each transit-tagged roll gains +1 for the first turn.',
  },

  // ============================================================
  // CITADEL UNCOMMONS (22)
  // ============================================================
  'card-artifact-citadel-inaugurated-compass': {
    flavor: 'Stayed pointing east. The administration didn\'t.',
    description: 'Persistent. +1 every turn while held; +2 against any ceremonial foe.',
  },
  'card-dialogue-citadel-bipartisan-charm': {
    name: 'Bipartisan Pitch',
    flavor: 'Both sides annoyed. Neither side disagreeing.',
    description: 'Action: open the floor. +2 influence; on a clear, draw 1.',
  },
  'card-dialogue-citadel-the-electrified-monologue': {
    flavor: 'Trended for ninety seconds. Forever in the archives.',
    description: 'Action: rile the room. +1 influence; the next foe loses 1 progress.',
  },
  'card-dialogue-citadel-executive-order-whisperer': {
    name: 'Quiet Authority on Executive Orders',
    flavor: 'Knows which one is signed. Knows which is just talk.',
    description: 'Action: +1 influence; reveal one tag of the next ceremonial encounter.',
  },
  'card-dialogue-citadel-the-bipartisan-monologue': {
    flavor: 'Twelve minutes. Three jokes. One actual answer.',
    description: 'Action: thread the needle. +2 influence; if any opponent has a press-tagged card, also reveal it.',
  },
  'card-dialogue-citadel-between-us-mk2': {
    flavor: 'Same room. Different decade.',
    description: 'Bonus, once per game: peek any opponent\'s next two encounters.',
  },
  'card-dialogue-citadel-sharp-inauguration': {
    flavor: 'Right hand on the book. Left hand on the message track.',
    description: 'Action: deliver a sworn-in speech. +2 influence; gain +1 standing for the next two turns.',
  },
  'card-event-citadel-filibustered-eruption': {
    flavor: 'Started on Tuesday. Ended sometime later.',
    description: 'Event: triggers on region entry. Influence rolls gain +1 for three turns.',
  },
  'card-event-citadel-the-quorum-incident': {
    flavor: 'Two members short. Three excuses long.',
    description: 'Event: a vote falls apart. Each player exhausts one card; the player with most political-tagged cards picks who.',
  },
  'card-insight-citadel-decrypt-the-summit': {
    flavor: 'Six countries. Five interpreters. One narrative.',
    description: 'Action: skip a ceremonial check; resolves at +2 free. The next encounter starts at +1.',
  },
  'card-insight-citadel-the-filibuster-gambit': {
    flavor: 'The clock ran out. So did the metaphor.',
    description: 'All-or-nothing: declare before rolling. +3 if you stall the foe\'s next turn, -1 if not.',
  },
  'card-insight-citadel-decrypt-the-embargo': {
    flavor: 'The story leaks before the embargo. Always.',
    description: 'Action: skip a press check; resolves at +2 free. Peek any opponent\'s hand size.',
  },
  'card-insight-citadel-unconstitutional-revelation': {
    flavor: 'Pleaded the fifth before being asked.',
    description: 'Bonus, once per game: peek any one opponent\'s entire hand.',
  },
  'card-insight-citadel-embargoed-revelation': {
    flavor: 'Off the record at six. On every cable at six-fifteen.',
    description: 'Action: consume mid-roll for +2 influence; reveal one tag of every active encounter.',
  },
  'card-insight-citadel-diplomatic-revelation': {
    flavor: 'A back-channel that became the channel.',
    description: 'Action: peek the next encounter; gain +2 if it shares any diplomatic tag.',
  },
  'card-quest-citadel-confront-the-foreign-agent': {
    name: 'Counter Foreign Agent',
    flavor: 'They were here for the Cherry Blossom Festival, allegedly.',
    description: 'Long-rest quest. Three rounds against Foreign Agent. +1 per clear; on completion, +2 against any clearance foe.',
  },
  'card-quest-citadel-ratified-assignment': {
    flavor: 'A bill, an amendment, a footnote. In that order.',
    description: 'Quest. Two-step. Each clear grants +1 standing for the rest of the encounter.',
  },
  'card-quest-citadel-breach-the-k-street': {
    flavor: 'Past the lobbies. Past the lobbyists.',
    description: 'Quest. Three security checks. +1 per clear; on completion, draw 1 lobbying-tagged card.',
  },
  'card-quest-citadel-confront-the-electoral-upset': {
    name: 'Stand Down Electoral Upset',
    flavor: 'County by county. Spreadsheet by spreadsheet.',
    description: 'Long-rest quest. Three rounds against Electoral Upset. +1 per clear; on completion, +2 against any political foe.',
  },
  'card-quest-citadel-breach-the-capitol-hill': {
    flavor: 'Past the Capitol police. Past the Capitol police museum.',
    description: 'Quest. Three security tiers. +2 per tier; on completion, draw 1 political card.',
  },
  'card-quest-citadel-the-inauguration-dilemma': {
    flavor: 'Cold day. Hot speech. Long parade.',
    description: 'Quest. Branching. Right: +2 influence and draw 1. Wrong: lose 1 progress.',
  },
  'card-quest-citadel-sovereign-quorum-hunt': {
    flavor: 'Five votes short. Eight calls long.',
    description: 'Quest. Track three undecideds across three rounds. +1 per clear.',
  },
  'card-quest-citadel-bipartisan-expedition': {
    flavor: 'A field trip everybody pretends went well.',
    description: 'Quest. Two-step. Each clear grants +1 influence for the rest of the encounter.',
  },
  'card-skill-citadel-ratified-pardon': {
    flavor: 'Signed Friday. Read about Saturday.',
    description: 'Action: cancel one effect on a teammate. They draw 1.',
  },
  'card-skill-citadel-k-street-savvy': {
    name: 'Knows K Street Backward',
    flavor: 'Friday lunch is recon. Friday dinner is the deal.',
    description: 'One-time passive: +2 to all rolls in Citadel for the rest of the game.',
  },
  'card-skill-citadel-capitol-hill-savvy': {
    name: 'Knows Capitol Hill Backward',
    flavor: 'Knows the staffer-secret restaurants by office number.',
    description: 'One-time passive: +1 influence in Citadel for the rest of the game.',
  },
  'card-skill-citadel-keen-diplomat': {
    flavor: 'Two languages. Three silences.',
    description: 'Passive +1 standing. Once per encounter, treat a tied diplomatic roll as a clear.',
  },
  'card-skill-citadel-ceremonial-instinct': {
    flavor: 'Knows when to stand. Knows when to sit faster.',
    description: 'Passive +2 standing. The first ceremonial-tagged roll each encounter gains +1.',
  },
  'card-skill-citadel-inauguration-mastery': {
    name: 'Career Inauguration Specialist',
    flavor: 'Five sworn-in. Six retired. Counts only the first number.',
    description: 'Passive +2 standing. Once per encounter, draw 1 if you clear a ceremonial roll.',
  },

  // ============================================================
  // NEUTRAL UNCOMMONS (29)
  // ============================================================
  'card-artifact-neutral-tysons-corner-mall-keystone': {
    name: 'Galleria Concierge Key',
    flavor: 'Opens the back hallway. The one with the mannequins.',
    description: 'Persistent place-anchor. While in Neutral regions, your standing rolls double. Base +2.',
  },
  'card-artifact-neutral-the-happy-hour-engine': {
    flavor: 'Three drinks deep. Two stories deeper.',
    description: 'Persistent. The first networking-tagged roll each turn gains +1.',
  },
  'card-artifact-neutral-rush-hour-amplifier': {
    flavor: 'The whole region, slowly, in unison.',
    description: 'Persistent. Each turn, the first transit-tagged roll gains +1 extra.',
  },
  'card-artifact-neutral-the-suburb-engine': {
    flavor: 'Two-car garage. Three commuters somehow.',
    description: 'Persistent. +1 every turn while held.',
  },
  'card-artifact-neutral-rideshare-amplifier': {
    flavor: 'Surge pricing. Surge clarity.',
    description: 'Persistent. Each turn, draw 1 if you cleared a transit roll last turn.',
  },
  'card-artifact-neutral-exit-ramp-amplifier': {
    flavor: 'Two-tenths past the sign. Always.',
    description: 'Persistent. The first transit-tagged roll each encounter gains +2 hustle.',
  },
  'card-dialogue-neutral-sly-carpool': {
    flavor: 'Three of you. One of you.',
    description: 'Action: hop the HOV. +2 hustle; the next foe loses one transit-tagged tag.',
  },
  'card-dialogue-neutral-express-bluff': {
    name: 'Express Tell',
    flavor: 'You said you would be late. You always say.',
    description: 'Action: set the posture. +1 influence; if revealed, this card returns to hand.',
  },
  'card-dialogue-neutral-interchange-whisperer': {
    name: 'Interchange Insider',
    flavor: 'Knows which lane will become exit-only.',
    description: 'Action: +1 hustle; reveal one tag of the next transit encounter.',
  },
  'card-dialogue-neutral-smooth-beltway': {
    flavor: 'Sixty miles an hour at five p.m. Once.',
    description: 'Action: ride the rare clear loop. +2 hustle; ignore one transit-tagged setback.',
  },
  'card-dialogue-neutral-the-commuter-monologue': {
    flavor: 'Six exits. Three coffees. Two opinions about the road.',
    description: 'Action: deliver the daily lament. +2 influence; on a clear, gain +1 standing.',
  },
  'card-dialogue-neutral-cutting-suburb': {
    flavor: 'Through the subdivision. Past the speed humps.',
    description: 'Action: +2 hustle; the foe loses 1 progress to the detour.',
  },
  'card-dialogue-neutral-scenic-bluff': {
    name: 'Scenic Front',
    flavor: 'Pretends to enjoy the drive. Mostly.',
    description: 'Action: set the posture. +1 hustle; if revealed, this card returns to hand.',
  },
  'card-dialogue-neutral-carpool-and-deflect': {
    name: 'Slug-Line Pivot',
    flavor: 'Three strangers in a Civic. Trust earned in two miles.',
    description: 'Action: slug the carpool. Reduce the next hit by 1; the foe takes the bridge alone.',
  },
  'card-dialogue-neutral-rush-hour-charm': {
    name: 'Rush-Hour Pitch',
    flavor: 'Closing in the carpool lane.',
    description: 'Action: close mid-commute. +1 influence; on a clear, draw 1.',
  },
  'card-event-neutral-metro-delay-strikes': {
    name: 'Metro Delay Lands',
    flavor: 'Single-tracking. Then double-stalling.',
    description: 'Event: all players lose one action this turn. Players with no transit cards in hand draw 1.',
  },
  'card-event-neutral-the-detour-incident': {
    flavor: 'The orange barrels appeared overnight. They always do.',
    description: 'Event: reroute the next encounter\'s tags. Each player picks one tag to ignore.',
  },
  'card-event-neutral-cross-town-storm': {
    flavor: 'Across town for one meeting. Across town back.',
    description: 'Event: each player loses 1 progress. The player with the most transit cards loses 0.',
  },
  'card-insight-neutral-rush-hour-revelation': {
    flavor: 'On the back-road. At the right minute.',
    description: 'Bonus, once per game: peek the next two transit-tagged events.',
  },
  'card-insight-neutral-detoured-epiphany': {
    flavor: 'The wrong way is the right way today.',
    description: 'Action: peek the next encounter; gain +1 hustle if it shares any transit tag.',
  },
  'card-quest-neutral-the-carpool-mandate': {
    name: 'Carpool Initiative',
    flavor: 'Mandated by HR. Subverted by everyone.',
    description: 'Long-rest quest. Multi-step. Two clears grant +2 hustle for the rest of the encounter.',
  },
  'card-quest-neutral-scenic-overpass-hunt': {
    flavor: 'Look up. Then look at the road again.',
    description: 'Quest. Track three landmarks across three rounds. +1 per clear; +1 standing on completion.',
  },
  'card-quest-neutral-the-carpool-dilemma': {
    flavor: 'HOV-2 or HOV-3. The friends you have, the friends you brought.',
    description: 'Quest. Branching. Right: +2 influence and draw 1. Wrong: lose 1 progress.',
  },
  'card-quest-neutral-the-carpool-trail': {
    flavor: 'Same exits. Same faces. Different cars.',
    description: 'Quest. Two-step. Each clear grants +1 hustle for the rest of the encounter.',
  },
  'card-quest-neutral-confront-the-flat-tire': {
    name: 'Counter Flat Tire',
    flavor: 'Mile marker 142. Of course it is 142.',
    description: 'Long-rest quest. Three rounds. +1 per clear; on completion, +2 against any transit foe.',
  },
  'card-quest-neutral-the-exit-ramp-dilemma': {
    flavor: 'Now or in two miles. There is never an in-between.',
    description: 'Quest. Branching. Right: +2 hustle, draw 1. Wrong: skip your next action.',
  },
  'card-quest-neutral-breach-the-the-beltway': {
    name: 'Breach the Beltway',
    flavor: 'Inner loop. Outer loop. Both wrong, somehow.',
    description: 'Quest. Three transit checks. +1 per clear; on completion, gain +2 against any transit foe.',
  },
  'card-quest-neutral-breach-the-route-66': {
    name: 'Breach Route 66',
    flavor: 'Twelve miles. Eighteen exits. One coffee.',
    description: 'Quest. Three transit checks. +2 per clear. Failure: lose your strongest transit card.',
  },
  'card-skill-neutral-keen-suburb': {
    flavor: 'Knows the cul-de-sacs better than the postman.',
    description: 'Passive +2 standing. Once per encounter, treat a tied transit roll as a clear.',
  },
  'card-skill-neutral-expert-bypass-handler': {
    name: 'Beltway Detour Rat',
    flavor: 'Will use the gas-station shortcut without a second thought.',
    description: 'Action: +1 to mixed rolls. Stacks with region bonuses.',
  },
  'card-skill-neutral-happy-hour-mastery': {
    name: 'Ten-Year Happy Hour Hand',
    flavor: 'Same bartender. Same booth. Same rumor.',
    description: 'Passive +2 standing. Once per encounter, draw 1 if you cleared an influence roll.',
  },
  'card-skill-neutral-the-beltway-savvy': {
    name: 'Knows the Beltway Backward',
    flavor: 'Inner. Outer. Counter-clockwise on principle.',
    description: 'One-time passive: +1 hustle in Neutral regions for the rest of the game.',
  },
  'card-skill-neutral-expert-rush-hour-handler': {
    name: 'Reverse-Commute Sage',
    flavor: 'Sees the gridlock from the open lane.',
    description: 'Action: +2 to transit rolls. Stacks with region bonuses.',
  },

  // ============================================================
  // RESTON UNCOMMONS (~32)
  // ============================================================
  'card-artifact-reston-incident-amplifier': {
    flavor: 'Page goes off. Three teams join. One actually works.',
    description: 'Persistent. The first debugging-tagged roll each turn gains +1.',
  },
  'card-artifact-reston-the-hotfix-engine': {
    flavor: 'Patched. Patched the patch. Patched that.',
    description: 'Persistent. Once per encounter, restore one of your discarded debugging cards to hand.',
  },
  'card-artifact-reston-the-refactor-engine': {
    flavor: 'Same code. New names. Different bugs.',
    description: 'Persistent. +1 every turn while held; the first debugging roll each encounter gains +1 extra.',
  },
  'card-dialogue-reston-the-polymorphic-monologue': {
    flavor: 'Same idea, three slide decks, four audiences.',
    description: 'Action: pitch the same thing differently. +1 standing; reveal one tag of the next encounter.',
  },
  'card-dialogue-reston-measured-handshake': {
    flavor: 'Three pumps. Four seconds. One contract.',
    description: 'Action: +2 cunning; the next networking encounter starts at +1.',
  },
  'card-dialogue-reston-cutting-rollback': {
    flavor: 'Reverted. Quietly. Before standup.',
    description: 'Action: +2 influence. Cancel one debugging-tagged effect on a teammate.',
  },
  'card-dialogue-reston-sprint-whisperer': {
    name: 'Sprint Closer',
    flavor: 'Knows which ticket will quietly slip.',
    description: 'Action: +2 influence; reveal one opponent card the first time a deployment encounter resolves.',
  },
  'card-dialogue-reston-compiled-charm': {
    name: 'Demo Day Polish',
    flavor: 'It worked once on the laptop. We will run that one.',
    description: 'Action: pre-roll boost. +2 influence; on a clear, draw 1.',
  },
  'card-dialogue-reston-invoke-throughput': {
    flavor: 'P95 looks great. P99 is on PTO.',
    description: 'Action, once per game: cite the throughput. +1 to all party members this turn.',
  },
  'card-dialogue-reston-bold-sprint': {
    flavor: 'Two weeks. Twelve tickets. Three pulled.',
    description: 'Action: declare ambition. +1 influence; if the encounter resolves on its first roll, draw 1.',
  },
  'card-dialogue-reston-deprecated-persuasion': {
    flavor: 'Use the new API. The new API uses the old one anyway.',
    description: 'Action: +1 cunning. Once per game, reveal one debugging-tagged card to copy its tag onto an encounter.',
  },
  'card-dialogue-reston-the-legacy-monologue': {
    flavor: 'Written before npm existed. Still in production.',
    description: 'Action: defend the old code. +1 influence; the next foe loses 1 progress to the legacy path.',
  },
  'card-event-reston-scope-creep-strikes': {
    name: 'Scope Creep Lands',
    flavor: 'One more requirement. Just one more.',
    description: 'Event: each player adds one tag to their next quest; the player with the most cards in hand loses 1 progress.',
  },
  'card-event-reston-race-condition-strikes': {
    name: 'Race Condition, Right on Schedule',
    flavor: 'Reproduces in production. Vanishes in staging.',
    description: 'Event: the player with the lowest hustle exhausts one card.',
  },
  'card-event-reston-reston-town-center-lockdown-neo': {
    flavor: 'Outdoor concert moved indoors. Indoor concert moved outside.',
    description: 'Area event: Reston Town Center sealed. Inside players gain +2 cunning; outside players cannot draw debugging cards.',
  },
  'card-event-reston-agile-surge': {
    name: 'Sprint Crunch',
    flavor: 'It is not technical debt if you call it velocity.',
    description: 'Event: triggers on region entry. Cunning rolls gain +2 for three turns.',
  },
  'card-insight-reston-flash-of-stack-trace': {
    name: 'Stack Trace Snap',
    flavor: 'Line 47. Always line 47.',
    description: 'Action: peek the next encounter; +1 if it has any debugging tag.',
  },
  'card-insight-reston-containerized-epiphany': {
    flavor: 'Stateless. Until you tried to upgrade.',
    description: 'Action: consume mid-roll for +1; reveal one of your tags to copy onto the encounter.',
  },
  'card-insight-reston-compiled-revelation': {
    name: 'Stack Trace Eureka',
    flavor: 'Paste the error. Wait. Pretend you read all six replies.',
    description: 'Action: consume mid-roll for +2; ignore one opposing reveal effect.',
  },
  'card-insight-reston-flash-of-incident': {
    name: 'Incident Spark',
    flavor: 'The chart was already tilting.',
    description: 'Action: peek the next encounter; +1 if it has any debugging tag.',
  },
  'card-insight-reston-flash-of-pipeline': {
    name: 'Sudden Pipeline',
    flavor: 'CI ran. CI was right.',
    description: 'Action: peek the next encounter; +2 if it has a deployment tag.',
  },
  'card-insight-reston-the-commit-gambit': {
    flavor: 'Force-push to main. Live with it.',
    description: 'All-or-nothing: declare before rolling. +3 cunning on a clear, -2 on a miss.',
  },
  'card-insight-reston-decrypt-the-commit': {
    flavor: 'Author: yourself, three years ago. No commit message.',
    description: 'Action: skip a debugging check; resolves at +1 free. Reveal one tag of the next encounter.',
  },
  'card-quest-reston-serverless-investigation': {
    name: 'Serverless Audit',
    flavor: 'Cold start. Hot bill.',
    description: 'Quest. Three rounds investigating cold-starts. +1 per clear; on completion, gain +2 against any infrastructure foe.',
  },
  'card-quest-reston-confront-the-ddos-attack': {
    name: 'Out-Maneuver DDoS Attack',
    flavor: 'Twelve gigabits. Twelve apologies.',
    description: 'Long-rest quest. Three rounds against DDoS. +1 per clear; on completion, +2 against any infrastructure foe.',
  },
  'card-quest-reston-distributed-rollback-hunt': {
    flavor: 'Forty machines. Three of them rolled back. The rest forgot.',
    description: 'Quest. Track three rolling rollbacks across three turns. +1 per clear.',
  },
  'card-quest-reston-the-payload-affair': {
    flavor: 'Three megabytes of JSON. None of it useful.',
    description: 'Quest. Two-step. Each clear grants +1 hustle for the rest of the encounter.',
  },
  'card-skill-reston-rollback-mastery': {
    name: 'Ten-Year Rollback Hand',
    flavor: 'Knows which switch undoes which Friday.',
    description: 'Passive +1 cunning. Once per encounter, ignore one debugging setback.',
  },
  'card-skill-reston-virtualized-instinct': {
    name: 'Sandbox Reflex',
    flavor: 'Try it on staging. Staging is also production now.',
    description: 'Passive +2 standing. The first deployment roll each encounter gains +1.',
  },
  'card-skill-reston-deep-sprint': {
    flavor: 'Eight points planned. Sixteen delivered. Twelve correct.',
    description: 'Passive +2 standing. Once per encounter, draw 1 if you clear two rolls in the same turn.',
  },
  'card-skill-reston-dulles-corridor-savvy': {
    name: 'Dulles Corridor Block-Walker',
    flavor: 'Knows the office parks by parking-lot color.',
    description: 'One-time passive: +1 standing in Reston for the rest of the game.',
  },
  'card-skill-reston-immutable-instinct': {
    flavor: 'Build it once. Replace it. Replace it again.',
    description: 'Passive +2 standing. Cannot be discarded by opponent effects.',
  },
  'card-skill-reston-wiehle-station-savvy': {
    name: 'Wiehle Station Local',
    flavor: 'Spot 142, Lot 2, Level B. Forever.',
    description: 'One-time passive: +1 cunning in Reston for the rest of the game.',
  },
  'card-skill-reston-reston-town-center-savvy': {
    name: 'Lifelong Reston Town Center Resident',
    flavor: 'Knows which patio is open before you do.',
    description: 'One-time passive: +1 cunning in Reston for the rest of the game.',
  },
  'card-skill-reston-lake-anne-savvy-omega': {
    name: 'Knows Lake Anne Backward',
    flavor: 'Knows which house has the squeaky dock.',
    description: 'One-time passive: +1 standing in Reston for the rest of the game.',
  },

  // ============================================================
  // TYSONS UNCOMMONS (~28)
  // ============================================================
  'card-artifact-tysons-exclusive-compass': {
    flavor: 'Always points to the bigger office.',
    description: 'Persistent. +1 every turn while held; +2 against any corporate foe.',
  },
  'card-artifact-tysons-merger-amplifier': {
    flavor: 'Sixty-four pages. Two of them matter.',
    description: 'Persistent. The first corporate roll each encounter gains +2.',
  },
  'card-dialogue-tysons-magnate-grade-negotiation': {
    flavor: 'A handshake worth eighty hours of legal review.',
    description: 'Action: +1 influence; on a clear, draw 1.',
  },
  'card-dialogue-tysons-invoke-merger': {
    flavor: 'Ten percent stock. Twenty percent silence.',
    description: 'Action, once per game: announce the deal. +2 to all party members this turn.',
  },
  'card-dialogue-tysons-accredited-bluff': {
    name: 'Accredited Cover',
    flavor: 'Licensed. Insured. Uninvolved.',
    description: 'Action: set the posture. +1 influence; if revealed, this card returns to hand.',
  },
  'card-dialogue-tysons-vested-charm': {
    name: 'Vested Pitch',
    flavor: 'Four years. Two clauses. Smooth as bourbon.',
    description: 'Action: +2 influence; on a clear, gain +1 standing.',
  },
  'card-dialogue-tysons-leverage-and-deflect': {
    name: 'Leveraged Pivot',
    flavor: 'Use the position you already had.',
    description: 'Action: reduce the next hit by 1; the foe absorbs the wobble.',
  },
  'card-dialogue-tysons-the-opulent-monologue': {
    flavor: 'Twelve minutes about the boat.',
    description: 'Action: brag at length. +2 influence; the foe must skip its first reveal.',
  },
  'card-dialogue-tysons-invoke-trust-fund': {
    flavor: 'Generation three. Generation last.',
    description: 'Action, once per game: cite the trust. +2 to all party members this turn.',
  },
  'card-dialogue-tysons-the-accredited-monologue': {
    flavor: 'Read the prospectus. Read it again.',
    description: 'Action: deliver the disclosure. +1 influence; the next foe must reveal a tag.',
  },
  'card-dialogue-tysons-hostile-retort': {
    flavor: 'Friendly. Until the term sheet.',
    description: 'Action: +2 influence. Force one foe to reroll its highest die.',
  },
  'card-dialogue-tysons-underwrite-and-deflect': {
    name: "Underwriter's Out",
    flavor: 'Cite the indemnity clause.',
    description: 'Action: reduce the next hit by 2; the next foe carries the residual risk.',
  },
  'card-dialogue-tysons-negotiate-and-deflect': {
    name: 'Counter-Offer',
    flavor: 'Their number, plus eight, minus dignity.',
    description: 'Action: reduce the next hit by 2; bind the foe to the new terms (-1 against you next turn).',
  },
  'card-dialogue-tysons-cutting-board-seat': {
    flavor: 'Three boards. One mind. Conflicted always.',
    description: 'Action: +2 influence; the next corporate foe loses 1 progress.',
  },
  'card-event-tysons-the-trust-fund-incident': {
    flavor: 'A 13D filing nobody saw coming.',
    description: 'Event, once per game: a trust fires. The player with most luxury cards draws 2; others lose 1 progress.',
  },
  'card-event-tysons-board-revolt-strikes': {
    name: 'Board Revolt Hits',
    flavor: 'Five members. Four no. One absent.',
    description: 'Event: the player with most corporate cards exhausts one of them.',
  },
  'card-event-tysons-sec-investigation-strikes': {
    name: 'SEC Investigation, Right on Schedule',
    flavor: 'Subpoena. Tuesday. Three boxes.',
    description: 'Event: each player reveals one tag; influence rolls take -1 for the next two turns.',
  },
  'card-insight-tysons-decrypt-the-board-seat': {
    flavor: 'The seat opened in February. The fight ended in March.',
    description: 'Action: skip a corporate check; resolves at +2 free. Reveal one tag of the next encounter.',
  },
  'card-insight-tysons-flash-of-stakeholder': {
    name: 'Sudden Stakeholder',
    flavor: 'Found at the last quarterly meeting.',
    description: 'Action: peek the next encounter; +2 if it has any networking tag.',
  },
  'card-insight-tysons-the-motorcade-gambit': {
    flavor: 'Six SUVs. One person. Two too many lights.',
    description: 'All-or-nothing: declare before rolling. +3 if you clear, -2 if not.',
  },
  'card-insight-tysons-magnate-grade-revelation': {
    flavor: 'A favor that closes a deal nobody named.',
    description: 'Bonus, once per game: peek any opponent\'s hand. +1 clout next roll.',
  },
  'card-insight-tysons-flash-of-valuation': {
    name: 'Valuation Snap',
    flavor: 'The number arrives at exactly the wrong moment.',
    description: 'Action: peek the next encounter; gain +2 if it has any corporate tag.',
  },
  'card-insight-tysons-preeminent-epiphany': {
    flavor: 'Quietly the largest. Loudly insistent on it.',
    description: 'Action: consume mid-roll for +2; reveal one of your tags to copy onto the encounter.',
  },
  'card-insight-tysons-decrypt-the-leverage': {
    flavor: 'Leverage you didn\'t know you had. Until now.',
    description: 'Action: skip an influence check; resolves at +2 free. Peek any opponent\'s hand size.',
  },
  'card-quest-tysons-the-corner-office-dilemma': {
    flavor: 'Window or door. There is never both.',
    description: 'Quest. Branching. Right: +2 influence and +1 standing. Wrong: lose 1 progress.',
  },
  'card-quest-tysons-influential-operation': {
    flavor: 'Three lunches. Two phone calls. One office.',
    description: 'Quest. Two-step. Each clear grants +1 influence for the rest of the encounter.',
  },
  'card-quest-tysons-bespoke-assignment': {
    flavor: 'Custom-fit. Custom-billed.',
    description: 'Quest. Two-step. Each clear grants +1 standing for the rest of the encounter.',
  },
  'card-quest-tysons-hostile-contract-hunt': {
    flavor: 'The clauses no one read until they had to.',
    description: 'Quest. Track three contracts across three turns. +1 per clear.',
  },
  'card-quest-tysons-breach-the-tysons-galleria': {
    flavor: 'Three floors. Two valets. One Cheesecake Factory.',
    description: 'Quest. Three security checks. +1 per clear; on completion, draw 1 luxury card.',
  },
  'card-quest-tysons-the-prospectus-dilemma': {
    flavor: 'Page seven, paragraph four, footnote two.',
    description: 'Quest. Branching. Right: +2 influence, draw 1. Wrong: lose 1 standing.',
  },
  'card-quest-tysons-breach-the-wolf-trap': {
    flavor: 'After the show. Through the catering loading dock.',
    description: 'Quest. Three security checks. +2 per clear. Failure: lose your strongest luxury card.',
  },
  'card-quest-tysons-breach-the-the-greensboro': {
    name: 'Breach The Greensboro',
    flavor: 'Doormen. Doormen behind doormen.',
    description: 'Quest. Three lobby checks. +2 per clear; on completion, gain +1 standing.',
  },
  'card-quest-tysons-preeminent-investigation': {
    name: 'Preeminent Probe',
    flavor: 'A blue-ribbon panel that quietly knew the answer.',
    description: 'Quest. Open a probe. Three rolls; the third lands at +2.',
  },
  'card-skill-tysons-silver-equity': {
    flavor: 'Held silver-tier. Whispered platinum.',
    description: 'Action: +1 influence. Once per encounter, draw 1 after a corporate clear.',
  },
  'card-skill-tysons-influential-dividend': {
    flavor: 'Quarterly. Reinvested. Untouchable.',
    description: 'Action: +1 standing. The first corporate roll each encounter gains +1 extra.',
  },
  'card-skill-tysons-expert-brunch-handler': {
    name: 'Brunch Power Broker',
    flavor: 'The deal closes between the eggs and the third bellini.',
    description: 'Action: +1 standing. Stacks with region bonuses.',
  },
  'card-skill-tysons-true-syndicate': {
    flavor: 'Six partners. One PO box. Two rooftops.',
    description: 'Action: +2 influence. Once per encounter, treat a corporate roll as if it shared one extra tag.',
  },
  'card-skill-tysons-magnate-grade-instinct': {
    flavor: 'Knew the price. Negotiated higher anyway.',
    description: 'Passive +1 standing. Once per encounter, peek the next corporate foe\'s primary tag.',
  },
  'card-skill-tysons-expert-lobby-handler': {
    name: 'Lobby Concierge',
    flavor: 'Knows the elevator code. Knows the elevator codes.',
    description: 'Action: +2 to political rolls. Stacks with region bonuses.',
  },
  'card-skill-tysons-valuation-mastery': {
    name: 'Ten-Year Valuation Hand',
    flavor: 'The number is the number when she signs it.',
    description: 'Passive +2 standing. Once per encounter, draw 1 if you clear a corporate roll.',
  },
  'card-skill-tysons-quick-merger': {
    name: 'M&A Sprint',
    flavor: 'Term sheet Tuesday. Leak by Thursday. Closed by Friday.',
    description: 'Action: +1 to political and corporate encounters.',
  },
  'card-skill-tysons-keen-portfolio': {
    flavor: 'Diversified into nineteen kinds of regret.',
    description: 'Passive +2 standing. The first influence roll each encounter cannot be reduced below +1.',
  },
};

const cards: Card[] = JSON.parse(readFileSync(cardsPath, 'utf-8'));
let touched = 0;
const missing: string[] = [];

for (const [id, patch] of Object.entries(PATCHES)) {
  const card = cards.find((c) => c.id === id);
  if (!card) { missing.push(id); continue; }
  if (patch.name) card.name = patch.name;
  card.flavor = patch.flavor;
  card.description = patch.description;
  if (patch.tags) card.tags = [...new Set(patch.tags)].sort();
  touched++;
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
console.log(`Hand-rewrote ${touched} rares + uncommons.`);
if (missing.length) console.log(`Missing IDs:`, missing);
