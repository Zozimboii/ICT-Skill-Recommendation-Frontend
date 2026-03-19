<script setup lang="ts">
import { validateLogin } from '~/validators/auth_validator';

const { login, isLoggedIn } = useAuth();
const form = reactive({ email: '', password: '' });
const loading = ref(false);
const errors = reactive<any>({});

watchEffect(() => {
    if (isLoggedIn) navigateTo('/');
});

const onSubmit = async () => {
    for (const key in errors) delete errors[key];

    const validateErrors = validateLogin(form);
    if (Object.keys(validateErrors).length > 0) {
        Object.assign(errors, validateErrors);
        return;
    }

    loading.value = true;
    try {
        await login({
            email: form.email.trim(),
            password: form.password,
        });
        navigateTo('/');
    } catch (e: any) {
        errors.general = e?.data?.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <div class="rounded-2xl p-8 shadow-2xl" style="background: rgba(8, 18, 36, 0.85); border: 1px solid rgba(42, 127, 212, 0.2); backdrop-filter: blur(20px)">
                <div class="h-0.5 w-16 rounded-full mb-6" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                <div class="mb-6">
                    <h1 class="text-4xl font-extrabold tracking-tight text-white">Login</h1>
                    <p class="mt-1 text-lg text-slate-400">เข้าสู่ระบบเพื่อใช้งานระบบแนะนำสกิล</p>
                </div>

                <div v-if="errors.general" class="mb-4 rounded-xl px-4 py-3 text-red-400 flex items-center gap-2" style="border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08)">
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {{ errors.general }}
                </div>

                <form class="space-y-4" @submit.prevent="onSubmit">
                    <div>
                        <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            autocomplete="email"
                            placeholder="you@example.com"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                            :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.email ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                        />
                        <p v-if="errors.email" class="text-red-400 text-base mt-1">{{ errors.email }}</p>
                    </div>
                    <div>
                        <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">Password</label>
                        <input
                            v-model="form.password"
                            type="password"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                            :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.password ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                        />
                        <p v-if="errors.password" class="text-red-400 text-base mt-1">{{ errors.password }}</p>
                    </div>
                    <button
                        type="submit"
                        :disabled="loading || !form.email.trim() || !form.password"
                        class="mt-2 w-full rounded-xl px-5 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.01]"
                        style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%)"
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
                <p class="mt-5 text-lg text-slate-500 text-center">
                    ยังไม่มีบัญชี?
                    <NuxtLink to="/register" class="font-semibold transition-colors" style="color: #4caf50">Register</NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>
