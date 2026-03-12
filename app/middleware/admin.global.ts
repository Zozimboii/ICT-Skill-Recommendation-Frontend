// middleware/admin.global.ts
import { useAuthStore } from '@/stores/useAuthStore';

export default defineNuxtRouteMiddleware((to) => {
    if (!to.path.startsWith('/admin')) return;

    const auth = useAuthStore();

    if (!auth.isLoggedIn) {
        return navigateTo('/login');
    }
    // role check → ทำ backend-side ผ่าน require_admin guard
});
