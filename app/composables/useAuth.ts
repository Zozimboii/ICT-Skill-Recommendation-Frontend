// composables/useAuth.ts
import { useAuthStore } from '~/stores/useAuthStore';
import type { AuthResponse, LoginPayload, RegisterPayload } from '~/types/Auth';

const BASE_URL = '/api/v1/auth';

export function useAuth() {
    const store = useAuthStore();

    async function login(payload: LoginPayload): Promise<AuthResponse> {
        const { data, error } = await useApiFetch<AuthResponse>(`${BASE_URL}/login`, {
            method: 'POST',
            body: payload,
        });

        if (error.value) throw error.value;
        const res = data.value;
        if (!res) throw new Error('No data received');

        const t = res.access_token || res.token;
        if (t) {
            store.setToken(t);
            try {
                const parts = t.split('.');
                if (parts.length === 3 && parts[1]) {
                    const jwtPayload = JSON.parse(atob(parts[1]));
                    if (jwtPayload.role) store.setRole(jwtPayload.role);
                }
            } catch {
                /* ignore */
            }
        }

        return res;
    }

    async function register(payload: RegisterPayload) {
        const { data, error } = await useApiFetch(`${BASE_URL}/register`, {
            method: 'POST',
            body: payload,
        });
        if (error.value) throw error.value;
        if (!data.value) throw new Error('No data received');
        return data.value;
    }

    return {
        token: store.token,
        role: store.role,
        isLoggedIn: store.isLoggedIn,
        isAdmin: store.isAdmin,
        logout: store.logout,
        login,
        register,
    };
}
