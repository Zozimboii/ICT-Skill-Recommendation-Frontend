// middleware/admin.global.ts
// ป้องกันหน้า /admin — เฉพาะ user ที่ role === 'admin' เข้าได้
// เนื่องจาก useAuth เก็บแค่ token ไม่ได้เก็บ role ใน client
// ให้ backend guard เป็นหลัก (403) และ frontend redirect เมื่อ token หมด

export default defineNuxtRouteMiddleware((to) => {
    if (!to.path.startsWith('/admin')) return;

    const { isLoggedIn } = useAuth();

    if (!isLoggedIn.value) {
        return navigateTo('/login');
    }
    // role check → ทำ backend-side ผ่าน require_admin guard
    // ถ้าอยากทำ client-side เพิ่ม role ใน useAuth และเช็คที่นี่
});
