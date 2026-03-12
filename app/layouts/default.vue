<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';

const route = useRoute();
const auth = useAuthStore();

const { isLoggedIn, role } = storeToRefs(auth);
const { logout } = auth;

const scrolled = ref(false);
const handleScroll = () => {
    scrolled.value = window.scrollY > 20;
};
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const navGroups = computed(() => {
    const groups: { label: string; items: { to: string; label: string; icon: string }[] }[] = [
        {
            label: 'สำรวจ',
            items: [
                { to: '/', label: 'Trend', icon: '📈' },
                { to: '/searchjob', label: 'Search Job', icon: '🔍' },
            ],
        },
    ];

    if (isLoggedIn.value) {
        groups.push({
            label: 'ของฉัน',
            items: [
                { to: '/transcript', label: 'Transcript', icon: '📄' },
                { to: '/dashboard', label: 'Dashboard', icon: '🎯' },
                { to: '/assessment', label: 'Assessment', icon: '🎯' },
            ],
        });
    }

    if (role.value === 'admin') {
        groups.push({
            label: 'จัดการ',
            items: [{ to: '/admin', label: 'Admin', icon: '⚙️' }],
        });
    }

    return groups;
});

const isActive = (path: string) => route.path === path;
</script>

<template>
    <div class="relative min-h-screen flex flex-col text-slate-100 font-['Sarabun'] overflow-x-hidden" style="background-color: #0a1628">
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
        <div
            class="fixed top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] z-0 pointer-events-none"
            style="background: radial-gradient(ellipse, rgba(13, 95, 163, 0.14) 0%, transparent 70%)"
        />

        <!-- Navbar -->
        <header :class="['fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95vw] max-w-5xl', scrolled ? 'scale-[0.98]' : 'scale-100']">
            <nav
                class="flex items-center justify-between gap-3 rounded-2xl px-4 py-2 backdrop-blur-xl transition-all duration-300"
                :style="
                    scrolled
                        ? 'background: rgba(6,14,26,0.95); border: 1px solid rgba(42,127,212,0.35); box-shadow: 0 8px 32px rgba(13,95,163,0.2);'
                        : 'background: rgba(6,14,26,0.80); border: 1px solid rgba(42,127,212,0.2); box-shadow: 0 4px 20px rgba(13,95,163,0.08);'
                "
            >
                <!-- Logo -->
                <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                    <img src="/logo.png" alt="ICT" class="h-8 w-auto" />
                    <span
                        class="font-extrabold tracking-tight text-base hidden sm:block"
                        style="background: linear-gradient(135deg, #2a9fd6 0%, #4caf50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent"
                    >
                        ICT Skill
                    </span>
                </NuxtLink>

                <!-- Nav groups (center) -->
                <div class="flex items-center gap-2">
                    <template v-for="(group, gi) in navGroups" :key="group.label">
                        <!-- Divider ระหว่าง group -->
                        <div v-if="gi > 0" class="w-px h-4" style="background: rgba(42, 127, 212, 0.2)" />

                        <!-- Group pill -->
                        <div class="flex items-center gap-0.5 p-0.5 rounded-xl" :style="gi > 0 ? 'background: rgba(13,95,163,0.08); border: 1px solid rgba(42,127,212,0.15)' : ''">
                            <!-- Group label (เล็กมาก ด้านบน) — แสดงแค่ถ้า > 1 group -->
                            <template v-if="navGroups.length > 1 && false">
                                <!-- ซ่อนไว้ก่อน ถ้าอยากเพิ่ม label ทำได้ -->
                            </template>

                            <NuxtLink
                                v-for="item in group.items"
                                :key="item.to"
                                :to="item.to"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                                :style="
                                    isActive(item.to) ? 'background: rgba(13,95,163,0.25); border: 1px solid rgba(42,159,214,0.4); color: #5bc4f5;' : 'color: #94a3b8; border: 1px solid transparent;'
                                "
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
                                <span class="text-sm">{{ item.icon }}</span>
                                <span>{{ item.label }}</span>
                            </NuxtLink>
                        </div>
                    </template>
                </div>

                <!-- Auth pill (right) -->
                <div class="shrink-0">
                    <!-- ยังไม่ login -->
                    <template v-if="!isLoggedIn">
                        <div class="flex items-center rounded-xl overflow-hidden" style="border: 1px solid rgba(42, 127, 212, 0.3)">
                            <NuxtLink
                                to="/login"
                                class="px-4 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-all"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                            >
                                Login
                            </NuxtLink>
                            <div class="w-px h-5" style="background: rgba(42, 127, 212, 0.3)" />
                            <NuxtLink
                                to="/register"
                                class="px-4 py-1.5 text-sm font-semibold text-white transition-all"
                                style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%)"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1)')"
                            >
                                Register
                            </NuxtLink>
                        </div>
                    </template>

                    <!-- login แล้ว -->
                    <template v-else>
                        <div class="flex items-center rounded-xl overflow-hidden" style="border: 1px solid rgba(42, 127, 212, 0.25)">
                            <!-- Role indicator -->
                            <div class="px-3 py-1.5 flex items-center gap-1.5" style="background: rgba(13, 95, 163, 0.12)">
                                <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #4caf50; box-shadow: 0 0 5px #4caf50" />
                                <span class="text-xs font-bold" style="color: #5bc4f5">
                                    {{ role === 'admin' ? 'Admin' : 'User' }}
                                </span>
                            </div>
                            <div class="w-px h-5" style="background: rgba(42, 127, 212, 0.25)" />
                            <!-- Logout -->
                            <button
                                class="px-4 py-1.5 text-sm font-semibold text-red-400 transition-all"
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
