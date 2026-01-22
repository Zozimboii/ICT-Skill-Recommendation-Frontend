<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 20px 16px; font-family: system-ui; height: 100vh; display: flex; flex-direction: column;">
    <!-- Header -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
        AI Assistant
      </h1>
      <p style="color: #666; margin-bottom: 0;">
        ถามคำถามเกี่ยวกับสกิลและงาน ICT ได้เลย
      </p>
    </div>

    <!-- Chat Messages Container -->
    <div 
      ref="messagesContainer"
      style="flex: 1; overflow-y: auto; padding: 16px 0; display: flex; flex-direction: column; gap: 16px; min-height: 0;"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" style="display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; flex: 1; color: #999;">
        <div style="font-size: 48px;">💬</div>
        <div style="font-size: 18px; font-weight: 600; color: #333;">สวัสดีครับ! มีอะไรให้ช่วยไหม?</div>
        <div style="font-size: 14px; text-align: center; max-width: 400px;">
          คุณสามารถถามเกี่ยวกับสกิลที่ต้องการ, คำแนะนำอาชีพ, หรือข้อมูลงาน ICT ได้เลย
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :style="{
          display: 'flex',
          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        }"
      >
        <div
          :style="{
            maxWidth: '75%',
            padding: '12px 16px',
            borderRadius: '18px',
            backgroundColor: message.role === 'user' ? '#111' : '#f3f3f3',
            color: message.role === 'user' ? '#fff' : '#333',
            fontSize: '15px',
            lineHeight: '1.5',
            wordWrap: 'break-word',
          }"
        >
          <div v-if="message.role === 'assistant'" style="font-weight: 600; margin-bottom: 4px; font-size: 13px; color: #666;">
            AI Assistant
          </div>
          <div style="white-space: pre-wrap;">{{ message.content }}</div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="loading" style="display: flex; justify-content: flex-start;">
        <div style="max-width: 75%; padding: 12px 16px; border-radius: 18px; background-color: #f3f3f3; color: #666; font-size: 15px;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <div class="loading-dot" style="animation-delay: 0s;"></div>
            <div class="loading-dot" style="animation-delay: 0.2s;"></div>
            <div class="loading-dot" style="animation-delay: 0.4s;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px;">
      <div style="display: flex; gap: 10px; align-items: flex-end;">
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="inputMessage += '\n'"
          :disabled="loading"
          placeholder="พิมพ์คำถามของคุณ..."
          rows="1"
          ref="textareaRef"
          style="
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 24px;
            font-size: 15px;
            font-family: inherit;
            resize: none;
            max-height: 120px;
            overflow-y: auto;
            outline: none;
          "
          @input="adjustTextareaHeight"
        />
        <button
          @click="sendMessage"
          :disabled="loading || !inputMessage.trim()"
          style="
            padding: 12px 20px;
            border-radius: 24px;
            border: none;
            background: #111;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            min-width: 80px;
            transition: opacity 0.2s;
          "
          :style="{ opacity: loading || !inputMessage.trim() ? 0.5 : 1 }"
        >
          {{ loading ? 'ส่ง...' : 'ส่ง' }}
        </button>
      </div>
      <div style="margin-top: 8px; color: #999; font-size: 12px; text-align: center;">
        กด Enter เพื่อส่ง • Shift+Enter เพื่อขึ้นบรรทัดใหม่
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Message = {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { post } = useApi()

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 120)}px`
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || loading.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content: message
  })

  inputMessage.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  loading.value = true
  scrollToBottom()

  try {
    // Call API endpoint for chat
    const response = await post<{
  answer: string
}>('/chat', {
  question: message,
  include_context: true
})

    // Add AI response
    messages.value.push({
      role: 'assistant',
      content: response.answer || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้'
    })
  } catch (error: any) {
    // If API fails, show a demo response
    console.error('Chat API error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อกับ backend'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// Auto-scroll when messages change
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: bounce 1.4s infinite ease-in-out;
}

textarea:focus {
  border-color: #111 !important;
}
</style>
