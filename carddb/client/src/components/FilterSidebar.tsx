import type { CardFilters } from '../hooks/useCards';

interface Region {
  id: string;
  name: string;
  color: string;
  card_count: number;
}

interface Props {
  filters: CardFilters;
  onFilterChange: (key: keyof CardFilters, value: string | number | undefined) => void;
  onReset: () => void;
  regions: Region[];
  tags: string[];
}

const TYPES = [
  { id: 'quest', label: 'Quest', color: 'var(--color-quest)' },
  { id: 'dialogue', label: 'Dialogue', color: 'var(--color-dialogue)' },
  { id: 'skill', label: 'Skill', color: 'var(--color-skill)' },
  { id: 'insight', label: 'Insight', color: 'var(--color-insight)' },
  { id: 'event', label: 'Event', color: 'var(--color-event)' },
  { id: 'artifact', label: 'Artifact', color: 'var(--color-artifact)' },
];

const RARITIES = [
  { id: 'common', label: 'Common', color: 'var(--color-common)' },
  { id: 'uncommon', label: 'Uncommon', color: 'var(--color-uncommon)' },
  { id: 'rare', label: 'Rare', color: 'var(--color-rare)' },
  { id: 'epic', label: 'Epic', color: 'var(--color-epic)' },
  { id: 'legendary', label: 'Legendary', color: 'var(--color-legendary)' },
];

const sectionStyle: React.CSSProperties = { marginBottom: '24px' };
const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const,
  letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px', display: 'block',
};
const chipStyle = (active: boolean, color: string): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  border: `1px solid ${active ? color : 'var(--border)'}`,
  background: active ? `${color}22` : 'transparent',
  color: active ? color : 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
});

export default function FilterSidebar({ filters, onFilterChange, onReset, regions, tags }: Props) {
  const hasActiveFilters = filters.type || filters.rarity || filters.region || filters.tags;

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      padding: '20px',
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      height: 'fit-content',
      position: 'sticky',
      top: '88px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Filters</h3>
        {hasActiveFilters && (
          <button onClick={onReset} style={{
            fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 500,
          }}>Clear all</button>
        )}
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>Type</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TYPES.map(t => (
            <button key={t.id} style={chipStyle(filters.type === t.id, t.color)}
              onClick={() => onFilterChange('type', filters.type === t.id ? undefined : t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>Rarity</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {RARITIES.map(r => (
            <button key={r.id} style={chipStyle(filters.rarity === r.id, r.color)}
              onClick={() => onFilterChange('rarity', filters.rarity === r.id ? undefined : r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>Region</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {regions.map(r => (
            <button key={r.id}
              onClick={() => onFilterChange('region', filters.region === r.id ? undefined : r.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: filters.region === r.id ? `${r.color}22` : 'transparent',
                color: filters.region === r.id ? r.color : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: filters.region === r.id ? 600 : 400,
                transition: 'all 0.15s',
              }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '3px', background: r.color, flexShrink: 0,
              }} />
              {r.name}
              <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.6 }}>{r.card_count}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>Modifier Range</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="number" min="0" max="6" placeholder="Min"
            value={filters.modifier_min ?? ''}
            onChange={e => onFilterChange('modifier_min', e.target.value ? parseInt(e.target.value) : undefined)}
            style={{
              width: '70px', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'center',
            }} />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input type="number" min="0" max="6" placeholder="Max"
            value={filters.modifier_max ?? ''}
            onChange={e => onFilterChange('modifier_max', e.target.value ? parseInt(e.target.value) : undefined)}
            style={{
              width: '70px', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'center',
            }} />
        </div>
      </div>

      {tags.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Popular Tags</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {tags.slice(0, 30).map(tag => (
              <button key={tag} onClick={() => onFilterChange('tags', filters.tags === tag ? undefined : tag)}
                style={chipStyle(filters.tags === tag, 'var(--accent)')}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
