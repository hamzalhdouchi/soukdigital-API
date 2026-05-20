import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminProductService, type ProductCreatePayload, type ProductUpdatePayload } from '../services/adminProductService'

export function useAdminProducts(params: { page?: number; size?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminProductService.getProducts(params),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductCreatePayload) => adminProductService.createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductUpdatePayload }) =>
      adminProductService.updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminProductService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })
}

export function useUploadProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      adminProductService.uploadImage(productId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })
}

export function useDeleteProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      adminProductService.deleteImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })
}
