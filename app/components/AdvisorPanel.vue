<script setup lang="ts">
import type { AdvisorResponse } from '~/types/AdvisorResponse';

const props = defineProps<{
    modelValue: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void;
    (e: 'quickSearch', skillName: string): void;
}>();

const { ask } = useAdvisor();

const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<AdvisorResponse | null>(null);

const submit = async () => {
    const text = props.modelValue.trim();
    if (!text) return;

    loading.value = true;
    error.value = null;
    result.value = null;

    try {
        result.value = await ask(text);
    } catch (e: any) {
        error.value = e?.data?.detail || e?.message || 'Advisor failed';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-lg font-bold">ถามแนะแนวการเรียน</div>
        <div class="mt-1 text-sm text-slate-600">พิมพ์คำถาม เช่น “อยากฝึกเขียนโปรแกรมควรเริ่มจากอะไร”</div>

        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
                :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                @keydown.enter="submit"
                placeholder="อยากเป็น data analyst ควรเริ่มจากอะไร?"
                class="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
                @click="submit"
                :disabled="loading || !modelValue.trim()"
                class="rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {{ loading ? 'กำลังคิด…' : 'ถาม' }}
            </button>
        </div>

        <div v-if="error" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
        </div>

        <div v-if="result" class="mt-4 space-y-2">
            <div class="text-sm font-semibold">
                แนวทางที่เหมาะ: <span class="text-blue-700">{{ result.intent }}</span>
            </div>

            <div class="text-sm">
                <span class="font-semibold">ควรเริ่มจาก:</span>
                <div class="mt-2 flex flex-wrap gap-2">
                    <button v-for="s in result.suggested_skills" :key="s" @click="emit('quickSearch', s)" class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 hover:bg-slate-200">
                        {{ s }}
                    </button>
                </div>
            </div>

            <div v-if="result.trend_preview" class="text-sm text-slate-700">
                <span class="font-semibold">ข้อมูลตลาดงาน:</span>
                สกิล <span class="font-semibold">{{ result.trend_preview.skill_name }}</span> พบใน <span class="font-semibold">{{ result.trend_preview.job_count }}</span> งาน
            </div>
        </div>
    </div>
</template>
