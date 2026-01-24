<!-- components/chat/ChatWindow.vue -->
<script setup lang="ts">
export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps<{
  messages: ChatMessage[]
  loading?: boolean
}>()

const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => [props.messages.length, props.loading],
  () => scrollToBottom(),
  { immediate: true }
)
</script>

<template>
  <div
    ref="messagesContainer"
    class="flex-1 overflow-y-auto py-4 flex flex-col gap-4 min-h-0"
  >
    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2"
    >
      <div class="text-5xl">💬</div>
      <div class="text-lg font-semibold text-slate-900">สวัสดีครับ! มีอะไรให้ช่วยไหม?</div>
      <div class="text-sm text-center max-w-md">
        คุณสามารถถามเกี่ยวกับสกิลที่ต้องการ, คำแนะนำอาชีพ, หรือข้อมูลงาน ICT ได้เลย
      </div>
    </div>

    <!-- Messages -->
    <div
      v-for="(m, i) in messages"
      :key="i"
      class="flex"
      :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
        :class="m.role === 'user'
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-900'"
      >
        <div
          v-if="m.role === 'assistant'"
          class="mb-1 text-xs font-semibold text-slate-500"
        >
          AI Assistant
        </div>
        {{ m.content }}
      </div>
    </div>

    <!-- Loading bubble -->
    <div v-if="loading" class="flex justify-start">
      <div class="max-w-[75%] rounded-2xl px-4 py-3 bg-slate-100">
        <div class="flex items-center gap-1">
          <span class="loading-dot" />
          <span class="loading-dot delay-200" />
          <span class="loading-dot delay-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-dot{
  width: 8px; height: 8px; border-radius: 999px;
  background: rgb(100 116 139); /* slate-500 */
  display: inline-block;
  animation: bounce 1.2s infinite ease-in-out;
}
.delay-200{ animation-delay: .2s; }
.delay-400{ animation-delay: .4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: .4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
