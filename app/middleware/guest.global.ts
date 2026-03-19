// app/middleware/guest.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const { isLoggedIn } = useAuthStore();
    const guestOnly = ['/login', '/register'];

    if (isLoggedIn && guestOnly.includes(to.path)) {
        return navigateTo('/');
    }
});
