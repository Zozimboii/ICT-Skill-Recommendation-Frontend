<!-- app/layouts/default.vue -->
 <script setup lang="ts">
const { isLoggedIn, logout } = useAuth()
</script>

<template>
   <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="font-extrabold tracking-tight">
          ICT Skill Recommendation
        </NuxtLink>

        <nav class="flex items-center gap-2 text-sm">
          <NuxtLink to="/" class="rounded-lg px-3 py-2 hover:bg-slate-100">Home</NuxtLink>

          <NuxtLink
            v-if="isLoggedIn"
            to="/trend"
            class="rounded-lg px-3 py-2 hover:bg-slate-100"
          >Trend</NuxtLink>

          <NuxtLink
            v-if="isLoggedIn"
            to="/advisor"
            class="rounded-lg px-3 py-2 hover:bg-slate-100"
          >Advisor</NuxtLink>

          <NuxtLink
            v-if="isLoggedIn"
            to="/assessment"
            class="rounded-lg px-3 py-2 hover:bg-slate-100"
          >Assessment</NuxtLink>

          <NuxtLink to="/chat" class="rounded-lg px-3 py-2 hover:bg-slate-100">Chat</NuxtLink>

          <template v-if="!isLoggedIn">
            <NuxtLink to="/login" class="rounded-lg px-3 py-2 hover:bg-slate-100">Login</NuxtLink>
            <NuxtLink to="/register" class="rounded-lg px-3 py-2 hover:bg-slate-100">Register</NuxtLink>
          </template>

          <button
            v-else
            class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-black"
            @click="logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>

    <footer class="mt-10 border-t bg-white">
      <div class="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500">
        © {{ new Date().getFullYear() }} ICT Skill Recommendation
      </div>
    </footer>
  </div>
</template>
