<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'search'): void
}>()
</script>

<template>
  <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
    <input
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="emit('search')"
      placeholder="Search skill… (e.g. python)"
      class="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
    />
    <button
      @click="emit('search')"
      :disabled="loading || !modelValue.trim()"
      class="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white
             hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      {{ loading ? 'Searching…' : 'Search' }}
    </button>
  </div>
</template>
