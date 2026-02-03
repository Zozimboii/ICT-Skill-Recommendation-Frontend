<!-- components/chat/ChatComposer.vue -->
<script setup lang="ts">
const props = defineProps<{
    modelValue: string;
    loading?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'send']);
const sendNow = () => {
    emit('send');
};
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
};

watch(
    () => props.modelValue,
    () => adjustHeight(),
);

const onInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
    adjustHeight();
};
</script>

<template>
    <div class="pt-4">
        <div class="flex gap-3 items-end">
            <!-- Add button -->
            <!-- <button type="button" class="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-white transition-colors">+</button> -->

            <!-- Textarea -->
            <textarea
                ref="textareaRef"
                :value="modelValue"
                :disabled="loading"
                rows="1"
                class="flex-1 resize-none max-h-[120px] overflow-y-auto rounded-3xl bg-black/80 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-400 outline-none focus:border-zinc-500"
                placeholder="ถามอะไรก็ได้..."
                @input="onInput"
                @keydown.enter.exact.prevent="sendNow"
                @keydown.enter.shift.exact.stop
            />

            <!-- Send button -->
            <button
                type="button"
                class="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-900 transition-colors disabled:opacity-50"
                :disabled="loading || !modelValue.trim()"
                @click="sendNow"
            >
                ➤
            </button>
        </div>
    </div>
</template>
