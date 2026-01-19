<template>
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
</style>
