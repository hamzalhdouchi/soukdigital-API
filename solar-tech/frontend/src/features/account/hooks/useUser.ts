import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'

export function useMyOrders(page = 0) {
  return useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => userService.myOrders(page),
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: userService.me,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
