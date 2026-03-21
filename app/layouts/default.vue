<!-- app/layouts/default.vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/useAuthStore';

const route = useRoute();
const auth = useAuthStore();
const { isLoggedIn, role } = storeToRefs(auth);
const { logout } = auth;

const scrolled = ref(false);
const mobileOpen = ref(false);

onMounted(() =>
    window.addEventListener('scroll', () => {
        scrolled.value = window.scrollY > 20;
    }),
);
onUnmounted(() => window.removeEventListener('scroll', () => {}));
watch(
    () => route.path,
    () => {
        mobileOpen.value = false;
    },
);

const navItems = computed(() => [
    { to: '/', label: 'Trend', requireAuth: null },
    { to: '/searchjob', label: 'Search Job', requireAuth: null },
    { to: '/transcript', label: 'Transcript', requireAuth: true },
    { to: '/assessment', label: 'Assessment', requireAuth: false },
    ...(isLoggedIn.value ? [{ to: '/dashboard', label: 'Dashboard', requireAuth: true }] : []),
    ...(role.value === 'admin' ? [{ to: '/admin', label: 'Admin', requireAuth: true }] : []),
]);

const toast = ref('');
let toastTimer: ReturnType<typeof setTimeout>;
function showToast(msg: string) {
    toast.value = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.value = '';
    }, 3000);
}

const router = useRouter();
function handleNavClick(item: (typeof navItems.value)[0], e: MouseEvent) {
    if (item.requireAuth === true && !isLoggedIn.value) {
        e.preventDefault();
        showToast('กรุณา Login ก่อนใช้งาน ' + item.label);
        router.push('/login');
    }
}

const isActive = (path: string) => route.path === path;
</script> -->
<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/useAuthStore';

const route = useRoute();
const auth = useAuthStore();
const { isLoggedIn, role } = storeToRefs(auth);
const { logout } = auth;

const scrolled = ref(false);
const mobileOpen = ref(false);

onMounted(() => {
    window.addEventListener('scroll', () => {
        scrolled.value = window.scrollY > 20;
    });

    // sync token ทันทีเมื่อ app mount
    auth.syncFromCookie();

    // sync ทุกครั้งที่ user กลับมาที่ tab — จับกรณี token หมดขณะ tab ซ่อน
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) auth.syncFromCookie();
    });

    // รับ event จาก apiFetch เมื่อ token หมดอายุ → แสดง toast ก่อน logout
    window.addEventListener('auth:expired', (e: Event) => {
        const msg = (e as CustomEvent).detail?.message ?? 'Session หมดอายุ กรุณา Login ใหม่';
        showToast(msg);
    });
});
onUnmounted(() => window.removeEventListener('scroll', () => {}));
watch(
    () => route.path,
    () => {
        mobileOpen.value = false;
    },
);

const navItems = computed(() => [
    { to: '/', label: 'Trend', requireAuth: null },
    { to: '/searchjob', label: 'Search Job', requireAuth: null },
    { to: '/transcript', label: 'Transcript', requireAuth: true },
    { to: '/assessment', label: 'Assessment', requireAuth: false },
    ...(isLoggedIn.value ? [{ to: '/dashboard', label: 'Dashboard', requireAuth: true }] : []),
    ...(role.value === 'admin' ? [{ to: '/admin', label: 'Admin', requireAuth: true }] : []),
]);

const toast = ref('');
let toastTimer: ReturnType<typeof setTimeout>;
function showToast(msg: string) {
    toast.value = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.value = '';
    }, 3000);
}

const router = useRouter();
function handleNavClick(item: (typeof navItems.value)[0], e: MouseEvent) {
    if (item.requireAuth === true && !isLoggedIn.value) {
        e.preventDefault();
        showToast('กรุณา Login ก่อนใช้งาน ' + item.label);
        router.push('/login');
    }
}

const isActive = (path: string) => route.path === path;
</script>

<template>
    <div class="relative min-h-screen flex flex-col text-slate-100 font-['Sarabun'] overflow-x-hidden" style="background-color: #0a1628; font-size: 16px">
        <!-- Background effects -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-25" style="background-image: radial-gradient(#3a8fd4 0.6px, transparent 0.6px); background-size: 24px 24px" />
        <div
            class="fixed -top-40 -right-20 w-[600px] h-[600px] rounded-full blur-[100px] z-0 pointer-events-none"
            style="background: radial-gradient(circle, rgba(13, 95, 163, 0.38) 0%, transparent 70%)"
        />
        <div
            class="fixed -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[90px] z-0 pointer-events-none"
            style="background: radial-gradient(circle, rgba(76, 175, 80, 0.25) 0%, transparent 70%)"
        />

        <!-- Toast -->
        <Transition name="toast">
            <div
                v-if="toast"
                class="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold shadow-xl"
                style="background: #0c1a30; border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; backdrop-filter: blur(12px)"
            >
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {{ toast }}
            </div>
        </Transition>

        <!-- Navbar -->
        <header :class="['fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[96vw] max-w-6xl', scrolled ? 'scale-[0.985]' : 'scale-100']">
            <nav
                class="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 backdrop-blur-xl transition-all duration-300"
                :style="
                    scrolled
                        ? 'background:rgba(6,14,26,0.96); border:1px solid rgba(42,127,212,0.35); box-shadow:0 8px 32px rgba(13,95,163,0.22);'
                        : 'background:rgba(6,14,26,0.82); border:1px solid rgba(42,127,212,0.2); box-shadow:0 4px 20px rgba(13,95,163,0.1);'
                "
            >
                <!-- Logo -->
                <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                    <img src="/logo.png" alt="ICT" class="h-8 w-auto" />
                    <span
                        class="font-extrabold tracking-tight text-lg hidden sm:block"
                        style="background: linear-gradient(135deg, #2a9fd6 0%, #4caf50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent"
                    >
                        ICT Skill
                    </span>
                </NuxtLink>

                <!-- Desktop nav -->
                <div class="hidden md:flex items-center gap-1">
                    <NuxtLink
                        v-for="item in navItems"
                        :key="item.to"
                        :to="item.to"
                        class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-semibold transition-all duration-150"
                        :style="isActive(item.to) ? 'background:rgba(13,95,163,0.25); border:1px solid rgba(42,159,214,0.4); color:#5bc4f5;' : 'color:#94a3b8; border:1px solid transparent;'"
                        @click="(e) => handleNavClick(item, e)"
                        @mouseover="
                            (e) => {
                                if (!isActive(item.to)) (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
                            }
                        "
                        @mouseleave="
                            (e) => {
                                if (!isActive(item.to)) (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                            }
                        "
                    >
                        {{ item.label }}
                        <!-- Lock badge -->
                        <span
                            v-if="item.requireAuth === true && !isLoggedIn"
                            class="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full"
                            style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4)"
                        >
                            <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                    </NuxtLink>
                </div>

                <!-- Auth + hamburger -->
                <div class="flex items-center gap-2 shrink-0">
                    <!-- Desktop auth -->
                    <div class="hidden md:block">
                        <template v-if="!isLoggedIn">
                            <div class="flex items-center rounded-xl overflow-hidden" style="border: 1px solid rgba(42, 127, 212, 0.3)">
                                <NuxtLink
                                    to="/login"
                                    class="px-4 py-1.5 text-base font-semibold text-slate-400 hover:text-white transition-all"
                                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')"
                                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                                >
                                    Login
                                </NuxtLink>
                                <div class="w-px h-5" style="background: rgba(42, 127, 212, 0.3)" />
                                <NuxtLink
                                    to="/register"
                                    class="px-4 py-1.5 text-base font-semibold text-white transition-all"
                                    style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%)"
                                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)')"
                                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1)')"
                                >
                                    Register
                                </NuxtLink>
                            </div>
                        </template>
                        <template v-else>
                            <div class="flex items-center rounded-xl overflow-hidden" style="border: 1px solid rgba(42, 127, 212, 0.25)">
                                <div class="px-3 py-1.5 flex items-center gap-1.5" style="background: rgba(13, 95, 163, 0.12)">
                                    <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #4caf50; box-shadow: 0 0 5px #4caf50" />
                                    <span class="text-base font-bold" style="color: #5bc4f5">
                                        {{ role === 'admin' ? 'Admin' : 'User' }}
                                    </span>
                                </div>
                                <div class="w-px h-5" style="background: rgba(42, 127, 212, 0.25)" />
                                <button
                                    class="px-4 py-1.5 text-base font-semibold transition-all"
                                    style="color: #f87171aa"
                                    @click="logout"
                                    @mouseover="
                                        (e) => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                                            (e.currentTarget as HTMLElement).style.color = '#f87171';
                                        }
                                    "
                                    @mouseleave="
                                        (e) => {
                                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLElement).style.color = '#f87171aa';
                                        }
                                    "
                                >
                                    Logout
                                </button>
                            </div>
                        </template>
                    </div>

                    <!-- Mobile hamburger -->
                    <button class="md:hidden flex flex-col gap-1 p-2 rounded-lg transition" style="border: 1px solid rgba(42, 127, 212, 0.2)" @click="mobileOpen = !mobileOpen">
                        <span v-for="i in 3" :key="i" class="block w-5 h-0.5 rounded-full" style="background: #5bc4f5" />
                    </button>
                </div>
            </nav>

            <!-- Mobile drawer -->
            <Transition name="mobile-menu">
                <div
                    v-if="mobileOpen"
                    class="md:hidden mt-2 rounded-2xl px-3 py-3 space-y-1"
                    style="background: rgba(6, 14, 26, 0.97); border: 1px solid rgba(42, 127, 212, 0.25); backdrop-filter: blur(16px)"
                >
                    <NuxtLink
                        v-for="item in navItems"
                        :key="item.to"
                        :to="item.to"
                        class="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all"
                        :style="isActive(item.to) ? 'background:rgba(13,95,163,0.2); color:#5bc4f5;' : 'color:#94a3b8;'"
                        @click="(e) => handleNavClick(item, e)"
                    >
                        <span>{{ item.label }}</span>
                        <span
                            v-if="item.requireAuth === true && !isLoggedIn"
                            class="ml-auto text-base px-2 py-0.5 rounded-full"
                            style="background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24"
                        >
                            ต้อง Login
                        </span>
                    </NuxtLink>

                    <!-- Mobile auth -->
                    <div class="pt-2 mt-2 flex gap-2" style="border-top: 1px solid rgba(42, 127, 212, 0.12)">
                        <template v-if="!isLoggedIn">
                            <NuxtLink to="/login" class="flex-1 text-center py-2.5 rounded-xl text-base font-semibold text-slate-300 transition" style="border: 1px solid rgba(42, 127, 212, 0.25)">
                                Login
                            </NuxtLink>
                            <NuxtLink to="/register" class="flex-1 text-center py-2.5 rounded-xl text-base font-semibold text-white" style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)">
                                Register
                            </NuxtLink>
                        </template>
                        <template v-else>
                            <button class="flex-1 py-2.5 rounded-xl text-base font-semibold text-red-400 transition" style="border: 1px solid rgba(239, 68, 68, 0.25)" @click="logout">Logout</button>
                        </template>
                    </div>
                </div>
            </Transition>
        </header>

        <!-- Main content -->
        <main class="relative z-10 flex-1 px-4 pt-28 pb-12">
            <div class="w-full max-w-[90%] mx-auto">
                <slot />
            </div>
        </main>

        <!-- Footer -->
        <footer class="relative z-10 py-5 text-base text-slate-500 text-center" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">© {{ new Date().getFullYear() }} ICT Job Recommendation</footer>
    </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
}
.mobile-menu-enter-active,
.mobile-menu-leave-active {
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
