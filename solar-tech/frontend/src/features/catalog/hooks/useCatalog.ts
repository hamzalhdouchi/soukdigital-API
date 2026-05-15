import { useQuery } from '@tanstack/react-query'
import { catalogService } from '@/features/catalog/services/catalogService'
import type { ProductFilterRequest } from '@/types'

export function useCatalog(filters: ProductFilterRequest) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogService.getProducts(filters),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogService.getProduct(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories(),
    staleTime: 1000 * 60 * 30,
  })
}
