<script setup lang="ts">
import { validateRegister } from '~/validators/auth_validator';

const { register } = useAuth();
const form = reactive({ first_name: '', last_name: '', email: '', password: '', confirm: '' });
const loading = ref(false);
const ok = ref<string | null>(null);
const errors = reactive<any>({});

const onSubmit = async () => {
    for (const key in errors) delete errors[key];

    const validateErrors = validateRegister(form);
    if (Object.keys(validateErrors).length > 0) {
        Object.assign(errors, validateErrors);
        return;
    }

    loading.value = true;
    try {
        await register({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email: form.email.trim(),
            password: form.password,
        });

        ok.value = 'สมัครสำเร็จ! กำลังไปหน้า Login...';
        setTimeout(() => navigateTo('/login'), 1500);
    } catch (e: any) {
        errors.general = e?.data?.detail || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <div class="rounded-2xl p-8 shadow-2xl" style="background: rgba(8, 18, 36, 0.85); border: 1px solid rgba(42, 127, 212, 0.2); backdrop-filter: blur(20px)">
                <div class="h-0.5 w-16 rounded-full mb-6" style="background: linear-gradient(90deg, #4caf50, #0d5fa3)" />
                <div class="mb-6">
                    <h1 class="text-4xl font-extrabold tracking-tight text-white">Register</h1>
                    <p class="mt-1 text-xl text-slate-400">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                </div>

                <div v-if="errors.general" class="mb-4 rounded-xl px-4 py-3 text-red-400 flex items-center gap-2" style="border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08)">
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {{ errors.general }}
                </div>
                <div v-if="ok" class="mb-4 rounded-xl px-4 py-3 flex items-center gap-2" style="border: 1px solid rgba(76, 175, 80, 0.3); background: rgba(76, 175, 80, 0.08); color: #81c784">
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {{ ok }}
                </div>

                <form class="space-y-4" @submit.prevent="onSubmit">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">First Name</label>
                            <input
                                v-model="form.first_name"
                                type="text"
                                placeholder="ชื่อ"
                                class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                                :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.first_name ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                            />
                            <p v-if="errors.first_name" class="text-red-400 text-base mt-1">{{ errors.first_name }}</p>
                        </div>
                        <div>
                            <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">Last Name</label>
                            <input
                                v-model="form.last_name"
                                type="text"
                                placeholder="นามสกุล"
                                class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                                :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.last_name ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                            />
                            <p v-if="errors.last_name" class="text-red-400 text-base mt-1">{{ errors.last_name }}</p>
                        </div>
                    </div>
                    <div>
                        <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
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
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                            :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.password ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                        />
                        <p v-if="errors.password" class="text-red-400 text-base mt-1">{{ errors.password }}</p>
                    </div>
                    <div>
                        <label class="text-base font-semibold uppercase tracking-widest" style="color: #5bc4f5">Confirm Password</label>
                        <input
                            v-model="form.confirm"
                            type="password"
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-all"
                            :style="{ background: 'rgba(13, 95, 163, 0.08)', border: errors.confirm ? '1px solid #ef4444' : '1px solid rgba(42, 127, 212, 0.2)' }"
                        />
                        <p v-if="errors.confirm" class="text-red-400 text-base mt-1">{{ errors.confirm }}</p>
                    </div>
                    <button
                        type="submit"
                        :disabled="loading || !form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password || !form.confirm"
                        class="mt-2 w-full rounded-xl px-5 py-3 text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.01]"
                        style="background: linear-gradient(135deg, #1a8c3e 0%, #0d5fa3 100%)"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            กำลังสมัครสมาชิก...
                        </span>
                        <span v-else>Create account</span>
                    </button>
                </form>
                <p class="mt-5 text-xl text-slate-500 text-center">
                    มีบัญชีแล้ว?
                    <NuxtLink to="/login" class="font-semibold transition-colors" style="color: #2a9fd6">Login</NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>
