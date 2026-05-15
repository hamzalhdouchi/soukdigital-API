import api from '@/lib/axios'

export interface AdminQuotePage {
  content: AdminQuote[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdminQuote {
  id: number
  reference: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  installationType?: string
  message: string
  status: string
  adminNotes?: string
  items: {
    id: number
    productName: string
    variantLabel?: string
    quantity: number
    unitPriceHt?: number
  }[]
  createdAt: string
}

export const adminQuoteService = {
  getQuotes: (params: { status?: string; page?: number; size?: number }) =>
    api
      .get<{ success: boolean; data: AdminQuotePage }>('/admin/quotes', { params })
      .then((r) => r.data.data),

  updateStatus: (id: number, status: string, adminNotes?: string) =>
    api
      .patch<{ success: boolean; data: AdminQuote }>(`/admin/quotes/${id}/status`, { status, adminNotes })
      .then((r) => r.data.data),
}
