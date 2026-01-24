<!-- <template>
  <div class="auth-container">
    <h2>Login</h2>

    <form @submit.prevent="handleLogin">
      <input
        type="text"
        v-model="username"
        placeholder="Username"
        required
      />

      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
      </button>
    </form>

    <p v-if="error" style="color:red">{{ error }}</p>

    <p>
      ยังไม่มีบัญชี?
      <router-link to="/register">สมัครสมาชิก</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useApi } from "@/composables/useApi"

interface LoginResponse {
  status: string
  message: string
}

const username = ref("")
const password = ref("")
const loading = ref(false)
const error = ref("")
const router = useRouter()
const { post } = useApi()

const handleLogin = async () => {
  loading.value = true
  error.value = ""

  try {
    const data = await post<LoginResponse>("/login", {
      username: username.value,
      password: password.value
    })

    console.log("Login success:", data.message)
    router.push('/searchJob')
  } catch (e: any) {
    error.value =
      e?.data?.detail ||
      e?.message ||
      "Login failed"
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

<script setup lang="ts">
const { login, isLoggedIn } = useAuth()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

watchEffect(() => {
  // ถ้าล็อกอินแล้วเด้งกลับ home
  if (isLoggedIn.value) navigateTo('/')
})

const onSubmit = async () => {
  error.value = null
  loading.value = true
  try {
    await login({ username: form.username.trim(), password: form.password })
    navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-extrabold tracking-tight">Login</h1>
      <p class="mt-1 text-sm text-slate-600">เข้าสู่ระบบเพื่อใช้งานระบบแนะนำสกิล</p>

      <div
        v-if="error"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
        <div>
          <label class="text-sm font-semibold text-slate-700">Username</label>
          <input
            v-model="form.username"
            type="username"
            autocomplete="username"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="you"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-700">Password</label>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !form.username.trim() || !form.password"
          class="mt-2 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white
                 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
      </form>

      <div class="mt-4 text-sm text-slate-600">
        ยังไม่มีบัญชี?
        <NuxtLink to="/register" class="font-semibold text-blue-700 hover:underline">
          Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
