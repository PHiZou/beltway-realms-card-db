import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCards, useRegions, useTags } from '../hooks/useCards';
import type { Card } from '../hooks/useCards';
import { useFilters } from '../hooks/useFilters';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import CardGrid from '../components/CardGrid';
import CardTable from '../components/CardTable';

export default function CardListPage() {
  const { filters, updateFilter, resetFilters, setPage } = useFilters();
  const { data, loading } = useCards(filters);
  const regions = useRegions();
  const tags = useTags();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const handleCompareToggle = useCallback((card: Card) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else if (next.size < 4) {
        next.add(card.id);
      }
      return next;
    });
  }, []);

  const handleSort = useCallback((field: string) => {
    if (filters.sort === field) {
      updateFilter('order', filters.order === 'asc' ? 'desc' : 'asc');
    } else {
      updateFilter('sort', field);
      updateFilter('order', 'asc');
    }
  }, [filters.sort, filters.order, updateFilter]);

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <FilterSidebar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        regions={regions}
        tags={tags}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Search + Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <SearchBar value={filters.q || ''} onChange={(v) => updateFilter('q', v || undefined)} />
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} style={{
              padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: '14px',
              background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
            }}>▦</button>
            <button onClick={() => setViewMode('table')} style={{
              padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: '14px',
              background: viewMode === 'table' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'table' ? 'white' : 'var(--text-muted)',
            }}>☰</button>
          </div>

          <select value={`${filters.sort}-${filters.order}`}
            onChange={e => {
              const [sort, order] = e.target.value.split('-');
              updateFilter('sort', sort);
              updateFilter('order', order);
            }}
            style={{
              padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px',
            }}>
            <option value="name-asc">Name A→Z</option>
            <option value="name-desc">Name Z→A</option>
            <option value="modifier-desc">Modifier ↓</option>
            <option value="modifier-asc">Modifier ↑</option>
            <option value="rarity-desc">Rarity ↓</option>
            <option value="rarity-asc">Rarity ↑</option>
            <option value="clout-desc">Clout ↓</option>
            <option value="hustle-desc">Hustle ↓</option>
            <option value="standing-desc">Standing ↓</option>
            <option value="cunning-desc">Cunning ↓</option>
            <option value="insight-desc">Insight ↓</option>
            <option value="influence-desc">Influence ↓</option>
            <option value="primary_ability-asc">Primary ability</option>
            <option value="action_type-asc">Action type</option>
            <option value="recharge-asc">Recharge</option>
          </select>
        </div>

        {/* Results header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${data?.total || 0} cards found`}
          </span>
          {compareIds.size > 0 && (
            <Link to={`/compare?ids=${[...compareIds].join(',')}`}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'var(--accent)', color: 'white', transition: 'opacity 0.15s',
              }}>
              Compare {compareIds.size} cards →
            </Link>
          )}
        </div>

        {/* Card list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⟳</div>
            Loading cards...
          </div>
        ) : viewMode === 'grid' ? (
          <CardGrid cards={data?.data || []} compareIds={compareIds} onCompareToggle={handleCompareToggle} />
        ) : (
          <CardTable cards={data?.data || []} sortField={filters.sort} sortOrder={filters.order}
            onSort={handleSort} compareIds={compareIds} onCompareToggle={handleCompareToggle} />
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            <button onClick={() => setPage(Math.max(1, (data.page || 1) - 1))}
              disabled={data.page <= 1}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '13px',
                opacity: data.page <= 1 ? 0.4 : 1, cursor: data.page <= 1 ? 'default' : 'pointer',
              }}>← Prev</button>
            <span style={{
              padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}>Page {data.page} of {data.totalPages}</span>
            <button onClick={() => setPage(Math.min(data.totalPages, (data.page || 1) + 1))}
              disabled={data.page >= data.totalPages}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '13px',
                opacity: data.page >= data.totalPages ? 0.4 : 1, cursor: data.page >= data.totalPages ? 'default' : 'pointer',
              }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
