import { useState, useEffect, useCallback } from 'react';

export interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  region_id: string | null;
  modifier: number;
  versatility: number;
  synergy: number;
  reliability: number;
  ceiling: number;
  flavor: string | null;
  description: string;
  unlock_method: string | null;
  tags: string[];
}

export interface PaginatedCards {
  data: Card[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CardFilters {
  type?: string;
  rarity?: string;
  region?: string;
  modifier_min?: number;
  modifier_max?: number;
  tags?: string;
  q?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export function useCards(filters: CardFilters) {
  const [data, setData] = useState<PaginatedCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '' && value !== null) {
          params.set(key, String(value));
        }
      }
      const res = await fetch(`/api/cards?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { data, loading, error, refetch: fetchCards };
}

export function useCard(id: string | undefined) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/cards/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setCard)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { card, loading, error };
}

export function useRegions() {
  const [regions, setRegions] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/regions').then(r => r.json()).then(setRegions).catch(() => {});
  }, []);
  return regions;
}

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setTags).catch(() => {});
  }, []);
  return tags;
}
