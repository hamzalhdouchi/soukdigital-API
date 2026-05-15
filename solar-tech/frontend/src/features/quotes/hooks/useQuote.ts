import { useMutation } from '@tanstack/react-query'
import { quoteService } from '../services/quoteService'
import type { QuoteRequest } from '@/types'

export function useSubmitQuote() {
  return useMutation({
    mutationFn: (data: QuoteRequest) => quoteService.submit(data),
  })
}
