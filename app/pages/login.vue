<!-- pages/login.vue -->

<script setup lang="ts">
const { login, isLoggedIn } = useAuth();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref<string | null>(null);

watchEffect(() => {
    if (isLoggedIn.value) navigateTo('/');
});

const onSubmit = async () => {
    error.value = null;
    loading.value = true;
    try {
        await login({ email: form.email.trim(), password: form.password });
        navigateTo('/');
    } catch (e: any) {
        error.value = e?.data?.detail || e?.message || 'Login failed';
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <!-- Card -->
            <div
                class="rounded-2xl p-8 shadow-2xl"
                style="background: rgba(8, 18, 36, 0.85); border: 1px solid rgba(42, 127, 212, 0.2); box-shadow: 0 25px 60px rgba(13, 95, 163, 0.15); backdrop-filter: blur(20px)"
            >
                <!-- Top accent line -->
                <div class="h-0.5 w-16 rounded-full mb-6" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />

                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-3xl font-extrabold tracking-tight text-white">Login</h1>
                    <p class="mt-1 text-base text-slate-400">เข้าสู่ระบบเพื่อใช้งานระบบแนะนำสกิล</p>
                </div>

                <!-- Error -->
                <div v-if="error" class="mb-4 rounded-xl px-4 py-3 text-sm text-red-400" style="border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08)">⚠️ {{ error }}</div>

                <!-- Form -->
                <form class="space-y-4" @submit.prevent="onSubmit">
                    <div>
                        <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            autocomplete="email"
                            placeholder="you@example.com"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                            style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                            @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                            @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        />
                    </div>

                    <div>
                        <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">Password</label>
                        <input
                            v-model="form.password"
                            type="password"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                            style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                            @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                            @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading || !form.email.trim() || !form.password"
                        class="mt-2 w-full rounded-xl px-5 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%); box-shadow: 0 4px 20px rgba(13, 95, 163, 0.35)"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            กำลังเข้าสู่ระบบ...
                        </span>
                        <span v-else>Login</span>
                    </button>
                </form>

                <!-- Footer -->
                <p class="mt-5 text-base text-slate-500 text-center">
                    ยังไม่มีบัญชี?
                    <NuxtLink
                        to="/register"
                        class="font-semibold transition-colors"
                        style="color: #4caf50"
                        @mouseover="(e) => ((e.target as HTMLElement).style.color = '#81c784')"
                        @mouseleave="(e) => ((e.target as HTMLElement).style.color = '#4caf50')"
                    >
                        Register
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>
