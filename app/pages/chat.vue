<script setup lang="ts">
import type { ChatMessage } from '~/components/chat/ChatWindow.vue'

const input = ref('')
const loading = ref(false)
const messages = ref<ChatMessage[]>([])
const error = ref<string | null>(null)

const { send } = useChat()

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  error.value = null
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true

  try {
    const res = await send(text, true)
    messages.value.push({
      role: 'assistant',
      content: res.answer || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้',
    })
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'เชื่อมต่อ API ไม่ได้'
    messages.value.push({
      role: 'assistant',
      content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้ง',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-[900px] px-4 py-6 h-[calc(100vh-120px)] flex flex-col">
    <div class="mb-4">
      <h1 class="text-2xl font-extrabold tracking-tight">AI Assistant</h1>
      <p class="mt-1 text-sm text-slate-500">ถามคำถามเกี่ยวกับสกิลและงาน ICT ได้เลย</p>
    </div>

    <div
      v-if="error"
      class="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <ChatWindow :messages="messages" :loading="loading" />
    <ChatComposer v-model="input" :loading="loading" @send="sendMessage" />
  </div>
</template>
