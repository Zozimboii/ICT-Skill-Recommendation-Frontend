<!-- components/chat/ChatComposer.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'send'): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

watch(
  () => props.modelValue,
  () => adjustHeight()
)

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  adjustHeight()
}
</script>

<template>
  <div class="border-t bg-white pt-4">
    <div class="flex gap-3 items-end">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :disabled="loading"
        rows="1"
        class="flex-1 resize-none max-h-[120px] overflow-y-auto rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none
               focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        placeholder="พิมพ์คำถามของคุณ..."
        @input="onInput"
        @keydown.enter.exact.prevent="emit('send')"
        @keydown.enter.shift.exact
      />
      <button
        class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white
               hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="loading || !modelValue.trim()"
        @click="emit('send')"
      >
        {{ loading ? 'ส่ง...' : 'ส่ง' }}
      </button>
    </div>

    <div class="mt-2 text-center text-xs text-slate-400">
      กด Enter เพื่อส่ง • Shift+Enter เพื่อขึ้นบรรทัดใหม่
    </div>
  </div>
</template>
