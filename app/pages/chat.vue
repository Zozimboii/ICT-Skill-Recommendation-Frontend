<script setup lang="ts">
import type { ChatMessage } from '~/types/Chat';

const input = ref('');
const loading = ref(false);
const messages = ref<ChatMessage[]>([]);
const error = ref<string | null>(null);

const { send } = useChat();

// const sendMessage = async () => {
//     console.log('🔥 sendMessage triggered');
//     const text = input.value.trim();
//     if (!text || loading.value) return;

//     error.value = null;
//     messages.value.push({ role: 'user', content: text });
//     input.value = '';
//     loading.value = true;

//     try {
//         const res = await send(text, true);

//         console.log('🟢 FULL RESPONSE:', res);

//         messages.value.push({
//             role: 'assistant',
//             content: res.answer,
//             skills: res.skills || [],
//         });
//     } catch (e: any) {
//         error.value = e?.data?.detail || e?.message || 'เชื่อมต่อ API ไม่ได้';
//         messages.value.push({
//             role: 'assistant',
//             content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้ง',
//         });
//     } finally {
//         loading.value = false;
//     }
// };
const sendMessage = async () => {
    console.log('🔥 sendMessage triggered');

    const text = input.value.trim();
    if (!text || loading.value) return;

    error.value = null;

    messages.value.push({
        role: 'user',
        content: text,
    });

    input.value = '';
    loading.value = true;

    try {
        const res = await send(text, true);

        console.log('🟢 FULL RESPONSE:', res);

        messages.value.push({
            role: 'assistant',
            content: res.answer,
            tags: res.tags || [],
        });
    } catch (err: any) {
        messages.value.push({
            role: 'assistant',
            content: err.message, // ✅ แสดงข้อความ limit สวย ๆ
        });
    } finally {
        loading.value = false;
    }
};

// คำแนะนำตัวอย่าง
const suggestions = [
    {
        icon: '💻',
        title: 'Design a clean homepage layout',
    },
    {
        icon: '🐳',
        title: 'Set up Docker for Nuxt3 app',
    },
    {
        icon: '🔧',
        title: 'Fix common MySQL errors with SQL',
    },
    {
        icon: '📊',
        title: 'Visualize job trends in Power BI',
    },
];

// ฟังก์ชันสำหรับจัดการเมื่อคลิกปุ่มตัวอย่าง
const handleSuggestionClick = async (suggestionText: string) => {
    input.value = suggestionText;
    await sendMessage();
};
</script>

<template>
    <div class="min-h-screen flex flex-col items-center px-4 py-8">
        <div class="w-full max-w-4xl flex flex-col gap-6">
            <!-- Chat Window Area -->
            <div class="flex-1 min-h-[400px] flex flex-col">
                <!-- Error -->
                <div v-if="error" class="mb-3 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {{ error }}
                </div>

                <!-- Chat Messages -->
                <ChatWindow :messages="messages" :loading="loading" />
            </div>

            <!-- Composer -->
            <ChatComposer v-model="input" :loading="loading" @send="sendMessage" />

            <!-- Suggestion Cards - Outside and below -->
            <div v-if="messages.length === 0" class="w-full">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-zinc-400">ลองถามไรดีนะ</h3>
                    <div class="flex gap-2">
                        <button class="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                            <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                        <button class="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                            <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        v-for="(suggestion, index) in suggestions"
                        :key="index"
                        @click="handleSuggestionClick(suggestion.title)"
                        class="suggestion-card text-left p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 hover:border-zinc-600 transition-all duration-200"
                    >
                        <div class="flex items-center gap-3">
                            <span class="text-2xl flex-shrink-0">{{ suggestion.icon }}</span>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm text-white font-normal">
                                    {{ suggestion.title }}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
