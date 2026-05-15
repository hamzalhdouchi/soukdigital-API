import api from '@/lib/axios'

export interface OrderResponse {
  id: number
  reference: string
  status: string
  totalTtc: number
  currency: string
  createdAt: string
}

export interface OrderCreatePayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode: string
  country: string
  notes?: string
  items: {
    variantId?: number
    productName: string
    variantLabel?: string
    quantity: number
    unitPriceHt: number
    unitPriceTtc: number
  }[]
}

export const orderService = {
  create: (payload: OrderCreatePayload) =>
    api
      .post<{ success: boolean; data: OrderResponse; message: string }>('/orders', payload)
      .then((r) => r.data),
}
