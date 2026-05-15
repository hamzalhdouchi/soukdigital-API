import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminQuoteService } from '../services/adminQuoteService'

export function useAdminQuotes(params: { status?: string; page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: ['admin-quotes', params],
    queryFn: () => adminQuoteService.getQuotes(params),
  })
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) =>
      adminQuoteService.updateStatus(id, status, adminNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-quotes'] }),
  })
}
