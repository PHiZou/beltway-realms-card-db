import { Link } from 'react-router-dom';
import type { Card } from '../hooks/useCards';
import { ABILITY_LABELS, ACTION_LABELS, RECHARGE_LABELS, abilityModifier } from '../hooks/useCards';

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
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('action_type')}>Action <SortIcon field="action_type" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('recharge')}>Recharge <SortIcon field="recharge" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('primary_ability')}>Primary <SortIcon field="primary_ability" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('clout')}>{ABILITY_LABELS.clout} <SortIcon field="clout" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('hustle')}>{ABILITY_LABELS.hustle} <SortIcon field="hustle" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('standing')}>{ABILITY_LABELS.standing} <SortIcon field="standing" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('cunning')}>{ABILITY_LABELS.cunning} <SortIcon field="cunning" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('insight')}>{ABILITY_LABELS.insight} <SortIcon field="insight" currentSort={sortField} currentOrder={sortOrder} /></th>
            <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => onSort('influence')}>{ABILITY_LABELS.influence} <SortIcon field="influence" currentSort={sortField} currentOrder={sortOrder} /></th>
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
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{ACTION_LABELS[card.action_type]}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>{RECHARGE_LABELS[card.recharge]}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.primary_ability}</td>
              {(['clout','hustle','standing','cunning','insight','influence'] as const).map((a) => {
                const score = card[a];
                const mod = abilityModifier(score);
                const isPrimary = card.primary_ability === a;
                return (
                  <td key={a} style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: isPrimary ? 'var(--color-legendary)' : (score >= 16 ? 'var(--text-primary)' : 'var(--text-secondary)'), fontWeight: isPrimary ? 700 : 400 }}>
                    {score} <span style={{ opacity: 0.55, fontSize: '11px' }}>({mod >= 0 ? '+' : ''}{mod})</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
