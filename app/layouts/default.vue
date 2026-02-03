<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const { isLoggedIn, logout } = useAuth();

const scrolled = ref(false);

const handleScroll = () => {
    scrolled.value = window.scrollY > 20;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
const route = useRoute();
const isFullWidthPage = computed(() => {
    return ['trend', 'advisor'].includes(route.name as string);
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-purple-200 text-slate-900bg-slate-50 text-slate-900">
        <header :class="[scrolled ? 'py-2 scale-[0.98]' : 'py-3 scale-100']" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full transition-all duration-300">
            <div
                :class="[
                    'flex items-center justify-between gap-6 rounded-full border shadow-lg px-6 py-3 w-[95vw] max-w-7xl backdrop-blur-xl transition-all duration-300',
                    !scrolled ? 'bg-black text-white border-white/10' : 'bg-black/60 text-white border-white/20',
                ]"
                class="hover:bg-black"
            >
                <NuxtLink to="/" :class="['font-extrabold tracking-tight text-xl transition-colors duration-300']" class="hover:text-indigo-300"> ICT Skill Recommendation </NuxtLink>

                <nav class="flex items-center gap-2 text-sm">
                    <NuxtLink to="/" :class="['rounded-lg px-3 py-2 transition-all duration-300']" class="font-bold text-base hover:text-indigo-300"> Home </NuxtLink>

                    <NuxtLink v-if="isLoggedIn" to="/trend" class="font-bold text-base rounded-lg px-3 py-2 hover:text-indigo-300"> Trend </NuxtLink>

                    <NuxtLink v-if="isLoggedIn" to="/searchJob" class="font-bold text-base rounded-lg px-3 py-2 hover:text-indigo-300"> SearchJob </NuxtLink>

                    <NuxtLink v-if="isLoggedIn" to="/assessment" class="font-bold text-base rounded-lg px-3 py-2 hover:text-indigo-300"> Assessment </NuxtLink>

                    <template v-if="!isLoggedIn">
                        <NuxtLink to="/login" class="rounded-lg px-3 py-2 font-bold hover:text-slate-700"> Login </NuxtLink>

                        <NuxtLink to="/register" class="rounded-lg px-3 py-2 font-bold hover:text-slate-700"> Register </NuxtLink>
                    </template>

                    <button v-else class="rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-900" @click="logout">Logout</button>
                </nav>
            </div>
        </header>

        <main class="flex-1 flex items-center justify-center px-4 pt-32 pb-10">
            <div :class="[' w-full']">
                <slot />
            </div>
        </main>

        <footer class="border-t bg-white">
            <div class="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 text-center">© {{ new Date().getFullYear() }} ICT Skill Recommendation</div>
        </footer>
    </div>
</template>
