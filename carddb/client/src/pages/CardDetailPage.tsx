import { useParams, Link } from 'react-router-dom';
import { useCard } from '../hooks/useCards';
import StatRadar from '../components/StatRadar';
import CardPreview from '../components/CardPreview';
import { useEffect, useState } from 'react';
import type { Card } from '../hooks/useCards';

const rarityColors: Record<string, string> = {
  common: '#9e9e9e', uncommon: '#4caf50', rare: '#2196f3', epic: '#9c27b0', legendary: '#ff9800',
};
const typeColors: Record<string, string> = {
  quest: '#ef4444', dialogue: '#f59e0b', skill: '#3b82f6', insight: '#8b5cf6', event: '#10b981', artifact: '#ec4899',
};

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { card, loading, error } = useCard(id);
  const [similar, setSimilar] = useState<Card[]>([]);

  useEffect(() => {
    if (id) {
      fetch(`/api/cards/${id}/similar?limit=4`)
        .then(r => r.json())
        .then(setSimilar)
        .catch(() => {});
    }
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading card...</div>;
  if (error || !card) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-quest)' }}>Card not found</div>;

  const rc = rarityColors[card.rarity] || '#666';
  const tc = typeColors[card.type] || '#666';

  return (
    <div>
      <Link to="/" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to cards
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '8px' }}>
        {/* Main card info */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '6px',
            background: `linear-gradient(90deg, ${rc}, ${tc})`,
          }} />
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                textTransform: 'uppercase', background: `${tc}22`, color: tc,
              }}>{card.type}</span>
              <span style={{
                padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                textTransform: 'uppercase', background: `${rc}22`, color: rc,
              }}>{card.rarity}</span>
              {card.region_id && (
                <span style={{
                  padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                  background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                }}>{card.region_id}</span>
              )}
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{card.name}</h1>

            {card.flavor && (
              <p style={{
                fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic',
                marginBottom: '20px', lineHeight: 1.6, borderLeft: `3px solid ${rc}`, paddingLeft: '16px',
              }}>"{card.flavor}"</p>
            )}

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              {card.description}
            </p>

            {/* Stat bars */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px',
              padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '24px',
            }}>
              {[
                { label: 'Modifier', value: card.modifier, max: 6, color: rc },
                { label: 'Versatility', value: card.versatility, max: 5, color: '#3b82f6' },
                { label: 'Synergy', value: card.synergy, max: 5, color: '#8b5cf6' },
                { label: 'Reliability', value: card.reliability, max: 5, color: '#10b981' },
                { label: 'Ceiling', value: card.ceiling, max: 5, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{stat.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: stat.color }}>
                      {stat.label === 'Modifier' ? `+${stat.value}` : stat.value}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${(stat.value / stat.max) * 100}%`,
                      background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {card.tags.map((tag: string) => (
                    <Link key={tag} to={`/?tags=${tag}`} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                      background: 'var(--bg-hover)', color: 'var(--accent)', border: '1px solid var(--border)',
                    }}>{tag}</Link>
                  ))}
                </div>
              </div>
            )}

            {/* Unlock method */}
            {card.unlock_method && (
              <div style={{
                padding: '16px', background: 'var(--bg-hover)', borderRadius: '10px',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Unlock Method
                </span>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {card.unlock_method}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Radar chart */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)',
            padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stat Profile
            </h3>
            <StatRadar
              stats={[
                { label: 'VRS', value: card.versatility },
                { label: 'SYN', value: card.synergy },
                { label: 'REL', value: card.reliability },
                { label: 'CIL', value: card.ceiling },
              ]}
              color={rc}
              size={220}
            />
          </div>

          {/* Usage stats */}
          {card.usage_stats && (
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Usage Stats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Times Played</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {card.usage_stats.times_played.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Win Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                    color: (card.usage_stats.times_won / card.usage_stats.times_played) > 0.5 ? 'var(--color-uncommon)' : 'var(--text-primary)',
                  }}>
                    {((card.usage_stats.times_won / card.usage_stats.times_played) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avg Roll</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {card.usage_stats.avg_roll_with?.toFixed(1) || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Popularity</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    #{card.usage_stats.popular_rank}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card ID */}
          <div style={{
            padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '8px',
            fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)',
            wordBreak: 'break-all',
          }}>
            {card.id}
          </div>
        </div>
      </div>

      {/* Similar cards */}
      {similar.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Similar Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {similar.map(c => <CardPreview key={c.id} card={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
