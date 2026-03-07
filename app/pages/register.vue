<!-- <template>
  <div class="auth-container">
    <h2>Register</h2>

    <form @submit.prevent="handleRegister">
      <input
        type="text"
        v-model="username"
        placeholder="ชื่อผู้ใช้"
        required
      />

      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />

      <input
        type="password"
        v-model="confirmPassword"
        placeholder="Confirm Password"
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? "Registering..." : "Register" }}
      </button>
    </form>

    <p v-if="error" style="color:red">{{ error }}</p>

    <p>
      มีบัญชีอยู่แล้ว?
      <router-link to="/login">เข้าสู่ระบบ</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useApi } from "@/composables/useApi"

interface RegisterResponse {
  status: string
  message: string
}

const username = ref("")
const password = ref("")
const confirmPassword = ref("")
const loading = ref(false)
const error = ref("")
const router = useRouter()

const { post } = useApi()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Password ไม่ตรงกัน"
    return
  }

  loading.value = true
  error.value = ""

  try {
    const data = await post<RegisterResponse>("/register", {
      username: username.value,
      password: password.value
    })

    console.log("Register success:", data.message)
    router.push('/login')
  } catch (e: any) {
    error.value =
      e?.data?.detail ||
      e?.message ||
      "Register failed"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 350px;
  margin: 100px auto;
  padding: 20px;
}
input {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
}
button {
  width: 100%;
  padding: 8px;
}
</style> -->
<!-- --------------------------------------- -->
<!-- <script setup lang="ts">
const { register } = useAuth();

const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm: '',
});

const loading = ref(false);
const error = ref<string | null>(null);
const ok = ref<string | null>(null);

const onSubmit = async () => {
    error.value = null;
    ok.value = null;

    if (form.password !== form.confirm) {
        error.value = 'Password ไม่ตรงกัน';
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

        ok.value = 'สมัครสมาชิกสำเร็จ! ไปหน้า Login ได้เลย';
        // จะ auto ไป login เลยก็ได้:
        setTimeout(() => navigateTo('/login'), 2000);
        // navigateTo('/login')
    } catch (e: any) {
        error.value = e?.data?.detail || e?.message || 'Register failed';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="mx-auto max-w-md">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 class="text-2xl font-extrabold tracking-tight">Register</h1>
            <p class="mt-1 text-sm text-slate-600">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>

            <div v-if="error" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ error }}
            </div>

            <div v-if="ok" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {{ ok }}
            </div>

            <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
                <div>
                    <label class="text-sm font-semibold text-slate-700">FirstName</label>
                    <input
                        v-model="form.first_name"
                        type="text"
                        class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="pruksakorn"
                    />
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">LastName</label>
                    <input
                        v-model="form.last_name"
                        type="text"
                        class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="Pruksakorn"
                    />
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">Email</label>
                    <input
                        v-model="form.email"
                        type="email"
                        class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">Password</label>
                    <input
                        v-model="form.password"
                        type="password"
                        class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">Confirm password</label>
                    <input
                        v-model="form.confirm"
                        type="password"
                        class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    :disabled="loading || !form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password || !form.confirm"
                    class="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {{ loading ? 'Creating…' : 'Create account' }}
                </button>
            </form>

            <div class="mt-4 text-sm text-slate-600">
                มีบัญชีแล้ว?
                <NuxtLink to="/login" class="font-semibold text-blue-700 hover:underline"> Login </NuxtLink>
            </div>
        </div>
    </div>
</template> -->

<script setup lang="ts">
const { register } = useAuth();

const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm: '',
});

const loading = ref(false);
const error = ref<string | null>(null);
const ok = ref<string | null>(null);

const onSubmit = async () => {
    error.value = null;
    ok.value = null;

    if (form.password !== form.confirm) {
        error.value = 'Password ไม่ตรงกัน';
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
        ok.value = 'สมัครสมาชิกสำเร็จ! กำลังไปหน้า Login...';
        setTimeout(() => navigateTo('/login'), 2000);
    } catch (e: any) {
        error.value = e?.data?.detail || e?.message || 'Register failed';
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <div
                class="rounded-2xl p-8 shadow-2xl"
                style="background: rgba(8, 18, 36, 0.85); border: 1px solid rgba(42, 127, 212, 0.2); box-shadow: 0 25px 60px rgba(13, 95, 163, 0.15); backdrop-filter: blur(20px)"
            >
                <!-- Top accent line -->
                <div class="h-0.5 w-16 rounded-full mb-6" style="background: linear-gradient(90deg, #4caf50, #0d5fa3)" />

                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-3xl font-extrabold tracking-tight text-white">Register</h1>
                    <p class="mt-1 text-base text-slate-400">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                </div>

                <!-- Error -->
                <div v-if="error" class="mb-4 rounded-xl px-4 py-3 text-sm text-red-400" style="border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08)">⚠️ {{ error }}</div>

                <!-- Success -->
                <div v-if="ok" class="mb-4 rounded-xl px-4 py-3 text-sm" style="border: 1px solid rgba(76, 175, 80, 0.3); background: rgba(76, 175, 80, 0.08); color: #81c784">✅ {{ ok }}</div>

                <!-- Form -->
                <form class="space-y-4" @submit.prevent="onSubmit">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">First Name</label>
                            <input
                                v-model="form.first_name"
                                type="text"
                                placeholder="Pruksakorn"
                                class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                                style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                                @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                                @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                            />
                        </div>
                        <div>
                            <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">Last Name</label>
                            <input
                                v-model="form.last_name"
                                type="text"
                                placeholder="Saiweal"
                                class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                                style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                                @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                                @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
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
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                            style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                            @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                            @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        />
                    </div>

                    <div>
                        <label class="text-sm font-semibold uppercase tracking-widest" style="color: #5bc4f5">Confirm Password</label>
                        <input
                            v-model="form.confirm"
                            type="password"
                            placeholder="••••••••"
                            class="mt-1.5 w-full rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition-all"
                            style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                            @focus="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                            @blur="(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading || !form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password || !form.confirm"
                        class="mt-2 w-full rounded-xl px-5 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        style="background: linear-gradient(135deg, #1a8c3e 0%, #0d5fa3 100%); box-shadow: 0 4px 20px rgba(76, 175, 80, 0.25)"
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

                <!-- Footer -->
                <p class="mt-5 text-base text-slate-500 text-center">
                    มีบัญชีแล้ว?
                    <NuxtLink
                        to="/login"
                        class="font-semibold transition-colors"
                        style="color: #2a9fd6"
                        @mouseover="(e) => ((e.target as HTMLElement).style.color = '#5bc4f5')"
                        @mouseleave="(e) => ((e.target as HTMLElement).style.color = '#2a9fd6')"
                    >
                        Login
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>
