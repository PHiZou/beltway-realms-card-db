import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import StatRadar from '../components/StatRadar';
import type { Card } from '../hooks/useCards';

const rarityColors: Record<string, string> = {
  common: '#9e9e9e', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800',
};
const compareColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (ids.length >= 2) {
      setLoading(true);
      fetch(`/api/cards/compare?ids=${ids.join(',')}`)
        .then(r => r.json())
        .then(setCards)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [searchParams.toString()]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/cards?q=${searchQuery}&limit=8`)
        .then(r => r.json())
        .then(d => setSearchResults(d.data || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addCard = (card: Card) => {
    if (cards.length >= 4 || cards.find(c => c.id === card.id)) return;
    setCards(prev => [...prev, card]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const statFields = [
    { key: 'modifier', label: 'Modifier', max: 8 },
    { key: 'clout', label: 'Clout', max: 20 },
    { key: 'hustle', label: 'Hustle', max: 20 },
    { key: 'standing', label: 'Standing', max: 20 },
    { key: 'cunning', label: 'Cunning', max: 20 },
    { key: 'insight', label: 'Insight', max: 20 },
    { key: 'influence', label: 'Influence', max: 20 },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Compare Cards</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
        Select 2-4 cards to compare side by side
      </p>

      {/* Search to add cards */}
      {cards.length < 4 && (
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for cards to compare..."
            style={{
              width: '100%', padding: '12px 16px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
            }} />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: '10px', marginTop: '4px', zIndex: 10,
              maxHeight: '300px', overflowY: 'auto',
            }}>
              {searchResults.map(card => (
                <button key={card.id} onClick={() => addCard(card)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 16px',
                  border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                  textAlign: 'left', fontSize: '13px',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <span style={{ fontWeight: 500 }}>{card.name}</span>
                  <span style={{ color: rarityColors[card.rarity], fontSize: '11px', textTransform: 'uppercase' }}>{card.rarity}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: 'auto' }}>{card.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading...</div>}

      {cards.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <p>No cards selected. <Link to="/">Browse cards</Link> and select some to compare, or search above.</p>
        </div>
      )}

      {cards.length > 0 && (
        <>
          {/* Cards header row */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${cards.length}, 1fr)`, gap: '12px', marginBottom: '16px' }}>
            <div />
            {cards.map((card, i) => (
              <div key={card.id} style={{
                background: 'var(--bg-secondary)', borderRadius: '12px', border: `2px solid ${compareColors[i]}`,
                padding: '16px', textAlign: 'center', position: 'relative',
              }}>
                <button onClick={() => removeCard(card.id)} style={{
                  position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px',
                  borderRadius: '6px', border: 'none', background: 'var(--bg-hover)', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '14px',
                }}>×</button>
                <div style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                  textTransform: 'uppercase', background: `${rarityColors[card.rarity]}22`,
                  color: rarityColors[card.rarity], display: 'inline-block', marginBottom: '8px',
                }}>{card.rarity}</div>
                <Link to={`/card/${card.id}`} style={{
                  display: 'block', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px',
                }}>{card.name}</Link>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.type} · {card.region_id}</span>
              </div>
            ))}
          </div>

          {/* Stat comparison rows */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {statFields.map((stat, idx) => {
              const values = cards.map(c => (c as any)[stat.key] as number);
              const maxVal = Math.max(...values);
              return (
                <div key={stat.key} style={{
                  display: 'grid', gridTemplateColumns: `160px repeat(${cards.length}, 1fr)`,
                  gap: '12px', padding: '16px 20px', alignItems: 'center',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{stat.label}</span>
                  {cards.map((card, i) => {
                    const val = (card as any)[stat.key] as number;
                    const isBest = val === maxVal && values.filter(v => v === maxVal).length === 1;
                    return (
                      <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '4px',
                            width: `${(val / stat.max) * 100}%`,
                            background: compareColors[i],
                            transition: 'width 0.4s',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '14px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                          color: isBest ? compareColors[i] : 'var(--text-secondary)', minWidth: '28px',
                        }}>
                          {stat.key === 'modifier' ? `+${val}` : val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Radar overlay */}
          {cards.length >= 2 && (
            <div style={{
              marginTop: '24px', background: 'var(--bg-secondary)', borderRadius: '12px',
              border: '1px solid var(--border)', padding: '24px', textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
                Stat Profiles Overlay
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                {cards.map((card, i) => (
                  <div key={card.id} style={{ textAlign: 'center' }}>
                    <StatRadar
                      stats={[
                        { label: 'CLT', value: Math.round((card.clout / 20) * 5) },
                        { label: 'HST', value: Math.round((card.hustle / 20) * 5) },
                        { label: 'STG', value: Math.round((card.standing / 20) * 5) },
                        { label: 'CUN', value: Math.round((card.cunning / 20) * 5) },
                        { label: 'INS', value: Math.round((card.insight / 20) * 5) },
                        { label: 'INF', value: Math.round((card.influence / 20) * 5) },
                      ]}
                      color={compareColors[i]}
                      size={180}
                    />
                    <span style={{ fontSize: '12px', color: compareColors[i], fontWeight: 600 }}>{card.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
