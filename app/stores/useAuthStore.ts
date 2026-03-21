// // stores/useAuthStore.ts
// import { defineStore } from 'pinia';

// export const useAuthStore = defineStore('auth', () => {
//     const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 7 });
//     const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 7 });

//     // ref ใช้ cookie เป็น initial value
//     const token = ref<string | null>(tokenCookie.value ?? null);
//     const role = ref<string | null>(roleCookie.value ?? null);

//     const isLoggedIn = computed(() => !!token.value);
//     const isAdmin = computed(() => role.value === 'admin');

//     function setToken(t: string | null) {
//         token.value = t;
//         tokenCookie.value = t;
//     }

//     function setRole(r: string | null) {
//         role.value = r;
//         roleCookie.value = r;
//     }

//     function logout() {
//         setToken(null);
//         setRole(null);
//         // hard reload → clear Vue state ทั้งหมด ไม่มีข้อมูล user เก่าค้าง
//         window.location.href = '/login';
//     }

//     return { token, role, isLoggedIn, isAdmin, setToken, setRole, logout };
// });

// stores/useAuthStore.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
    const tokenCookie = useCookie<string | null>('auth_token', { maxAge: 60 * 60 * 24 * 7 });
    const roleCookie = useCookie<string | null>('auth_role', { maxAge: 60 * 60 * 24 * 7 });

    // ref sync กับ cookie
    const token = ref<string | null>(tokenCookie.value ?? null);
    const role = ref<string | null>(roleCookie.value ?? null);

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => role.value === 'admin');

    function setToken(t: string | null) {
        token.value = t;
        tokenCookie.value = t;
    }

    function setRole(r: string | null) {
        role.value = r;
        roleCookie.value = r;
    }

    function logout() {
        setToken(null);
        setRole(null);
        // hard reload → clear Pinia + Vue state ทั้งหมด
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    /**
     * sync token จาก cookie → ref
     * เรียกเมื่อ app mount หรือเมื่อ visibilitychange กลับมา
     * แก้ปัญหา: token หมดอายุ → cookie ว่าง แต่ ref ยังมีค่าเดิม
     */
    function syncFromCookie() {
        const cookieToken = tokenCookie.value;
        if (token.value && !cookieToken) {
            // token ใน memory แต่ cookie หมดแล้ว → logout
            console.warn('[AuthStore] token expired (cookie missing) — logging out');
            logout();
        }
    }

    return { token, role, isLoggedIn, isAdmin, setToken, setRole, logout, syncFromCookie };
});
