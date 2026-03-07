// // app/composables/useAuth.ts

// import type { AuthResponse, LoginPayload, RegisterPayload } from '~/types/Auth';

// const BASE_URL = '/api/v1/auth';

// export function useAuth() {
//     const token = useState<string | null>('token', () => null);

//     if (process.client) {
//         token.value = localStorage.getItem('token');
//     }

//     const isLoggedIn = computed(() => !!token.value);

//     // ✅ Login
//     async function login(payload: LoginPayload): Promise<AuthResponse> {
//         const { data, error } = await useApiFetch<AuthResponse>(`${BASE_URL}/login`, {
//             method: 'POST',
//             body: payload,
//         });
//         if (error.value) throw error.value;

//         const res = data.value;
//         if (!res) throw new Error('No response from server');

//         const t = res.access_token || res.token;
//         if (!t) throw new Error('No token in response');

//         token.value = t;
//         localStorage.setItem('token', t);
//         return res;
//     }

//     // ✅ Register (เพิ่มใหม่)
//     async function register(payload: RegisterPayload): Promise<any> {
//         const { data, error } = await useApiFetch(`${BASE_URL}/register`, {
//             method: 'POST',
//             body: payload,
//         });

//         if (error.value) {
//             // ดึง Error จาก Backend มาโยนต่อ
//             throw error.value;
//         }
//         return data.value;
//     }

//     function logout() {
//         token.value = null;
//         localStorage.removeItem('token');
//         navigateTo('/login');
//     }

//     return {
//         token,
//         isLoggedIn,
//         login,
//         register, // อย่าลืม export ออกไปใช้
//         logout,
//     };
// }
// composables/useAuth.ts
import type { AuthResponse, LoginPayload, RegisterPayload } from '~/types/Auth';

const BASE_URL = '/api/v1/auth';

export function useAuth() {
    // ใช้ useCookie แทน localStorage เพื่อให้ Server-side รู้จัก token ด้วย
    const token = useCookie<string | null>('token', {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        watch: true,
    });

    const isLoggedIn = computed(() => !!token.value);

    async function login(payload: LoginPayload): Promise<AuthResponse> {
        const { data, error } = await useApiFetch<AuthResponse>(`${BASE_URL}/login`, {
            method: 'POST',
            body: payload,
        });

        // 1. ถ้ามี error จากการยิง API ให้ throw ทันที
        if (error.value) {
            throw error.value;
        }

        // 2. ตรวจสอบว่า data.value มีค่าไหม
        // วิธีนี้จะช่วยให้ TypeScript มั่นใจว่า 'res' ไม่เป็น undefined หลังจากบรรทัดนี้
        const res = data.value;

        if (!res) {
            throw new Error('No data received from server');
        }

        // 3. จัดการเรื่อง Token
        const t = res.access_token || res.token;
        if (t) {
            token.value = t;
            // หากใช้ useCookie ตามที่แนะนำก่อนหน้า มันจะบันทึกให้อัตโนมัติครับ
        }

        // ตอนนี้ TypeScript จะยอมให้ return res แล้ว เพราะเรารองรับกรณี undefined ไปแล้วข้างบน
        return res;
    }

    function logout() {
        token.value = null; // ลบ cookie
        navigateTo('/login');
    }
    async function register(payload: RegisterPayload) {
        const { data, error } = await useApiFetch(`${BASE_URL}/register`, {
            method: 'POST',
            body: payload,
        });

        if (error.value) {
            throw error.value;
        }

        if (!data.value) {
            throw new Error('No data received from server');
        }

        return data.value;
    }

    return {
        token,
        isLoggedIn,
        login,
        register,
        logout,
    };
}
