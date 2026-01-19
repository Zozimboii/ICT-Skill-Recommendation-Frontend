<template>
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
    // TODO: redirect ไปหน้า login
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
</style>
