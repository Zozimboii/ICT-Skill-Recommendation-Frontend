import type { UseFetchOptions } from 'nuxt/app'

export function useApiFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })

  // ทำ headers ให้เป็น object ชัด ๆ ก่อน (หลีกเลี่ยง type แดง)
  const mergedHeaders: Record<string, string> = {
    ...(options.headers as any),
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  }

  return useFetch<T>(path, {
    ...options as any,
    baseURL: config.public.apiBase,
    headers: mergedHeaders as any,
  })
}
