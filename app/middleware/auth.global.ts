// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()

  // หน้าอนุญาตให้เข้าได้แม้ไม่ login
  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  if (!isLoggedIn.value && !isPublic) {
    return navigateTo('/login')
  }
})
