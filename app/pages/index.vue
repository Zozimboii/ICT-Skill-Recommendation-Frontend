<!-- <script setup lang="ts">
import type { SkillSearchResponse } from '~/types/SkillSearchResponse';
import SearchJob from '~/components/SearchJob.vue';
import type { SearchJobsResult } from '~/types/SearchJobsResult';

const question = ref('');
const q = ref('');

const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<SkillSearchResponse | null>(null);
const jobResult = ref<SearchJobsResult | null>(null);
const { search: searchSkill } = useSkill();

const search = async () => {
    const keyword = q.value.trim();
    if (!keyword) return;

    loading.value = true;
    error.value = null;
    result.value = null;

    try {
        result.value = await searchSkill(keyword);
    } catch (e: any) {
        error.value = e?.data?.detail || e?.message || 'Search failed';
    } finally {
        loading.value = false;
    }
};

const quickSearch = async (skillName: string) => {
    q.value = skillName;
    await search();
};
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-16 font-sans flex flex-col items-center text-center">

        <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ICT Job Skill Recommendation</h1>

        <p class="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
            พิมพ์สกิล เช่น
            <span class="font-semibold text-indigo-600">python</span>,
            <span class="font-semibold text-indigo-600">sql</span>
            เพื่อดูว่าตลาดงานพูดถึงมากแค่ไหน และอยู่ในสายงานใด
        </p>

        <div class="mt-8 h-[2px] w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        <div class="mt-10 w-full">
            <AdvisorPanel v-model="question" @quickSearch="quickSearch" />
        </div>

        <div class="mt-6 w-full">
            <SkillSearchBar v-model="q" :loading="loading" @search="search" />
        </div>

        <div v-if="error" class="mt-6 w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {{ error }}
        </div>

        <div class="mt-10 w-full">
            <SkillResultPanel v-if="result" :result="result" @quickSearch="quickSearch" />
        </div>

      
    </div>
</template> -->
<script setup lang="ts">
import type { ChatMessage } from '~/types/Chat';

const input = ref('');
const loading = ref(false);
const messages = ref<ChatMessage[]>([]);
const error = ref<string | null>(null);

const { send } = useChat();

const sendMessage = async () => {
    const text = input.value.trim();
    if (!text || loading.value) return;

    error.value = null;
    messages.value.push({ role: 'user', content: text });
    input.value = '';
    loading.value = true;

    try {
        const res = await send(text, true);

        messages.value.push({
            role: 'assistant',
            content: res.answer || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้',
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
</script>

<template>
    <!-- Background -->
    <div class="flex items-center justify-center px-4">
        <!-- Main Card -->
        <div class="w-full max-w-6xl rounded-3xl bg-slate/80 backdrop-blur shadow-xl border p-8 flex flex-col">
            <!-- Header -->
            <div class="text-center mb-6">
                <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ICT Skill Recommendation</h1>

                <p class="mt-3 text-slate-600 text-lg">ผู้ช่วย AI สำหรับถาม–ตอบเกี่ยวกับทักษะที่ตลาดงาน ICT ต้องการ</p>

                <div class="mt-4 flex justify-center gap-4 text-sm">
                    <NuxtLink to="/assessment" class="text-indigo-600 hover:underline"> ทำแบบประเมิน Skill → </NuxtLink>

                    <NuxtLink to="/trend" class="text-purple-600 hover:underline"> ดูแนวโน้มตำแหน่งงาน → </NuxtLink>
                </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ error }}
            </div>

            <!-- Chat Box -->
            <div class="flex-1 overflow-hidden rounded-2xl border bg-black/80 shadow-inner">
                <ChatWindow :messages="messages" :loading="loading" />
            </div>

            <!-- Composer -->
            <div class="mt-4">
                <ChatComposer v-model="input" :loading="loading" @send="sendMessage" />
            </div>
        </div>
    </div>
</template>
