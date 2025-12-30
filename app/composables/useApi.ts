export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const get = async <T>(path: string, params?: Record<string, any>) => {
    return await $fetch<T>(path, { baseURL, params })
  }

  return { get }
}
