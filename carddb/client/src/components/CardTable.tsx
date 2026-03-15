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
  cards: Card[];
  sortField?: string;
  sortOrder?: string;
  onSort: (field: string) => void;
  compareIds: Set<string>;
  onCompareToggle: (card: Card) => void;
}

function SortIcon({ field, currentSort, currentOrder }: { field: string; currentSort?: string; currentOrder?: string }) {
  if (currentSort !== field) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
  return <span style={{ marginLeft: '4px' }}>{currentOrder === 'desc' ? '↓' : '↑'}</span>;
}

export default function CardTable({ cards, sortField, sortOrder, onSort, compareIds, onCompareToggle }: Props) {
  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap',
    userSelect: 'none',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '40px' }}></th>
            <th style={thStyle} onClick={() => onSort('name')}>Name <SortIcon field="name" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={thStyle} onClick={() => onSort('type')}>Type <SortIcon field="type" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={thStyle} onClick={() => onSort('rarity')}>Rarity <SortIcon field="rarity" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={thStyle} onClick={() => onSort('region_id')}>Region <SortIcon field="region_id" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('modifier')}>MOD <SortIcon field="modifier" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('versatility')}>VRS <SortIcon field="versatility" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('synergy')}>SYN <SortIcon field="synergy" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('reliability')}>REL <SortIcon field="reliability" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('ceiling')}>CIL <SortIcon field="ceiling" currentSort={sortField} currentOrder={sortOrder} /></th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr key={card.id} style={{ transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={tdStyle}>
                <button onClick={() => onCompareToggle(card)} style={{
                  width: '24px', height: '24px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: compareIds.has(card.id) ? 'var(--accent)' : 'var(--bg-card)',
                  color: compareIds.has(card.id) ? 'white' : 'var(--text-muted)',
                  fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{compareIds.has(card.id) ? '✓' : '⚖'}</button>
              </td>
              <td style={tdStyle}>
                <Link to={`/card/${card.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {card.name}
                </Link>
              </td>
              <td style={tdStyle}>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                  background: `${typeColors[card.type]}22`, color: typeColors[card.type],
                }}>{card.type}</span>
              </td>
              <td style={tdStyle}>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                  background: `${rarityColors[card.rarity]}22`, color: rarityColors[card.rarity],
                }}>{card.rarity}</span>
              </td>
              <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{card.region_id || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>+{card.modifier}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: card.versatility >= 4 ? 'var(--color-legendary)' : 'var(--text-secondary)' }}>{card.versatility}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: card.synergy >= 4 ? 'var(--color-legendary)' : 'var(--text-secondary)' }}>{card.synergy}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: card.reliability >= 4 ? 'var(--color-legendary)' : 'var(--text-secondary)' }}>{card.reliability}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: card.ceiling >= 4 ? 'var(--color-legendary)' : 'var(--text-secondary)' }}>{card.ceiling}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
