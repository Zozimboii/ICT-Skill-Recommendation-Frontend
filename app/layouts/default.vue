<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const { isLoggedIn, logout } = useAuth();
const route = useRoute();

const scrolled = ref(false);
const handleScroll = () => {
    scrolled.value = window.scrollY > 20;
};
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const navItems = computed(() => {
    const base = [
        { to: '/', label: 'Trend' },
        { to: '/searchjob', label: 'Search Job' },
    ];
    if (isLoggedIn.value) return [...base, { to: '/transcript', label: 'Transcript' }];
    return base;
});

const isActive = (path: string) => route.path === path;
</script>

<template>
    <div class="relative min-h-screen flex flex-col text-slate-100 font-['Sarabun'] overflow-x-hidden" style="background-color: #0a1628">
        <!-- dot grid — สว่างขึ้น -->
        <div class="fixed inset-0 z-0 pointer-events-none opacity-25" style="background-image: radial-gradient(#3a8fd4 0.6px, transparent 0.6px); background-size: 24px 24px" />

        <!-- blue glow top-right — เพิ่ม intensity -->
        <div
            class="fixed -top-40 -right-20 w-[600px] h-[600px] rounded-full blur-[100px] z-0 pointer-events-none"
            style="background: radial-gradient(circle, rgba(13, 95, 163, 0.38) 0%, transparent 70%)"
        />

        <!-- green glow bottom-left — เพิ่ม intensity -->
        <div
            class="fixed -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[90px] z-0 pointer-events-none"
            style="background: radial-gradient(circle, rgba(76, 175, 80, 0.25) 0%, transparent 70%)"
        />

        <!-- center ambient — ใหม่ -->
        <div
            class="fixed top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] z-0 pointer-events-none"
            style="background: radial-gradient(ellipse, rgba(13, 95, 163, 0.14) 0%, transparent 70%)"
        />

        <!-- Navbar -->
        <header :class="['fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300', scrolled ? 'scale-[0.98]' : 'scale-100']">
            <nav
                class="flex items-center justify-between gap-4 rounded-full px-5 py-2.5 w-[95vw] max-w-5xl backdrop-blur-xl transition-all duration-300"
                :style="
                    scrolled
                        ? 'background: rgba(6,14,26,0.92); border: 1px solid rgba(42,127,212,0.35); box-shadow: 0 8px 32px rgba(13,95,163,0.15);'
                        : 'background: rgba(6,14,26,0.80); border: 1px solid rgba(42,127,212,0.2); box-shadow: 0 4px 20px rgba(13,95,163,0.08);'
                "
            >
                <!-- ✅ Logo ต้องวางไฟล์ที่ frontend/public/logo.png -->
                <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                    <img src="/logo.png" alt="ICT" class="h-8 w-auto" />
                    <span
                        class="font-extrabold tracking-tight text-lg"
                        style="background: linear-gradient(135deg, #2a9fd6 0%, #4caf50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent"
                    >
                        ICT Recommendation
                    </span>
                </NuxtLink>

                <!-- Nav links -->
                <div class="flex items-center gap-1">
                    <NuxtLink
                        v-for="item in navItems"
                        :key="item.to"
                        :to="item.to"
                        class="px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                        :style="isActive(item.to) ? 'background: rgba(13,95,163,0.2); border: 1px solid rgba(42,159,214,0.4); color: #5bc4f5;' : 'color: #94a3b8; border: 1px solid transparent;'"
                    >
                        {{ item.label }}
                    </NuxtLink>
                </div>

                <!-- Auth -->
                <div class="flex items-center gap-2 shrink-0">
                    <template v-if="!isLoggedIn">
                        <NuxtLink to="/login" class="px-3 py-1.5 rounded-full text-base font-semibold text-slate-400 hover:text-white transition-all"> Login </NuxtLink>
                        <NuxtLink
                            to="/register"
                            class="px-4 py-1.5 rounded-full text-base font-semibold text-white transition-all"
                            style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%); box-shadow: 0 3px 12px rgba(13, 95, 163, 0.35)"
                        >
                            Register
                        </NuxtLink>
                    </template>
                    <button v-else class="px-4 py-1.5 rounded-full text-base font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-all" @click="logout">
                        Logout
                    </button>
                </div>
            </nav>
        </header>

        <!-- Content -->
        <main class="relative z-10 flex-1 px-4 pt-28 pb-10">
            <div class="w-full max-w-[90%] mx-auto">
                <slot />
            </div>
        </main>

        <!-- Footer -->
        <footer class="relative z-10 py-5 text-sm text-slate-500 text-center" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">© {{ new Date().getFullYear() }} ICT Job Recommendation</footer>
    </div>
</template>
