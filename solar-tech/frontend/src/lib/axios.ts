import axios from 'axios'
import { store } from '@/app/store'
import { logout, setTokens } from '@/features/auth/authSlice'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = store.getState().auth.refreshToken
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        store.dispatch(setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }))
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        store.dispatch(logout())
        window.location.href = '/connexion'
      }
    }
    return Promise.reject(error)
  },
)

export default api
