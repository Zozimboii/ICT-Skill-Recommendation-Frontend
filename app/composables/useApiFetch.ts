// import type { UseFetchOptions } from 'nuxt/app'

// import type { UseFetchOptions } from '#app';

// export function useApiFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
//   const config = useRuntimeConfig()
//   const token = useCookie<string | null>('token', { sameSite: 'lax' })

//   // ทำ headers ให้เป็น object ชัด ๆ ก่อน (หลีกเลี่ยง type แดง)
//   const mergedHeaders: Record<string, string> = {
//     ...(options.headers as any),
//     ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
//   }

//   return useFetch<T>(path, {
//     ...options as any,
//     baseURL: config.public.apiBase,
//     headers: mergedHeaders as any,
//   })
// }

// export function useApiFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
//     const config = useRuntimeConfig();

//     let token: string | null = null;

//     if (process.client) {
//         token = localStorage.getItem('token');
//     }

//     const mergedHeaders: Record<string, string> = {
//         ...(options.headers as any),
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };

//     return useFetch<T>(path, {
//         ...(options as any),
//         baseURL: config.public.apiBase,
//         headers: mergedHeaders as any,
//     });
// }
// composables/useApiFetch.ts

// export async function useApiFetch<T>(path: string, options: any = {}): Promise<T> {
//     const config = useRuntimeConfig();

//     let token: string | null = null;

//     if (process.client) {
//         token = localStorage.getItem('token');
//     }

//     const headers: Record<string, string> = {
//         ...(options.headers || {}),
//     };

//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }

//     return await $fetch<T>(path, {
//         ...options,
//         baseURL: config.public.apiBase,
//         headers,
//     });
// }
// export async function useApiFetch<T>(url: string, options: any = {}) {
//     const config = useRuntimeConfig();
//     const token = useState<string | null>('token');

//     const headers: any = {
//         ...(options.headers || {}),
//     };

//     if (token.value) {
//         headers.Authorization = `Bearer ${token.value}`;
//     }

//     return await useFetch<T>(url, {
//         baseURL: config.public.apiBase,
//         ...options,
//         headers,
//     });
// }

// import type { UseFetchOptions } from 'nuxt/app';
// import { useGenVueKey } from './useGenVueKey';

// export function useApiFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
//     let headers: any = {};
//     const { $api } = useNuxtApp();
//     const csrfToken = useCookie('XSRF-TOKEN');
//     const { token } = useAuth();

//     if (csrfToken.value) {
//         headers['X-XSRF-TOKEN'] = csrfToken.value as string;
//     }

//     headers = {
//         ...headers,
//         ...useRequestHeaders(['cookie']),
//     };

//     return useFetch($api(path), {
//         key: useGenVueKey(),
//         credentials: 'include',
//         watch: false,
//         ...options,
//         headers: {
//             ...headers,
//             ...options?.headers,
//             authorization: token.value,
//         },
//     });
// }

// composables/useApiFetch.ts
// composables/useApiFetch.ts

// composables/useApiFetch.ts
export function useApiFetch<T>(path: string, options: any = {}) {
    const config = useRuntimeConfig();
    const { token } = useAuth(); // ดึง token state มาจาก useAuth

    // ใช้ defu หรือ merge headers
    const headers = {
        ...options.headers,
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    };

    return useFetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers,
        // แนะนำเพิ่มเติม: จัดการ error global ที่นี่ได้เลย
        onResponseError({ response }) {
            if (response.status === 401) {
                // ถ้า token หมดอายุ ให้ logout
                const { logout } = useAuth();
                logout();
            }
        },
    });
}
