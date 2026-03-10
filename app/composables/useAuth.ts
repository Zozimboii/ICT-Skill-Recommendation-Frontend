// composables/useAuth.ts
import type { AuthResponse, LoginPayload, RegisterPayload } from '~/types/Auth';

const BASE_URL = '/api/v1/auth';

export function useAuth() {
    // useCookie อ่านค่าได้ทั้ง SSR + client หลัง F5
    const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 7 });
    const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 7 });

    // useState ใช้ cookie เป็น initial value → share ทั้งแอป
    const token = useState<string | null>('auth:token', () => tokenCookie.value ?? null);
    const role = useState<string | null>('auth:role', () => roleCookie.value ?? null);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => role.value === 'admin');

    function setToken(t: string | null) {
        token.value = t;
        tokenCookie.value = t; // เขียน cookie ด้วยเพื่อให้อยู่หลัง F5
    }

    function setRole(r: string | null) {
        role.value = r;
        roleCookie.value = r;
    }

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
            setToken(t);
            try {
                const parts = t.split('.');
                if (parts.length === 3 && parts[1]) {
                    const jwtPayload = JSON.parse(atob(parts[1]));
                    if (jwtPayload.role) setRole(jwtPayload.role);
                }
            } catch {
                /* ignore */
            }
        }

        return res;
    }

    function logout() {
        setToken(null);
        setRole(null);
        navigateTo('/login');
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

    return { token, role, isLoggedIn, isAdmin, login, register, logout };
}
