// composables/useApiFetch.ts
// export function useApiFetch<T>(path: string, options: any = {}) {
//     const config = useRuntimeConfig();
//     const { token } = useAuth(); // ดึง token state มาจาก useAuth

//     // ใช้ defu หรือ merge headers
//     const headers = {
//         ...options.headers,
//         ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
//     };

//     return useFetch<T>(path, {
//         ...options,
//         baseURL: config.public.apiBase,
//         headers,
//         // แนะนำเพิ่มเติม: จัดการ error global ที่นี่ได้เลย
//         onResponseError({ response }) {
//             if (response.status === 401) {
//                 // ถ้า token หมดอายุ ให้ logout
//                 const { logout } = useAuth();
//                 logout();
//             }
//         },
//     });
// }

export function useApiFetch<T>(path: string, options: any = {}) {
    const config = useRuntimeConfig();
    const { token } = useAuth();

    const headers = {
        ...options.headers,
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    };

    return useFetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers,
        onResponseError({ response }) {
            if (response.status === 401) {
                const { logout } = useAuth();
                logout();
            }
        },
    });
}
