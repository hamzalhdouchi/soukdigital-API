import api from '@/lib/axios'
import type { User } from '@/types'

export interface MyOrder {
  id: number
  reference: string
  status: string
  totalTtc: number
  currency: string
  createdAt: string
}

interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
}

export const userService = {
  me: () =>
    api
      .get<{ success: boolean; data: User }>('/users/me')
      .then((r) => r.data.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    api
      .patch<{ success: boolean; data: User }>('/users/me', payload)
      .then((r) => r.data.data),

  myOrders: (page = 0) =>
    api
      .get<{ success: boolean; data: { content: MyOrder[]; totalPages: number } }>('/orders/me', { params: { page, size: 5 } })
      .then((r) => r.data.data),
}
