import { useState, useCallback } from 'react'
import type { ProductFilterRequest } from '@/types'

const DEFAULTS: ProductFilterRequest = {
  page: 0,
  size: 12,
  sort: 'createdAt,desc',
}

export function useProductFilters(initial?: Partial<ProductFilterRequest>) {
  const [filters, setFilters] = useState<ProductFilterRequest>({ ...DEFAULTS, ...initial })

  const applyFilter = useCallback(<K extends keyof ProductFilterRequest>(
    key: K,
    value: ProductFilterRequest[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULTS, ...initial })
  }, [initial])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'size', 'sort'].includes(k) && v !== undefined && v !== null && v !== ''
  ).length

  return { filters, applyFilter, resetFilters, setPage, activeFilterCount }
}
