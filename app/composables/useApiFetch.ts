import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { useAuthStore } from '@/stores/useAuthStore';

// ── 1. useApiFetch — สำหรับ component context (useFetch) ─────────────────────
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
                _handleUnauthorized();
            }
        },
    });
}

// ── helper: แสดง toast + logout ──────────────────────────────────────────────
function _handleUnauthorized() {
    const auth = useAuthStore();

    // แสดง toast ก่อน logout
    if (typeof window !== 'undefined') {
        // ใช้ custom event ให้ layout รับไปแสดง toast
        window.dispatchEvent(
            new CustomEvent('auth:expired', {
                detail: { message: 'Session หมดอายุ กรุณา Login ใหม่' },
            }),
        );
        // delay เล็กน้อยให้ toast แสดงก่อน redirect
        setTimeout(() => auth.logout(), 1500);
    } else {
        auth.logout();
    }
}

// ── 2. apiFetch — สำหรับ async function / Pinia action ($fetch) ──────────────
export async function apiFetch<T>(path: string, options: NitroFetchOptions<NitroFetchRequest> & { query?: Record<string, any> } = {}): Promise<T> {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) ?? {}),
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    };

    // build URL with query params
    let url = `${config.public.apiBase}${path}`;
    if (options.query && Object.keys(options.query).length > 0) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(options.query)) {
            if (v !== undefined && v !== null) params.append(k, String(v));
        }
        url += `?${params.toString()}`;
    }

    const { query: _q, ...fetchOptions } = options;

    try {
        return await $fetch<T>(url, {
            ...fetchOptions,
            headers,
        });
    } catch (e: any) {
        const status = e?.status ?? e?.response?.status;
        if (status === 401) {
            console.warn('[apiFetch] 401 Unauthorized — session expired');
            _handleUnauthorized();
        }
        throw e;
    }
}
