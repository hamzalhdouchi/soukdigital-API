import api from '@/lib/axios'
import type { User, AuthTokens } from '@/types'

export interface AuthResponse extends AuthTokens {
  id: number
  email: string
  firstName: string
  lastName: string
  roles: string[]
  tokenType: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload).then((r) => r.data.data),

  register: (payload: RegisterPayload) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/register', payload).then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/refresh', { refreshToken }).then((r) => r.data.data),

  me: () =>
    api.get<{ success: boolean; data: User }>('/users/me').then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),
}
