export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const get = async <T>(path: string, params?: Record<string, any>) => {
    return await $fetch<T>(path, { baseURL, params })
  }

  const post = async <T>(path: string, body?: Record<string, any>) => {
    return await $fetch<T>(path, {
      baseURL,
      method: "POST",
      body
    })
  }
  return { get , post }
}
