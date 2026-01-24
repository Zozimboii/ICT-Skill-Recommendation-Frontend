// app/composables/useAuth.ts
type LoginPayload = { username: string; password: string }
type RegisterPayload = { username: string; email: string; password: string }

type AuthResponse = {
  access_token: string
  token_type?: string
  user?: any
  token?: string // เผื่อ backend บางทีใช้ชื่อ token
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })
  const BASE_URL = '/api/v1/auth'

  const isLoggedIn = computed(() => !!token.value)

  const apiFetch = async <T>(path: string, options: any = {}) => {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase,
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    })
  }

  const login = async (payload: LoginPayload) => {
    const res = await apiFetch<AuthResponse>(`${BASE_URL}/login`, {
      method: 'POST',
      body: payload,
    })

    // ✅ ใช้ token จริงจาก backend
    const t = res.access_token || res.token
    if (!t) throw new Error('No token in response')

    token.value = t
    return res
  }

  const register = async (payload: RegisterPayload) => {
    return await apiFetch(`${BASE_URL}/register`, {
      method: 'POST',
      body: payload,
    })
  }

  const logout = () => {
    token.value = null
    navigateTo('/login')
  }

  return { token, isLoggedIn, login, register, logout, apiFetch }
}
