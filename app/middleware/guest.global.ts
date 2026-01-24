// app/middleware/guest.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()
  const guestOnly = ['/login', '/register']

  if (isLoggedIn.value && guestOnly.includes(to.path)) {
    return navigateTo('/')
  }
})
