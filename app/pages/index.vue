<script setup lang="ts">
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
        <!-- Title -->
        <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ICT Job Skill Recommendation</h1>

        <!-- Subtitle -->
        <p class="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
            พิมพ์สกิล เช่น
            <span class="font-semibold text-indigo-600">python</span>,
            <span class="font-semibold text-indigo-600">sql</span>
            เพื่อดูว่าตลาดงานพูดถึงมากแค่ไหน และอยู่ในสายงานใด
        </p>

        <!-- Divider Line -->
        <div class="mt-8 h-[2px] w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        <!-- Advisor -->
        <div class="mt-10 w-full">
            <AdvisorPanel v-model="question" @quickSearch="quickSearch" />
        </div>

        <!-- Search Bar -->
        <div class="mt-6 w-full">
            <SkillSearchBar v-model="q" :loading="loading" @search="search" />
        </div>

        <!-- Error -->
        <div v-if="error" class="mt-6 w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {{ error }}
        </div>

        <!-- Result -->
        <div class="mt-10 w-full">
            <SkillResultPanel v-if="result" :result="result" @quickSearch="quickSearch" />
        </div>

        <!-- Extra section -->
        <!-- <div v-if="result" class="mt-10 w-full rounded-2xl border bg-white/70 backdrop-blur-lg shadow-lg p-6">
            <SearchJob />
        </div> -->
    </div>
</template>
