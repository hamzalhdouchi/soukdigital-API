import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCredentials, logout as logoutAction } from '@/features/auth/authSlice'
import { authService, type LoginPayload, type RegisterPayload } from '@/features/auth/services/authService'
import type { UserRole } from '@/types'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          roles: data.roles as UserRole[],
          isActive: true,
          emailVerified: true,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }))
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          roles: data.roles as UserRole[],
          isActive: true,
          emailVerified: false,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }))
      navigate('/')
    },
  })

  const logout = () => {
    dispatch(logoutAction())
    navigate('/connexion')
  }

  const isAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN')

  return {
    user,
    isAuthenticated: !!accessToken,
    isAdmin,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  }
}
