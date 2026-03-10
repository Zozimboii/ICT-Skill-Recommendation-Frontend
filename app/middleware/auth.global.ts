// // app/middleware/auth.global.ts
// export default defineNuxtRouteMiddleware((to) => {
//     const { isLoggedIn } = useAuth();

//     const protectedPages = ['/assessment', '/transcript'];
//     const requiresAuth = protectedPages.includes(to.path);

//     if (requiresAuth && !isLoggedIn.value) {
//         return navigateTo('/login');
//     }
// });
// middleware/auth.ts
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const { isLoggedIn } = useAuth();

    const protectedPages = ['/assessment', '/transcript'];
    const isProtected = protectedPages.some((path) => to.path.startsWith(path));

    if (isProtected && !isLoggedIn.value) {
        return navigateTo('/login');
    }
});
