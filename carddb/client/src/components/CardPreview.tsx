import { Link } from 'react-router-dom';
import type { Card } from '../hooks/useCards';

const rarityColors: Record<string, string> = {
  common: 'var(--color-common)',
  uncommon: 'var(--color-uncommon)',
  rare: 'var(--color-rare)',
  epic: 'var(--color-epic)',
  legendary: 'var(--color-legendary)',
};

const typeColors: Record<string, string> = {
  quest: 'var(--color-quest)',
  dialogue: 'var(--color-dialogue)',
  skill: 'var(--color-skill)',
  insight: 'var(--color-insight)',
  event: 'var(--color-event)',
  artifact: 'var(--color-artifact)',
};

interface Props {
  card: Card;
  onCompareToggle?: (card: Card) => void;
  isComparing?: boolean;
}

export default function CardPreview({ card, onCompareToggle, isComparing }: Props) {
  const rarityColor = rarityColors[card.rarity] || '#666';
  const typeColor = typeColors[card.type] || '#666';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isComparing ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = isComparing ? 'var(--accent)' : 'var(--border)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Rarity gradient top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${rarityColor}, ${typeColor})`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
              textTransform: 'uppercase', background: `${typeColor}22`, color: typeColor,
              letterSpacing: '0.05em',
            }}>{card.type}</span>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
              textTransform: 'uppercase', background: `${rarityColor}22`, color: rarityColor,
              letterSpacing: '0.05em',
            }}>{card.rarity}</span>
          </div>
          <Link to={`/card/${card.id}`} style={{
            fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)',
            lineHeight: 1.3, display: 'block',
          }}>
            {card.name}
          </Link>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${rarityColor}33, ${typeColor}33)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color: rarityColor, flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
        }}>+{card.modifier}</div>
      </div>

      <p style={{
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
        marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{card.description}</p>

      {card.flavor && (
        <p style={{
          fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic',
          marginBottom: '12px', lineHeight: 1.4,
        }}>"{card.flavor}"</p>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
        marginBottom: '12px',
      }}>
        {[
          { label: 'VRS', value: card.versatility },
          { label: 'SYN', value: card.synergy },
          { label: 'REL', value: card.reliability },
          { label: 'CIL', value: card.ceiling },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500,
              letterSpacing: '0.05em', marginBottom: '2px',
            }}>{stat.label}</div>
            <div style={{
              fontSize: '16px', fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: stat.value >= 4 ? 'var(--color-legendary)' : stat.value >= 3 ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {card.tags.map(tag => (
            <span key={tag} style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
              background: 'var(--bg-hover)', color: 'var(--text-muted)',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to={`/card/${card.id}`} style={{
          flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
          textAlign: 'center', background: 'var(--bg-hover)', color: 'var(--text-secondary)',
          transition: 'all 0.15s', border: 'none',
        }}>View Details</Link>
        {onCompareToggle && (
          <button onClick={() => onCompareToggle(card)} style={{
            padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
            background: isComparing ? 'var(--accent)' : 'var(--bg-hover)',
            color: isComparing ? 'white' : 'var(--text-secondary)',
            border: 'none', transition: 'all 0.15s',
          }}>{isComparing ? '✓' : '⚖'}</button>
        )}
      </div>
    </div>
  );
}
