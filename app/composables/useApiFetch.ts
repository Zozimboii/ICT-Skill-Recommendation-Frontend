// composables/useApiFetch.ts
import { useAuthStore } from '@/stores/useAuthStore';

export function useApiFetch<T>(path: string, options: any = {}) {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const headers = {
        ...options.headers,
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    };

    return useFetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers,
        onResponseError({ response }) {
            if (response.status === 401) {
                auth.logout();
            }
        },
    });
}
