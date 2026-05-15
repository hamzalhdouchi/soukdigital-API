import api from '@/lib/axios'
import type { ProductSummary, ProductDetailResponse, ProductFilterRequest } from '@/types'

export interface CatalogPage {
  content: ProductSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export const catalogService = {
  getProducts: (filters: ProductFilterRequest) => {
    const params: Record<string, unknown> = { ...filters }
    return api
      .get<{ success: boolean; data: CatalogPage }>('/products', { params })
      .then((r) => r.data.data)
  },

  getProduct: (slug: string) =>
    api
      .get<{ success: boolean; data: ProductDetailResponse }>(`/products/${slug}`)
      .then((r) => r.data.data),

  getCategories: () =>
    api
      .get<{ success: boolean; data: unknown[] }>('/categories')
      .then((r) => r.data.data),
}
