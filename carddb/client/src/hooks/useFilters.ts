import { useState, useCallback } from 'react';
import type { CardFilters } from './useCards';

const DEFAULT_FILTERS: CardFilters = {
  sort: 'name',
  order: 'asc',
  page: 1,
  limit: 50,
};

export function useFilters() {
  const [filters, setFilters] = useState<CardFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback((key: keyof CardFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return { filters, updateFilter, resetFilters, setPage };
}
