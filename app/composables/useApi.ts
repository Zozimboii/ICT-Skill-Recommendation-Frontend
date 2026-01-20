// export const useApi = () => {
//   const config = useRuntimeConfig()
//   const baseURL = config.public.apiBase

//   const get = async <T>(path: string, params?: Record<string, any>) => {
//     return await $fetch<T>(path, { baseURL, params })
//   }

//   const post = async <T>(path: string, body?: Record<string, any>) => {
//     return await $fetch<T>(path, {
//       baseURL,
//       method: "POST",
//       body
//     })
//   }
//   return { get , post }
// }
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()

  const get = async <T>(path: string, params?: Record<string, any>) => {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase, // เช่น http://127.0.0.1:8000
      method: 'GET',
      params,
    })
  }

  const post = async <T>(path: string, body?: any) => {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase,
      method: 'POST',
      body,
    })
  }

  return { get, post }
}
