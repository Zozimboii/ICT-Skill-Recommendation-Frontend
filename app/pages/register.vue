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

<script setup lang="ts">
const { register } = useAuth()

const form = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirm: '',
})


const loading = ref(false)
const error = ref<string | null>(null)
const ok = ref<string | null>(null)

const onSubmit = async () => {
  error.value = null
  ok.value = null

  if (form.password !== form.confirm) {
    error.value = 'Password ไม่ตรงกัน'
    return
  }

  loading.value = true
  try {
   await register({
  username: form.username.trim(),
  email: form.email.trim(),
  password: form.password,
})



    ok.value = 'สมัครสมาชิกสำเร็จ! ไปหน้า Login ได้เลย'
    // จะ auto ไป login เลยก็ได้:
    // navigateTo('/login')
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'Register failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-extrabold tracking-tight">Register</h1>
      <p class="mt-1 text-sm text-slate-600">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>

      <div
        v-if="error"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div
        v-if="ok"
        class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ ok }}
      </div>

      <form class="mt-5 space-y-3" @submit.prevent="onSubmit">
        <div>
  <label class="text-sm font-semibold text-slate-700">Username</label>
  <input
    v-model="form.username"
    type="text"
    class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
           focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
    placeholder="pruksakorn"
  />
</div>

        <div>
          <label class="text-sm font-semibold text-slate-700">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Pruksakorn"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-700">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-700">Confirm password</label>
          <input
            v-model="form.confirm"
            type="password"
            class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none
                   focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !form.username.trim() || !form.name.trim() || !form.email.trim() || !form.password || !form.confirm"

          class="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white
                 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Creating…' : 'Create account' }}
        </button>
      </form>

      <div class="mt-4 text-sm text-slate-600">
        มีบัญชีแล้ว?
        <NuxtLink to="/login" class="font-semibold text-blue-700 hover:underline">
          Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
