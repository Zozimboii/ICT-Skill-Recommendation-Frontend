<!-- components/chat/ChatWindow.vue -->
<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import type { ChatMessage } from '~/types/Chat';

const props = defineProps<{
    messages: ChatMessage[];
    loading?: boolean;
}>();
const hasStartedChat = computed(() => props.messages.length > 0);

const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
});

const formatMessage = (text: string) => {
    return md.render(text);
};

watch(
    () => [props.messages.length, props.loading],
    () => scrollToBottom(),
    { immediate: true },
);
</script>

<template>
    <div v-if="hasStartedChat || loading" ref="messagesContainer" class="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-4 min-h-0">
        <!-- Messages -->
        <div v-for="(m, i) in messages" :key="i" class="flex" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
            <!-- Bubble -->
            <div class="max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed" :class="m.role === 'user' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-white'">
                <!-- Assistant Label -->
                <div v-if="m.role === 'assistant'" class="text-xs text-zinc-400 mb-2">AI Assistant</div>

                <!-- Assistant Answer -->
                <div v-if="m.role === 'assistant'" class="prose prose-invert max-w-none" v-html="formatMessage(m.content)" />

                <!-- User Text -->
                <div v-else>
                    {{ m.content }}
                </div>

                <!-- sub Chips -->
                <div v-if="m.tags?.length" class="flex flex-wrap gap-2 pt-2">
                    <NuxtLink v-for="t in m.tags" :key="t" :to="`/searchJob?sub_category=${encodeURIComponent(t)}`" class="chip"> 📌 {{ t }} </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Loading bubble -->
        <div v-if="loading" class="flex justify-start">
            <div class="max-w-[75%] rounded-2xl px-4 py-3 bg-zinc-800">
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
.loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgb(161 161 170);
    display: inline-block;
    animation: bounce 1.2s infinite ease-in-out;
}
.delay-200 {
    animation-delay: 0.2s;
}
.delay-400 {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.4;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}
:deep(h3) {
    font-size: 1.1rem;
    font-weight: 700;
    margin-top: 12px;
}

:deep(h4) {
    font-size: 1rem;
    font-weight: 600;
    margin-top: 10px;
}

:deep(ul) {
    padding-left: 20px;
    list-style-type: disc;
}

:deep(li) {
    margin-bottom: 6px;
}

:deep(hr) {
    border: none;
    border-top: 1px solid rgb(63 63 70);
    margin: 14px 0;
}

:deep(strong) {
    color: white;
    font-weight: 700;
}
</style>
