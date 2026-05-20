import api from '@/lib/axios'
import type { ProductDetailResponse } from '@/types'

export interface AdminProductPage {
  content: ProductDetailResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ProductCreatePayload {
  sku: string
  name: string
  shortDescription?: string
  productType: string
  installationType?: string
  phaseType?: string
  basePowerKwc?: number
  batteryCapacityKwh?: number
  panelCount?: number
  warrantyYears?: number
  categoryId?: number
  brandId?: number
  isFeatured: boolean
  isActive: boolean
  variants: {
    reference: string
    label: string
    priceHt: number
    priceTtc: number
    currency: string
    isDefault: boolean
    isActive: boolean
  }[]
}

export interface ProductUpdatePayload {
  name?: string
  shortDescription?: string
  productType?: string
  installationType?: string
  isActive?: boolean
  isFeatured?: boolean
}

export const adminProductService = {
  getProducts: (params: { page?: number; size?: number; search?: string }) =>
    api
      .get<{ success: boolean; data: AdminProductPage }>('/admin/products', { params })
      .then((r) => r.data.data),

  createProduct: (payload: ProductCreatePayload) =>
    api
      .post<{ success: boolean; data: ProductDetailResponse }>('/admin/products', payload)
      .then((r) => r.data.data),

  updateProduct: (id: number, payload: ProductUpdatePayload) =>
    api
      .put<{ success: boolean; data: ProductDetailResponse }>(`/admin/products/${id}`, payload)
      .then((r) => r.data.data),

  deleteProduct: (id: number) =>
    api.delete(`/admin/products/${id}`),

  uploadImage: (productId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<{ success: boolean; data: ProductDetailResponse }>(`/admin/products/${productId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },

  deleteImage: (productId: number, imageId: number) =>
    api
      .delete<{ success: boolean; data: ProductDetailResponse }>(`/admin/products/${productId}/images/${imageId}`)
      .then((r) => r.data.data),
}
