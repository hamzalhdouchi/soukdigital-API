import api from '@/lib/axios'
import type { QuoteRequest } from '@/types'

export interface QuoteResponse {
  id: number
  reference: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
}

export const quoteService = {
  submit: (data: QuoteRequest) =>
    api
      .post<{ success: boolean; data: QuoteResponse; message: string }>('/quotes', data)
      .then((r) => r.data),
}
