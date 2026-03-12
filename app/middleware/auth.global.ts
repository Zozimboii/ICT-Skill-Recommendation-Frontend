// middleware/auth.global.ts
import { useAuthStore } from '@/stores/useAuthStore';

export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuthStore();
    const protectedPages = ['/assessment', '/transcript', '/dashboard'];
    const isProtected = protectedPages.some((p) => to.path.startsWith(p));

    if (isProtected && !auth.isLoggedIn) {
        return navigateTo('/login');
    }
});
