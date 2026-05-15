import api from '@/lib/axios'

export interface AdminOrder {
  id: number
  reference: string
  status: string
  shippingFirstName: string
  shippingLastName: string
  shippingEmail: string
  shippingCity: string
  shippingCountry: string
  totalTtc: number
  currency: string
  createdAt: string
}

export interface AdminOrderPage {
  content: AdminOrder[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const adminOrderService = {
  getOrders: (params: { status?: string; page?: number; size?: number }) =>
    api
      .get<{ success: boolean; data: AdminOrderPage }>('/admin/orders', { params })
      .then((r) => r.data.data),

  updateStatus: (id: number, status: string) =>
    api
      .patch<{ success: boolean; data: AdminOrder }>(`/admin/orders/${id}/status`, null, { params: { status } })
      .then((r) => r.data.data),
}
