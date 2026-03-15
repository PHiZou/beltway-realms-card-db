import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Card } from '../hooks/useCards';
import StatRadar from '../components/StatRadar';

const rarityColors: Record<string, string> = {
  common: '#9e9e9e', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800',
};
const typeColors: Record<string, string> = {
  quest: '#ef4444', dialogue: '#f59e0b', skill: '#3b82f6', insight: '#8b5cf6', event: '#10b981', artifact: '#ec4899',
};

interface SynergyResult {
  id: string;
  name: string;
  card_ids: string[];
  cards: Card[];
  total_modifier: number;
  synergy_bonus: number;
  synergy_rules: string[];
}

export default function LoadoutBuilderPage() {
  const [hand, setHand] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [loadoutName, setLoadoutName] = useState('');
  const [savedResult, setSavedResult] = useState<SynergyResult | null>(null);
  const [synergy, setSynergy] = useState<{ bonus: number; rules: string[] } | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/cards?q=${searchQuery}&limit=10`)
        .then(r => r.json())
        .then(d => setSearchResults(d.data || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute synergy whenever hand changes
  useEffect(() => {
    if (hand.length < 2) { setSynergy(null); return; }

    let bonus = 0;
    const rules: string[] = [];

    const regionCounts: Record<string, number> = {};
    for (const card of hand) {
      if (card.region_id) regionCounts[card.region_id] = (regionCounts[card.region_id] || 0) + 1;
    }
    for (const [region, count] of Object.entries(regionCounts)) {
      if (count >= 2) { bonus += 1; rules.push(`Region synergy: ${count} cards from ${region} (+1)`); }
    }

    const tagCounts: Record<string, number> = {};
    for (const card of hand) {
      for (const tag of (card.tags || [])) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    for (const [tag, count] of Object.entries(tagCounts)) {
      if (count >= 3) { bonus += 1; rules.push(`Tag synergy: ${count} cards with "${tag}" (+1)`); }
    }

    if (hand.length >= 3) {
      const r = hand[0].rarity;
      if (hand.every(c => c.rarity === r)) { bonus += 2; rules.push(`Rarity synergy: all ${r} (+2)`); }
    }

    const artifacts = hand.filter(c => c.type === 'artifact');
    const skills = hand.filter(c => c.type === 'skill');
    for (const artifact of artifacts) {
      if (skills.some(s => s.region_id === artifact.region_id)) {
        rules.push(`Combo: ${artifact.name} triggers twice (matching skill)`);
      }
    }

    const events = hand.filter(c => c.type === 'event');
    const quests = hand.filter(c => c.type === 'quest');
    for (const event of events) {
      if (quests.some(q => q.region_id === event.region_id)) {
        rules.push(`Combo: ${event.name} auto-triggers (matching quest)`);
      }
    }

    setSynergy({ bonus, rules });
  }, [hand]);

  const addToHand = (card: Card) => {
    if (hand.length >= 5 || hand.find(c => c.id === card.id)) return;
    setHand(prev => [...prev, card]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromHand = (id: string) => {
    setHand(prev => prev.filter(c => c.id !== id));
    setSavedResult(null);
  };

  const saveLoadout = async () => {
    if (hand.length === 0 || !loadoutName) return;
    try {
      const res = await fetch('/api/loadouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loadoutName, card_ids: hand.map(c => c.id) }),
      });
      const data = await res.json();
      setSavedResult(data);
    } catch { /* ignore */ }
  };

  const totalModifier = hand.reduce((sum, c) => sum + c.modifier, 0);
  const totalWithSynergy = totalModifier + (synergy?.bonus || 0);

  const avgStats = hand.length > 0 ? {
    versatility: +(hand.reduce((s, c) => s + c.versatility, 0) / hand.length).toFixed(1),
    synergy: +(hand.reduce((s, c) => s + c.synergy, 0) / hand.length).toFixed(1),
    reliability: +(hand.reduce((s, c) => s + c.reliability, 0) / hand.length).toFixed(1),
    ceiling: +(hand.reduce((s, c) => s + c.ceiling, 0) / hand.length).toFixed(1),
  } : null;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Loadout Builder</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
        Build a hand of 3-5 cards for an encounter. Maximize modifiers and trigger synergies.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main area */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={hand.length >= 5 ? 'Hand is full (5/5)' : 'Search cards to add...'}
              disabled={hand.length >= 5}
              style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                opacity: hand.length >= 5 ? 0.5 : 1,
              }} />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: '10px', marginTop: '4px', zIndex: 10,
                maxHeight: '300px', overflowY: 'auto',
              }}>
                {searchResults.map(card => (
                  <button key={card.id} onClick={() => addToHand(card)}
                    disabled={!!hand.find(c => c.id === card.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 16px',
                      border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                      textAlign: 'left', fontSize: '13px',
                      opacity: hand.find(c => c.id === card.id) ? 0.4 : 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <span style={{ fontWeight: 500 }}>{card.name}</span>
                    <span style={{ color: rarityColors[card.rarity], fontSize: '11px', textTransform: 'uppercase' }}>{card.rarity}</span>
                    <span style={{ color: typeColors[card.type], fontSize: '11px', marginLeft: 'auto' }}>{card.type}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600 }}>+{card.modifier}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hand */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[0, 1, 2, 3, 4].map(slot => {
              const card = hand[slot];
              if (!card) {
                return (
                  <div key={slot} style={{
                    width: '200px', height: '160px', borderRadius: '12px', border: '2px dashed var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: '13px',
                  }}>Slot {slot + 1}</div>
                );
              }
              const rc = rarityColors[card.rarity] || '#666';
              const tc = typeColors[card.type] || '#666';
              return (
                <div key={card.id} style={{
                  width: '200px', background: 'var(--bg-card)', borderRadius: '12px',
                  border: `1px solid var(--border)`, padding: '16px', position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: `linear-gradient(90deg, ${rc}, ${tc})`,
                  }} />
                  <button onClick={() => removeFromHand(card.id)} style={{
                    position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px',
                    borderRadius: '4px', border: 'none', background: 'var(--bg-hover)', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px',
                  }}>×</button>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
                      background: `${tc}22`, color: tc, fontWeight: 600, textTransform: 'uppercase',
                    }}>{card.type}</span>
                    <span style={{
                      fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
                      background: `${rc}22`, color: rc, fontWeight: 600, textTransform: 'uppercase',
                    }}>{card.rarity}</span>
                  </div>
                  <Link to={`/card/${card.id}`} style={{
                    fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                    display: 'block', marginBottom: '6px', lineHeight: 1.3,
                  }}>{card.name}</Link>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.region_id}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: rc,
                    }}>+{card.modifier}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[card.versatility, card.synergy, card.reliability, card.ceiling].map((v, i) => (
                      <span key={i} style={{
                        fontSize: '10px', fontFamily: "'JetBrains Mono', monospace",
                        color: v >= 4 ? 'var(--color-legendary)' : 'var(--text-muted)',
                      }}>{v}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save */}
          {hand.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="text" value={loadoutName} onChange={e => setLoadoutName(e.target.value)}
                placeholder="Loadout name..."
                style={{
                  padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', width: '250px',
                }} />
              <button onClick={saveLoadout} disabled={!loadoutName}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600,
                  background: loadoutName ? 'var(--accent)' : 'var(--bg-hover)',
                  color: loadoutName ? 'white' : 'var(--text-muted)', cursor: loadoutName ? 'pointer' : 'default',
                }}>Save Loadout</button>
              {savedResult && (
                <span style={{ fontSize: '13px', color: 'var(--color-uncommon)' }}>
                  Saved! ID: {savedResult.id}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Totals */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Loadout Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cards</span>
                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{hand.length}/5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Base Modifier</span>
                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>+{totalModifier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Synergy Bonus</span>
                <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                  color: synergy && synergy.bonus > 0 ? 'var(--color-uncommon)' : 'var(--text-muted)',
                }}>+{synergy?.bonus || 0}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Modifier</span>
                <span style={{
                  fontSize: '20px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: totalWithSynergy > 0 ? 'var(--color-legendary)' : 'var(--text-primary)',
                }}>+{totalWithSynergy}</span>
              </div>
            </div>
          </div>

          {/* Synergy rules */}
          {synergy && synergy.rules.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Synergies
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {synergy.rules.map((rule, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px',
                    fontSize: '12px', color: 'var(--color-uncommon)', lineHeight: 1.4,
                  }}>{rule}</div>
                ))}
              </div>
            </div>
          )}

          {/* Average radar */}
          {avgStats && (
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)',
              padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Average Stats
              </h3>
              <StatRadar
                stats={[
                  { label: 'VRS', value: Math.round(avgStats.versatility) },
                  { label: 'SYN', value: Math.round(avgStats.synergy) },
                  { label: 'REL', value: Math.round(avgStats.reliability) },
                  { label: 'CIL', value: Math.round(avgStats.ceiling) },
                ]}
                size={200}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
